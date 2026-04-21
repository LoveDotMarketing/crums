import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claims.claims.sub;
    const service = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: roleRow } = await service
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const { node_record_id } = body;
    if (!node_record_id || typeof node_record_id !== "string") {
      return new Response(JSON.stringify({ error: "node_record_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: node, error: nodeErr } = await service
      .from("bland_pathway_nodes")
      .select("*")
      .eq("id", node_record_id)
      .single();
    if (nodeErr || !node) {
      return new Response(JSON.stringify({ error: "Node not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("BLAND_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "BLAND_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the pathway and find the node
    const blandRes = await fetch(
      `https://api.bland.ai/v1/pathway/${node.pathway_id}`,
      {
        method: "GET",
        headers: { Authorization: apiKey },
      }
    );

    const blandText = await blandRes.text();
    let blandJson: any = null;
    try { blandJson = JSON.parse(blandText); } catch { /* keep raw */ }

    if (!blandRes.ok) {
      return new Response(
        JSON.stringify({
          error: "Bland API error",
          status: blandRes.status,
          detail: blandJson || blandText,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Bland pathway responses typically include `nodes` array. Each node has id and data.{prompt}
    const nodes = blandJson?.nodes || blandJson?.pathway?.nodes || blandJson?.data?.nodes || [];
    const target = Array.isArray(nodes)
      ? nodes.find((n: any) => n?.id === node.node_id)
      : null;

    const prompt = target?.data?.prompt ?? target?.prompt ?? "";

    return new Response(
      JSON.stringify({
        prompt,
        nodeName: target?.data?.name ?? target?.name ?? null,
        rawNode: target ?? null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("bland-get-node error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
