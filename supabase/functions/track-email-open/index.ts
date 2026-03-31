import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // SendGrid sends an array of event objects
    const events = await req.json();

    if (!Array.isArray(events)) {
      return new Response(JSON.stringify({ error: "Expected array of events" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let updatedCount = 0;

    for (const event of events) {
      // We only care about "open" events
      if (event.event !== "open") continue;

      const email = event.email;
      if (!email) continue;

      // Update the most recent outreach_log entry for this email that hasn't been opened
      const { error } = await supabaseClient
        .from("outreach_logs")
        .update({ opened_at: new Date().toISOString() })
        .eq("email", email)
        .eq("status", "sent")
        .is("opened_at", null)
        .order("sent_at", { ascending: false })
        .limit(1);

      if (!error) updatedCount++;
    }

    console.log(`[TrackEmailOpen] Processed ${events.length} events, updated ${updatedCount} logs`);

    return new Response(
      JSON.stringify({ success: true, processed: events.length, updated: updatedCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[TrackEmailOpen] Error:", msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
