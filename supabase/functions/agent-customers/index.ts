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

    const { action, email, customer_id, name } = await req.json();

    console.log("Agent customers request:", { action, email, customer_id, name });

    let result;

    switch (action) {
      case "search": {
        // Search customers by email or name
        let query = supabase
          .from("profiles")
          .select("id, email, first_name, last_name, company_name, phone, created_at")
          .order("created_at", { ascending: false });

        if (email) {
          query = query.ilike("email", `%${email}%`);
        }
        if (name) {
          query = query.or(`first_name.ilike.%${name}%,last_name.ilike.%${name}%,company_name.ilike.%${name}%`);
        }

        const { data, error } = await query.limit(20);
        if (error) throw error;

        result = {
          success: true,
          count: data?.length || 0,
          customers: data,
        };
        break;
      }

      case "get_profile": {
        if (!customer_id && !email) {
          return new Response(
            JSON.stringify({ success: false, error: "Customer ID or email required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        let query = supabase
          .from("profiles")
          .select("id, email, first_name, last_name, company_name, phone, created_at");

        if (customer_id) {
          query = query.eq("id", customer_id);
        } else if (email) {
          query = query.eq("email", email);
        }

        const { data, error } = await query.maybeSingle();
        if (error) throw error;

        result = {
          success: true,
          customer: data,
        };
        break;
      }

      case "get_applications": {
        // Get customer applications - optionally filter by customer_id
        let query = supabase
          .from("customer_applications")
          .select(`
            id,
            status,
            phone_number,
            company_address,
            business_type,
            mc_dot_number,
            number_of_trailers,
            date_needed,
            rental_start_date,
            created_at,
            message
          `)
          .order("created_at", { ascending: false });

        if (customer_id) {
          query = query.eq("user_id", customer_id);
        }

        const { data, error } = await query.limit(50);
        if (error) throw error;

        result = {
          success: true,
          count: data?.length || 0,
          applications: data,
        };
        break;
      }

      case "get_rentals": {
        // Get trailers assigned to a customer
        if (!customer_id) {
          return new Response(
            JSON.stringify({ success: false, error: "Customer ID required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data, error } = await supabase
          .from("trailers")
          .select("id, trailer_number, type, make, model, year, status, is_rented")
          .eq("assigned_to", customer_id)
          .eq("is_rented", true);

        if (error) throw error;

        result = {
          success: true,
          count: data?.length || 0,
          rentals: data,
        };
        break;
      }

      case "get_tolls": {
        // Get tolls for a customer
        if (!customer_id) {
          return new Response(
            JSON.stringify({ success: false, error: "Customer ID required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data, error } = await supabase
          .from("tolls")
          .select("id, amount, status, toll_date, toll_location, toll_authority, payment_date")
          .eq("customer_id", customer_id)
          .order("toll_date", { ascending: false })
          .limit(20);

        if (error) throw error;

        const summary = {
          total_tolls: data?.length || 0,
          pending: data?.filter((t) => t.status === "pending").length || 0,
          paid: data?.filter((t) => t.status === "paid").length || 0,
          total_amount: data?.reduce((sum, t) => sum + Number(t.amount), 0) || 0,
        };

        result = {
          success: true,
          summary,
          tolls: data,
        };
        break;
      }

      default:
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid action. Valid actions: search, get_profile, get_applications, get_rentals, get_tolls",
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Agent customers error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
