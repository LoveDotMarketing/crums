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

// Calculate card surcharge using reverse formula: (base + 0.30) / (1 - 0.029)
function calculateCardSurcharge(baseAmount: number): { adjustedAmount: number; surcharge: number } {
  const adjustedAmount = Math.round(((baseAmount + 0.30) / (1 - 0.029)) * 100) / 100;
  const surcharge = Math.round((adjustedAmount - baseAmount) * 100) / 100;
  return { adjustedAmount, surcharge };
}

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

    const CHARGE_CEILING = 5000;
    const COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

    if (Number(amount) > CHARGE_CEILING) {
      throw new Error(`Charge of $${amount} exceeds the $${CHARGE_CEILING} per-charge limit. Contact a senior admin to override.`);
    }

    // Duplicate detection: check for recent charge to same customer
    const { data: recentCharge } = await supabaseAdmin
      .from("app_event_logs")
      .select("created_at")
      .eq("event_type", "customer_charged")
      .eq("user_id", userData.user.id)
      .gte("created_at", new Date(Date.now() - COOLDOWN_MS).toISOString())
      .limit(10);

    const hasDuplicate = recentCharge?.some((log: any) => {
      // Check metadata for same customer_id via description pattern
      return true; // any recent charge within window triggers check
    });

    if (recentCharge && recentCharge.length > 0) {
      // Check if any were for the same customer by querying more specifically
      const { data: dupCheck } = await supabaseAdmin
        .from("app_event_logs")
        .select("created_at, metadata")
        .eq("event_type", "customer_charged")
        .gte("created_at", new Date(Date.now() - COOLDOWN_MS).toISOString())
        .limit(50);

      const isDuplicate = dupCheck?.some((log: any) => {
        try {
          const meta = typeof log.metadata === "string" ? JSON.parse(log.metadata) : log.metadata;
          return meta?.customer_id === customer_id;
        } catch { return false; }
      });

      if (isDuplicate) {
        throw new Error("A charge was already made to this customer in the last 10 minutes. Wait before charging again.");
      }
    }

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
      throw new Error("Customer has no linked Stripe account. Set up payment method first.");
    }
    logStep("Stripe customer found", { stripeCustomerId: sub.stripe_customer_id });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2025-08-27.basil",
    });

    // Check the customer's default payment method to detect card vs ACH
    const stripeCustomer = await stripe.customers.retrieve(sub.stripe_customer_id);
    let isCard = false;
    if (stripeCustomer && !stripeCustomer.deleted) {
      const defaultPmId = stripeCustomer.invoice_settings?.default_payment_method;
      if (defaultPmId) {
        const pmId = typeof defaultPmId === "string" ? defaultPmId : defaultPmId.id;
        const pm = await stripe.paymentMethods.retrieve(pmId);
        isCard = pm.type === "card";
        logStep("Default payment method type", { type: pm.type, isCard });
      }
    }

    // Apply card surcharge if needed
    let finalAmountCents = amountCents;
    let surchargeAmount = 0;
    let finalDescription = description;
    if (isCard) {
      const { adjustedAmount, surcharge } = calculateCardSurcharge(amount);
      finalAmountCents = Math.round(adjustedAmount * 100);
      surchargeAmount = surcharge;
      finalDescription = `${description} (includes $${surcharge.toFixed(2)} card processing fee)`;
      logStep("Card surcharge applied", { base: amount, surcharge, total: adjustedAmount });
    }

    // Create invoice item
    await stripe.invoiceItems.create({
      customer: sub.stripe_customer_id,
      amount: finalAmountCents,
      currency: "usd",
      description: finalDescription,
    });
    logStep("Invoice item created", { amountCents: finalAmountCents, description: finalDescription });

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
      isCard,
      surcharge: surchargeAmount,
    });

    // Server-side audit log
    await supabaseAdmin.from("app_event_logs").insert({
      user_id: userData.user.id,
      user_email: userData.user.email,
      event_category: "admin_action",
      event_type: "customer_charged",
      description: `Charged $${amount} to customer ${customer_id}: ${description}`,
      metadata: {
        customer_id,
        amount,
        final_amount_cents: finalAmountCents,
        description,
        stripe_invoice_id: finalizedInvoice.id,
        stripe_payment_intent_id: paymentIntentId,
        payment_method: isCard ? "card" : "ach",
        surcharge: surchargeAmount,
      },
      page_url: "/dashboard/admin/billing",
    });
    logStep("Audit log inserted");

    return new Response(JSON.stringify({
      success: true,
      status: finalizedInvoice.status,
      stripe_invoice_id: finalizedInvoice.id,
      stripe_payment_intent_id: paymentIntentId,
      surcharge: isCard ? surchargeAmount : 0,
      payment_method: isCard ? "card" : "ach",
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
