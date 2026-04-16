import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/auth.ts";

function validateWebhookAuth(req: Request): { valid: boolean; error?: string } {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return { valid: false, error: "Missing authorization header" };

  const [scheme, token] = authHeader.split(" ");
  if (scheme.toLowerCase() !== "bearer" || !token) {
    return { valid: false, error: "Invalid authorization format. Use: Bearer <token>" };
  }

  const agentSecret = Deno.env.get("N8N_AGENT_SECRET");
  const blandKey = Deno.env.get("BLAND_WEBHOOK_KEY");

  if (agentSecret && token === agentSecret) return { valid: true };
  if (blandKey && token === blandKey) return { valid: true };

  return { valid: false, error: "Invalid authorization token" };
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

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

  const authResult = validateWebhookAuth(req);
  if (!authResult.valid) {
    return new Response(JSON.stringify({ error: authResult.error }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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

    const normalized = normalizePhone(phone);

    // Check for existing lead by normalized phone
    const { data: existing } = await supabase
      .from("phone_leads")
      .select("*")
      .or(`phone.eq.${phone},phone.eq.${normalized}`)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (existing) {
      // Overwrite notes with the latest value (do not append)
      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (notes !== undefined) updates.notes = notes || null;
      if (name && name !== existing.name) updates.name = name;
      if (email && email !== existing.email) updates.email = email;

      const { data, error } = await supabase
        .from("phone_leads")
        .update(updates)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        console.error("[create-phone-lead] Update error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to update phone lead" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify({ ...data, action: "updated" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // No existing lead — insert new
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

    return new Response(JSON.stringify({ ...data, action: "created" }), {
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
