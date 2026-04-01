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
      .select("type, year, make, model")
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

    // Group by type/year/make/model with counts
    const grouped = new Map<string, { type: string; year: number; make: string; model: string; count: number }>();
    for (const row of data ?? []) {
      const key = `${row.type}|${row.year}|${row.make}|${row.model}`;
      const existing = grouped.get(key);
      if (existing) {
        existing.count++;
      } else {
        grouped.set(key, { type: row.type, year: row.year, make: row.make, model: row.model, count: 1 });
      }
    }

    const available = Array.from(grouped.values()).sort((a, b) => b.year - a.year);

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
