import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[RETRY-PAYMENT] ${step}`, details ? JSON.stringify(details) : "");
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

    // Get payment failure record
    const { data: failure, error: failureError } = await supabase
      .from("payment_failures")
      .select("*")
      .eq("id", failureId)
      .maybeSingle();

    if (failureError || !failure) {
      throw new Error("Payment failure record not found");
    }

    if (failure.resolved_at) {
      return new Response(
        JSON.stringify({ success: false, message: "This payment failure has already been resolved" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!failure.stripe_invoice_id) {
      throw new Error("No Stripe invoice ID associated with this failure");
    }

    logStep("Found payment failure", { 
      stripeInvoiceId: failure.stripe_invoice_id,
      currentRetryCount: failure.retry_count 
    });

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-01-27.acacia",
    });

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

      return new Response(
        JSON.stringify({ success: true, message: "Invoice was already paid. Failure marked as resolved." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if invoice is in a retryable state
    if (invoice.status !== "open") {
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

      // Update retry count regardless of outcome
      await supabase
        .from("payment_failures")
        .update({
          retry_count: (failure.retry_count || 0) + 1,
          next_retry_at: null
        })
        .eq("id", failureId);

      if (paidInvoice.status === "paid") {
        // Payment succeeded - the webhook will handle marking as resolved
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

      // Update retry count
      await supabase
        .from("payment_failures")
        .update({
          retry_count: (failure.retry_count || 0) + 1
        })
        .eq("id", failureId);

      const errorMessage = paymentError instanceof Error ? paymentError.message : "Payment failed";
      
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
