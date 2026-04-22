import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CONFIRM-ACH-SETUP] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const liveStripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!liveStripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

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

    // Get request body
    const { setupIntentId, paymentMethodId, billingAnchorDay, targetUserId, customerId, paymentMethodType } = await req.json();
    if (!setupIntentId) throw new Error("setupIntentId is required");
    logStep("Received request", { setupIntentId, billingAnchorDay, targetUserId, customerId, paymentMethodType });

    let lookupUserId = user.id;

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
        throw new Error("Admin access required to confirm payment setup for another user");
      }
      logStep("Admin role verified");
      lookupUserId = targetUserId || customerId;
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Retrieve the SetupIntent to verify it succeeded
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
    logStep("Retrieved SetupIntent", { 
      status: setupIntent.status, 
      paymentMethod: setupIntent.payment_method 
    });

    if (setupIntent.status !== "succeeded") {
      throw new Error(`SetupIntent status is ${setupIntent.status}, expected succeeded`);
    }

    // Get the payment method ID from the SetupIntent if not provided
    const pmId = paymentMethodId || setupIntent.payment_method;
    if (!pmId) {
      throw new Error("No payment method found on SetupIntent");
    }

    // Determine payment method type from the PM itself or from metadata
    const pmDetails = await stripe.paymentMethods.retrieve(pmId as string);
    const resolvedPmType = pmDetails.type === "card" ? "card" : "ach";
    // Resolve the stripe_customer_id this PM is attached to
    const pmStripeCustomerId = typeof pmDetails.customer === "string" ? pmDetails.customer : pmDetails.customer?.id ?? null;
    logStep("Resolved payment method type", { pmType: resolvedPmType, stripeType: pmDetails.type, pmStripeCustomerId });

    // Ensure the payment method is attached to the correct Stripe customer
    try {
      const pmCustomer = typeof pmDetails.customer === "string" ? pmDetails.customer : pmDetails.customer?.id ?? null;
      
      // Determine the correct email to look up the Stripe customer
      let lookupEmail = user.email!;
      if (customerId) {
        const { data: custData } = await supabaseClient
          .from("customers")
          .select("email")
          .eq("id", customerId)
          .maybeSingle();
        if (custData?.email) lookupEmail = custData.email;
      } else if (targetUserId && targetUserId !== user.id) {
        const { data: profileData } = await supabaseClient
          .from("profiles")
          .select("email")
          .eq("id", targetUserId)
          .maybeSingle();
        if (profileData?.email) lookupEmail = profileData.email;
      }
      
      if (!pmCustomer) {
        // PM is detached — find a Stripe customer to attach it to
        const existingCustomers = await stripe.customers.list({ email: lookupEmail, limit: 1 });
        if (existingCustomers.data.length > 0) {
          await stripe.paymentMethods.attach(pmId as string, { customer: existingCustomers.data[0].id });
          await stripe.customers.update(existingCustomers.data[0].id, {
            invoice_settings: { default_payment_method: pmId as string },
          });
          logStep("Attached PM to existing Stripe customer", { pmId, stripeCustomerId: existingCustomers.data[0].id, email: lookupEmail });
        }
      } else {
        // PM is attached — set as default payment method
        await stripe.customers.update(pmCustomer, {
          invoice_settings: { default_payment_method: pmId as string },
        });
        logStep("Set PM as default on Stripe customer", { pmId, stripeCustomerId: pmCustomer });
      }
    } catch (attachErr: any) {
      logStep("Warning: could not ensure PM attachment", { error: attachErr.message, pmId });
    }

    // Get the user's application - use customer_id for customer path, user_id otherwise
    const appQuery = customerId
      ? supabaseClient.from("customer_applications").select("id, customer_id, user_id").eq("customer_id", customerId).single()
      : supabaseClient.from("customer_applications").select("id, customer_id, user_id").eq("user_id", lookupUserId).single();
    const { data: application, error: appError } = await appQuery;

    if (appError || !application) {
      throw new Error("Application not found");
    }

    // Auto-link customer_id on the application if missing
    if (!application.customer_id && application.user_id) {
      const { data: profileData } = await supabaseClient
        .from("profiles")
        .select("email")
        .eq("id", application.user_id)
        .maybeSingle();
      
      if (profileData?.email) {
        const { data: customerData } = await supabaseClient
          .from("customers")
          .select("id")
          .ilike("email", profileData.email)
          .maybeSingle();
        
        if (customerData?.id) {
          await supabaseClient
            .from("customer_applications")
            .update({ customer_id: customerData.id })
            .eq("id", application.id);
          logStep("Auto-linked customer_id on application", { applicationId: application.id, customerId: customerData.id });
        }
      }
    }

    // Update the application with the payment method, billing anchor, payment method type, AND stripe_customer_id
    const { error: updateError } = await supabaseClient
      .from("customer_applications")
      .update({
        stripe_payment_method_id: pmId as string,
        payment_setup_status: "completed",
        billing_anchor_day: billingAnchorDay || null,
        payment_method_type: resolvedPmType,
        stripe_customer_id: pmStripeCustomerId,
      })
      .eq("id", application.id);

    if (updateError) {
      logStep("Error updating application", { error: updateError.message });
      throw new Error("Failed to update application with payment method");
    }

    logStep("Application updated with payment method and billing anchor", { 
      applicationId: application.id, 
      paymentMethodId: pmId,
      billingAnchorDay: billingAnchorDay || null,
      paymentMethodType: resolvedPmType,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment method successfully linked",
        paymentMethodId: pmId,
        paymentMethodType: resolvedPmType,
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
