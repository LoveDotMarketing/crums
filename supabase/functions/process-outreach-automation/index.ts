import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

interface PlannedEmail {
  customer_id: string;
  customer_name: string;
  email: string;
  type: "welcome" | "password_reminder" | "profile_reminder";
  reason: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Verify admin authentication
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    console.log("[Automation] No authorization header");
    return new Response(
      JSON.stringify({ error: "Missing authorization header" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Get user from JWT
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    console.log("[Automation] Invalid token:", authError?.message);
    return new Response(
      JSON.stringify({ error: "Invalid authorization token" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Check if user has admin role
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .single();

  if (!roleData) {
    console.log("[Automation] User is not admin:", user.id);
    return new Response(
      JSON.stringify({ error: "Admin access required" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Parse request body for dry_run flag
  let dryRun = false;
  try {
    const body = await req.json();
    dryRun = body?.dry_run === true;
  } catch {
    // No body or invalid JSON, proceed with default (not dry run)
  }

  console.log(`[Automation] Admin ${user.email} starting outreach automation (dry_run: ${dryRun})`);

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
          emails_sent: 0,
          dry_run: dryRun,
          planned_emails: []
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

    // Fetch only ACTIVE customers with email (exclude archived customers)
    const { data: customers, error: customersError } = await supabase
      .from("customers")
      .select("id, full_name, email")
      .eq("status", "active")
      .not("email", "is", null);

    if (customersError) throw customersError;
    if (!customers || customers.length === 0) {
      console.log("[Automation] No customers with email found.");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No customers to process", 
          emails_sent: 0,
          dry_run: dryRun,
          planned_emails: []
        }),
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
    const plannedEmails: PlannedEmail[] = [];

    for (const customer of customers) {
      let status = statuses[customer.id];
      let justSentWelcome = false;

      if (!status) {
        if (dryRun) {
          status = {
            id: "simulated",
            customer_id: customer.id,
            welcome_sent_at: null,
            password_set_at: null,
            profile_completed_at: null,
            last_password_reminder_at: null,
            last_profile_reminder_at: null,
            reminder_count: 0,
            unsubscribed: false,
          };
        } else {
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
      }

      if (status.unsubscribed) {
        console.log(`[Automation] Skipping ${customer.email} - unsubscribed`);
        continue;
      }

      const unsubscribeUrl = `${baseUrl}/unsubscribe?email=${encodeURIComponent(customer.email)}`;
      const replaceVariables = (text: string) => {
        return text
          .replace(/\{\{customer_name\}\}/g, customer.full_name || "Valued Customer")
          .replace(/\{\{login_url\}\}/g, loginUrl)
          .replace(/\{\{profile_url\}\}/g, profileUrl)
          .replace(/\{\{unsubscribe_url\}\}/g, unsubscribeUrl);
      };

      // 1. WELCOME EMAIL
      if (
        settings.welcome_email_enabled === "true" &&
        !status.welcome_sent_at &&
        welcomeTemplate
      ) {
        if (dryRun) {
          plannedEmails.push({
            customer_id: customer.id,
            customer_name: customer.full_name,
            email: customer.email,
            type: "welcome",
            reason: "No welcome email sent yet",
          });
          justSentWelcome = true;
        } else {
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
            justSentWelcome = true;
          } else {
            console.error(`[Automation] Failed to send welcome to ${customer.email}:`, sendError);
            results.push({ customer: customer.email, type: "welcome", status: "failed" });
          }
        }
      }

      // 2. PASSWORD REMINDER
      if (
        settings.password_reminder_enabled === "true" &&
        !status.password_set_at &&
        passwordTemplate &&
        status.reminder_count < maxReminders &&
        !justSentWelcome
      ) {
        const lastReminder = status.last_password_reminder_at
          ? new Date(status.last_password_reminder_at)
          : null;
        const daysSinceLastReminder = lastReminder
          ? (now.getTime() - lastReminder.getTime()) / (1000 * 60 * 60 * 24)
          : passwordReminderDays + 1;

        if (daysSinceLastReminder >= passwordReminderDays) {
          if (dryRun) {
            plannedEmails.push({
              customer_id: customer.id,
              customer_name: customer.full_name,
              email: customer.email,
              type: "password_reminder",
              reason: lastReminder 
                ? `${Math.floor(daysSinceLastReminder)} days since last reminder`
                : "No password reminder sent yet",
            });
          } else {
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
      }

      // 3. PROFILE COMPLETION REMINDER
      if (
        settings.profile_reminder_enabled === "true" &&
        status.password_set_at &&
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
          if (dryRun) {
            plannedEmails.push({
              customer_id: customer.id,
              customer_name: customer.full_name,
              email: customer.email,
              type: "profile_reminder",
              reason: lastProfileReminder
                ? `${Math.floor(daysSinceLastProfileReminder)} days since last reminder`
                : "No profile reminder sent yet",
            });
          } else {
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
    }

    if (dryRun) {
      const welcomeCount = plannedEmails.filter(e => e.type === "welcome").length;
      const passwordCount = plannedEmails.filter(e => e.type === "password_reminder").length;
      const profileCount = plannedEmails.filter(e => e.type === "profile_reminder").length;

      console.log(`[Automation] Dry run complete. Would send ${plannedEmails.length} emails.`);
      
      return new Response(
        JSON.stringify({
          success: true,
          dry_run: true,
          message: `Preview: ${plannedEmails.length} emails would be sent`,
          total_planned: plannedEmails.length,
          welcome_count: welcomeCount,
          password_reminder_count: passwordCount,
          profile_reminder_count: profileCount,
          planned_emails: plannedEmails,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Automation] Completed. ${emailsSent} emails sent.`);

    return new Response(
      JSON.stringify({
        success: true,
        dry_run: false,
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
