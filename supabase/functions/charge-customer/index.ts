import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHARGE-CUSTOMER] ${step}${detailsStr}`);
};

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

    const { customer_id, amount, description } = await req.json();
    if (!customer_id) throw new Error("customer_id is required");
    if (!amount || amount <= 0) throw new Error("A positive amount is required");
    if (!description) throw new Error("description is required");

    const amountCents = Math.round(Number(amount) * 100);
    logStep("Charge request", { customerId: customer_id, amount, amountCents, description });

    // Look up customer's stripe_customer_id
    const { data: sub, error: subError } = await supabaseAdmin
      .from("customer_subscriptions")
      .select("stripe_customer_id")
      .eq("customer_id", customer_id)
      .not("stripe_customer_id", "is", null)
      .limit(1)
      .single();

    if (subError || !sub?.stripe_customer_id) {
      throw new Error("Customer has no linked Stripe account. Set up ACH payment first.");
    }
    logStep("Stripe customer found", { stripeCustomerId: sub.stripe_customer_id });

    // Create Stripe invoice
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2025-08-27.basil",
    });

    // Create invoice item
    await stripe.invoiceItems.create({
      customer: sub.stripe_customer_id,
      amount: amountCents,
      currency: "usd",
      description,
    });
    logStep("Invoice item created", { amountCents, description });

    // Create and finalize invoice
    const invoice = await stripe.invoices.create({
      customer: sub.stripe_customer_id,
      collection_method: "charge_automatically",
      auto_advance: true,
    });
    logStep("Invoice created", { invoiceId: invoice.id });

    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
    logStep("Invoice finalized", { status: finalizedInvoice.status });

    const paymentIntentId = typeof finalizedInvoice.payment_intent === "string"
      ? finalizedInvoice.payment_intent
      : finalizedInvoice.payment_intent?.id || null;

    logStep("Charge completed", {
      status: finalizedInvoice.status,
      invoiceId: finalizedInvoice.id,
      paymentIntentId,
    });

    return new Response(JSON.stringify({
      success: true,
      status: finalizedInvoice.status,
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
