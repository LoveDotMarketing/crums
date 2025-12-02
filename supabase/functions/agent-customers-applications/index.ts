import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, validateAgentSecret, unauthorizedResponse } from "../_shared/auth.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authResult = validateAgentSecret(req);
  if (!authResult.valid) {
    console.log("[agent-customers-applications] Auth failed:", authResult.error);
    return unauthorizedResponse(authResult.error!);
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { customer_id, status } = await req.json().catch(() => ({}));

    console.log("[agent-customers-applications] Fetching applications:", { customer_id, status });

    let query = supabase
      .from("customer_applications")
      .select(`
        id,
        user_id,
        status,
        phone_number,
        mc_dot_number,
        business_type,
        company_address,
        number_of_trailers,
        date_needed,
        rental_start_date,
        message,
        admin_notes,
        created_at,
        updated_at,
        primary_trailer_id,
        backup_trailer_id
      `)
      .order("created_at", { ascending: false });

    if (customer_id) {
      query = query.eq("user_id", customer_id);
    }
    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      console.error("[agent-customers-applications] Database error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[agent-customers-applications] Found", data?.length || 0, "applications");

    return new Response(JSON.stringify({ applications: data, count: data?.length || 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[agent-customers-applications] Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
