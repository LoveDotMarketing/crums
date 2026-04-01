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

    // Determine caller identity for rate-limiting and routing
    let rateLimitKey = "anon";
    let verifiedUserId: string | null = null;
    const authHeader = req.headers.get("Authorization");

    if (authHeader) {
      try {
        // Use service role to verify the JWT reliably in Lovable Cloud
        const supabaseClient = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        );
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await supabaseClient.auth.getUser(token);
        if (user) {
          rateLimitKey = user.id;
          verifiedUserId = user.id;
        }
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

    // Routing: authenticated users with a userType go to the customer/staff webhook
    const userType = body?.metadata?.userType ?? body?.userType;
    const isAuthenticated = verifiedUserId !== null;
    const isAuthenticatedRole = isAuthenticated && ["customer", "admin", "mechanic"].includes(userType);

    const customerWebhookUrl = Deno.env.get("N8N_CUSTOMER_AGENT_WEBHOOK");
    const publicWebhookUrl = Deno.env.get("VITE_N8N_CHAT_URL");

    const webhookUrl = isAuthenticatedRole && customerWebhookUrl
      ? customerWebhookUrl
      : publicWebhookUrl;

    if (!webhookUrl) {
      console.error("[chat-proxy] No webhook URL configured for route:", isAuthenticatedRole ? "customer" : "public");
      return new Response(
        JSON.stringify({ error: "Chat service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, sessionId } = body;
    console.log("[chat-proxy] action:", action, "sessionId:", sessionId, "route:", isAuthenticatedRole ? "customer" : "public");

    // Enrich with verified userId
    const forwardBody = {
      ...body,
      userId: verifiedUserId ?? undefined,
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
