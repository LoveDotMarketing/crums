import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, validateAgentSecret, unauthorizedResponse } from "../_shared/auth.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authResult = validateAgentSecret(req);
  if (!authResult.valid) {
    console.log("[agent-customers-tolls] Auth failed:", authResult.error);
    return unauthorizedResponse(authResult.error!);
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { customer_id, status } = await req.json().catch(() => ({}));

    if (!customer_id) {
      return new Response(JSON.stringify({ error: "customer_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[agent-customers-tolls] Fetching tolls for customer:", customer_id);

    let query = supabase
      .from("tolls")
      .select("id, toll_date, amount, status, toll_location, toll_authority, notes, trailer_id, created_at")
      .eq("customer_id", customer_id)
      .order("toll_date", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      console.error("[agent-customers-tolls] Database error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate summary
    const totalAmount = data?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const pendingAmount = data?.filter(t => t.status === "pending").reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const paidAmount = data?.filter(t => t.status === "paid").reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    const summary = {
      totalTolls: data?.length || 0,
      totalAmount: totalAmount.toFixed(2),
      pendingAmount: pendingAmount.toFixed(2),
      paidAmount: paidAmount.toFixed(2),
      pendingCount: data?.filter(t => t.status === "pending").length || 0,
      paidCount: data?.filter(t => t.status === "paid").length || 0,
    };

    console.log("[agent-customers-tolls] Found", data?.length || 0, "tolls, summary:", summary);

    return new Response(JSON.stringify({ tolls: data, summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[agent-customers-tolls] Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
