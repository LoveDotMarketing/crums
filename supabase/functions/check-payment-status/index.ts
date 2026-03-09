import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
      .select("id, stripe_customer_id, stripe_payment_method_id, payment_setup_status, status, payment_method_type")
      .eq("user_id", user.id)
      .single();

    if (appError) {
      logStep("No application found", { error: appError.message });
      return new Response(
        JSON.stringify({
          hasPaymentMethod: false,
          applicationStatus: null,
          paymentSetupStatus: null,
          paymentMethodType: null,
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
          paymentMethodType: application.payment_method_type || "ach",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check for ACH payment methods
    const achMethods = await stripe.paymentMethods.list({
      customer: application.stripe_customer_id,
      type: "us_bank_account",
    });

    // Check for card payment methods
    const cardMethods = await stripe.paymentMethods.list({
      customer: application.stripe_customer_id,
      type: "card",
    });

    logStep("Retrieved payment methods", { achCount: achMethods.data.length, cardCount: cardMethods.data.length });

    // No payment methods at all
    if (achMethods.data.length === 0 && cardMethods.data.length === 0) {
      return new Response(
        JSON.stringify({
          hasPaymentMethod: false,
          applicationStatus: application.status,
          paymentSetupStatus: application.payment_setup_status,
          paymentMethodType: application.payment_method_type || "ach",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Determine which type is active based on stored preference, falling back to what exists
    const storedType = application.payment_method_type || "ach";
    let activeType: "ach" | "card" = storedType as "ach" | "card";
    let paymentMethodDetails: Record<string, unknown> = {};

    if (activeType === "card" && cardMethods.data.length > 0) {
      const card = cardMethods.data[0];
      paymentMethodDetails = {
        id: card.id,
        brand: card.card?.brand || "card",
        last4: card.card?.last4 || "****",
        expMonth: card.card?.exp_month,
        expYear: card.card?.exp_year,
      };
    } else if (activeType === "ach" && achMethods.data.length > 0) {
      const pm = achMethods.data[0];
      const bankAccount = pm.us_bank_account;
      paymentMethodDetails = {
        id: pm.id,
        bankName: bankAccount?.bank_name || "Bank Account",
        last4: bankAccount?.last4 || "****",
        accountType: bankAccount?.account_type || "checking",
        accountHolderType: bankAccount?.account_holder_type || "individual",
      };
    } else if (cardMethods.data.length > 0) {
      // Fallback: stored type doesn't match what exists
      activeType = "card";
      const card = cardMethods.data[0];
      paymentMethodDetails = {
        id: card.id,
        brand: card.card?.brand || "card",
        last4: card.card?.last4 || "****",
        expMonth: card.card?.exp_month,
        expYear: card.card?.exp_year,
      };
    } else {
      activeType = "ach";
      const pm = achMethods.data[0];
      const bankAccount = pm.us_bank_account;
      paymentMethodDetails = {
        id: pm.id,
        bankName: bankAccount?.bank_name || "Bank Account",
        last4: bankAccount?.last4 || "****",
        accountType: bankAccount?.account_type || "checking",
        accountHolderType: bankAccount?.account_holder_type || "individual",
      };
    }

    // Update application if payment method wasn't recorded
    if (!application.stripe_payment_method_id && paymentMethodDetails.id) {
      await supabaseClient
        .from("customer_applications")
        .update({
          stripe_payment_method_id: paymentMethodDetails.id as string,
          payment_setup_status: "completed",
          payment_method_type: activeType,
        })
        .eq("id", application.id);
      logStep("Updated application with payment method", { paymentMethodId: paymentMethodDetails.id, type: activeType });
    }

    return new Response(
      JSON.stringify({
        hasPaymentMethod: true,
        applicationStatus: application.status,
        paymentSetupStatus: "completed",
        paymentMethodType: activeType,
        paymentMethod: paymentMethodDetails,
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
