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
  console.log(`[SYNC-PAYMENTS] ${step}${detailsStr}`);
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

    // Verify admin auth or cron
    const authHeader = req.headers.get("Authorization");
    const cronSecret = Deno.env.get("CRON_SECRET");
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      
      if (token !== cronSecret) {
        const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
        if (userError) throw new Error(`Authentication error: ${userError.message}`);

        const { data: roleData } = await supabaseClient
          .from("user_roles")
          .select("role")
          .eq("user_id", userData.user.id)
          .eq("role", "admin")
          .single();

        if (!roleData) throw new Error("Admin access required");
        logStep("Admin verified", { adminId: userData.user.id });
      } else {
        logStep("Cron job authenticated");
      }
    } else {
      throw new Error("No authorization provided");
    }

    // Per-subscription Stripe client is selected inside the loop via getStripeClient(sub).

    // Parse request body for optional filters
    let subscriptionId: string | undefined;
    try {
      const body = await req.json();
      subscriptionId = body.subscriptionId;
    } catch {
      // No body provided, sync all
    }

    // Build query
    let query = supabaseClient
      .from("customer_subscriptions")
      .select("*")
      .not("stripe_subscription_id", "is", null);

    if (subscriptionId) {
      query = query.eq("id", subscriptionId);
    }

    const { data: subscriptions, error: subError } = await query;
    if (subError) throw new Error(`Failed to fetch subscriptions: ${subError.message}`);

    logStep("Found subscriptions to sync", { count: subscriptions?.length || 0 });

    const results = {
      subscriptionsProcessed: 0,
      paymentsCreated: 0,
      paymentsUpdated: 0,
      depositsConfirmed: 0,
      errors: [] as string[],
    };

    for (const sub of subscriptions || []) {
      try {
        // Resolve correct Stripe client (live or test) for this subscription
        const { stripe, mode } = getStripeClient(sub);
        logStep("Processing subscription", { subId: sub.id, mode });
        // Get invoices for this subscription directly from Stripe
        const stripeInvoices = [];
        if (sub.stripe_subscription_id) {
          try {
            const invoiceList = await stripe.invoices.list({
              subscription: sub.stripe_subscription_id,
              limit: 100,
            });
            stripeInvoices.push(...invoiceList.data);
          } catch {
            logStep("Could not list invoices for subscription", { subId: sub.id });
          }
        }

        // Also get standalone invoices (deposits/charges) for this customer
        try {
          const { customerId } = getStripeClient(sub);
          if (customerId) {
            const customerInvoices = await stripe.invoices.list({
              customer: customerId,
              limit: 100,
            });
            // Add invoices that reference this subscription via metadata
            for (const inv of customerInvoices.data) {
              if (inv.metadata?.subscription_id === sub.stripe_subscription_id &&
                  !stripeInvoices.some(si => si.id === inv.id)) {
                stripeInvoices.push(inv);
              }
            }
          }
        } catch {
          // ignore
        }

        logStep("Found invoices for subscription", { subId: sub.id, count: stripeInvoices.length });

        for (const inv of stripeInvoices) {
          // Skip $0 invoices
          if (inv.amount_due === 0 && inv.amount_paid === 0) continue;

          const piId = typeof inv.payment_intent === "string" 
            ? inv.payment_intent 
            : inv.payment_intent?.id ?? null;

          // Check if this payment is already recorded
          let existingPayment: { id: string; status: string } | null = null;

          if (piId) {
            const { data: byPI } = await supabaseClient
              .from("billing_history")
              .select("id, status")
              .eq("stripe_payment_intent_id", piId)
              .maybeSingle();
            existingPayment = byPI;
          }

          if (!existingPayment) {
            const { data: byInv } = await supabaseClient
              .from("billing_history")
              .select("id, status")
              .eq("stripe_invoice_id", inv.id)
              .maybeSingle();
            existingPayment = byInv;

            // Backfill the payment_intent_id
            if (byInv && piId) {
              await supabaseClient
                .from("billing_history")
                .update({ stripe_payment_intent_id: piId })
                .eq("id", byInv.id);
              logStep("Backfilled stripe_payment_intent_id", { id: byInv.id, piId });
            }
          }

          // Map invoice status to payment status
          let paymentStatus: "pending" | "processing" | "succeeded" | "failed" | "refunded" = "pending";
          if (inv.status === "paid") {
            // Double-check via PI if available
            if (piId) {
              try {
                const pi = await stripe.paymentIntents.retrieve(piId);
                if (pi.status === "succeeded") paymentStatus = "succeeded";
                else if (pi.status === "processing") paymentStatus = "processing";
                else if (pi.status === "canceled" || pi.status === "requires_payment_method") paymentStatus = "failed";
                else paymentStatus = "succeeded"; // invoice is paid, trust it
              } catch {
                paymentStatus = "succeeded"; // invoice says paid
              }
            } else {
              paymentStatus = "succeeded";
            }
          } else if (inv.status === "open") {
            // Check the payment intent to distinguish pending vs failed vs processing
            if (piId) {
              try {
                const pi = await stripe.paymentIntents.retrieve(piId);
                if (pi.status === "requires_payment_method" || pi.status === "canceled") {
                  paymentStatus = "failed";
                } else if (pi.status === "processing") {
                  paymentStatus = "processing";
                } else {
                  paymentStatus = "pending";
                }
                logStep("Checked PI for open invoice", { invoiceId: inv.id, piStatus: pi.status, paymentStatus });
              } catch {
                paymentStatus = "processing"; // default for open invoices when PI check fails
              }
            } else {
              paymentStatus = "pending";
            }
          } else if (inv.status === "void" || inv.status === "uncollectible") {
            paymentStatus = "failed";
          }

          if (existingPayment) {
            if (existingPayment.status !== paymentStatus) {
              await supabaseClient
                .from("billing_history")
                .update({
                  status: paymentStatus,
                  paid_at: paymentStatus === "succeeded" ? new Date().toISOString() : null,
                  updated_at: new Date().toISOString(),
                  stripe_payment_intent_id: piId || undefined,
                  stripe_mode: mode,
                })
                .eq("id", existingPayment.id);

              results.paymentsUpdated++;
              logStep("Updated payment status", {
                paymentId: existingPayment.id,
                oldStatus: existingPayment.status,
                newStatus: paymentStatus,
                mode,
              });
            }
          } else {
            // Create new billing_history record
            let billingPeriodStart: string | null = null;
            let billingPeriodEnd: string | null = null;
            if (inv.period_start) {
              billingPeriodStart = new Date(inv.period_start * 1000).toISOString();
            }
            if (inv.period_end) {
              billingPeriodEnd = new Date(inv.period_end * 1000).toISOString();
            }

            await supabaseClient
              .from("billing_history")
              .insert({
                subscription_id: sub.id,
                amount: inv.amount_due / 100,
                net_amount: inv.amount_paid / 100,
                status: paymentStatus,
                stripe_payment_intent_id: piId,
                stripe_invoice_id: inv.id,
                billing_period_start: billingPeriodStart,
                billing_period_end: billingPeriodEnd,
                paid_at: paymentStatus === "succeeded" ? new Date(inv.created * 1000).toISOString() : null,
                payment_method: "ach",
                stripe_mode: mode,
              });

            results.paymentsCreated++;
            logStep("Created payment record", { invoiceId: inv.id, status: paymentStatus, amount: inv.amount_due / 100, mode });
          }

          // Check if this might be a deposit payment — use metadata first, then fall back to amount matching
          const isDepositByMetadata = inv.metadata?.type === "security_deposit";
          const isDepositByAmount = !isDepositByMetadata && sub.deposit_amount && Math.abs((inv.amount_due / 100) - sub.deposit_amount) < 1;
          if (
            paymentStatus === "succeeded" &&
            !sub.deposit_paid &&
            (isDepositByMetadata || isDepositByAmount)
          ) {
            await supabaseClient
              .from("customer_subscriptions")
              .update({
                deposit_paid: true,
                deposit_paid_at: new Date().toISOString(),
              })
              .eq("id", sub.id);

            results.depositsConfirmed++;
            logStep("Confirmed deposit payment", { subscriptionId: sub.id });
          }
        }

        // Also sync subscription status from Stripe
        if (sub.stripe_subscription_id) {
          try {
            const stripeSub = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
            
            // Map Stripe status to our allowed values: pending, active, paused, canceled
            // CRITICAL: Use "canceled" (single L) to match database constraint
            const statusMap: Record<string, string> = {
              incomplete: "pending",
              incomplete_expired: "canceled",
              trialing: "active",
              active: "active",
              canceled: "canceled",
              unpaid: "paused",
              paused: "paused",
            };
            
            // Smart past_due mapping: only map to "active" if there's been a successful payment
            let mappedStatus: string;
            if (stripeSub.status === "past_due") {
              const { data: successPayments } = await supabaseClient
                .from("billing_history")
                .select("id")
                .eq("subscription_id", sub.id)
                .eq("status", "succeeded")
                .limit(1);
              mappedStatus = successPayments?.length ? "active" : "pending";
            } else {
              mappedStatus = statusMap[stripeSub.status] ?? sub.status ?? "pending";
            }
            logStep("Mapping subscription status", { stripeStatus: stripeSub.status, mappedStatus, currentStatus: sub.status });
            
            await supabaseClient
              .from("customer_subscriptions")
              .update({
                status: mappedStatus,
                next_billing_date: new Date(stripeSub.current_period_end * 1000).toISOString(),
              })
              .eq("id", sub.id);
          } catch {
            // Subscription might have been deleted
          }
        }

        results.subscriptionsProcessed++;
      } catch (subError) {
        const msg = subError instanceof Error ? subError.message : String(subError);
        results.errors.push(`Subscription ${sub.id}: ${msg}`);
        logStep("Error syncing subscription", { id: sub.id, error: msg });
      }
    }

    logStep("Sync complete", results);

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
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
        status: 500,
      }
    );
  }
});
