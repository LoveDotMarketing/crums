import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import Stripe from "npm:stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    console.log("[toggle-application-sandbox] request received");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const { data: userData, error: userErr } = await adminClient.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin } = await adminClient.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { applicationId, enable, force } = body;
    const rawReason = typeof body?.reason === "string" ? body.reason.trim() : "";
    const reason = rawReason ? rawReason.slice(0, 500) : null;

    if (!applicationId || typeof applicationId !== "string") {
      return new Response(JSON.stringify({ error: "applicationId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (typeof enable !== "boolean") {
      return new Response(JSON.stringify({ error: "enable must be boolean" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[toggle-application-sandbox] start", { applicationId, enable, force });

    // Load application + linked customer
    const { data: app, error: appErr } = await adminClient
      .from("customer_applications")
      .select(`
        id,
        sandbox,
        sandbox_stripe_customer_id,
        payment_setup_status,
        stripe_payment_method_id,
        customer_id,
        user_id,
        customers ( id, full_name, email ),
        profiles!customer_applications_user_id_fkey ( id, first_name, last_name, email )
      `)
      .eq("id", applicationId)
      .single();

    if (appErr || !app) {
      console.error("[toggle-application-sandbox] application lookup failed", {
        applicationId,
        appErr,
      });
      return new Response(
        JSON.stringify({
          error: "Application not found",
          details: appErr?.message ?? null,
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const previousSandbox = !!app.sandbox;

    if (previousSandbox === enable) {
      return new Response(
        JSON.stringify({
          ok: true,
          unchanged: true,
          sandbox: previousSandbox,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Guard: switching sandbox -> live with completed payment setup would orphan a test PM
    const isSwitchingToLive = previousSandbox && !enable;
    const setupComplete = app.payment_setup_status === "completed";
    if (isSwitchingToLive && setupComplete && !force) {
      return new Response(
        JSON.stringify({
          error:
            "Payment setup is already completed in sandbox mode. Pass `force: true` to switch to live — the customer's stored payment method will be cleared and they'll be re-prompted to set up a real bank or card.",
          requiresForce: true,
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const customer = (app as any).customers;
    const profile = (app as any).profiles;
    const displayName =
      customer?.full_name ||
      [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim() ||
      customer?.email ||
      profile?.email ||
      "Customer";
    const displayEmail = customer?.email || profile?.email || null;

    // If enabling sandbox: ensure we have a test-mode Stripe customer
    let testCustomerId = app.sandbox_stripe_customer_id;
    if (enable && !testCustomerId) {
      const testKey = Deno.env.get("STRIPE_TEST_SECRET_KEY");
      if (!testKey) {
        return new Response(
          JSON.stringify({
            error:
              "STRIPE_TEST_SECRET_KEY is not configured. Add it before enabling sandbox mode.",
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      const stripeTest = new Stripe(testKey, { apiVersion: "2025-08-27.basil" });
      const testCustomer = await stripeTest.customers.create({
        name: displayName,
        email: displayEmail || undefined,
        metadata: {
          source: "lovable_admin_sandbox",
          live_application_id: String(app.id),
          live_customer_id: customer?.id ? String(customer.id) : "",
        },
      });
      testCustomerId = testCustomer.id;
    }

    // Build update payload
    const updatePayload: Record<string, unknown> = {
      sandbox: enable,
      stripe_mode: enable ? "test" : "live",
    };
    if (enable && testCustomerId) {
      updatePayload.sandbox_stripe_customer_id = testCustomerId;
    }
    if (isSwitchingToLive && force && setupComplete) {
      // Clear stored PM so customer is re-prompted in live mode
      updatePayload.stripe_payment_method_id = null;
      updatePayload.payment_setup_status = "pending";
      updatePayload.stripe_customer_id = null;
    }

    const { error: updateErr } = await adminClient
      .from("customer_applications")
      .update(updatePayload)
      .eq("id", applicationId);

    if (updateErr) throw updateErr;

    // Audit row
    await adminClient.from("subscription_sandbox_audit").insert({
      application_id: applicationId,
      subscription_id: null,
      from_sandbox: previousSandbox,
      to_sandbox: enable,
      changed_by: userData.user.id,
      reason,
    });

    // App event log
    await adminClient.from("app_event_logs").insert({
      event_category: "billing",
      event_type: "application_sandbox_toggled",
      description: `Application sandbox ${enable ? "enabled" : "disabled"} for ${displayName}`,
      user_id: userData.user.id,
      user_email: userData.user.email ?? null,
      metadata: {
        application_id: applicationId,
        customer_id: customer?.id ?? null,
        from_sandbox: previousSandbox,
        to_sandbox: enable,
        sandbox_stripe_customer_id: testCustomerId,
        forced: !!force,
        reason,
      },
    });

    return new Response(
      JSON.stringify({
        ok: true,
        sandbox: enable,
        sandbox_stripe_customer_id: testCustomerId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[toggle-application-sandbox] error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
