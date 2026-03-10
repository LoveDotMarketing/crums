import Stripe from "npm:stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-BILLING] ${step}${detailsStr}`);
};

Deno.serve(async (req) => {
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

    // This can be called by cron or manually by admin
    const authHeader = req.headers.get("Authorization");
    const cronSecret = Deno.env.get("CRON_SECRET");
    
    // Check if called by cron or by admin
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      
      // Check if it's a cron secret
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

    // Get all active subscriptions that need billing check
    const { data: subscriptions, error: subError } = await supabaseClient
      .from("customer_subscriptions")
      .select(`
        *,
        customers!inner(id, email, full_name)
      `)
      .eq("status", "active");

    if (subError) throw new Error(`Failed to fetch subscriptions: ${subError.message}`);
    logStep("Found active subscriptions", { count: subscriptions?.length || 0 });

    const results = {
      processed: 0,
      errors: [] as string[],
      updated: [] as string[],
    };

    for (const sub of subscriptions || []) {
      try {
        if (!sub.stripe_subscription_id) {
          logStep("Skipping subscription without Stripe ID", { id: sub.id });
          continue;
        }

        // Retrieve the Stripe subscription
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
        
        // Update local status if it changed
        if (mappedStatus !== sub.status) {
          await supabaseClient
            .from("customer_subscriptions")
            .update({
              status: mappedStatus,
              next_billing_date: new Date(stripeSub.current_period_end * 1000).toISOString(),
            })
            .eq("id", sub.id);

          results.updated.push(sub.id);
          logStep("Updated subscription status", { 
            id: sub.id, 
            oldStatus: sub.status, 
            newStatus: mappedStatus,
            stripeStatus: stripeSub.status 
          });
        }

        // Check for recent invoices and sync to billing_history
        const invoices = await stripe.invoices.list({
          subscription: sub.stripe_subscription_id,
          limit: 5,
        });

        for (const invoice of invoices.data) {
          // Check if we already have this invoice (e.g. inserted by activate-subscription)
          const { data: existing } = await supabaseClient
            .from("billing_history")
            .select("id, status, paid_at")
            .eq("stripe_invoice_id", invoice.id)
            .maybeSingle();

          if (existing) {
            // Update status if it changed (e.g. pending/processing → succeeded)
            if (existing.status !== paymentStatus) {
              await supabaseClient
                .from("billing_history")
                .update({
                  status: paymentStatus,
                  paid_at: paymentStatus === "succeeded" && invoice.status_transitions?.paid_at
                    ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
                    : existing.paid_at,
                  stripe_payment_intent_id: typeof invoice.payment_intent === 'string'
                    ? invoice.payment_intent : invoice.payment_intent?.id,
                  net_amount: invoice.amount_paid / 100,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", existing.id);
              logStep("Updated existing invoice status", { invoiceId: invoice.id, oldStatus: existing.status, newStatus: paymentStatus });
            } else {
              logStep("Skipping unchanged invoice", { invoiceId: invoice.id });
            }
            continue;
          }

            // Map Stripe status to our payment_status enum
            let paymentStatus: "pending" | "processing" | "succeeded" | "failed" | "refunded" = "pending";
            if (invoice.status === "paid") paymentStatus = "succeeded";
            else if (invoice.status === "open") paymentStatus = "pending";
            else if (invoice.status === "uncollectible") paymentStatus = "failed";

            await supabaseClient
              .from("billing_history")
              .insert({
                subscription_id: sub.id,
                amount: invoice.total / 100,
                net_amount: invoice.amount_paid / 100,
                discount_amount: invoice.total_discount_amounts?.reduce((sum: number, d: { amount: number }) => sum + d.amount, 0) / 100 || 0,
                status: paymentStatus,
                stripe_invoice_id: invoice.id,
                stripe_payment_intent_id: typeof invoice.payment_intent === 'string' ? invoice.payment_intent : invoice.payment_intent?.id,
                billing_period_start: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : null,
                billing_period_end: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null,
                paid_at: invoice.status === "paid" && invoice.status_transitions?.paid_at 
                  ? new Date(invoice.status_transitions.paid_at * 1000).toISOString() 
                  : null,
                payment_method: "ach",
              });

            logStep("Synced invoice to billing_history", { invoiceId: invoice.id });
        }

        results.processed++;
      } catch (subProcessError) {
        const msg = subProcessError instanceof Error ? subProcessError.message : String(subProcessError);
        results.errors.push(`Subscription ${sub.id}: ${msg}`);
        logStep("Error processing subscription", { id: sub.id, error: msg });
      }
    }

    logStep("Processing complete", results);

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
