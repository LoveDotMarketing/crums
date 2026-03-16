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
        JSON.stringify({ hasPaymentMethod: false, applicationStatus: null, paymentSetupStatus: null, paymentMethodType: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    logStep("Application loaded", {
      appId: application.id,
      status: application.payment_setup_status,
      storedPmId: application.stripe_payment_method_id,
      stripeCustomerId: application.stripe_customer_id,
    });

    // No Stripe customer yet → no payment method
    if (!application.stripe_customer_id) {
      logStep("No Stripe customer ID found");
      return new Response(
        JSON.stringify({
          hasPaymentMethod: false,
          applicationStatus: application.status,
          paymentSetupStatus: application.payment_setup_status,
          paymentMethodType: application.payment_method_type || "ach",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Fetch actual payment methods from Stripe
    const achMethods = await stripe.paymentMethods.list({ customer: application.stripe_customer_id, type: "us_bank_account" });
    const cardMethods = await stripe.paymentMethods.list({ customer: application.stripe_customer_id, type: "card" });
    logStep("Retrieved payment methods", { achCount: achMethods.data.length, cardCount: cardMethods.data.length });

    const allMethods = [...achMethods.data, ...cardMethods.data];
    const storedPmId = application.stripe_payment_method_id;

    // KEY RULE: Only trust the stored PM id. Check if it actually exists on the Stripe customer.
    const storedPmValid = storedPmId ? allMethods.some(m => m.id === storedPmId) : false;

    // AUTO-RESET: If DB says "completed" but stored PM is missing/detached, reset to pending
    if (application.payment_setup_status === "completed" && !storedPmValid) {
      logStep("Auto-resetting: completed but stored PM invalid", { storedPmId, appId: application.id });
      await supabaseClient
        .from("customer_applications")
        .update({ payment_setup_status: "pending", stripe_payment_method_id: null })
        .eq("id", application.id);

      return new Response(
        JSON.stringify({
          hasPaymentMethod: false,
          applicationStatus: application.status,
          paymentSetupStatus: "pending",
          paymentMethodType: application.payment_method_type || "ach",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // AUTO-RESET: If status is "sent" but no methods exist at all, reset to pending for retry
    if (application.payment_setup_status === "sent" && allMethods.length === 0) {
      logStep("Auto-resetting stuck 'sent' status", { appId: application.id });
      await supabaseClient
        .from("customer_applications")
        .update({ payment_setup_status: "pending", stripe_payment_method_id: null })
        .eq("id", application.id);

      return new Response(
        JSON.stringify({
          hasPaymentMethod: false,
          applicationStatus: application.status,
          paymentSetupStatus: "pending",
          paymentMethodType: application.payment_method_type || "ach",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // GUARD: If pending/sent and orphan methods exist but no stored PM, do NOT auto-complete.
    // The customer must go through the full setup flow.
    if (!storedPmValid) {
      logStep("No valid stored PM, returning not-complete", { status: application.payment_setup_status });
      return new Response(
        JSON.stringify({
          hasPaymentMethod: false,
          applicationStatus: application.status,
          paymentSetupStatus: application.payment_setup_status,
          paymentMethodType: application.payment_method_type || "ach",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Stored PM is valid — build detail response
    const storedPm = allMethods.find(m => m.id === storedPmId)!;
    const storedType = application.payment_method_type || "ach";
    let paymentMethodDetails: Record<string, unknown> = {};

    if (storedPm.type === "card" && storedPm.card) {
      paymentMethodDetails = {
        id: storedPm.id,
        brand: storedPm.card.brand || "card",
        last4: storedPm.card.last4 || "****",
        expMonth: storedPm.card.exp_month,
        expYear: storedPm.card.exp_year,
      };
    } else if (storedPm.type === "us_bank_account" && storedPm.us_bank_account) {
      paymentMethodDetails = {
        id: storedPm.id,
        bankName: storedPm.us_bank_account.bank_name || "Bank Account",
        last4: storedPm.us_bank_account.last4 || "****",
        accountType: storedPm.us_bank_account.account_type || "checking",
        accountHolderType: storedPm.us_bank_account.account_holder_type || "individual",
      };
    }

    return new Response(
      JSON.stringify({
        hasPaymentMethod: true,
        applicationStatus: application.status,
        paymentSetupStatus: "completed",
        paymentMethodType: storedType,
        paymentMethod: paymentMethodDetails,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
