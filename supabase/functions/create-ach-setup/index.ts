import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-ACH-SETUP] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const stripePublishableKey = Deno.env.get("STRIPE_PUBLISHABLE_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!stripePublishableKey) throw new Error("STRIPE_PUBLISHABLE_KEY is not set");

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

    // Get the user's application to find their customer info
    const { data: application, error: appError } = await supabaseClient
      .from("customer_applications")
      .select("id, stripe_customer_id, status")
      .eq("user_id", user.id)
      .single();

    if (appError) {
      logStep("Error fetching application", { error: appError.message });
      throw new Error("No application found for this user");
    }

    if (application.status !== "approved") {
      throw new Error("Application must be approved before setting up payment");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Find or create Stripe customer
    let customerId = application.stripe_customer_id;
    
    if (!customerId) {
      logStep("No existing Stripe customer, searching by email");
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found existing Stripe customer", { customerId });
      } else {
        // Get profile info for customer creation
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("first_name, last_name, phone, company_name")
          .eq("id", user.id)
          .single();

        const customer = await stripe.customers.create({
          email: user.email,
          name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || undefined : undefined,
          phone: profile?.phone || undefined,
          metadata: {
            supabase_user_id: user.id,
            company_name: profile?.company_name || '',
          },
        });
        customerId = customer.id;
        logStep("Created new Stripe customer", { customerId });
      }

      // Save customer ID to application
      await supabaseClient
        .from("customer_applications")
        .update({ stripe_customer_id: customerId })
        .eq("id", application.id);
    }

    // Create SetupIntent for ACH Direct Debit with Financial Connections
    // Note: When customer is specified, attach_to_self should NOT be set
    // The payment method will automatically attach to the customer
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["us_bank_account"],
      payment_method_options: {
        us_bank_account: {
          financial_connections: {
            permissions: ["payment_method", "balances"],
          },
          verification_method: "automatic",
        },
      },
      metadata: {
        supabase_user_id: user.id,
        application_id: application.id,
      },
    });

    logStep("SetupIntent created", { 
      setupIntentId: setupIntent.id, 
      clientSecret: setupIntent.client_secret?.slice(0, 20) + '...' 
    });

    return new Response(
      JSON.stringify({
        clientSecret: setupIntent.client_secret,
        setupIntentId: setupIntent.id,
        customerId: customerId,
        publishableKey: stripePublishableKey,
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
