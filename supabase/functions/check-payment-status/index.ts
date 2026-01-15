import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-PAYMENT-STATUS] ${step}${detailsStr}`);
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

    // Get auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get the user's application
    const { data: application, error: appError } = await supabaseClient
      .from("customer_applications")
      .select("id, stripe_customer_id, stripe_payment_method_id, payment_setup_status, status")
      .eq("user_id", user.id)
      .single();

    if (appError) {
      logStep("No application found", { error: appError.message });
      return new Response(
        JSON.stringify({
          hasPaymentMethod: false,
          applicationStatus: null,
          paymentSetupStatus: null,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // If no Stripe customer yet, no payment method
    if (!application.stripe_customer_id) {
      logStep("No Stripe customer ID found");
      return new Response(
        JSON.stringify({
          hasPaymentMethod: false,
          applicationStatus: application.status,
          paymentSetupStatus: application.payment_setup_status,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get payment methods for this customer
    const paymentMethods = await stripe.paymentMethods.list({
      customer: application.stripe_customer_id,
      type: "us_bank_account",
    });

    logStep("Retrieved payment methods", { count: paymentMethods.data.length });

    if (paymentMethods.data.length === 0) {
      return new Response(
        JSON.stringify({
          hasPaymentMethod: false,
          applicationStatus: application.status,
          paymentSetupStatus: application.payment_setup_status,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Get the first (most recent) payment method
    const pm = paymentMethods.data[0];
    const bankAccount = pm.us_bank_account;

    // Update application if payment method wasn't recorded
    if (!application.stripe_payment_method_id && pm.id) {
      await supabaseClient
        .from("customer_applications")
        .update({
          stripe_payment_method_id: pm.id,
          payment_setup_status: "completed",
        })
        .eq("id", application.id);
      logStep("Updated application with payment method", { paymentMethodId: pm.id });
    }

    return new Response(
      JSON.stringify({
        hasPaymentMethod: true,
        applicationStatus: application.status,
        paymentSetupStatus: "completed",
        paymentMethod: {
          id: pm.id,
          bankName: bankAccount?.bank_name || "Bank Account",
          last4: bankAccount?.last4 || "****",
          accountType: bankAccount?.account_type || "checking",
          accountHolderType: bankAccount?.account_holder_type || "individual",
        },
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
