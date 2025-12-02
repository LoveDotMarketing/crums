import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, validateAgentSecret, unauthorizedResponse } from "../_shared/auth.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authResult = validateAgentSecret(req);
  if (!authResult.valid) {
    console.log("[agent-customers-profile] Auth failed:", authResult.error);
    return unauthorizedResponse(authResult.error!);
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { customer_id, email } = await req.json().catch(() => ({}));

    if (!customer_id && !email) {
      return new Response(JSON.stringify({ error: "customer_id or email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[agent-customers-profile] Fetching profile:", { customer_id, email });

    let query = supabase
      .from("profiles")
      .select("id, email, first_name, last_name, phone, company_name, company_id, created_at, updated_at");

    if (customer_id) {
      query = query.eq("id", customer_id);
    } else if (email) {
      query = query.ilike("email", email);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error("[agent-customers-profile] Database error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!data) {
      console.log("[agent-customers-profile] Customer not found");
      return new Response(JSON.stringify({ error: "Customer not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[agent-customers-profile] Found customer:", data.email);

    return new Response(JSON.stringify({ profile: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[agent-customers-profile] Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
