import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function escapeHtml(text: string): string {
  if (!text) return '';
  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, email, phone, companyName, referralCode } = await req.json();

    console.log('New signup notification:', { firstName, lastName, email });

    const safeName = escapeHtml(`${firstName || ''} ${lastName || ''}`.trim() || 'Not provided');
    const safeEmail = escapeHtml(email || 'Not provided');
    const safePhone = escapeHtml(phone || 'Not provided');
    const safeCompany = escapeHtml(companyName || 'Not provided');
    const safeReferral = referralCode ? escapeHtml(referralCode) : null;

    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #f97316; padding-bottom: 10px;">
          New Customer Registration
        </h2>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Name:</strong> ${safeName}</p>
          <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
          <p style="margin: 10px 0;"><strong>Phone:</strong> ${safePhone}</p>
          <p style="margin: 10px 0;"><strong>Company:</strong> ${safeCompany}</p>
          ${safeReferral ? `<p style="margin: 10px 0;"><strong>Referral Code:</strong> ${safeReferral}</p>` : ''}
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 12px;">
          <p>Registered via Get Started page on ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;

    const recipients = [
      'sales@crumsleasing.com',
      'eric@crumsleasing.com',
      'ambrosia@crumsleasing.com',
      'lovedotmarketing@gmail.com',
      'adam@crumsleasing.com',
    ];

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: recipients.map(e => ({ email: e })), subject: `[New Registration] ${(firstName || '')} ${(lastName || '')} — CRUMS Leasing` }],
        from: { email: 'sales@crumsleasing.com', name: 'CRUMS Leasing' },
        content: [{ type: 'text/html', value: emailBody }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SendGrid error:', errorText);
      throw new Error(`SendGrid error: ${response.status}`);
    }

    console.log('Signup notification sent successfully');
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in send-signup-notification:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
