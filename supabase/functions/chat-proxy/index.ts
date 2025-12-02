import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId, userType, userId } = await req.json();
    
    console.log("Chat proxy request:", { message, sessionId, userType, userId });

    // Only customer/visitor agent is implemented for now
    if (userType !== "customer") {
      return new Response(
        JSON.stringify({ error: "Only customer agent is currently available" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const webhookUrl = Deno.env.get("N8N_CUSTOMER_AGENT_WEBHOOK");
    if (!webhookUrl) {
      console.error("N8N_CUSTOMER_AGENT_WEBHOOK not configured");
      return new Response(
        JSON.stringify({ error: "Chat service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Calling n8n webhook:", webhookUrl);

    // Call n8n webhook with streaming
    const n8nResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
      },
      body: JSON.stringify({
        chatInput: message,
        sessionId: sessionId,
        userId: userId || "anonymous",
      }),
    });

    console.log("n8n response status:", n8nResponse.status);

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error("n8n error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to get response from agent" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if response is streaming (SSE)
    const contentType = n8nResponse.headers.get("content-type") || "";
    
    if (contentType.includes("text/event-stream")) {
      // Stream the SSE response directly
      console.log("Streaming SSE response");
      return new Response(n8nResponse.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    } else {
      // Non-streaming response - wrap in SSE format
      console.log("Non-streaming response, wrapping in SSE");
      const responseText = await n8nResponse.text();
      console.log("Response text:", responseText);
      
      // Try to parse JSON response
      let outputText = responseText;
      try {
        const jsonResponse = JSON.parse(responseText);
        // n8n chat webhook typically returns { output: "..." }
        outputText = jsonResponse.output || jsonResponse.text || jsonResponse.message || responseText;
      } catch {
        // Not JSON, use as-is
      }

      // Create SSE formatted response
      const encoder = new TextEncoder();
      const sseData = `data: ${JSON.stringify({ output: outputText })}\n\ndata: [DONE]\n\n`;
      
      return new Response(encoder.encode(sseData), {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });
    }
  } catch (error) {
    console.error("Chat proxy error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
