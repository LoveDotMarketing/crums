import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VOID-CHARGE] ${step}${detailsStr}`);
};

const VOID_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

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

    const { stripe_invoice_id, adminOverride } = await req.json();
    if (!stripe_invoice_id) throw new Error("stripe_invoice_id is required");
    logStep("Void request", { stripeInvoiceId: stripe_invoice_id, adminOverride: !!adminOverride });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the invoice
    const invoice = await stripe.invoices.retrieve(stripe_invoice_id);
    logStep("Invoice retrieved", { status: invoice.status, created: invoice.created });

    // Enforce 30-minute grace window (server-side) unless admin override
    const invoiceAge = Date.now() - (invoice.created * 1000);
    if (!adminOverride && invoiceAge > VOID_WINDOW_MS) {
      throw new Error(`Void window expired. Invoice is ${Math.round(invoiceAge / 60000)} minutes old. Use a refund instead.`);
    }
    if (adminOverride) {
      logStep("Admin override: bypassing void window", { invoiceAgeMinutes: Math.round(invoiceAge / 60000) });
    }

    // Attempt to void based on invoice status
    if (invoice.status === "open") {
      // Check if payment_intent is in processing state (ACH)
      const openPiId = typeof invoice.payment_intent === "string"
        ? invoice.payment_intent
        : invoice.payment_intent?.id;
      
      if (openPiId) {
        const openPi = await stripe.paymentIntents.retrieve(openPiId);
        if (openPi.status === "processing") {
          throw new Error(
            "This ACH payment is still processing (takes 4-5 business days). " +
            "You cannot void or cancel it while processing. " +
            "Wait for it to settle — if it succeeds, use a refund. If it fails, the invoice will reopen and you can void it then."
          );
        }
      }
      
      await stripe.invoices.voidInvoice(stripe_invoice_id);
      logStep("Invoice voided (was open)");
    } else if (invoice.status === "paid") {
      const piId = typeof invoice.payment_intent === "string"
        ? invoice.payment_intent
        : invoice.payment_intent?.id;
      
      if (piId) {
        const pi = await stripe.paymentIntents.retrieve(piId);
        if (pi.status === "processing") {
          throw new Error(
            "This ACH payment is still processing (takes 4-5 business days). " +
            "You cannot void or refund it while processing. " +
            "Wait for it to settle — if it succeeds, use a refund. If it fails, the invoice will reopen and you can void it then."
          );
        } else if (pi.status === "succeeded") {
          await stripe.refunds.create({ payment_intent: piId });
          logStep("Refund created (payment already succeeded)");
        } else {
          await stripe.paymentIntents.cancel(piId);
          logStep("PaymentIntent cancelled", { piStatus: pi.status });
        }
      }
    } else if (invoice.status === "draft") {
      await stripe.invoices.del(stripe_invoice_id);
      logStep("Draft invoice deleted");
    } else {
      throw new Error(`Cannot void invoice with status: ${invoice.status}`);
    }

    // Audit log
    await supabaseAdmin.from("app_event_logs").insert({
      user_id: userData.user.id,
      user_email: userData.user.email,
      event_category: "admin_action",
      event_type: "charge_voided",
      description: `Voided invoice ${stripe_invoice_id}`,
      metadata: {
        stripe_invoice_id,
        original_status: invoice.status,
        invoice_age_minutes: Math.round(invoiceAge / 60000),
      },
      page_url: "/dashboard/admin/billing",
    });
    logStep("Audit log inserted");

    return new Response(JSON.stringify({ success: true, voided: stripe_invoice_id }), {
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
