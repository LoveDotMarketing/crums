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
    const { node_record_id, new_prompt } = body;
    if (!node_record_id || typeof node_record_id !== "string") {
      return new Response(JSON.stringify({ error: "node_record_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (typeof new_prompt !== "string") {
      return new Response(JSON.stringify({ error: "new_prompt must be a string" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (new_prompt.length > 100000) {
      return new Response(JSON.stringify({ error: "Prompt too large (max 100k chars)" }), {
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

    // Fetch current prompt for snapshot
    let previousPrompt = "";
    try {
      const getRes = await fetch(
        `https://api.bland.ai/v1/pathway/${node.pathway_id}`,
        { method: "GET", headers: { Authorization: apiKey } }
      );
      if (getRes.ok) {
        const j = await getRes.json();
        const nodes = j?.nodes || j?.pathway?.nodes || j?.data?.nodes || [];
        const target = Array.isArray(nodes)
          ? nodes.find((n: any) => n?.id === node.node_id)
          : null;
        previousPrompt = target?.data?.prompt ?? target?.prompt ?? "";
      }
    } catch (e) {
      console.warn("snapshot fetch failed", e);
    }

    // Push update to Bland
    const updateRes = await fetch(
      `https://api.bland.ai/v1/pathway/${node.pathway_id}/nodes/${node.node_id}`,
      {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: { prompt: new_prompt } }),
      }
    );

    const updateText = await updateRes.text();
    let updateJson: any = null;
    try { updateJson = JSON.parse(updateText); } catch { /* keep raw */ }

    if (!updateRes.ok) {
      return new Response(
        JSON.stringify({
          error: "Bland API error",
          status: updateRes.status,
          detail: updateJson || updateText,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the edit
    await service.from("bland_node_edits").insert({
      node_record_id,
      edited_by: userId,
      previous_prompt: previousPrompt,
      new_prompt,
    });

    // Bump updated_at on the registry row
    await service
      .from("bland_pathway_nodes")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", node_record_id);

    return new Response(
      JSON.stringify({ success: true, bland: updateJson }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("bland-update-node error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
