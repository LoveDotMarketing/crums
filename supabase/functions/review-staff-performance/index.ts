import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the caller is an admin
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("Unauthorized");

    const { data: roleCheck } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();
    if (!roleCheck) throw new Error("Admin access required");

    const { staffProfileId, userId, quarter } = await req.json();

    // Get staff profile info
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("id", userId)
      .single();

    const staffName = profile ? [profile.first_name, profile.last_name].filter(Boolean).join(" ") : "Staff member";

    // Get leads count
    const { count: leadsCount } = await supabase
      .from("customer_applications")
      .select("id", { count: "exact", head: true })
      .eq("staff_referral_id", staffProfileId);

    // Get outreach logs for this staff member
    const { data: outreachLogs } = await supabase
      .from("outreach_logs")
      .select("email_type, status, sent_at")
      .eq("customer_id", userId)
      .order("sent_at", { ascending: false })
      .limit(50);

    // Build context for AI
    const context = `
Staff Member: ${staffName} (${profile?.email || "unknown"})
Review Period: ${quarter}
Total Leads Generated: ${leadsCount || 0}
Recent Outreach Activity: ${outreachLogs?.length || 0} emails sent
Outreach breakdown: ${JSON.stringify(
      outreachLogs?.reduce((acc: Record<string, number>, log) => {
        acc[log.status] = (acc[log.status] || 0) + 1;
        return acc;
      }, {}) || {}
    )}
    `.trim();

    // Call Lovable AI via the gateway
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) throw new Error("AI service not configured");

    const aiResponse = await fetch("https://ai-gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an HR performance reviewer for a trailer leasing company. Write a brief, professional performance summary based on the data provided. Include observations about lead generation, communication activity, and actionable recommendations. Keep it under 200 words.",
          },
          {
            role: "user",
            content: `Please generate a performance review summary for the following staff member:\n\n${context}`,
          },
        ],
        max_tokens: 500,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`AI service error: ${errText}`);
    }

    const aiData = await aiResponse.json();
    const summary = aiData.choices?.[0]?.message?.content || "Unable to generate summary.";

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
