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

// Import shared surcharge logic
import { calculateCardSurcharge } from "../_shared/billing.ts";

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

    const amountCents = Math.round(Number(amount) * 100);
    logStep("Charge request", { customerId: customer_id, amount, amountCents, description });

    // Duplicate detection: check for recent charge (pending or completed) to same customer
    const cooldownCutoff = new Date(Date.now() - COOLDOWN_MS).toISOString();
    const { data: dupCheck } = await supabaseAdmin
      .from("app_event_logs")
      .select("created_at, metadata")
      .eq("event_type", "customer_charged")
      .gte("created_at", cooldownCutoff)
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

    // Insert PENDING audit log BEFORE calling Stripe (closes race window)
    const { data: pendingLog } = await supabaseAdmin.from("app_event_logs").insert({
      user_id: userData.user.id,
      user_email: userData.user.email,
      event_category: "admin_action",
      event_type: "customer_charged",
      description: `[pending] Charging $${amount} to customer ${customer_id}: ${description}`,
      metadata: {
        customer_id,
        amount,
        description,
        status: "pending",
      },
      page_url: "/dashboard/admin/billing",
    }).select("id").single();
    logStep("Pending audit log inserted", { logId: pendingLog?.id });

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

    // Generate deterministic idempotency key (10-minute bucket)
    const timeBucket = Math.floor(Date.now() / 600000);
    const chargeIdempotencyKey = `charge_${customer_id}_${amountCents}_${timeBucket}`;
    logStep("Using idempotency key", { chargeIdempotencyKey });

    // Create invoice FIRST with pending_invoice_items_behavior: 'exclude' to prevent dangling items
    const invoice = await stripe.invoices.create({
      customer: sub.stripe_customer_id,
      collection_method: "charge_automatically",
      auto_advance: true,
      pending_invoice_items_behavior: "exclude",
    }, {
      idempotencyKey: chargeIdempotencyKey,
    });
    logStep("Invoice created (isolated)", { invoiceId: invoice.id });

    // Attach invoice item explicitly to this invoice
    await stripe.invoiceItems.create({
      customer: sub.stripe_customer_id,
      invoice: invoice.id,
      amount: finalAmountCents,
      currency: "usd",
      description: finalDescription,
    });
    logStep("Invoice item attached", { amountCents: finalAmountCents, description: finalDescription });

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

    // Update pending audit log to completed
    if (pendingLog?.id) {
      await supabaseAdmin.from("app_event_logs")
        .update({
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
            status: "completed",
          },
        })
        .eq("id", pendingLog.id);
    }
    logStep("Audit log updated to completed");

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
