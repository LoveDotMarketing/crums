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
    console.error("[agent-trailers-get] Auth failed:", authResult.error);
    return unauthorizedResponse(authResult.error!);
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { trailer_id, trailer_number } = await req.json().catch(() => ({}));

    if (!trailer_id && !trailer_number) {
      return new Response(JSON.stringify({ error: "trailer_id or trailer_number is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[agent-trailers-get] Fetching trailer:", { trailer_id, trailer_number });

    let query = supabase
      .from("trailers")
      .select("id, trailer_number, type, year, make, model, status, is_rented, license_plate, notes, assigned_to");

    if (trailer_id) {
      query = query.eq("id", trailer_id);
    } else if (trailer_number) {
      query = query.ilike("trailer_number", trailer_number);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error("[agent-trailers-get] Database error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!data) {
      console.log("[agent-trailers-get] Trailer not found");
      return new Response(JSON.stringify({ error: "Trailer not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[agent-trailers-get] Found trailer:", data.trailer_number);

    return new Response(JSON.stringify({ trailer: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[agent-trailers-get] Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
