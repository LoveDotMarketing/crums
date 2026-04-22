import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[RETRY-PAYMENT] ${step}`, details ? JSON.stringify(details) : "");
};

const BASE_URL = "https://crumsleasing.com";

// Send email notification to customer about payment retry
const sendRetryNotification = async (
  sendgridApiKey: string,
  customerEmail: string,
  customerName: string,
  amount: number,
  success: boolean,
  errorMessage?: string
) => {
  const subject = success 
    ? "Good News! Your Payment Has Been Processed - CRUMS Leasing"
    : "Payment Retry Update - CRUMS Leasing";

  const successBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #22c55e;">Payment Successfully Processed!</h2>
      <p>Hi ${customerName},</p>
      <p>Great news! We successfully processed your payment of <strong>$${amount.toFixed(2)}</strong>.</p>
      <p>Your account is now in good standing and your service continues uninterrupted.</p>
      <p>If you have any questions about this payment, please don't hesitate to contact us.</p>
      <p style="margin-top: 24px;">
        <a href="${BASE_URL}/dashboard/customer/billing" style="background-color: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Your Billing</a>
      </p>
      <p style="margin-top: 32px; color: #666;">
        Thank you for your business!<br>
        <strong>CRUMS Leasing Team</strong><br>
        <a href="tel:555-555-5555">555-555-5555</a>
      </p>
    </div>
  `;

  const failureBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ef4444;">Payment Retry Unsuccessful</h2>
      <p>Hi ${customerName},</p>
      <p>We attempted to process your payment of <strong>$${amount.toFixed(2)}</strong>, but unfortunately it was not successful.</p>
      ${errorMessage ? `<p style="color: #666; background: #f5f5f5; padding: 12px; border-radius: 4px;"><em>Reason: ${errorMessage}</em></p>` : ""}
      <p>Please update your payment method or contact us to resolve this issue and avoid any service interruption.</p>
      <p style="margin-top: 24px;">
        <a href="${BASE_URL}/dashboard/customer/billing" style="background-color: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Update Payment Method</a>
      </p>
      <p style="margin-top: 32px; color: #666;">
        Need help? Call us at <a href="tel:555-555-5555">555-555-5555</a><br>
        <strong>CRUMS Leasing Team</strong>
      </p>
    </div>
  `;

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sendgridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: customerEmail }] }],
        from: { email: "sales@crumsleasing.com", name: "CRUMS Leasing" },
        reply_to: { email: "sales@crumsleasing.com" },
        subject,
        content: [{ type: "text/html", value: success ? successBody : failureBody }],
      }),
    });

    if (response.ok) {
      logStep("Email notification sent", { customerEmail, success });
    } else {
      const errorText = await response.text();
      logStep("Failed to send email notification", { customerEmail, error: errorText });
    }
  } catch (error) {
    logStep("Error sending email notification", { error: String(error) });
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");

    if (!supabaseUrl || !supabaseServiceKey || !stripeSecretKey) {
      throw new Error("Missing required environment variables");
    }

    // Authenticate admin user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace("Bearer ", "");
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error("Invalid authentication token");
    }

    // Check if user is admin
    const { data: roles, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roles) {
      throw new Error("Unauthorized: Admin access required");
    }

    logStep("Admin authenticated", { userId: user.id });

    // Parse request body
    const { failureId } = await req.json();
    if (!failureId) {
      throw new Error("Missing failureId parameter");
    }

    logStep("Processing retry request", { failureId });

    // Get payment failure record with customer + subscription (for sandbox routing)
    const { data: failure, error: failureError } = await supabase
      .from("payment_failures")
      .select(`
        *,
        customer_subscriptions (
          sandbox,
          stripe_customer_id,
          sandbox_stripe_customer_id,
          customers (
            full_name,
            email
          )
        )
      `)
      .eq("id", failureId)
      .maybeSingle();

    if (failureError || !failure) {
      throw new Error("Payment failure record not found");
    }

    const customerEmail = failure.customer_subscriptions?.customers?.email;
    const customerName = failure.customer_subscriptions?.customers?.full_name || "Valued Customer";
    const paymentAmount = Number(failure.amount);

    if (failure.resolved_at) {
      return new Response(
        JSON.stringify({ success: false, message: "This payment failure has already been resolved" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check cooldown (1 hour between retries)
    const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
    if (failure.last_retry_at) {
      const lastRetry = new Date(failure.last_retry_at).getTime();
      const now = Date.now();
      const timeSinceRetry = now - lastRetry;
      
      if (timeSinceRetry < COOLDOWN_MS) {
        const remainingMinutes = Math.ceil((COOLDOWN_MS - timeSinceRetry) / (60 * 1000));
        return new Response(
          JSON.stringify({ 
            success: false, 
            cooldown: true,
            remainingMinutes,
            message: `Please wait ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''} before retrying again.`
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (!failure.stripe_invoice_id) {
      throw new Error("No Stripe invoice ID associated with this failure");
    }

    logStep("Found payment failure", { 
      stripeInvoiceId: failure.stripe_invoice_id,
      currentRetryCount: failure.retry_count,
      customerEmail
    });

    // Initialize Stripe via shared helper (live or test based on subscription.sandbox)
    const { getStripeClient } = await import("../_shared/billing.ts");
    const subForClient = failure.customer_subscriptions ?? {};
    const { stripe } = getStripeClient(subForClient);

    // Retrieve the invoice from Stripe
    const invoice = await stripe.invoices.retrieve(failure.stripe_invoice_id);
    logStep("Retrieved Stripe invoice", { status: invoice.status });

    // Check if invoice is already paid
    if (invoice.status === "paid") {
      // Mark the failure as resolved since invoice is already paid
      await supabase
        .from("payment_failures")
        .update({
          resolved_at: new Date().toISOString(),
          resolution_type: "paid"
        })
        .eq("id", failureId);

      // Log the retry attempt
      await supabase.from("payment_retry_logs").insert({
        payment_failure_id: failureId,
        admin_id: user.id,
        stripe_invoice_id: failure.stripe_invoice_id,
        amount: paymentAmount,
        outcome: "already_paid",
        customer_notified: false
      });

      // Send success notification
      let customerNotified = false;
      if (sendgridApiKey && customerEmail) {
        // Check if notifications are enabled
        const { data: notifSetting } = await supabase
          .from("outreach_settings")
          .select("setting_value")
          .eq("setting_key", "payment_retry_notification_enabled")
          .maybeSingle();
        
        const notificationsEnabled = notifSetting?.setting_value !== "false";
        if (notificationsEnabled) {
          await sendRetryNotification(sendgridApiKey, customerEmail, customerName, paymentAmount, true);
          customerNotified = true;
        }
      }

      // Update log with notification status
      if (customerNotified) {
        await supabase
          .from("payment_retry_logs")
          .update({ customer_notified: true })
          .eq("payment_failure_id", failureId)
          .eq("outcome", "already_paid")
          .order("created_at", { ascending: false })
          .limit(1);
      }

      return new Response(
        JSON.stringify({ success: true, message: "Invoice was already paid. Failure marked as resolved." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if invoice is in a retryable state
    if (invoice.status !== "open") {
      // Log the non-retryable attempt
      await supabase.from("payment_retry_logs").insert({
        payment_failure_id: failureId,
        admin_id: user.id,
        stripe_invoice_id: failure.stripe_invoice_id,
        amount: paymentAmount,
        outcome: "not_retryable",
        error_message: `Invoice status is '${invoice.status}'`,
        customer_notified: false
      });

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Invoice status is '${invoice.status}' and cannot be retried. Only 'open' invoices can be retried.` 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Attempt to pay the invoice
    logStep("Attempting to pay invoice");
    
    try {
      const paidInvoice = await stripe.invoices.pay(failure.stripe_invoice_id);
      logStep("Invoice payment result", { status: paidInvoice.status });

      // Update retry count and last_retry_at regardless of outcome
      await supabase
        .from("payment_failures")
        .update({
          retry_count: (failure.retry_count || 0) + 1,
          last_retry_at: new Date().toISOString(),
          next_retry_at: null
        })
        .eq("id", failureId);

      if (paidInvoice.status === "paid") {
        // Payment succeeded - send success notification if enabled
        let customerNotified = false;
        if (sendgridApiKey && customerEmail) {
          const { data: notifSetting } = await supabase
            .from("outreach_settings")
            .select("setting_value")
            .eq("setting_key", "payment_retry_notification_enabled")
            .maybeSingle();
          
          if (notifSetting?.setting_value !== "false") {
            await sendRetryNotification(sendgridApiKey, customerEmail, customerName, paymentAmount, true);
            customerNotified = true;
          }
        }

        // Log successful retry
        await supabase.from("payment_retry_logs").insert({
          payment_failure_id: failureId,
          admin_id: user.id,
          stripe_invoice_id: failure.stripe_invoice_id,
          amount: paymentAmount,
          outcome: "success",
          customer_notified: customerNotified
        });

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Payment retry successful! Invoice has been paid." 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        // Payment didn't immediately succeed (might be processing)
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Payment is processing. Invoice status: ${paidInvoice.status}` 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (paymentError) {
      // Payment failed again
      logStep("Payment retry failed", { error: String(paymentError) });

      // Update retry count and last_retry_at
      await supabase
        .from("payment_failures")
        .update({
          retry_count: (failure.retry_count || 0) + 1,
          last_retry_at: new Date().toISOString()
        })
        .eq("id", failureId);

      const errorMessage = paymentError instanceof Error ? paymentError.message : "Payment failed";
      
      // Send failure notification if enabled
      let customerNotified = false;
      if (sendgridApiKey && customerEmail) {
        const { data: notifSetting } = await supabase
          .from("outreach_settings")
          .select("setting_value")
          .eq("setting_key", "payment_retry_notification_enabled")
          .maybeSingle();
        
        if (notifSetting?.setting_value !== "false") {
          await sendRetryNotification(sendgridApiKey, customerEmail, customerName, paymentAmount, false, errorMessage);
          customerNotified = true;
        }
      }

      // Log failed retry
      await supabase.from("payment_retry_logs").insert({
        payment_failure_id: failureId,
        admin_id: user.id,
        stripe_invoice_id: failure.stripe_invoice_id,
        amount: paymentAmount,
        outcome: "failed",
        error_message: errorMessage,
        customer_notified: customerNotified
      });

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Payment retry failed: ${errorMessage}` 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    logStep("Error in retry-payment", { error: String(error) });
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : "An error occurred" 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
