import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

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
        // Get all payment intents for this subscription's customer
        const paymentIntents = await stripe.paymentIntents.list({
          customer: sub.stripe_customer_id,
          limit: 100,
        });

        for (const pi of paymentIntents.data) {
          // Check if this payment is already recorded
          const { data: existingPayment } = await supabaseClient
            .from("billing_history")
            .select("id, status")
            .eq("stripe_payment_intent_id", pi.id)
            .single();

          // Map Stripe status to our enum
          let paymentStatus: "pending" | "processing" | "succeeded" | "failed" | "refunded" = "pending";
          if (pi.status === "succeeded") paymentStatus = "succeeded";
          else if (pi.status === "processing") paymentStatus = "processing";
          else if (pi.status === "canceled" || pi.status === "requires_payment_method") paymentStatus = "failed";

          if (existingPayment) {
            // Update if status changed
            if (existingPayment.status !== paymentStatus) {
              await supabaseClient
                .from("billing_history")
                .update({
                  status: paymentStatus,
                  paid_at: paymentStatus === "succeeded" ? new Date().toISOString() : null,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", existingPayment.id);

              results.paymentsUpdated++;
              logStep("Updated payment status", { 
                paymentId: existingPayment.id, 
                newStatus: paymentStatus 
              });
            }
          } else if (pi.metadata?.subscription_id || pi.invoice) {
            // New payment - create record
            // Try to get invoice details for period info
            let billingPeriodStart: string | null = null;
            let billingPeriodEnd: string | null = null;
            let invoiceId: string | null = null;

            if (pi.invoice) {
              try {
                const invoice = await stripe.invoices.retrieve(pi.invoice as string);
                invoiceId = invoice.id;
                if (invoice.period_start) {
                  billingPeriodStart = new Date(invoice.period_start * 1000).toISOString();
                }
                if (invoice.period_end) {
                  billingPeriodEnd = new Date(invoice.period_end * 1000).toISOString();
                }
              } catch {
                // Invoice might not exist anymore
              }
            }

            await supabaseClient
              .from("billing_history")
              .insert({
                subscription_id: sub.id,
                amount: pi.amount / 100,
                net_amount: pi.amount_received / 100,
                status: paymentStatus,
                stripe_payment_intent_id: pi.id,
                stripe_invoice_id: invoiceId,
                billing_period_start: billingPeriodStart,
                billing_period_end: billingPeriodEnd,
                paid_at: paymentStatus === "succeeded" ? new Date(pi.created * 1000).toISOString() : null,
                payment_method: "ach",
              });

            results.paymentsCreated++;
            logStep("Created payment record", { paymentIntentId: pi.id });
          }

          // Check if this might be a deposit payment
          if (
            paymentStatus === "succeeded" &&
            !sub.deposit_paid &&
            sub.deposit_amount &&
            Math.abs((pi.amount / 100) - sub.deposit_amount) < 1
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
            
            // Map Stripe status to our allowed values: pending, active, paused, cancelled
            const statusMap: Record<string, string> = {
              incomplete: "pending",
              incomplete_expired: "cancelled",
              trialing: "active",
              active: "active",
              past_due: "active", // Still active but needs attention
              canceled: "cancelled",
              unpaid: "paused",
              paused: "paused",
            };
            const mappedStatus = statusMap[stripeSub.status] || "pending";
            logStep("Mapped subscription status", { stripeStatus: stripeSub.status, mappedStatus });
            
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
