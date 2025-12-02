export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export function validateAgentSecret(req: Request): { valid: boolean; error?: string } {
  const authHeader = req.headers.get("authorization");
  
  if (!authHeader) {
    return { valid: false, error: "Missing authorization header" };
  }

  const [scheme, token] = authHeader.split(" ");
  
  if (scheme.toLowerCase() !== "bearer" || !token) {
    return { valid: false, error: "Invalid authorization format. Use: Bearer <token>" };
  }

  const expectedSecret = Deno.env.get("N8N_AGENT_SECRET");
  
  if (!expectedSecret) {
    console.error("[auth] N8N_AGENT_SECRET not configured");
    return { valid: false, error: "Server configuration error" };
  }

  if (token !== expectedSecret) {
    return { valid: false, error: "Invalid authorization token" };
  }

  return { valid: true };
}

export function unauthorizedResponse(error: string): Response {
  return new Response(JSON.stringify({ error }), {
    status: 401,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
