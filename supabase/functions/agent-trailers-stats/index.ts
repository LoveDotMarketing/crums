import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    console.log("[agent-trailers-stats] Fetching fleet statistics");

    const { data: trailers, error } = await supabase
      .from("trailers")
      .select("type, status, is_rented");

    if (error) {
      console.error("[agent-trailers-stats] Database error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const total = trailers?.length || 0;
    const available = trailers?.filter(t => t.status === "available" && !t.is_rented).length || 0;
    const rented = trailers?.filter(t => t.is_rented).length || 0;
    const maintenance = trailers?.filter(t => t.status === "maintenance").length || 0;

    const byType: Record<string, number> = {};
    trailers?.forEach(t => {
      byType[t.type] = (byType[t.type] || 0) + 1;
    });

    const byStatus: Record<string, number> = {};
    trailers?.forEach(t => {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    });

    const stats = {
      total,
      available,
      rented,
      maintenance,
      byType,
      byStatus,
    };

    console.log("[agent-trailers-stats] Stats:", stats);

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[agent-trailers-stats] Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
