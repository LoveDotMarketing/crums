import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[PROCESS-PAYMENT-FAILURES] ${step}${detailsStr}`);
};

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  template_type: string;
  is_active: boolean;
}

interface PaymentFailure {
  id: string;
  subscription_id: string;
  stripe_payment_intent_id: string;
  stripe_invoice_id: string | null;
  amount: number;
  failure_code: string | null;
  failure_message: string | null;
  failed_at: string;
  notification_sent_day_0: boolean;
  notification_sent_day_3: boolean;
  notification_sent_day_5: boolean;
  subscription: {
    id: string;
    customer_id: string;
    stripe_subscription_id: string | null;
    grace_period_end: string | null;
    customers: {
      email: string | null;
      full_name: string | null;
    } | null;
  } | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const cronSecret = Deno.env.get("CRON_SECRET");

  if (!supabaseUrl || !supabaseServiceKey || !stripeSecretKey) {
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Verify authorization (cron secret or admin JWT)
  const authHeader = req.headers.get("Authorization");
  const isCronCall = authHeader === `Bearer ${cronSecret}`;

  if (!isCronCall) {
    // Verify admin JWT
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") || "", {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: authData, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", authData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-08-27.basil" });

  try {
    logStep("Starting payment failure processing");

    // Fetch email templates for payment failures
    const { data: templates } = await supabase
      .from("email_templates")
      .select("*")
      .in("template_type", ["payment_failed_day_0", "payment_failed_day_3", "payment_failed_day_5", "subscription_canceled"])
      .eq("is_active", true);

    const templateMap: Record<string, EmailTemplate> = {};
    for (const t of templates || []) {
      templateMap[t.template_type] = t;
    }

    logStep("Loaded email templates", { count: Object.keys(templateMap).length });

    // Get all unresolved payment failures
    const { data: failures, error: failuresError } = await supabase
      .from("payment_failures")
      .select(`
        *,
        subscription:customer_subscriptions(
          id,
          customer_id,
          stripe_subscription_id,
          grace_period_end,
          customers(email, full_name)
        )
      `)
      .is("resolved_at", null)
      .order("failed_at", { ascending: true });

    if (failuresError) {
      throw new Error(`Failed to fetch payment failures: ${failuresError.message}`);
    }

    logStep("Found unresolved failures", { count: failures?.length || 0 });

    const now = new Date();
    let notificationsSent = 0;
    let subscriptionsSuspended = 0;

    for (const failure of (failures as PaymentFailure[]) || []) {
      const failedAt = new Date(failure.failed_at);
      const daysSinceFailed = Math.floor((now.getTime() - failedAt.getTime()) / (1000 * 60 * 60 * 24));
      const subscription = failure.subscription;
      const customer = subscription?.customers;

      logStep("Processing failure", { 
        failureId: failure.id, 
        daysSinceFailed,
        customerId: subscription?.customer_id 
      });

      // Send Day 3 notification
      if (daysSinceFailed >= 3 && !failure.notification_sent_day_3 && customer?.email) {
        await sendTemplatedEmail({
          email: customer.email,
          name: customer.full_name,
          amount: failure.amount,
          gracePeriodEnd: subscription?.grace_period_end || "",
          template: templateMap["payment_failed_day_3"],
          fallbackSubject: "Urgent: 4 Days Left to Update Payment - CRUMS Leasing",
        });

        await supabase
          .from("payment_failures")
          .update({ notification_sent_day_3: true })
          .eq("id", failure.id);

        notificationsSent++;
        logStep("Sent Day 3 notification", { email: customer.email });
      }

      // Send Day 5 notification
      if (daysSinceFailed >= 5 && !failure.notification_sent_day_5 && customer?.email) {
        await sendTemplatedEmail({
          email: customer.email,
          name: customer.full_name,
          amount: failure.amount,
          gracePeriodEnd: subscription?.grace_period_end || "",
          template: templateMap["payment_failed_day_5"],
          fallbackSubject: "FINAL NOTICE: Payment Required in 2 Days - CRUMS Leasing",
        });

        await supabase
          .from("payment_failures")
          .update({ notification_sent_day_5: true })
          .eq("id", failure.id);

        notificationsSent++;
        logStep("Sent Day 5 notification", { email: customer.email });
      }

      // Check if grace period has ended (Day 7+)
      if (daysSinceFailed >= 7 && subscription) {
        logStep("Grace period ended, suspending subscription", { 
          subscriptionId: subscription.id 
        });

        // Cancel the Stripe subscription
        if (subscription.stripe_subscription_id) {
          try {
            await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
            logStep("Canceled Stripe subscription", { 
              stripeId: subscription.stripe_subscription_id 
            });
          } catch (stripeErr: unknown) {
            const errorMessage = stripeErr instanceof Error ? stripeErr.message : "Unknown error";
            logStep("Error canceling Stripe subscription", { error: errorMessage });
          }
        }

        // Update our records - use "suspended" instead of "canceled" to allow reinstatement
        await supabase
          .from("customer_subscriptions")
          .update({ status: "suspended" })
          .eq("id", subscription.id);

        // Release trailers
        const { data: items } = await supabase
          .from("subscription_items")
          .select("trailer_id")
          .eq("subscription_id", subscription.id);

        if (items?.length) {
          const trailerIds = items.map(i => i.trailer_id);
          
          await supabase
            .from("subscription_items")
            .update({ status: "ended", end_date: now.toISOString().split("T")[0] })
            .eq("subscription_id", subscription.id);

          await supabase
            .from("trailers")
            .update({ is_rented: false, customer_id: null, status: "available" })
            .in("id", trailerIds);

          logStep("Released trailers", { count: trailerIds.length });
        }

        // Mark failure as resolved
        await supabase
          .from("payment_failures")
          .update({
            resolved_at: now.toISOString(),
            resolution_type: "suspended",
          })
          .eq("id", failure.id);

        // Send suspension notification email
        if (customer?.email) {
          await sendTemplatedEmail({
            email: customer.email,
            name: customer.full_name,
            amount: failure.amount,
            gracePeriodEnd: "",
            template: templateMap["subscription_canceled"],
            fallbackSubject: "Account Suspended - Payment Required to Reinstate",
          });
        }

        subscriptionsSuspended++;
      }
    }

    logStep("Processing complete", { notificationsSent, subscriptionsSuspended });

    return new Response(
      JSON.stringify({
        success: true,
        processed: failures?.length || 0,
        notificationsSent,
        subscriptionsSuspended,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logStep("Error processing payment failures", { error: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function sendTemplatedEmail(
  details: { 
    email: string; 
    name?: string | null; 
    amount: number; 
    gracePeriodEnd: string; 
    template?: EmailTemplate;
    fallbackSubject: string;
  }
) {
  const gracePeriodDate = details.gracePeriodEnd 
    ? new Date(details.gracePeriodEnd).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const baseUrl = "https://crumsleasing.com";
  
  // Use template if available, otherwise use fallback
  let subject = details.fallbackSubject;
  let body = `
Dear ${details.name || "Customer"},

This is a reminder that your payment of $${details.amount.toFixed(2)} is still outstanding.

Please update your payment method immediately to avoid service interruption.

Log in to your customer portal to update your payment information.

Best regards,
CRUMS Leasing Team
  `.trim();

  if (details.template) {
    subject = details.template.subject;
    body = details.template.body;
    
    // Replace template variables
    const replacements: Record<string, string> = {
      "{{customer_name}}": details.name || "Valued Customer",
      "{{payment_amount}}": `$${details.amount.toFixed(2)}`,
      "{{grace_period_end}}": gracePeriodDate,
      "{{login_url}}": `${baseUrl}/login`,
      "{{unsubscribe_url}}": `${baseUrl}/unsubscribe?email=${encodeURIComponent(details.email)}`,
    };
    
    for (const [key, value] of Object.entries(replacements)) {
      subject = subject.replace(new RegExp(key, "g"), value);
      body = body.replace(new RegExp(key, "g"), value);
    }
  }

  try {
    const response = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-outreach-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({
        to: details.email,
        subject,
        body,
        email_type: "payment_reminder",
      }),
    });

    if (!response.ok) {
      console.error("Failed to send email:", response.status);
    }
  } catch (err) {
    console.error("Error sending email:", err);
  }
}
