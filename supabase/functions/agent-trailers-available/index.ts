import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, validateAgentSecret, unauthorizedResponse } from "../_shared/auth.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate agent secret
  const authResult = validateAgentSecret(req);
  if (!authResult.valid) {
    console.error("[agent-trailers-available] Auth failed:", authResult.error);
    return unauthorizedResponse(authResult.error!);
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { type } = await req.json().catch(() => ({}));

    console.log("[agent-trailers-available] Fetching available trailers, type filter:", type);

    let query = supabase
      .from("trailers")
      .select("id, trailer_number, type, year, make, model, status, license_plate, notes")
      .eq("status", "available")
      .eq("is_rented", false)
      .order("trailer_number", { ascending: true });

    if (type) {
      query = query.ilike("type", `%${type}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[agent-trailers-available] Database error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[agent-trailers-available] Found", data?.length || 0, "available trailers");

    return new Response(JSON.stringify({ trailers: data, count: data?.length || 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[agent-trailers-available] Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
