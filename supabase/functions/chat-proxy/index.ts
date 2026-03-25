import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory rate limiting (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW = 60 * 1000;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("[chat-proxy] Incoming payload keys:", Object.keys(body));

    // Determine caller identity for rate-limiting
    let rateLimitKey = "anon";
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const supabaseClient = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!,
          { global: { headers: { Authorization: authHeader } } }
        );
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) rateLimitKey = user.id;
      } catch {
        // anonymous caller – that's fine
      }
    }

    if (!checkRateLimit(rateLimitKey)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please wait before sending more messages." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const webhookUrl = Deno.env.get("VITE_N8N_CHAT_URL");
    if (!webhookUrl) {
      console.error("[chat-proxy] VITE_N8N_CHAT_URL not configured");
      return new Response(
        JSON.stringify({ error: "Chat service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // @n8n/chat sends: { action, chatInput, sessionId, ... }
    // For "loadPreviousSession" n8n expects the same shape and returns []
    // For "sendMessage" n8n expects chatInput + sessionId
    // We forward the payload as-is and relay the response back.

    const { action, sessionId, chatInput } = body;
    console.log("[chat-proxy] action:", action, "sessionId:", sessionId);

    // Enrich with userId if authenticated
    const forwardBody = {
      ...body,
      userId: rateLimitKey !== "anon" ? rateLimitKey : undefined,
    };

    const n8nResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(forwardBody),
    });

    console.log("[chat-proxy] n8n status:", n8nResponse.status);

    if (!n8nResponse.ok) {
      const errText = await n8nResponse.text();
      console.error("[chat-proxy] n8n error:", errText);
      return new Response(
        JSON.stringify({ error: "Failed to get response from agent" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Relay the upstream response directly (could be JSON or SSE)
    const contentType = n8nResponse.headers.get("content-type") || "application/json";
    const responseBody = await n8nResponse.text();
    console.log("[chat-proxy] Relaying response, content-type:", contentType, "length:", responseBody.length);

    return new Response(responseBody, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    console.error("[chat-proxy] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
