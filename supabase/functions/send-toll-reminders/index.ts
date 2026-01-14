import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET");

interface TollWithProfile {
  id: string;
  amount: number;
  toll_date: string;
  toll_location: string | null;
  toll_authority: string | null;
  customer_id: string;
  last_reminder_sent_at: string | null;
  reminder_count: number;
  profiles: {
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
}

// Validate cron job authentication
const validateCronAuth = (req: Request): boolean => {
  const authHeader = req.headers.get("authorization");
  
  // Check for Bearer token (cron job secret)
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "");
    if (CRON_SECRET && token === CRON_SECRET) {
      return true;
    }
  }
  
  return false;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Authenticate the request - only allow authorized cron jobs
  if (!validateCronAuth(req)) {
    console.error("Unauthorized access attempt to send-toll-reminders");
    return new Response(
      JSON.stringify({ error: "Unauthorized. This endpoint requires cron job authentication." }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if toll reminders are enabled
    const { data: settings } = await supabase
      .from("outreach_settings")
      .select("setting_key, setting_value")
      .in("setting_key", ["toll_reminder_enabled", "toll_reminder_interval_days"]);

    const settingsMap = (settings || []).reduce((acc, s) => {
      acc[s.setting_key] = s.setting_value;
      return acc;
    }, {} as Record<string, string>);

    const isEnabled = settingsMap["toll_reminder_enabled"] === "true";
    const intervalDays = parseInt(settingsMap["toll_reminder_interval_days"] || "3", 10);

    if (!isEnabled) {
      console.log("Toll reminders are disabled");
      return new Response(JSON.stringify({ message: "Toll reminders are disabled" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate the cutoff date for sending reminders
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - intervalDays);

    // Fetch pending tolls that need reminders
    const { data: pendingTolls, error: tollsError } = await supabase
      .from("tolls")
      .select(`
        id,
        amount,
        toll_date,
        toll_location,
        toll_authority,
        customer_id,
        last_reminder_sent_at,
        reminder_count,
        profiles!tolls_customer_id_fkey (
          email,
          first_name,
          last_name
        )
      `)
      .eq("status", "pending")
      .or(`last_reminder_sent_at.is.null,last_reminder_sent_at.lt.${cutoffDate.toISOString()}`);

    if (tollsError) {
      console.error("Error fetching tolls:", tollsError);
      throw new Error(`Failed to fetch tolls: ${tollsError.message}`);
    }

    console.log(`Found ${pendingTolls?.length || 0} tolls needing reminders`);

    if (!pendingTolls || pendingTolls.length === 0) {
      return new Response(JSON.stringify({ message: "No tolls need reminders", sent: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sentCount = 0;
    let errorCount = 0;

    for (const toll of pendingTolls as unknown as TollWithProfile[]) {
      if (!toll.profiles?.email) {
        console.log(`Skipping toll ${toll.id}: no email found`);
        continue;
      }

      const customerName = toll.profiles.first_name 
        ? `${toll.profiles.first_name}` 
        : "Valued Customer";

      const formattedAmount = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(toll.amount);

      const formattedDate = new Date(toll.toll_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a365d;">Toll Payment Reminder</h2>
          <p>Hello ${customerName},</p>
          <p>This is a reminder that you have an unpaid toll notice requiring your attention:</p>
          <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Amount:</strong> ${formattedAmount}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            ${toll.toll_location ? `<p><strong>Location:</strong> ${toll.toll_location}</p>` : ""}
            ${toll.toll_authority ? `<p><strong>Toll Authority:</strong> ${toll.toll_authority}</p>` : ""}
          </div>
          <p>Please pay this toll directly to the toll authority as soon as possible to avoid additional fees.</p>
          <p>Once paid, log in to your dashboard and mark the toll as paid.</p>
          <p style="margin-top: 30px;">Thank you,<br>CRUMS Leasing Team</p>
        </div>
      `;

      try {
        const emailResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SENDGRID_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: toll.profiles.email }] }],
            from: { email: "noreply@crumsleasing.com", name: "CRUMS Leasing" },
            subject: `Toll Payment Reminder - ${formattedAmount} due`,
            content: [{ type: "text/html", value: emailContent }],
          }),
        });

        if (emailResponse.ok || emailResponse.status === 202) {
          // Update the toll record with reminder info
          await supabase
            .from("tolls")
            .update({
              last_reminder_sent_at: new Date().toISOString(),
              reminder_count: (toll.reminder_count || 0) + 1,
            })
            .eq("id", toll.id);

          sentCount++;
          console.log(`Sent reminder for toll ${toll.id} to ${toll.profiles.email}`);
        } else {
          const errorText = await emailResponse.text();
          console.error(`Failed to send email for toll ${toll.id}:`, errorText);
          errorCount++;
        }
      } catch (emailError) {
        console.error(`Error sending email for toll ${toll.id}:`, emailError);
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({
        message: "Toll reminders processed",
        sent: sentCount,
        errors: errorCount,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-toll-reminders:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
