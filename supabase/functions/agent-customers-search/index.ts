import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, validateAgentSecret, unauthorizedResponse } from "../_shared/auth.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authResult = validateAgentSecret(req);
  if (!authResult.valid) {
    console.log("[agent-customers-search] Auth failed:", authResult.error);
    return unauthorizedResponse(authResult.error!);
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { email, name } = await req.json().catch(() => ({}));

    if (!email && !name) {
      return new Response(JSON.stringify({ error: "email or name is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[agent-customers-search] Searching customers:", { email, name });

    let query = supabase
      .from("profiles")
      .select("id, email, first_name, last_name, phone, company_name, created_at");

    if (email) {
      query = query.ilike("email", `%${email}%`);
    }
    if (name) {
      query = query.or(`first_name.ilike.%${name}%,last_name.ilike.%${name}%,company_name.ilike.%${name}%`);
    }

    const { data, error } = await query.limit(20);

    if (error) {
      console.error("[agent-customers-search] Database error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[agent-customers-search] Found", data?.length || 0, "customers");

    return new Response(JSON.stringify({ customers: data, count: data?.length || 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[agent-customers-search] Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
