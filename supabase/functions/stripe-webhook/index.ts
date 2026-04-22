import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

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

  const liveStripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const liveWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET");
  const testStripeKey = Deno.env.get("STRIPE_TEST_SECRET_KEY");
  const testWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET_TEST");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!liveStripeKey || !liveWebhookSecret || !supabaseUrl || !supabaseServiceKey) {
    console.error("Missing required environment variables");
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const liveStripe = new Stripe(liveStripeKey, { apiVersion: "2025-08-27.basil" });
  const testStripe = testStripeKey ? new Stripe(testStripeKey, { apiVersion: "2025-08-27.basil" }) : null;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Will be reassigned after signature verification picks live or test mode
  let stripe: Stripe = liveStripe;
  let stripeMode: "live" | "test" = "live";

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

    // Dual-mode signature verification: try live first, then test
    let event: Stripe.Event;
    try {
      event = await liveStripe.webhooks.constructEventAsync(body, signature, liveWebhookSecret);
      stripe = liveStripe;
      stripeMode = "live";
    } catch (liveErr: unknown) {
      // Live verification failed — try test mode if configured
      if (testStripe && testWebhookSecret) {
        try {
          event = await testStripe.webhooks.constructEventAsync(body, signature, testWebhookSecret);
          stripe = testStripe;
          stripeMode = "test";
          logStep("Verified with TEST signing secret");
        } catch (testErr: unknown) {
          const liveMsg = liveErr instanceof Error ? liveErr.message : "Unknown";
          const testMsg = testErr instanceof Error ? testErr.message : "Unknown";
          logStep("Webhook signature verification failed for both live and test", { liveMsg, testMsg });
          return new Response(JSON.stringify({ error: "Invalid signature" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else {
        const errorMessage = liveErr instanceof Error ? liveErr.message : "Unknown error";
        logStep("Webhook signature verification failed (test mode not configured)", { error: errorMessage });
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    logStep("Received webhook event", { type: event.type, id: event.id, mode: stripeMode, livemode: event.livemode });

    logStep("Received webhook event", { type: event.type, id: event.id });

    // Prepare webhook log data
    let logData: {
      event_id: string;
      event_type: string;
      status: string;
      customer_email?: string;
      customer_id?: string;
      subscription_id?: string;
      stripe_subscription_id?: string;
      amount?: number;
      error_message?: string;
      payload?: object;
    } = {
      event_id: event.id,
      event_type: event.type,
      status: "success",
      payload: { livemode: event.livemode, api_version: event.api_version }
    };

    try {
      switch (event.type) {
        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          logData.amount = (invoice.amount_due || 0) / 100;
          logData.stripe_subscription_id = typeof invoice.subscription === "string" 
            ? invoice.subscription 
            : invoice.subscription?.id;
          await handlePaymentFailed(supabase, stripe, invoice, stripeMode);
          break;
        }
        case "invoice.paid": {
          const invoice = event.data.object as Stripe.Invoice;
          logData.amount = (invoice.total || 0) / 100;
          logData.stripe_subscription_id = typeof invoice.subscription === "string" 
            ? invoice.subscription 
            : invoice.subscription?.id;
          await handlePaymentSucceeded(supabase, stripe, invoice, stripeMode);
          break;
        }
        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;
          logData.stripe_subscription_id = subscription.id;
          logData.payload = { ...logData.payload, subscription_status: subscription.status };
          await handleSubscriptionUpdated(supabase, subscription);
          break;
        }
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          logData.stripe_subscription_id = subscription.id;
          await handleSubscriptionDeleted(supabase, subscription);
          break;
        }
        default:
          logStep("Unhandled event type", { type: event.type });
      }

      // Look up our subscription and customer IDs if we have a stripe_subscription_id
      // Check both live and sandbox columns
      if (logData.stripe_subscription_id) {
        const { data: subData } = await supabase
          .from("customer_subscriptions")
          .select("id, customer_id, customers(email)")
          .or(`stripe_subscription_id.eq.${logData.stripe_subscription_id},sandbox_stripe_subscription_id.eq.${logData.stripe_subscription_id}`)
          .maybeSingle();

        if (subData) {
          logData.subscription_id = subData.id;
          logData.customer_id = subData.customer_id;
          // customers is a joined table result
          const customers = subData.customers as unknown as { email?: string } | null;
          logData.customer_email = customers?.email || undefined;
        }
      }
    } catch (handlerError: unknown) {
      const errorMessage = handlerError instanceof Error ? handlerError.message : "Unknown error";
      logStep("Handler error", { error: errorMessage });
      logData.status = "error";
      logData.error_message = errorMessage;
    }

    // Log the webhook event
    const { error: logError } = await supabase
      .from("stripe_webhook_logs")
      .insert(logData);
    
    if (logError) {
      logStep("Failed to insert webhook log", { error: logError.message });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logStep("Webhook handler error", { error: errorMessage });
    
    // Try to log the error even if we can't process the event
    try {
      await supabase
        .from("stripe_webhook_logs")
        .insert({
          event_id: `error-${Date.now()}`,
          event_type: "unknown",
          status: "error",
          error_message: errorMessage,
        });
    } catch {
      // Ignore logging errors
    }
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handlePaymentFailed(
  supabase: SupabaseClient,
  stripe: Stripe,
  invoice: Stripe.Invoice,
  stripeMode: "live" | "test"
) {
  logStep("Processing payment failed", { invoiceId: invoice.id, subscriptionId: invoice.subscription, mode: stripeMode });

  if (!invoice.subscription) {
    logStep("No subscription associated with invoice, skipping");
    return;
  }

  const stripeSubscriptionId = typeof invoice.subscription === "string" 
    ? invoice.subscription 
    : invoice.subscription.id;

  // Find our subscription record (check both live and sandbox columns)
  const { data: subscription, error: subError } = await supabase
    .from("customer_subscriptions")
    .select("id, customer_id, failed_payment_count, grace_period_start")
    .or(`stripe_subscription_id.eq.${stripeSubscriptionId},sandbox_stripe_subscription_id.eq.${stripeSubscriptionId}`)
    .maybeSingle();

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

  // Update billing_history status to "failed" for this invoice
  if (invoice.id) {
    const { error: bhError } = await supabase
      .from("billing_history")
      .update({
        status: "failed",
        failure_reason: failureMessage,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_invoice_id", invoice.id);
    
    if (bhError) {
      logStep("Failed to update billing_history status to failed", { error: bhError.message });
    } else {
      logStep("Updated billing_history to failed", { invoiceId: invoice.id });
    }
  }

  // Update subscription with grace period info
  const newFailedCount = (subscription.failed_payment_count || 0) + 1;
  // Note: We keep status as "active" during grace period - "past_due" is not a valid DB status
  // The grace_period_start and grace_period_end fields indicate the payment issue
  const { error: updateError } = await supabase
    .from("customer_subscriptions")
    .update({
      failed_payment_count: newFailedCount,
      grace_period_start: subscription.grace_period_start || now.toISOString(),
      grace_period_end: gracePeriodEnd.toISOString(),
      // Keep as active during grace period - admin can pause/cancel if needed
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
  stripe: Stripe,
  invoice: Stripe.Invoice,
  stripeMode: "live" | "test"
) {
  logStep("Processing payment succeeded", {
    invoiceId: invoice.id,
    customerId: invoice.customer,
    subscriptionId: invoice.subscription,
    hasSubscription: !!invoice.subscription,
    billingReason: invoice.billing_reason,
    mode: stripeMode,
  });

  // Skip invoices that aren't for subscriptions (one-time payments, etc.)
  if (!invoice.subscription) {
    // Try to find subscription by customer email as fallback
    const stripeCustomerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
    if (!stripeCustomerId) {
      logStep("No subscription or customer on invoice, skipping");
      return;
    }
    
    logStep("No subscription on invoice, trying customer lookup fallback");
    
    try {
      const stripeCustomer = await stripe.customers.retrieve(stripeCustomerId);
      if (stripeCustomer && !stripeCustomer.deleted && stripeCustomer.email) {
        logStep("Found Stripe customer for fallback", { email: stripeCustomer.email });
        
        // Find customer by email
        const { data: customer } = await supabase
          .from("customers")
          .select("id")
          .eq("email", stripeCustomer.email)
          .maybeSingle();
        
        if (customer) {
          // Find their active/pending subscription
          const { data: custSub } = await supabase
            .from("customer_subscriptions")
            .select("id, customer_id")
            .eq("customer_id", customer.id)
            .in("status", ["active", "pending"])
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (custSub) {
            logStep("Found subscription via customer email fallback", { subscriptionId: custSub.id });
            
            // Update billing history and send email for this invoice
            await supabase
              .from("billing_history")
              .upsert({
                subscription_id: custSub.id,
                stripe_invoice_id: invoice.id,
                stripe_payment_intent_id: typeof invoice.payment_intent === "string"
                  ? invoice.payment_intent
                  : invoice.payment_intent?.id,
                amount: (invoice.total || 0) / 100,
                net_amount: (invoice.total || 0) / 100,
                status: "succeeded",
                paid_at: new Date().toISOString(),
                stripe_mode: stripeMode,
              }, {
                onConflict: "stripe_invoice_id",
              });
            
            // Send receipt email
            await sendPaymentReceiptEmail(supabase, custSub.customer_id, {
              amount: (invoice.total || 0) / 100,
              invoiceNumber: invoice.number || invoice.id,
              invoiceUrl: invoice.hosted_invoice_url || null,
              billingPeriodStart: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : null,
              billingPeriodEnd: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null,
            });
            
            logStep("Processed invoice via customer fallback successfully");
            return;
          }
        }
      }
    } catch (err) {
      logStep("Customer fallback lookup failed", { error: err instanceof Error ? err.message : "Unknown" });
    }
    
    logStep("Could not process invoice - no subscription found via any method");
    return;
  }

  const stripeSubscriptionId = typeof invoice.subscription === "string" 
    ? invoice.subscription 
    : invoice.subscription.id;

  logStep("Looking for subscription", { stripeSubscriptionId });

  // Find our subscription record (check both live and sandbox columns)
  let subscription: { id: string; customer_id: string } | null = null;

  const { data: subData, error: subError } = await supabase
    .from("customer_subscriptions")
    .select("id, customer_id")
    .or(`stripe_subscription_id.eq.${stripeSubscriptionId},sandbox_stripe_subscription_id.eq.${stripeSubscriptionId}`)
    .maybeSingle();

  if (subData) {
    subscription = subData;
    logStep("Found subscription by stripe_subscription_id", { subscriptionId: subscription.id });
  } else {
    logStep("Subscription not found by stripe_subscription_id, trying by customer email", { error: subError?.message });
    
    // Fallback: lookup by customer email from Stripe
    const stripeCustomerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
    if (stripeCustomerId) {
      try {
        const stripeCustomer = await stripe.customers.retrieve(stripeCustomerId);
        if (stripeCustomer && !stripeCustomer.deleted && stripeCustomer.email) {
          logStep("Found Stripe customer email", { email: stripeCustomer.email });
          
          // Find customer by email, then get their subscription
          const { data: customer } = await supabase
            .from("customers")
            .select("id")
            .eq("email", stripeCustomer.email)
            .maybeSingle();
          
          if (customer) {
            const { data: custSub } = await supabase
              .from("customer_subscriptions")
              .select("id, customer_id")
              .eq("customer_id", customer.id)
              .in("status", ["active", "pending"])
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();
            
            if (custSub) {
              subscription = custSub;
              logStep("Found subscription by customer email fallback", { subscriptionId: subscription.id });
              
              // Update the stripe_subscription_id for future lookups
              await supabase
                .from("customer_subscriptions")
                .update({ stripe_subscription_id: stripeSubscriptionId })
                .eq("id", subscription.id);
            }
          }
        }
      } catch (err) {
        logStep("Failed to lookup Stripe customer", { error: err instanceof Error ? err.message : "Unknown" });
      }
    }
  }

  if (!subscription) {
    logStep("Could not find subscription record for invoice", { stripeSubscriptionId });
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

  // Reset subscription grace period and reinstate if suspended
  const { data: currentSub } = await supabase
    .from("customer_subscriptions")
    .select("status")
    .eq("id", subscription.id)
    .single();

  // Auto-reinstate suspended accounts when payment succeeds
  const newStatus = currentSub?.status === "suspended" ? "active" : "active";
  
  await supabase
    .from("customer_subscriptions")
    .update({
      failed_payment_count: 0,
      grace_period_start: null,
      grace_period_end: null,
      status: newStatus,
    })
    .eq("id", subscription.id);

  if (currentSub?.status === "suspended") {
    logStep("Auto-reinstated suspended account", { subscriptionId: subscription.id });
  }

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
      stripe_mode: stripeMode,
    }, {
      onConflict: "stripe_invoice_id",
    });

  logStep("Billing history updated, now sending receipt email");

  // Send payment receipt email via SendGrid
  await sendPaymentReceiptEmail(supabase, subscription.customer_id, {
    amount: (invoice.total || 0) / 100,
    invoiceNumber: invoice.number || invoice.id,
    invoiceUrl: invoice.hosted_invoice_url || null,
    billingPeriodStart: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : null,
    billingPeriodEnd: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null,
  });

  logStep("Payment success processed", { subscriptionId: subscription.id });
}

async function handleSubscriptionUpdated(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription
) {
  logStep("Processing subscription updated", { subscriptionId: subscription.id, status: subscription.status });

  // Map Stripe status to our valid DB status: pending | active | paused | canceled
  // CRITICAL: Do not use "past_due" - it's not in our DB constraint
  const statusMap: Record<string, string> = {
    active: "active",
    past_due: "active",      // Keep active during grace period
    unpaid: "paused",        // Pause when fully unpaid
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
    .or(`stripe_subscription_id.eq.${subscription.id},sandbox_stripe_subscription_id.eq.${subscription.id}`);

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

  // Update subscription status to canceled (check both live and sandbox columns)
  const { data: sub } = await supabase
    .from("customer_subscriptions")
    .update({ status: "canceled" })
    .or(`stripe_subscription_id.eq.${subscription.id},sandbox_stripe_subscription_id.eq.${subscription.id}`)
    .select("id")
    .maybeSingle();

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

async function sendPaymentReceiptEmail(
  supabase: SupabaseClient,
  customerId: string,
  details: { 
    amount: number; 
    invoiceNumber: string; 
    invoiceUrl: string | null;
    billingPeriodStart: string | null;
    billingPeriodEnd: string | null;
  }
) {
  // Get customer email
  const { data: customer } = await supabase
    .from("customers")
    .select("email, full_name")
    .eq("id", customerId)
    .single();

  if (!customer?.email) {
    logStep("No customer email found for receipt notification");
    return;
  }

  const paidDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let billingPeriodText = "";
  if (details.billingPeriodStart && details.billingPeriodEnd) {
    const startDate = new Date(details.billingPeriodStart).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const endDate = new Date(details.billingPeriodEnd).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    billingPeriodText = `<p><strong>Billing Period:</strong> ${startDate} - ${endDate}</p>`;
  }

  const invoiceLinkHtml = details.invoiceUrl 
    ? `<p><a href="${details.invoiceUrl}" style="color: #0066cc; text-decoration: underline;">View Invoice Details</a></p>`
    : "";

  const subject = `Payment Receipt - $${details.amount.toFixed(2)} - CRUMS Leasing`;

  const body = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #1a1a1a; margin-bottom: 5px;">Payment Received</h1>
    <p style="color: #666; font-size: 14px;">Thank you for your payment</p>
  </div>
  
  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin-bottom: 25px;">
    <p style="margin: 0 0 15px 0;">Dear ${customer.full_name || "Valued Customer"},</p>
    
    <p>We have successfully received your payment. Here are the details:</p>
    
    <div style="background-color: #fff; border-radius: 6px; padding: 20px; margin: 20px 0; border: 1px solid #e9ecef;">
      <p style="margin: 0 0 10px 0;"><strong>Amount Paid:</strong> <span style="color: #28a745; font-size: 18px; font-weight: bold;">$${details.amount.toFixed(2)}</span></p>
      <p style="margin: 0 0 10px 0;"><strong>Invoice Number:</strong> ${details.invoiceNumber}</p>
      <p style="margin: 0 0 10px 0;"><strong>Payment Date:</strong> ${paidDate}</p>
      ${billingPeriodText}
    </div>
    
    ${invoiceLinkHtml}
    
    <p>This payment confirms your continued trailer leasing service with CRUMS Leasing.</p>
  </div>
  
  <div style="border-top: 1px solid #e9ecef; padding-top: 20px; text-align: center; color: #666; font-size: 13px;">
    <p style="margin: 0 0 10px 0;">If you have any questions about this payment, please contact us.</p>
    <p style="margin: 0;">
      <strong>CRUMS Leasing</strong><br>
      <a href="mailto:sales@crumsleasing.com" style="color: #0066cc;">sales@crumsleasing.com</a> | 
      <a href="https://crumsleasing.com" style="color: #0066cc;">crumsleasing.com</a>
    </p>
  </div>
</body>
</html>
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
        recipients: [{
          email: customer.email,
          customer_id: customerId,
          customer_name: customer.full_name,
        }],
        subject,
        body,
        email_type: "payment_receipt",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logStep("Failed to send receipt email", { status: response.status, error: errorText });
    } else {
      logStep("Payment receipt email sent", { email: customer.email, amount: details.amount });
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logStep("Error sending receipt email", { error: errorMessage });
  }
}
