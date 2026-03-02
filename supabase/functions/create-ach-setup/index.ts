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

    // Check for admin acting on behalf of a customer
    const body = await req.json().catch(() => ({}));
    const { targetUserId, customerId, customerEmail } = body;
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
        throw new Error("Admin access required to set up ACH for another user");
      }
      logStep("Admin role verified");

      if (targetUserId) {
        lookupUserId = targetUserId;
      } else if (customerId) {
        useCustomerPath = true;
        lookupUserId = customerId; // Will be used as placeholder user_id
      }
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    let targetEmail: string;
    let targetName: string | undefined;
    let targetPhone: string | undefined;
    let targetCompany: string | undefined;

    if (useCustomerPath) {
      // ── Customer-record path (no auth account) ──
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
      // ── Profile path (auth account exists) ──
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
    let { data: application } = useCustomerPath
      ? await supabaseClient
          .from("customer_applications")
          .select("id, stripe_customer_id, status")
          .eq("customer_id", customerId)
          .maybeSingle()
      : await supabaseClient
          .from("customer_applications")
          .select("id, stripe_customer_id, status")
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
        .select("id, stripe_customer_id, status")
        .single();
      if (createAppError) {
        logStep("Error creating application", { error: createAppError.message });
        throw new Error("Failed to create application record for ACH setup");
      }
      application = newApp;
      logStep("Auto-created application", { applicationId: application.id });
    } else {
      logStep("Application found", { applicationId: application.id, status: application.status });
    }

    // Find or create Stripe customer
    let customerId_stripe = application.stripe_customer_id;
    
    if (!customerId_stripe) {
      logStep("No existing Stripe customer, searching by email");
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
            ...(useCustomerPath ? { customer_record_id: customerId } : {}),
          },
        });
        customerId_stripe = customer.id;
        logStep("Created new Stripe customer", { customerId: customerId_stripe });
      }

      // Save customer ID to application
      await supabaseClient
        .from("customer_applications")
        .update({ stripe_customer_id: customerId_stripe })
        .eq("id", application.id);
    }

    // Create SetupIntent for ACH Direct Debit with Financial Connections
    const setupIntent = await stripe.setupIntents.create({
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
        ...(useCustomerPath ? { customer_record_path: "true" } : {}),
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
        customerId: customerId_stripe,
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
