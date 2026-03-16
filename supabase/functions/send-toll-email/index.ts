import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function logStep(step: string, details?: Record<string, unknown>) {
  console.log(`[send-toll-email] ${step}`, details ? JSON.stringify(details) : "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization") || "";
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify admin caller
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { toll_id } = await req.json();
    if (!toll_id) {
      return new Response(JSON.stringify({ error: "toll_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Fetching toll", { toll_id });

    // Fetch toll with customer profile
    const { data: toll, error: tollError } = await supabaseAdmin
      .from("tolls")
      .select(`
        id, amount, toll_date, toll_location, toll_authority, receipt_url, customer_id,
        profiles:customer_id(email, first_name, last_name)
      `)
      .eq("id", toll_id)
      .single();

    if (tollError || !toll) {
      logStep("Toll not found", { tollError });
      return new Response(JSON.stringify({ error: "Toll not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const profile = toll.profiles as { email: string; first_name: string | null; last_name: string | null } | null;
    if (!profile?.email) {
      logStep("No customer email found");
      return new Response(JSON.stringify({ error: "Customer has no email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate signed URL for toll photo if receipt_url exists
    let photoUrl = "";
    if (toll.receipt_url) {
      const { data: signedData } = await supabaseAdmin.storage
        .from("toll-receipts")
        .createSignedUrl(toll.receipt_url, 60 * 60 * 24 * 7); // 7 days
      if (signedData?.signedUrl) {
        photoUrl = signedData.signedUrl;
      }
    }

    const customerName = profile.first_name || "Valued Customer";
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
        <h2 style="color: #1a365d;">Toll Notice from CRUMS Leasing</h2>
        <p>Hello ${customerName},</p>
        <p>A toll has been recorded on your account. Please review the details below:</p>
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Amount:</strong> ${formattedAmount}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          ${toll.toll_location ? `<p><strong>Location:</strong> ${toll.toll_location}</p>` : ""}
          ${toll.toll_authority ? `<p><strong>Toll Authority:</strong> ${toll.toll_authority}</p>` : ""}
        </div>
        ${photoUrl ? `
          <div style="margin: 20px 0;">
            <p><strong>Toll Notice Photo:</strong></p>
            <a href="${photoUrl}" target="_blank" style="display: inline-block; margin-top: 8px;">
              <img src="${photoUrl}" alt="Toll notice" style="max-width: 100%; max-height: 400px; border-radius: 8px; border: 1px solid #e2e8f0;" />
            </a>
            <p style="font-size: 12px; color: #718096; margin-top: 4px;">Click the image to view full size. This link expires in 7 days.</p>
          </div>
        ` : ""}
        <p>This toll will be charged to your account. If you have questions, please contact us.</p>
        <p style="margin-top: 30px;">Thank you,<br>CRUMS Leasing Team</p>
      </div>
    `;

    logStep("Sending email", { to: profile.email });

    const emailResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: profile.email }] }],
        from: { email: "noreply@crumsleasing.com", name: "CRUMS Leasing" },
        subject: `Toll Notice - ${formattedAmount} | ${formattedDate}`,
        content: [{ type: "text/html", value: emailContent }],
      }),
    });

    if (!emailResponse.ok && emailResponse.status !== 202) {
      const errText = await emailResponse.text();
      logStep("SendGrid error", { status: emailResponse.status, body: errText });
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    logStep("Error", { error: msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
