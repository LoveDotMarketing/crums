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

const resolveAchPaymentMethodId = async ({
  stripe,
  supabaseClient,
  stripeCustomerId,
  localCustomerId,
  customerEmail,
}: {
  stripe: Stripe;
  supabaseClient: ReturnType<typeof createClient>;
  stripeCustomerId: string;
  localCustomerId: string;
  customerEmail?: string | null;
}) => {
  // 1) Prefer payment methods already attached to the Stripe customer on the subscription
  const existingMethods = await stripe.paymentMethods.list({
    customer: stripeCustomerId,
    type: "us_bank_account",
    limit: 1,
  });

  if (existingMethods.data.length > 0) {
    const paymentMethodId = existingMethods.data[0].id;
    logStep("Found ACH payment method on subscription customer", { paymentMethodId });
    return paymentMethodId;
  }

  // 2) Fallback to stored ACH setup in customer_applications
  let storedPmId: string | null = null;

  const { data: appByCustomerRows, error: appByCustomerError } = await supabaseClient
    .from("customer_applications")
    .select("stripe_payment_method_id")
    .eq("customer_id", localCustomerId)
    .not("stripe_payment_method_id", "is", null)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (appByCustomerError) {
    logStep("Warning: failed customer_id payment method lookup", { error: appByCustomerError.message, localCustomerId });
  }

  storedPmId = appByCustomerRows?.[0]?.stripe_payment_method_id ?? null;

  if (!storedPmId && customerEmail) {
    const { data: profileRows, error: profileError } = await supabaseClient
      .from("profiles")
      .select("id")
      .ilike("email", customerEmail)
      .limit(1);

    if (profileError) {
      logStep("Warning: failed profile lookup for ACH fallback", { error: profileError.message, customerEmail });
    }

    const profileId = profileRows?.[0]?.id;

    if (profileId) {
      const { data: appByUserRows, error: appByUserError } = await supabaseClient
        .from("customer_applications")
        .select("stripe_payment_method_id")
        .eq("user_id", profileId)
        .not("stripe_payment_method_id", "is", null)
        .order("updated_at", { ascending: false })
        .limit(1);

      if (appByUserError) {
        logStep("Warning: failed user_id payment method lookup", { error: appByUserError.message, profileId });
      }

      storedPmId = appByUserRows?.[0]?.stripe_payment_method_id ?? null;
    }
  }

  // 3) Last fallback: find ACH method on any Stripe customer with same email
  if (!storedPmId && customerEmail) {
    const sameEmailCustomers = await stripe.customers.list({ email: customerEmail, limit: 10 });

    for (const candidateCustomer of sameEmailCustomers.data) {
      if (candidateCustomer.id === stripeCustomerId) continue;
      const candidateMethods = await stripe.paymentMethods.list({
        customer: candidateCustomer.id,
        type: "us_bank_account",
        limit: 1,
      });
      if (candidateMethods.data.length > 0) {
        storedPmId = candidateMethods.data[0].id;
        logStep("Recovered ACH method from same-email Stripe customer", {
          paymentMethodId: storedPmId,
          fromStripeCustomerId: candidateCustomer.id,
        });
        break;
      }
    }
  }

  if (!storedPmId) {
    throw new Error("Customer has no payment method attached. They need to complete ACH setup first.");
  }

  logStep("Recovered stored ACH payment method from application", { paymentMethodId: storedPmId });
  return storedPmId;
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

    // If already active, check if deposit still needs to be charged
    if (stripeSubscription.status === "active") {
      const depositAmount = subscription.deposit_amount || 0;
      const depositPaid = subscription.deposit_paid || false;

      if (!depositPaid && depositAmount > 0) {
        logStep("Subscription active but deposit unpaid, charging deposit now", { depositAmount });

        const paymentMethodId = await resolveAchPaymentMethodId({
          stripe,
          supabaseClient,
          stripeCustomerId: subscription.stripe_customer_id,
          localCustomerId: subscription.customer_id,
          customerEmail: subscription.customers?.email,
        });

        const resolvedPm = await stripe.paymentMethods.retrieve(paymentMethodId);
        let paymentMethodCustomerId = typeof resolvedPm.customer === "string"
          ? resolvedPm.customer
          : resolvedPm.customer?.id ?? null;

        // If the payment method is detached, re-attach it to the subscription's Stripe customer
        if (!paymentMethodCustomerId) {
          logStep("Payment method is detached, re-attaching to subscription customer", { paymentMethodId, targetCustomer: subscription.stripe_customer_id });
          try {
            await stripe.paymentMethods.attach(paymentMethodId, { customer: subscription.stripe_customer_id });
            paymentMethodCustomerId = subscription.stripe_customer_id;
            logStep("Successfully re-attached payment method");
          } catch (attachErr: any) {
            logStep("Failed to re-attach payment method", { error: attachErr.message });
            throw new Error("Customer ACH payment method could not be re-attached. Please resend ACH setup and have the customer reconnect their bank account, then retry activation.");
          }
        }

        const chargeCustomerId = paymentMethodCustomerId;

        if (chargeCustomerId !== subscription.stripe_customer_id) {
          logStep("Charging deposit on alternate Stripe customer tied to ACH setup", {
            chargeCustomerId,
            subscriptionStripeCustomerId: subscription.stripe_customer_id,
            paymentMethodId,
          });
        }

        // Set default payment method on the customer being charged
        await stripe.customers.update(chargeCustomerId, {
          invoice_settings: { default_payment_method: paymentMethodId },
        });

        // Create standalone deposit invoice
        await stripe.invoiceItems.create({
          customer: chargeCustomerId,
          amount: Math.round(depositAmount * 100),
          currency: "usd",
          description: "Security Deposit",
        });

        const depositInvoice = await stripe.invoices.create({
          customer: chargeCustomerId,
          auto_advance: false,
          metadata: { type: "security_deposit", subscription_id: subscription.stripe_subscription_id },
        });

        const finalizedInvoice = await stripe.invoices.finalizeInvoice(depositInvoice.id);
        logStep("Finalized deposit invoice", { invoiceId: finalizedInvoice.id, amountDue: finalizedInvoice.amount_due });

        const paidInvoice = await stripe.invoices.pay(finalizedInvoice.id, {
          payment_method: paymentMethodId,
        });
        logStep("Deposit invoice payment initiated", { invoiceId: paidInvoice.id, status: paidInvoice.status });

        // Update deposit status in database
        await supabaseClient
          .from("customer_subscriptions")
          .update({
            deposit_paid: true,
            deposit_paid_at: new Date().toISOString(),
            status: "active",
          })
          .eq("id", subscriptionId);

        // Create billing_history record for deposit
        await supabaseClient.from("billing_history").insert({
          subscription_id: subscriptionId,
          amount: depositAmount,
          net_amount: depositAmount,
          status: "processing",
          stripe_payment_intent_id: typeof paidInvoice.payment_intent === "string"
            ? paidInvoice.payment_intent
            : paidInvoice.payment_intent?.id ?? null,
          stripe_invoice_id: paidInvoice.id,
          payment_method: "ach",
        });

        logStep("Deposit charged successfully");

        return new Response(
          JSON.stringify({
            success: true,
            message: `Security deposit of $${depositAmount} charged for ${subscription.customers?.full_name || "customer"}`,
            depositCharged: true,
            amountCharged: depositAmount,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      logStep("Subscription already active and deposit already paid, skipping");
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

    const paymentMethodId = await resolveAchPaymentMethodId({
      stripe,
      supabaseClient,
      stripeCustomerId: subscription.stripe_customer_id,
      localCustomerId: subscription.customer_id,
      customerEmail: subscription.customers?.email,
    });

    const resolvedPm = await stripe.paymentMethods.retrieve(paymentMethodId);
    let paymentMethodCustomerId = typeof resolvedPm.customer === "string"
      ? resolvedPm.customer
      : resolvedPm.customer?.id ?? null;

    // If the payment method is detached, re-attach it to the subscription's Stripe customer
    if (!paymentMethodCustomerId) {
      logStep("Payment method is detached, re-attaching to subscription customer", { paymentMethodId, targetCustomer: subscription.stripe_customer_id });
      try {
        await stripe.paymentMethods.attach(paymentMethodId, { customer: subscription.stripe_customer_id });
        paymentMethodCustomerId = subscription.stripe_customer_id;
        logStep("Successfully re-attached payment method");
      } catch (attachErr: any) {
        logStep("Failed to re-attach payment method", { error: attachErr.message });
        throw new Error("Customer ACH payment method could not be re-attached. Please resend ACH setup and have the customer reconnect their bank account, then retry activation.");
      }
    }

    // If PM is attached to a different Stripe customer, detach and re-attach to the subscription customer
    if (paymentMethodCustomerId !== subscription.stripe_customer_id) {
      logStep("Payment method on different customer, re-attaching", { from: paymentMethodCustomerId, to: subscription.stripe_customer_id });
      try {
        await stripe.paymentMethods.detach(paymentMethodId);
        await stripe.paymentMethods.attach(paymentMethodId, { customer: subscription.stripe_customer_id });
        paymentMethodCustomerId = subscription.stripe_customer_id;
        logStep("Successfully moved payment method to subscription customer");
      } catch (moveErr: any) {
        logStep("Failed to move payment method", { error: moveErr.message });
        throw new Error("Customer ACH payment method belongs to a different billing profile and could not be moved. Please re-run ACH setup for this customer.");
      }
    }

    logStep("Payment method verified", { paymentMethodId, paymentMethodCustomerId });

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
      net_amount: paidInvoice.amount_due / 100,
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

    // Re-check Stripe subscription status after payment attempt
    const updatedStripeSub = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
    const localStatus = updatedStripeSub.status === "active" ? "active" : "pending";
    logStep("Post-payment Stripe status check", { stripeStatus: updatedStripeSub.status, localStatus });

    // Update local subscription status based on actual Stripe status
    const { error: updateError } = await supabaseClient
      .from("customer_subscriptions")
      .update({
        status: localStatus,
        next_billing_date: updatedStripeSub.current_period_end 
          ? new Date(updatedStripeSub.current_period_end * 1000).toISOString()
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
