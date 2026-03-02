import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ACTIVATE-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify admin auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.id) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      throw new Error("Unauthorized - admin access required");
    }
    logStep("Admin access verified");

    // Get request body
    const { subscriptionId } = await req.json();
    if (!subscriptionId) throw new Error("subscriptionId is required");
    logStep("Processing subscription", { subscriptionId });

    // Get the subscription from database
    const { data: subscription, error: subError } = await supabaseClient
      .from("customer_subscriptions")
      .select(`
        *,
        customers (
          full_name,
          email
        )
      `)
      .eq("id", subscriptionId)
      .single();

    if (subError || !subscription) {
      throw new Error("Subscription not found");
    }
    logStep("Subscription found", { 
      status: subscription.status,
      stripeSubId: subscription.stripe_subscription_id,
      stripeCustomerId: subscription.stripe_customer_id
    });

    if (!subscription.stripe_subscription_id) {
      throw new Error("No Stripe subscription ID found");
    }

    if (!subscription.stripe_customer_id) {
      throw new Error("No Stripe customer ID found");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get the Stripe subscription to find the latest invoice
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
    logStep("Retrieved Stripe subscription", { 
      stripeStatus: stripeSubscription.status,
      latestInvoice: stripeSubscription.latest_invoice
    });

    // If already active, return success without double-charging
    if (stripeSubscription.status === "active") {
      logStep("Subscription already active, skipping payment");
      return new Response(
        JSON.stringify({
          success: true,
          message: `Subscription is already active for ${subscription.customers?.full_name || "customer"}`,
          alreadyActive: true
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    if (!["incomplete", "past_due"].includes(stripeSubscription.status)) {
      throw new Error(`Subscription is not in incomplete or past_due status (current: ${stripeSubscription.status})`);
    }

    // Get the latest invoice
    let invoiceId = typeof stripeSubscription.latest_invoice === "string" 
      ? stripeSubscription.latest_invoice 
      : stripeSubscription.latest_invoice?.id;

    let invoice = invoiceId ? await stripe.invoices.retrieve(invoiceId) : null;
    logStep("Retrieved latest invoice", { 
      invoiceId: invoice?.id,
      invoiceStatus: invoice?.status,
      amountDue: invoice?.amount_due
    });

    // For past_due, the latest invoice may not be open — find the first open one
    if (!invoice || invoice.status !== "open") {
      const openInvoices = await stripe.invoices.list({
        subscription: subscription.stripe_subscription_id,
        status: "open",
        limit: 1,
      });
      if (openInvoices.data.length > 0) {
        invoice = openInvoices.data[0];
        invoiceId = invoice.id;
        logStep("Found open invoice via list", { invoiceId, amountDue: invoice.amount_due });
      } else {
        throw new Error("No open invoice found for this subscription");
      }
    }

    // Check if customer has a payment method
    const paymentMethods = await stripe.paymentMethods.list({
      customer: subscription.stripe_customer_id,
      type: "us_bank_account",
    });

    if (paymentMethods.data.length === 0) {
      throw new Error("Customer has no payment method attached. They need to complete ACH setup first.");
    }
    
    const paymentMethodId = paymentMethods.data[0].id;
    logStep("Payment method verified", { 
      paymentMethodCount: paymentMethods.data.length,
      paymentMethodId 
    });

    // Set the payment method as default on the customer for future invoices
    await stripe.customers.update(subscription.stripe_customer_id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    logStep("Set default payment method on customer");

    // Re-check invoice status right before paying to prevent double-charge
    const freshInvoice = await stripe.invoices.retrieve(invoiceId!);
    if (freshInvoice.status !== "open") {
      logStep("Invoice no longer open, skipping payment", { status: freshInvoice.status });
      return new Response(
        JSON.stringify({
          success: true,
          message: "Payment already initiated — no additional charge was made",
          alreadyActive: true
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Pay the invoice with the payment method
    const paidInvoice = await stripe.invoices.pay(invoiceId!, {
      payment_method: paymentMethodId,
    });
    logStep("Invoice payment initiated", { 
      invoiceId: paidInvoice.id,
      newStatus: paidInvoice.status
    });

    // Create billing_history record so UI shows "Processing" immediately
    const { error: bhError } = await supabaseClient.from("billing_history").insert({
      subscription_id: subscriptionId,
      amount: paidInvoice.amount_due / 100,
      net_amount: paidInvoice.amount_paid / 100,
      status: "processing",
      stripe_payment_intent_id: typeof paidInvoice.payment_intent === "string" 
        ? paidInvoice.payment_intent 
        : paidInvoice.payment_intent?.id ?? null,
      stripe_invoice_id: paidInvoice.id,
      payment_method: "ach",
    });

    if (bhError) {
      logStep("Warning: Failed to insert billing_history", { error: bhError.message });
    } else {
      logStep("billing_history record created with processing status");
    }

    // Update local subscription status to active
    const { error: updateError } = await supabaseClient
      .from("customer_subscriptions")
      .update({
        status: "active",
        next_billing_date: stripeSubscription.current_period_end 
          ? new Date(stripeSubscription.current_period_end * 1000).toISOString()
          : null
      })
      .eq("id", subscriptionId);

    if (updateError) {
      logStep("Warning: Failed to update local status", { error: updateError.message });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Subscription activated successfully for ${subscription.customers?.full_name || "customer"}`,
        invoiceStatus: paidInvoice.status,
        amountCharged: paidInvoice.amount_paid / 100
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
