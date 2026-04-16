import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const STRIPE_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;

  async function updateSub(subId: string, anchorUnix: number, label: string) {
    const body = new URLSearchParams({
      billing_cycle_anchor: String(anchorUnix),
      proration_behavior: "none",
    });
    const res = await fetch(`https://api.stripe.com/v1/subscriptions/${subId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    const json = await res.json();
    return {
      label,
      subId,
      status: res.status,
      error: json.error ?? null,
      billing_cycle_anchor: json.billing_cycle_anchor
        ? new Date(json.billing_cycle_anchor * 1000).toISOString()
        : null,
      current_period_start: json.current_period_start
        ? new Date(json.current_period_start * 1000).toISOString()
        : null,
      current_period_end: json.current_period_end
        ? new Date(json.current_period_end * 1000).toISOString()
        : null,
    };
  }

  const results = await Promise.all([
    updateSub("sub_1T5ZS1LjIwiEGQIhaRTuOx5P", 1777939200, "Sub 1 - $2,300 - anchor day 1 (May 1)"),
    updateSub("sub_1T6fyxLjIwiEGQIhmWSblWrY", 1779148800, "Sub 2 - $3,800 - anchor day 15 (May 15)"),
  ]);

  return new Response(JSON.stringify({ results }, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
