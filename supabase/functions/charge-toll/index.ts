import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getStripeClient } from "../_shared/billing.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHARGE-TOLL] ${step}${detailsStr}`);
};

const TOLL_CEILING = 2000;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Unauthorized");
    logStep("Authenticated", { userId: userData.user.id });

    // Verify admin role
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) throw new Error("Admin access required");
    logStep("Admin role verified");

    const { toll_id } = await req.json();
    if (!toll_id) throw new Error("toll_id is required");

    // 1. Fetch the toll
    const { data: toll, error: tollError } = await supabaseAdmin
      .from("tolls")
      .select("id, amount, customer_id, toll_location, toll_date, toll_authority, status, stripe_invoice_id")
      .eq("id", toll_id)
      .single();

    if (tollError || !toll) throw new Error("Toll not found");
    if (toll.stripe_invoice_id) throw new Error("Toll has already been charged via Stripe");
    if (toll.status === "paid") throw new Error("Toll is already marked as paid");

    // Amount ceiling check
    if (Number(toll.amount) > TOLL_CEILING) {
      throw new Error(`Toll amount of $${toll.amount} exceeds the $${TOLL_CEILING} per-toll limit. Verify the amount and contact a senior admin.`);
    }

    logStep("Toll fetched", { tollId: toll.id, amount: toll.amount, customerId: toll.customer_id });

    // 2. Look up customer's subscription (with sandbox info) for Stripe routing
    const { data: sub, error: subError } = await supabaseAdmin
      .from("customer_subscriptions")
      .select("stripe_customer_id, sandbox, sandbox_stripe_customer_id")
      .eq("customer_id", toll.customer_id)
      .not("stripe_customer_id", "is", null)
      .limit(1)
      .single();

    if (subError || !sub?.stripe_customer_id) {
      throw new Error("Customer has no linked Stripe account. Set up ACH payment first.");
    }

    const { stripe, mode, customerId } = getStripeClient(sub);
    if (!customerId) {
      throw new Error("Customer has no Stripe customer ID for the selected mode.");
    }
    logStep("Stripe customer resolved", { stripeCustomerId: customerId, mode });

    // 3. Create Stripe invoice with invoice isolation

    const tollDate = new Date(toll.toll_date).toLocaleDateString("en-US", {
      month: "numeric", day: "numeric", year: "numeric"
    });
    const description = `Toll - ${toll.toll_authority || toll.toll_location || "Unknown"} - ${tollDate}`;
    const amountCents = Math.round(Number(toll.amount) * 100);

    // Create invoice FIRST with pending_invoice_items_behavior: 'exclude' to prevent dangling items
    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: "charge_automatically",
      auto_advance: true,
      pending_invoice_items_behavior: "exclude",
    });
    logStep("Invoice created (isolated)", { invoiceId: invoice.id });

    // Attach invoice item explicitly to this invoice
    await stripe.invoiceItems.create({
      customer: customerId,
      invoice: invoice.id,
      amount: amountCents,
      currency: "usd",
      description,
    });
    logStep("Invoice item attached", { amountCents, description });

    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
    logStep("Invoice finalized", { status: finalizedInvoice.status });

    // Determine status based on invoice
    const paymentIntentId = typeof finalizedInvoice.payment_intent === "string"
      ? finalizedInvoice.payment_intent
      : finalizedInvoice.payment_intent?.id || null;

    let tollStatus = "pending";
    if (finalizedInvoice.status === "paid") {
      tollStatus = "paid";
    }

    // 4. Update toll record
    const updateData: Record<string, unknown> = {
      stripe_invoice_id: finalizedInvoice.id,
      stripe_payment_intent_id: paymentIntentId,
      status: tollStatus,
      updated_at: new Date().toISOString(),
    };
    if (tollStatus === "paid") {
      updateData.payment_date = new Date().toISOString();
    }

    const { error: updateError } = await supabaseAdmin
      .from("tolls")
      .update(updateData)
      .eq("id", toll_id);

    if (updateError) {
      logStep("Failed to update toll record", { error: updateError.message });
    }

    // 5. Audit log
    await supabaseAdmin.from("app_event_logs").insert({
      user_id: userData.user.id,
      user_email: userData.user.email,
      event_category: "admin_action",
      event_type: "toll_charged",
      description: `Charged toll $${toll.amount} to customer ${toll.customer_id}: ${description}`,
      metadata: {
        toll_id,
        customer_id: toll.customer_id,
        amount: toll.amount,
        stripe_invoice_id: finalizedInvoice.id,
        stripe_payment_intent_id: paymentIntentId,
      },
      page_url: "/dashboard/admin/tolls",
    });
    logStep("Audit log inserted");

    logStep("Toll charged successfully", { tollStatus, invoiceId: finalizedInvoice.id });

    return new Response(JSON.stringify({
      success: true,
      status: tollStatus,
      stripe_invoice_id: finalizedInvoice.id,
      stripe_payment_intent_id: paymentIntentId,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message });
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
