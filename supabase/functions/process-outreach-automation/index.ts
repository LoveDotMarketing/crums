import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Customer {
  id: string;
  full_name: string;
  email: string;
}

interface OutreachStatus {
  id: string;
  customer_id: string;
  welcome_sent_at: string | null;
  password_set_at: string | null;
  profile_completed_at: string | null;
  last_password_reminder_at: string | null;
  last_profile_reminder_at: string | null;
  reminder_count: number;
  unsubscribed: boolean;
}

interface EmailTemplate {
  id: string;
  subject: string;
  body: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log("[Automation] Starting outreach automation process...");

  try {
    // Fetch all settings
    const { data: settingsData, error: settingsError } = await supabase
      .from("outreach_settings")
      .select("setting_key, setting_value");

    if (settingsError) throw settingsError;

    const settings: Record<string, string> = {};
    settingsData?.forEach((s) => {
      settings[s.setting_key] = s.setting_value;
    });

    // CHECK MASTER SWITCH FIRST
    if (settings.automation_enabled !== "true") {
      console.log("[Automation] Master switch is OFF. No automated emails will be sent.");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Automation is disabled",
          emails_sent: 0 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[Automation] Master switch is ON. Processing automation...");

    // Fetch templates
    const { data: templates, error: templatesError } = await supabase
      .from("email_templates")
      .select("id, subject, body, template_type")
      .eq("is_active", true);

    if (templatesError) throw templatesError;

    const welcomeTemplate = templates?.find((t) => t.template_type === "welcome");
    const passwordTemplate = templates?.find((t) => t.template_type === "password_reminder");
    const profileTemplate = templates?.find((t) => t.template_type === "profile_reminder");

    // Fetch customers with email
    const { data: customers, error: customersError } = await supabase
      .from("customers")
      .select("id, full_name, email")
      .not("email", "is", null);

    if (customersError) throw customersError;
    if (!customers || customers.length === 0) {
      console.log("[Automation] No customers with email found.");
      return new Response(
        JSON.stringify({ success: true, message: "No customers to process", emails_sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch all outreach statuses
    const { data: statusesData, error: statusesError } = await supabase
      .from("customer_outreach_status")
      .select("*");

    if (statusesError) throw statusesError;

    const statuses: Record<string, OutreachStatus> = {};
    statusesData?.forEach((s) => {
      statuses[s.customer_id] = s as OutreachStatus;
    });

    const now = new Date();
    const passwordReminderDays = parseInt(settings.password_reminder_days || "3");
    const profileReminderDays = parseInt(settings.profile_reminder_days || "3");
    const maxReminders = parseInt(settings.max_reminders || "5");
    const baseUrl = "https://crumsleasing.com";
    const loginUrl = `${baseUrl}/login`;
    const profileUrl = `${baseUrl}/dashboard/customer/profile`;

    let emailsSent = 0;
    const results: { customer: string; type: string; status: string }[] = [];

    for (const customer of customers) {
      let status = statuses[customer.id];

      // Create outreach status record if doesn't exist
      if (!status) {
        const { data: newStatus, error: insertError } = await supabase
          .from("customer_outreach_status")
          .insert({ customer_id: customer.id })
          .select()
          .single();

        if (insertError) {
          console.error(`[Automation] Failed to create status for ${customer.email}:`, insertError);
          continue;
        }
        status = newStatus as OutreachStatus;
      }

      // Skip if unsubscribed
      if (status.unsubscribed) {
        console.log(`[Automation] Skipping ${customer.email} - unsubscribed`);
        continue;
      }

      // Helper to replace template variables
      const replaceVariables = (text: string) => {
        return text
          .replace(/\{\{customer_name\}\}/g, customer.full_name || "Valued Customer")
          .replace(/\{\{login_url\}\}/g, loginUrl)
          .replace(/\{\{profile_url\}\}/g, profileUrl);
      };

      // 1. WELCOME EMAIL
      if (
        settings.welcome_email_enabled === "true" &&
        !status.welcome_sent_at &&
        welcomeTemplate
      ) {
        console.log(`[Automation] Sending welcome email to ${customer.email}`);
        
        const { error: sendError } = await supabase.functions.invoke("send-outreach-email", {
          body: {
            to: customer.email,
            subject: replaceVariables(welcomeTemplate.subject),
            body: replaceVariables(welcomeTemplate.body),
            customer_id: customer.id,
            template_id: welcomeTemplate.id,
            email_type: "welcome",
          },
        });

        if (!sendError) {
          await supabase
            .from("customer_outreach_status")
            .update({ welcome_sent_at: now.toISOString() })
            .eq("customer_id", customer.id);
          emailsSent++;
          results.push({ customer: customer.email, type: "welcome", status: "sent" });
        } else {
          console.error(`[Automation] Failed to send welcome to ${customer.email}:`, sendError);
          results.push({ customer: customer.email, type: "welcome", status: "failed" });
        }
      }

      // 2. PASSWORD REMINDER
      if (
        settings.password_reminder_enabled === "true" &&
        !status.password_set_at &&
        passwordTemplate &&
        status.reminder_count < maxReminders
      ) {
        const lastReminder = status.last_password_reminder_at
          ? new Date(status.last_password_reminder_at)
          : null;
        const daysSinceLastReminder = lastReminder
          ? (now.getTime() - lastReminder.getTime()) / (1000 * 60 * 60 * 24)
          : passwordReminderDays + 1; // Trigger on first run

        if (daysSinceLastReminder >= passwordReminderDays) {
          console.log(`[Automation] Sending password reminder to ${customer.email}`);
          
          const { error: sendError } = await supabase.functions.invoke("send-outreach-email", {
            body: {
              to: customer.email,
              subject: replaceVariables(passwordTemplate.subject),
              body: replaceVariables(passwordTemplate.body),
              customer_id: customer.id,
              template_id: passwordTemplate.id,
              email_type: "password_reminder",
            },
          });

          if (!sendError) {
            await supabase
              .from("customer_outreach_status")
              .update({
                last_password_reminder_at: now.toISOString(),
                reminder_count: (status.reminder_count || 0) + 1,
              })
              .eq("customer_id", customer.id);
            emailsSent++;
            results.push({ customer: customer.email, type: "password_reminder", status: "sent" });
          } else {
            console.error(`[Automation] Failed to send password reminder to ${customer.email}:`, sendError);
            results.push({ customer: customer.email, type: "password_reminder", status: "failed" });
          }
        }
      }

      // 3. PROFILE COMPLETION REMINDER
      if (
        settings.profile_reminder_enabled === "true" &&
        status.password_set_at && // Only send if password is set
        !status.profile_completed_at &&
        profileTemplate
      ) {
        const lastProfileReminder = status.last_profile_reminder_at
          ? new Date(status.last_profile_reminder_at)
          : null;
        const daysSinceLastProfileReminder = lastProfileReminder
          ? (now.getTime() - lastProfileReminder.getTime()) / (1000 * 60 * 60 * 24)
          : profileReminderDays + 1;

        if (daysSinceLastProfileReminder >= profileReminderDays) {
          console.log(`[Automation] Sending profile reminder to ${customer.email}`);
          
          const { error: sendError } = await supabase.functions.invoke("send-outreach-email", {
            body: {
              to: customer.email,
              subject: replaceVariables(profileTemplate.subject),
              body: replaceVariables(profileTemplate.body),
              customer_id: customer.id,
              template_id: profileTemplate.id,
              email_type: "profile_reminder",
            },
          });

          if (!sendError) {
            await supabase
              .from("customer_outreach_status")
              .update({ last_profile_reminder_at: now.toISOString() })
              .eq("customer_id", customer.id);
            emailsSent++;
            results.push({ customer: customer.email, type: "profile_reminder", status: "sent" });
          } else {
            console.error(`[Automation] Failed to send profile reminder to ${customer.email}:`, sendError);
            results.push({ customer: customer.email, type: "profile_reminder", status: "failed" });
          }
        }
      }
    }

    console.log(`[Automation] Completed. ${emailsSent} emails sent.`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Automation completed`,
        emails_sent: emailsSent,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[Automation] Error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
