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
    console.error("[agent-trailers-list] Auth failed:", authResult.error);
    return unauthorizedResponse(authResult.error!);
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { type, status, trailer_number } = await req.json().catch(() => ({}));

    console.log("[agent-trailers-list] Fetching trailers with filters:", { type, status, trailer_number });

    let query = supabase
      .from("trailers")
      .select("id, trailer_number, type, year, make, model, status, is_rented, license_plate, notes")
      .order("trailer_number", { ascending: true });

    if (type) {
      query = query.ilike("type", `%${type}%`);
    }
    if (status) {
      query = query.eq("status", status);
    }
    if (trailer_number) {
      query = query.ilike("trailer_number", `%${trailer_number}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[agent-trailers-list] Database error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[agent-trailers-list] Found", data?.length || 0, "trailers");

    return new Response(JSON.stringify({ trailers: data, count: data?.length || 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[agent-trailers-list] Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
