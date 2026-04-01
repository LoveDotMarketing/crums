import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, validateAgentSecret, unauthorizedResponse } from "../_shared/auth.ts";

const PRICING = {
  dryVan: [
    { year: "2027", twoYear: "$950", flexible: "$1,100" },
    { year: "2024", twoYear: "$800", flexible: "$850" },
    { year: "2021", twoYear: "$780" },
    { year: "2020", twoYear: "$750" },
    { year: "2019", twoYear: "$720" },
    { year: "2018", twoYear: "$700" },
  ],
  flatbed: [
    { year: "2027", price: "$1,400" },
  ],
};

const LEASE_TERMS = {
  options: ["2-year", "1-year", "Month-to-month"],
  mileageCharges: "None — flat monthly rate",
  deposit: "Varies by trailer year and type",
  includes: ["Roadside assistance", "GPS tracking"],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authResult = validateAgentSecret(req);
  if (!authResult.valid) {
    return unauthorizedResponse(authResult.error!);
  }

  try {
    const { type } = await req.json().catch(() => ({}));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let query = supabase
      .from("trailers")
      .select("vin, type, year, make, body_material, rental_rate, status, is_rented")
      .eq("status", "available")
      .eq("is_rented", false);

    if (type) {
      query = query.ilike("type", `%${type}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[agent-public-fleet-info] DB error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const available = (data ?? [])
      .map((row) => ({
        vin: row.vin,
        type: row.type,
        year: row.year,
        make: row.make,
        material: row.body_material,
        price: row.rental_rate,
        available: true,
      }))
      .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));

    return new Response(JSON.stringify({
      available,
      totalAvailable: data?.length ?? 0,
      pricing: PRICING,
      leaseTerms: LEASE_TERMS,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[agent-public-fleet-info] Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
