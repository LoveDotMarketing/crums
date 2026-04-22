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

    // Verify the calling user (use service role to bypass ES256 issues)
    const { data: userData, error: userErr } = await adminClient.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify admin role
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

    const { subscriptionId } = await req.json();
    if (!subscriptionId || typeof subscriptionId !== "string") {
      return new Response(JSON.stringify({ error: "subscriptionId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load subscription + customer
    const { data: sub, error: subErr } = await adminClient
      .from("customer_subscriptions")
      .select(`
        id,
        customer_id,
        sandbox,
        sandbox_stripe_customer_id,
        customers ( id, full_name, email )
      `)
      .eq("id", subscriptionId)
      .single();

    if (subErr || !sub) {
      return new Response(JSON.stringify({ error: "Subscription not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customer = (sub as any).customers;
    if (!customer) {
      return new Response(
        JSON.stringify({ error: "Linked customer not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    let testCustomerId = sub.sandbox_stripe_customer_id;

    // Reuse existing test customer if present, else create one
    if (!testCustomerId) {
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
        name: customer.full_name || undefined,
        email: customer.email || undefined,
        metadata: {
          source: "lovable_admin_sandbox",
          live_customer_id: String(customer.id),
          subscription_id: String(sub.id),
        },
      });
      testCustomerId = testCustomer.id;
    }

    // Update subscription
    const { error: updateErr } = await adminClient
      .from("customer_subscriptions")
      .update({
        sandbox: true,
        sandbox_stripe_customer_id: testCustomerId,
      })
      .eq("id", subscriptionId);

    if (updateErr) throw updateErr;

    // Audit log
    await adminClient.from("app_event_logs").insert({
      event_category: "billing",
      event_type: "sandbox_enabled",
      description: `Sandbox mode enabled for subscription ${subscriptionId}`,
      user_id: userData.user.id,
      user_email: userData.user.email ?? null,
      metadata: {
        subscription_id: subscriptionId,
        customer_id: customer.id,
        sandbox_stripe_customer_id: testCustomerId,
      },
    });

    return new Response(
      JSON.stringify({ sandbox_stripe_customer_id: testCustomerId }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[enable-sandbox] error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
