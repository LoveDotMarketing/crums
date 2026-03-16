import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[RESET-PAYMENT-SETUP] ${step}${detailsStr}`);
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

    // Verify admin auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);

    const adminId = userData.user?.id;
    if (!adminId) throw new Error("User not authenticated");

    const { data: adminRole } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", adminId)
      .eq("role", "admin")
      .maybeSingle();

    if (!adminRole) throw new Error("Admin access required");
    logStep("Admin verified", { adminId });

    const { applicationId } = await req.json();
    if (!applicationId) throw new Error("applicationId is required");

    // Load application
    const { data: app, error: appError } = await supabaseClient
      .from("customer_applications")
      .select("id, stripe_customer_id, stripe_payment_method_id, payment_setup_status, payment_method_type")
      .eq("id", applicationId)
      .single();

    if (appError || !app) throw new Error("Application not found");
    logStep("Application loaded", { applicationId: app.id, stripeCustomerId: app.stripe_customer_id, currentStatus: app.payment_setup_status });

    let detachedCount = 0;
    let clearedDefault = false;

    // Detach stale payment methods from Stripe customer
    if (app.stripe_customer_id) {
      const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

      try {
        // Detach all us_bank_account methods
        const achMethods = await stripe.paymentMethods.list({
          customer: app.stripe_customer_id,
          type: "us_bank_account",
        });
        for (const pm of achMethods.data) {
          await stripe.paymentMethods.detach(pm.id);
          detachedCount++;
          logStep("Detached ACH method", { pmId: pm.id });
        }

        // Detach all card methods
        const cardMethods = await stripe.paymentMethods.list({
          customer: app.stripe_customer_id,
          type: "card",
        });
        for (const pm of cardMethods.data) {
          await stripe.paymentMethods.detach(pm.id);
          detachedCount++;
          logStep("Detached card method", { pmId: pm.id });
        }

        // Clear default invoice payment method if set
        const customer = await stripe.customers.retrieve(app.stripe_customer_id) as Stripe.Customer;
        if (customer && !customer.deleted && customer.invoice_settings?.default_payment_method) {
          await stripe.customers.update(app.stripe_customer_id, {
            invoice_settings: { default_payment_method: "" as any },
          });
          clearedDefault = true;
          logStep("Cleared default invoice payment method");
        }
      } catch (stripeErr) {
        logStep("Stripe cleanup warning (non-fatal)", { error: stripeErr instanceof Error ? stripeErr.message : String(stripeErr) });
      }
    }

    // Reset DB fields
    const { error: updateError } = await supabaseClient
      .from("customer_applications")
      .update({
        payment_setup_status: "pending",
        stripe_payment_method_id: null,
      })
      .eq("id", applicationId);

    if (updateError) throw new Error(`DB update failed: ${updateError.message}`);

    logStep("Reset complete", { applicationId, detachedCount, clearedDefault });

    return new Response(
      JSON.stringify({ success: true, applicationId, detachedCount, clearedDefault }),
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
