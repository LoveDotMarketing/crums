import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, trailer_number, type, status, id } = await req.json();

    console.log("Agent trailers request:", { action, trailer_number, type, status, id });

    let result;

    switch (action) {
      case "list":
      case "search": {
        // Build query with optional filters
        let query = supabase
          .from("trailers")
          .select("id, trailer_number, type, make, model, year, status, is_rented, notes")
          .order("trailer_number");

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
        if (error) throw error;

        result = {
          success: true,
          count: data?.length || 0,
          trailers: data,
        };
        break;
      }

      case "get_available": {
        const { data, error } = await supabase
          .from("trailers")
          .select("id, trailer_number, type, make, model, year, status, notes")
          .eq("status", "available")
          .eq("is_rented", false)
          .order("type, trailer_number");

        if (error) throw error;

        result = {
          success: true,
          count: data?.length || 0,
          available_trailers: data,
        };
        break;
      }

      case "get_by_id": {
        if (!id) {
          return new Response(
            JSON.stringify({ success: false, error: "Trailer ID required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data, error } = await supabase
          .from("trailers")
          .select("id, trailer_number, type, make, model, year, status, is_rented, notes, license_plate")
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;

        result = {
          success: true,
          trailer: data,
        };
        break;
      }

      case "get_stats": {
        const { data, error } = await supabase
          .from("trailers")
          .select("status, is_rented, type");

        if (error) throw error;

        const stats = {
          total: data?.length || 0,
          available: data?.filter((t) => t.status === "available" && !t.is_rented).length || 0,
          rented: data?.filter((t) => t.is_rented).length || 0,
          in_maintenance: data?.filter((t) => t.status === "maintenance").length || 0,
          by_type: {} as Record<string, number>,
        };

        data?.forEach((t) => {
          stats.by_type[t.type] = (stats.by_type[t.type] || 0) + 1;
        });

        result = {
          success: true,
          stats,
        };
        break;
      }

      default:
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid action. Valid actions: list, search, get_available, get_by_id, get_stats",
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Agent trailers error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
