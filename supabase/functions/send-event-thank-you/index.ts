import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY is not configured');
    }

    const { full_name, email } = await req.json();

    if (!email || !full_name) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const firstName = full_name.split(' ')[0];

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color:#1a1a2e;padding:30px 40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:bold;">CRUMS Leasing</h1>
              <p style="color:#c4a35a;margin:8px 0 0;font-size:14px;">MATS 2026 — Booth 38024</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="color:#1a1a2e;margin:0 0 16px;font-size:22px;">Thank you for visiting our booth, ${firstName}!</h2>
              <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 20px;">
                It was great meeting you at MATS 2026! We appreciate you stopping by and learning about our trailer leasing solutions.
              </p>
              <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 20px;">
                Whether you're an owner-operator looking for your first trailer or a fleet manager scaling operations, CRUMS Leasing is here to help you move forward.
              </p>
              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:30px auto;">
                <tr>
                  <td style="background-color:#c4a35a;border-radius:6px;">
                    <a href="https://crumsleasing.com/get-started" target="_blank" style="display:inline-block;padding:14px 32px;color:#1a1a2e;font-size:16px;font-weight:bold;text-decoration:none;">
                      Get Started Today
                    </a>
                  </td>
                </tr>
              </table>
              <hr style="border:none;border-top:1px solid #e5e5e5;margin:30px 0;" />
              <!-- Links -->
              <p style="color:#1a1a2e;font-size:16px;font-weight:bold;margin:0 0 12px;">Learn More</p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="padding:4px 0;"><a href="https://crumsleasing.com" target="_blank" style="color:#c4a35a;font-size:14px;text-decoration:none;">🌐 crumsleasing.com</a></td>
                </tr>
                <tr>
                  <td style="padding:4px 0;"><a href="https://crumsleasing.com/dry-van-trailer-leasing" target="_blank" style="color:#c4a35a;font-size:14px;text-decoration:none;">🚛 Dry Van Trailer Leasing</a></td>
                </tr>
                <tr>
                  <td style="padding:4px 0;"><a href="https://crumsleasing.com/flatbed-trailer-leasing" target="_blank" style="color:#c4a35a;font-size:14px;text-decoration:none;">📦 Flatbed Trailer Leasing</a></td>
                </tr>
                <tr>
                  <td style="padding:4px 0;"><a href="https://crumsleasing.com/services/lease-to-own" target="_blank" style="color:#c4a35a;font-size:14px;text-decoration:none;">🔑 Lease to Own Program</a></td>
                </tr>
                <tr>
                  <td style="padding:4px 0;"><a href="tel:+18885704564" style="color:#c4a35a;font-size:14px;text-decoration:none;">📞 (888) 570-4564</a></td>
                </tr>
              </table>
              <!-- Social Links -->
              <p style="color:#1a1a2e;font-size:16px;font-weight:bold;margin:0 0 12px;">Follow Us</p>
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:16px;">
                    <a href="https://www.facebook.com/CRUMSLeasing/" target="_blank" style="color:#c4a35a;font-size:14px;text-decoration:none;">Facebook</a>
                  </td>
                  <td style="padding-right:16px;">
                    <a href="https://www.instagram.com/crumsleasingllc/" target="_blank" style="color:#c4a35a;font-size:14px;text-decoration:none;">Instagram</a>
                  </td>
                  <td style="padding-right:16px;">
                    <a href="https://www.linkedin.com/company/crums-leasing/" target="_blank" style="color:#c4a35a;font-size:14px;text-decoration:none;">LinkedIn</a>
                  </td>
                  <td>
                    <a href="https://www.youtube.com/@CRUMSLeasing" target="_blank" style="color:#c4a35a;font-size:14px;text-decoration:none;">YouTube</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:24px 40px;text-align:center;">
              <p style="color:#999;font-size:12px;margin:0 0 4px;">CRUMS Leasing | 7450 Prue Rd #2, San Antonio, TX 78249</p>
              <p style="color:#999;font-size:12px;margin:0;">© ${new Date().getFullYear()} CRUMS Leasing. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const sgResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email, name: full_name }] }],
        from: { email: 'hello@crumsleasing.com', name: 'CRUMS Leasing' },
        subject: `Great meeting you at MATS 2026, ${firstName}!`,
        content: [{ type: 'text/html', value: htmlContent }],
      }),
    });

    if (!sgResponse.ok) {
      const errText = await sgResponse.text();
      console.error('SendGrid error:', errText);
      throw new Error(`SendGrid failed: ${sgResponse.status}`);
    }

    console.log(`[send-event-thank-you] Email sent to ${email}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[send-event-thank-you] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
