import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, validateAgentSecret, unauthorizedResponse } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Validate agent secret
  const authResult = validateAgentSecret(req);
  if (!authResult.valid) {
    return unauthorizedResponse(authResult.error!);
  }

  try {
    const { name, phone, email, notes } = await req.json();

    if (!name || !phone) {
      return new Response(
        JSON.stringify({ error: "name and phone are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase
      .from("phone_leads")
      .insert({ name, phone, email: email || null, notes: notes || null })
      .select()
      .single();

    if (error) {
      console.error("[create-phone-lead] Insert error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create phone lead" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[create-phone-lead] Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
