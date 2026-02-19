import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Support both legacy format (string[]) and new format (object[])
interface RecipientObject {
  email: string;
  customer_id?: string;
  customer_name?: string;
}

interface EmailRequest {
  to?: string | string[];  // Legacy format
  recipients?: RecipientObject[];  // New format with customer data
  subject: string;
  body: string;
  campaign_id?: string;
  template_id?: string;
  customer_ids?: string[];  // Legacy format
  email_type?: string;
}

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const BASE_URL = "https://crumsleasing.com";

// Replace template variables with actual customer data
const replaceTemplateVariables = (
  text: string, 
  customer: { email: string; name?: string }
): string => {
  return text
    .replace(/\{\{customer_name\}\}/g, customer.name || "Valued Customer")
    .replace(/\{\{customer_email\}\}/g, customer.email)
    .replace(/\{\{username\}\}/g, customer.email)
    .replace(/\{\{login_url\}\}/g, `${BASE_URL}/login`)
    .replace(/\{\{profile_url\}\}/g, `${BASE_URL}/dashboard/customer/profile`)
    .replace(/\{\{application_url\}\}/g, `${BASE_URL}/dashboard/customer/application`)
    .replace(/\{\{get_started_url\}\}/g, `${BASE_URL}/get-started`)
    .replace(/\{\{unsubscribe_url\}\}/g, `${BASE_URL}/unsubscribe?email=${encodeURIComponent(customer.email)}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

  // Check for authorization - support both user JWT and internal service calls
  const authHeader = req.headers.get("authorization");
  let callerEmail = "internal-service";
  let isAuthorized = false;

  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    
    // Check if it's the service role key (internal call from another edge function)
    if (token === supabaseServiceKey) {
      isAuthorized = true;
      callerEmail = "internal-automation";
      console.log("[SendOutreachEmail] Internal service call authorized");
    } else {
      // Try to validate as user JWT
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
      
      if (!authError && user) {
        // Check if user has admin role
        const { data: roleData } = await supabaseClient
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .single();

        if (roleData) {
          isAuthorized = true;
          callerEmail = user.email || "admin";
          console.log(`[SendOutreachEmail] Admin ${callerEmail} authorized`);
        }
      }
    }
  }

  if (!isAuthorized) {
    console.log("[SendOutreachEmail] Unauthorized request");
    return new Response(
      JSON.stringify({ error: "Unauthorized - admin access or internal service call required" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const requestBody: EmailRequest = await req.json();
    const { to, recipients, subject, body, campaign_id, template_id, customer_ids, email_type = "manual" } = requestBody;

    // Normalize recipients - support both legacy (to + customer_ids) and new (recipients) format
    let normalizedRecipients: RecipientObject[];
    
    if (recipients && Array.isArray(recipients) && recipients.length > 0) {
      // New format: array of recipient objects
      normalizedRecipients = recipients;
      console.log(`[SendOutreachEmail] Using new recipient format with ${recipients.length} recipients`);
    } else if (to) {
      // Legacy format: convert to recipient objects
      const emailArray = Array.isArray(to) ? to : [to];
      normalizedRecipients = emailArray.map((email, i) => ({
        email,
        customer_id: customer_ids?.[i],
        customer_name: undefined, // Legacy format doesn't include names
      }));
      console.log(`[SendOutreachEmail] Using legacy format with ${emailArray.length} recipients`);
    } else {
      throw new Error("No recipients specified");
    }

    console.log(`[SendOutreachEmail] ${callerEmail} sending email to ${normalizedRecipients.length} recipients`);

    const results: { email: string; success: boolean; error?: string }[] = [];

    // Get from settings
    const { data: settings } = await supabaseClient
      .from("outreach_settings")
      .select("setting_key, setting_value")
      .in("setting_key", ["from_name", "reply_to"]);

    const fromName = settings?.find(s => s.setting_key === "from_name")?.setting_value || "CRUMS Leasing";
    const replyTo = settings?.find(s => s.setting_key === "reply_to")?.setting_value || "sales@crumsleasing.com";

    for (const recipient of normalizedRecipients) {
      const { email, customer_id: customerId, customer_name } = recipient;

      // Personalize subject and body for this recipient
      const personalizedSubject = replaceTemplateVariables(subject, { email, name: customer_name });
      const personalizedBody = replaceTemplateVariables(body, { email, name: customer_name });

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
            subject: personalizedSubject,
            content: [{ type: "text/html", value: personalizedBody }],
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
