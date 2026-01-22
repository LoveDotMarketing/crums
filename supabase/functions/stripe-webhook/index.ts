import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
    console.error("Missing required environment variables");
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-08-27.basil" });
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      logStep("Missing stripe-signature header");
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      logStep("Webhook signature verification failed", { error: errorMessage });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Received webhook event", { type: event.type, id: event.id });

    switch (event.type) {
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(supabase, stripe, invoice);
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(supabase, invoice);
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(supabase, subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(supabase, subscription);
        break;
      }
      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logStep("Webhook handler error", { error: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handlePaymentFailed(
  supabase: SupabaseClient,
  stripe: Stripe,
  invoice: Stripe.Invoice
) {
  logStep("Processing payment failed", { invoiceId: invoice.id, subscriptionId: invoice.subscription });

  if (!invoice.subscription) {
    logStep("No subscription associated with invoice, skipping");
    return;
  }

  const stripeSubscriptionId = typeof invoice.subscription === "string" 
    ? invoice.subscription 
    : invoice.subscription.id;

  // Find our subscription record
  const { data: subscription, error: subError } = await supabase
    .from("customer_subscriptions")
    .select("id, customer_id, failed_payment_count, grace_period_start")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .single();

  if (subError || !subscription) {
    logStep("Subscription not found in database", { stripeSubscriptionId, error: subError?.message });
    return;
  }

  // Get the payment intent for failure details
  let failureCode = "unknown";
  let failureMessage = "Payment failed";
  let paymentIntentId = "";

  if (invoice.payment_intent) {
    const piId = typeof invoice.payment_intent === "string" ? invoice.payment_intent : invoice.payment_intent.id;
    paymentIntentId = piId;
    
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(piId);
      if (paymentIntent.last_payment_error) {
        failureCode = paymentIntent.last_payment_error.code || "unknown";
        failureMessage = paymentIntent.last_payment_error.message || "Payment failed";
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      logStep("Could not retrieve payment intent", { error: errorMessage });
    }
  }

  // Check if we already have a failure record for this payment intent
  const { data: existingFailure } = await supabase
    .from("payment_failures")
    .select("id")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();

  if (existingFailure) {
    logStep("Payment failure already recorded", { paymentIntentId });
    return;
  }

  // Calculate grace period (7 days from first failure)
  const now = new Date();
  const gracePeriodStart = subscription.grace_period_start ? new Date(subscription.grace_period_start) : now;
  const gracePeriodEnd = new Date(gracePeriodStart);
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);

  // Create payment failure record
  const { error: insertError } = await supabase
    .from("payment_failures")
    .insert({
      subscription_id: subscription.id,
      stripe_payment_intent_id: paymentIntentId,
      stripe_invoice_id: invoice.id,
      amount: (invoice.amount_due || 0) / 100,
      failure_code: failureCode,
      failure_message: failureMessage,
      notification_sent_day_0: true, // We're sending it now
    });

  if (insertError) {
    logStep("Failed to insert payment failure record", { error: insertError.message });
    return;
  }

  // Update subscription with grace period info
  const newFailedCount = (subscription.failed_payment_count || 0) + 1;
  const { error: updateError } = await supabase
    .from("customer_subscriptions")
    .update({
      failed_payment_count: newFailedCount,
      grace_period_start: subscription.grace_period_start || now.toISOString(),
      grace_period_end: gracePeriodEnd.toISOString(),
      status: "past_due",
    })
    .eq("id", subscription.id);

  if (updateError) {
    logStep("Failed to update subscription", { error: updateError.message });
  }

  // Send Day 0 notification email
  await sendPaymentFailedEmail(supabase, subscription.customer_id, {
    amount: (invoice.amount_due || 0) / 100,
    failureReason: failureMessage,
    gracePeriodEnd: gracePeriodEnd.toISOString(),
    dayNumber: 0,
  });

  logStep("Payment failure processed", { 
    subscriptionId: subscription.id, 
    failedCount: newFailedCount,
    gracePeriodEnd: gracePeriodEnd.toISOString()
  });
}

async function handlePaymentSucceeded(
  supabase: SupabaseClient,
  invoice: Stripe.Invoice
) {
  logStep("Processing payment succeeded", { invoiceId: invoice.id });

  if (!invoice.subscription) return;

  const stripeSubscriptionId = typeof invoice.subscription === "string" 
    ? invoice.subscription 
    : invoice.subscription.id;

  // Find our subscription record
  const { data: subscription, error: subError } = await supabase
    .from("customer_subscriptions")
    .select("id")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .single();

  if (subError || !subscription) {
    logStep("Subscription not found", { stripeSubscriptionId });
    return;
  }

  // Resolve any pending payment failures
  if (invoice.payment_intent) {
    const piId = typeof invoice.payment_intent === "string" ? invoice.payment_intent : invoice.payment_intent.id;
    
    await supabase
      .from("payment_failures")
      .update({
        resolved_at: new Date().toISOString(),
        resolution_type: "paid",
      })
      .eq("stripe_payment_intent_id", piId);
  }

  // Reset subscription grace period
  await supabase
    .from("customer_subscriptions")
    .update({
      failed_payment_count: 0,
      grace_period_start: null,
      grace_period_end: null,
      status: "active",
    })
    .eq("id", subscription.id);

  // Update billing history
  await supabase
    .from("billing_history")
    .upsert({
      subscription_id: subscription.id,
      stripe_invoice_id: invoice.id,
      stripe_payment_intent_id: typeof invoice.payment_intent === "string" 
        ? invoice.payment_intent 
        : invoice.payment_intent?.id,
      amount: (invoice.total || 0) / 100,
      net_amount: (invoice.total || 0) / 100,
      status: "succeeded",
      paid_at: new Date().toISOString(),
    }, {
      onConflict: "stripe_invoice_id",
    });

  logStep("Payment success processed", { subscriptionId: subscription.id });
}

async function handleSubscriptionUpdated(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription
) {
  logStep("Processing subscription updated", { subscriptionId: subscription.id, status: subscription.status });

  // Map Stripe status to our status
  const statusMap: Record<string, string> = {
    active: "active",
    past_due: "past_due",
    unpaid: "past_due",
    canceled: "canceled",
    incomplete: "pending",
    incomplete_expired: "canceled",
    trialing: "active",
    paused: "paused",
  };

  const newStatus = statusMap[subscription.status] || "active";

  const { error } = await supabase
    .from("customer_subscriptions")
    .update({
      status: newStatus,
      next_billing_date: subscription.current_period_end 
        ? new Date(subscription.current_period_end * 1000).toISOString().split("T")[0]
        : null,
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    logStep("Failed to update subscription status", { error: error.message });
  }

  logStep("Subscription status updated", { stripeId: subscription.id, newStatus });
}

async function handleSubscriptionDeleted(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription
) {
  logStep("Processing subscription deleted", { subscriptionId: subscription.id });

  // Update subscription status to canceled
  const { data: sub } = await supabase
    .from("customer_subscriptions")
    .update({ status: "canceled" })
    .eq("stripe_subscription_id", subscription.id)
    .select("id")
    .single();

  if (sub) {
    // Resolve any pending failures
    await supabase
      .from("payment_failures")
      .update({
        resolved_at: new Date().toISOString(),
        resolution_type: "canceled",
      })
      .eq("subscription_id", sub.id)
      .is("resolved_at", null);

    // Release trailers
    await supabase
      .from("subscription_items")
      .update({ status: "ended", end_date: new Date().toISOString().split("T")[0] })
      .eq("subscription_id", sub.id);
  }

  logStep("Subscription deletion processed");
}

async function sendPaymentFailedEmail(
  supabase: SupabaseClient,
  customerId: string,
  details: { amount: number; failureReason: string; gracePeriodEnd: string; dayNumber: number }
) {
  // Get customer email
  const { data: customer } = await supabase
    .from("customers")
    .select("email, full_name")
    .eq("id", customerId)
    .single();

  if (!customer?.email) {
    logStep("No customer email found for notification");
    return;
  }

  const gracePeriodDate = new Date(details.gracePeriodEnd).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subject = details.dayNumber === 0
    ? "Payment Failed - Action Required"
    : `Payment Reminder - Day ${details.dayNumber} of Grace Period`;

  const body = `
Dear ${customer.full_name || "Customer"},

We were unable to process your payment of $${details.amount.toFixed(2)}.

Reason: ${details.failureReason}

Your grace period ends on ${gracePeriodDate}. Please update your payment method to avoid service interruption.

To update your payment information, please log in to your customer portal.

If you have any questions, please contact our support team.

Best regards,
CRUMS Leasing Team
  `.trim();

  try {
    // Use the existing send-outreach-email function
    const response = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-outreach-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({
        to: customer.email,
        subject,
        body,
        email_type: "payment_failed",
      }),
    });

    if (!response.ok) {
      logStep("Failed to send email", { status: response.status });
    } else {
      logStep("Payment failed email sent", { email: customer.email, dayNumber: details.dayNumber });
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logStep("Error sending email", { error: errorMessage });
  }
}
