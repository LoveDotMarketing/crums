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
    const { pathway_id, version_name, environment } = body;

    if (!pathway_id || typeof pathway_id !== "string") {
      return new Response(JSON.stringify({ error: "pathway_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const env = (environment === "staging" ? "staging" : "production") as
      | "production"
      | "staging";

    const apiKey = Deno.env.get("BLAND_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "BLAND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const finalVersionName =
      typeof version_name === "string" && version_name.trim()
        ? version_name.trim()
        : `Edited via admin — ${new Date().toISOString()}`;

    // 1. Create a version snapshot of the current draft
    const versionRes = await fetch(
      `https://api.bland.ai/v1/pathway/${pathway_id}/version`,
      {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: finalVersionName }),
      }
    );

    const versionText = await versionRes.text();
    let versionJson: any = null;
    try { versionJson = JSON.parse(versionText); } catch { /* keep raw */ }

    if (!versionRes.ok) {
      return new Response(
        JSON.stringify({
          error: "Failed to create Bland version",
          status: versionRes.status,
          detail: versionJson || versionText,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const versionNumber: number | null =
      versionJson?.version_number ??
      versionJson?.data?.version_number ??
      versionJson?.version ??
      versionJson?.data?.version ??
      null;

    if (versionNumber === null || versionNumber === undefined) {
      return new Response(
        JSON.stringify({
          error: "Bland did not return a version_number",
          detail: versionJson || versionText,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Promote that version to the target environment
    const publishRes = await fetch(
      `https://api.bland.ai/v1/pathway/${pathway_id}/publish`,
      {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version_id: versionNumber,
          environment: env,
        }),
      }
    );

    const publishText = await publishRes.text();
    let publishJson: any = null;
    try { publishJson = JSON.parse(publishText); } catch { /* keep raw */ }

    if (!publishRes.ok) {
      return new Response(
        JSON.stringify({
          error: "Failed to promote version",
          status: publishRes.status,
          version_number: versionNumber,
          detail: publishJson || publishText,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Log the publish event
    await service.from("bland_pathway_publishes").insert({
      pathway_id,
      version_number: versionNumber,
      version_name: finalVersionName,
      environment: env,
      published_by: userId,
    });

    return new Response(
      JSON.stringify({
        success: true,
        version_number: versionNumber,
        version_name: finalVersionName,
        environment: env,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("bland-publish-pathway error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
