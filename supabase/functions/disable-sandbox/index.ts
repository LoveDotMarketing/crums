import { createClient } from "npm:@supabase/supabase-js@2.57.2";

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
    const { subscriptionId } = body;
    const rawReason = typeof body?.reason === "string" ? body.reason.trim() : "";
    const reason = rawReason ? rawReason.slice(0, 500) : null;

    if (!subscriptionId || typeof subscriptionId !== "string") {
      return new Response(JSON.stringify({ error: "subscriptionId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Read current state
    const { data: sub, error: subErr } = await adminClient
      .from("customer_subscriptions")
      .select("id, customer_id, sandbox")
      .eq("id", subscriptionId)
      .single();

    if (subErr || !sub) {
      return new Response(JSON.stringify({ error: "Subscription not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const previousSandbox = !!sub.sandbox;

    // Flip the flag (preserve sandbox_stripe_customer_id for re-enable)
    const { error: updateErr } = await adminClient
      .from("customer_subscriptions")
      .update({ sandbox: false })
      .eq("id", subscriptionId);

    if (updateErr) throw updateErr;

    await adminClient.from("subscription_sandbox_audit").insert({
      subscription_id: subscriptionId,
      from_sandbox: previousSandbox,
      to_sandbox: false,
      changed_by: userData.user.id,
      reason,
    });

    await adminClient.from("app_event_logs").insert({
      event_category: "billing",
      event_type: "sandbox_disabled",
      description: `Sandbox mode disabled for subscription ${subscriptionId}`,
      user_id: userData.user.id,
      user_email: userData.user.email ?? null,
      metadata: {
        subscription_id: subscriptionId,
        customer_id: sub.customer_id,
        reason,
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[disable-sandbox] error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
