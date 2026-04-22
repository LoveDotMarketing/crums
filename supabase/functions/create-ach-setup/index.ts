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

    const liveStripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const liveStripePublishableKey = Deno.env.get("STRIPE_PUBLISHABLE_KEY");
    if (!liveStripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!liveStripePublishableKey) throw new Error("STRIPE_PUBLISHABLE_KEY is not set");

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

    // Check for admin acting on behalf of a customer
    const body = await req.json().catch(() => ({}));
    const { targetUserId, customerId, customerEmail, paymentMethodType } = body;
    const pmType = paymentMethodType === "card" ? "card" : "ach";
    let lookupUserId = user.id;
    let useCustomerPath = false;

    if (targetUserId || customerId) {
      logStep("Admin mode requested", { targetUserId, customerId });
      // Verify caller is admin
      const { data: adminRole } = await supabaseClient
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!adminRole) {
        throw new Error("Admin access required to set up payment for another user");
      }
      logStep("Admin role verified");

      if (targetUserId) {
        lookupUserId = targetUserId;
      } else if (customerId) {
        useCustomerPath = true;
        lookupUserId = customerId;
      }
    }

    // Defer stripe instantiation until we know if this application is in sandbox mode
    let stripe: Stripe;
    let stripePublishableKey = liveStripePublishableKey;
    let stripeMode: "live" | "test" = "live";

    let targetEmail: string;
    let targetName: string | undefined;
    let targetPhone: string | undefined;
    let targetCompany: string | undefined;

    if (useCustomerPath) {
      const { data: customerRecord } = await supabaseClient
        .from("customers")
        .select("id, email, full_name, phone, company_name")
        .eq("id", customerId)
        .single();

      if (!customerRecord) {
        throw new Error("Customer record not found");
      }
      if (!customerRecord.email && !customerEmail) {
        throw new Error("Customer has no email on file. Please add an email first.");
      }

      targetEmail = customerRecord.email || customerEmail;
      targetName = customerRecord.full_name || undefined;
      targetPhone = customerRecord.phone || undefined;
      targetCompany = customerRecord.company_name || undefined;
      logStep("Using customer record path", { customerId, email: targetEmail });
    } else {
      const { data: targetProfile } = await supabaseClient
        .from("profiles")
        .select("id, email, first_name, last_name, phone, company_name")
        .eq("id", lookupUserId)
        .single();

      if (!targetProfile) {
        throw new Error("Profile not found for the target user");
      }

      targetEmail = targetProfile.email;
      targetName = `${targetProfile.first_name || ''} ${targetProfile.last_name || ''}`.trim() || undefined;
      targetPhone = targetProfile.phone || undefined;
      targetCompany = targetProfile.company_name || undefined;
    }

    // Get or create customer_applications row
    const APP_SELECT = "id, stripe_customer_id, status, sandbox, sandbox_stripe_customer_id, stripe_mode";
    let { data: application } = useCustomerPath
      ? await supabaseClient
          .from("customer_applications")
          .select(APP_SELECT)
          .eq("customer_id", customerId)
          .maybeSingle()
      : await supabaseClient
          .from("customer_applications")
          .select(APP_SELECT)
          .eq("user_id", lookupUserId)
          .maybeSingle();

    if (!application) {
      logStep("No application found, auto-creating minimal record");
      const insertPayload = useCustomerPath
        ? {
            customer_id: customerId,
            phone_number: targetPhone || "N/A",
            status: "pending_review",
          }
        : {
            user_id: lookupUserId,
            phone_number: targetPhone || "N/A",
            status: "pending_review",
          };
      const { data: newApp, error: createAppError } = await supabaseClient
        .from("customer_applications")
        .insert(insertPayload)
        .select(APP_SELECT)
        .single();
      if (createAppError) {
        logStep("Error creating application", { error: createAppError.message });
        throw new Error("Failed to create application record for payment setup");
      }
      application = newApp;
      logStep("Auto-created application", { applicationId: application.id });
    } else {
      logStep("Application found", { applicationId: application.id, status: application.status, sandbox: application.sandbox });
    }

    // Resolve stripe instance based on application sandbox flag
    if (application.sandbox) {
      const testKey = Deno.env.get("STRIPE_TEST_SECRET_KEY");
      const testPublishable = Deno.env.get("STRIPE_TEST_PUBLISHABLE_KEY");
      if (!testKey) throw new Error("Sandbox application: STRIPE_TEST_SECRET_KEY is not configured");
      if (!testPublishable) throw new Error("Sandbox application: STRIPE_TEST_PUBLISHABLE_KEY is not configured. Add this secret to enable sandbox payment setup.");
      stripe = new Stripe(testKey, { apiVersion: "2025-08-27.basil" });
      stripePublishableKey = testPublishable;
      stripeMode = "test";
      logStep("Using Stripe TEST mode for sandbox application");
    } else {
      stripe = new Stripe(liveStripeKey, { apiVersion: "2025-08-27.basil" });
      stripeMode = "live";
    }

    // Find or create Stripe customer.
    // In sandbox mode, use the application's sandbox_stripe_customer_id (test mode customer);
    // in live mode, use stripe_customer_id.
    let customerId_stripe = application.sandbox
      ? application.sandbox_stripe_customer_id
      : application.stripe_customer_id;

    if (customerId_stripe) {
      try {
        await stripe.customers.retrieve(customerId_stripe);
        logStep("Verified existing Stripe customer", { customerId: customerId_stripe, mode: stripeMode });
      } catch (stripeErr) {
        logStep("WARNING: Stored Stripe customer ID is invalid, will create new one", {
          invalidId: customerId_stripe,
          mode: stripeMode,
          error: stripeErr instanceof Error ? stripeErr.message : String(stripeErr),
        });
        customerId_stripe = null;
        await supabaseClient
          .from("customer_applications")
          .update(application.sandbox ? { sandbox_stripe_customer_id: null } : { stripe_customer_id: null })
          .eq("id", application.id);
      }
    }
    
    if (!customerId_stripe) {
      logStep("No valid Stripe customer, searching by email", { mode: stripeMode });
      const customers = await stripe.customers.list({ email: targetEmail, limit: 1 });
      
      if (customers.data.length > 0) {
        customerId_stripe = customers.data[0].id;
        logStep("Found existing Stripe customer", { customerId: customerId_stripe });
      } else {
        const customer = await stripe.customers.create({
          email: targetEmail,
          name: targetName,
          phone: targetPhone,
          metadata: {
            supabase_user_id: lookupUserId,
            company_name: targetCompany || '',
            ...(application.sandbox ? { source: "lovable_admin_sandbox", live_application_id: String(application.id) } : {}),
            ...(useCustomerPath ? { customer_record_id: customerId } : {}),
          },
        });
        customerId_stripe = customer.id;
        logStep("Created new Stripe customer", { customerId: customerId_stripe, mode: stripeMode });
      }

      const persistPayload: Record<string, unknown> = { stripe_mode: stripeMode };
      if (application.sandbox) {
        persistPayload.sandbox_stripe_customer_id = customerId_stripe;
      } else {
        persistPayload.stripe_customer_id = customerId_stripe;
      }
      await supabaseClient
        .from("customer_applications")
        .update(persistPayload)
        .eq("id", application.id);
    } else if (application.stripe_mode !== stripeMode) {
      await supabaseClient
        .from("customer_applications")
        .update({ stripe_mode: stripeMode })
        .eq("id", application.id);
    }

    // Create SetupIntent based on payment method type
    let setupIntent;
    if (pmType === "card") {
      setupIntent = await stripe.setupIntents.create({
        customer: customerId_stripe,
        payment_method_types: ["card"],
        metadata: {
          supabase_user_id: lookupUserId,
          application_id: application.id,
          initiated_by_admin: user.id,
          payment_method_type: "card",
          ...(useCustomerPath ? { customer_record_path: "true" } : {}),
        },
      });
      logStep("Card SetupIntent created", { setupIntentId: setupIntent.id });
    } else {
      setupIntent = await stripe.setupIntents.create({
        customer: customerId_stripe,
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
          supabase_user_id: lookupUserId,
          application_id: application.id,
          initiated_by_admin: user.id,
          payment_method_type: "ach",
          ...(useCustomerPath ? { customer_record_path: "true" } : {}),
        },
      });
      logStep("ACH SetupIntent created", { setupIntentId: setupIntent.id });
    }

    logStep("SetupIntent created", { 
      setupIntentId: setupIntent.id, 
      clientSecret: setupIntent.client_secret?.slice(0, 20) + '...',
      paymentMethodType: pmType,
    });

    return new Response(
      JSON.stringify({
        clientSecret: setupIntent.client_secret,
        setupIntentId: setupIntent.id,
        customerId: customerId_stripe,
        publishableKey: stripePublishableKey,
        paymentMethodType: pmType,
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
