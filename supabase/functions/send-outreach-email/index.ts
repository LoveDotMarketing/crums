import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string | string[];
  subject: string;
  body: string;
  campaign_id?: string;
  template_id?: string;
  customer_ids?: string[];
  email_type?: string;
}

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { to, subject, body, campaign_id, template_id, customer_ids, email_type = "manual" }: EmailRequest = await req.json();

    const recipients = Array.isArray(to) ? to : [to];
    const results: { email: string; success: boolean; error?: string }[] = [];

    // Get from settings
    const { data: settings } = await supabaseClient
      .from("outreach_settings")
      .select("setting_key, setting_value")
      .in("setting_key", ["from_name", "reply_to"]);

    const fromName = settings?.find(s => s.setting_key === "from_name")?.setting_value || "CRUMS Leasing";
    const replyTo = settings?.find(s => s.setting_key === "reply_to")?.setting_value || "sales@crumsleasing.com";

    for (let i = 0; i < recipients.length; i++) {
      const email = recipients[i];
      const customerId = customer_ids?.[i];

      try {
        const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SENDGRID_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email }] }],
            from: { email: "sales@crumsleasing.com", name: fromName },
            reply_to: { email: replyTo },
            subject,
            content: [{ type: "text/html", value: body }],
          }),
        });

        const success = response.ok;
        const errorText = success ? undefined : await response.text();

        // Log the send
        await supabaseClient.from("outreach_logs").insert({
          campaign_id,
          customer_id: customerId,
          email,
          template_id,
          email_type,
          status: success ? "sent" : "failed",
          sent_at: success ? new Date().toISOString() : null,
          error_message: errorText,
        });

        results.push({ email, success, error: errorText });

        // Update campaign counts if applicable
        if (campaign_id) {
          if (success) {
            await supabaseClient.rpc("increment_campaign_sent", { campaign_uuid: campaign_id });
          } else {
            await supabaseClient.rpc("increment_campaign_failed", { campaign_uuid: campaign_id });
          }
        }

        console.log(`Email to ${email}: ${success ? "sent" : "failed"}`);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error(`Error sending to ${email}:`, error);
        results.push({ email, success: false, error: errorMessage });

        await supabaseClient.from("outreach_logs").insert({
          campaign_id,
          customer_id: customerId,
          email,
          template_id,
          email_type,
          status: "failed",
          error_message: errorMessage,
        });
      }
    }

    // Mark campaign as completed if all emails processed
    if (campaign_id) {
      await supabaseClient
        .from("email_campaigns")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", campaign_id);
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failCount,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-outreach-email:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
