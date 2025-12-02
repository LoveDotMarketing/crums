import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

declare const EdgeRuntime: {
  waitUntil(promise: Promise<any>): void;
};

interface ContactFormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

// HTML entity encoding to prevent injection attacks
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

// Handle shutdown events
addEventListener('beforeunload', (ev: any) => {
  console.log('Function shutdown:', ev.detail?.reason || 'unknown reason');
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData: ContactFormData = await req.json();
    console.log('Received contact form submission:', { name: formData.name, email: formData.email });

    // Validate required fields
    if (!formData.name || !formData.company || !formData.email || !formData.phone) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Background task to send email
    const sendEmailTask = async () => {
      try {
        // Prepare email content - escape all user inputs to prevent HTML injection
        const safeName = escapeHtml(formData.name);
        const safeCompany = escapeHtml(formData.company);
        const safeEmail = escapeHtml(formData.email);
        const safePhone = escapeHtml(formData.phone);
        const safeService = escapeHtml(formData.service || 'Not specified');
        const safeMessage = formData.message ? escapeHtml(formData.message) : '';
        
        const emailSubject = `New Quote Request from ${safeName} - ${safeService}`;
        
        const emailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #f97316; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Name:</strong> ${safeName}</p>
              <p style="margin: 10px 0;"><strong>Company:</strong> ${safeCompany}</p>
              <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
              <p style="margin: 10px 0;"><strong>Phone:</strong> ${safePhone}</p>
              <p style="margin: 10px 0;"><strong>Service Interest:</strong> ${safeService}</p>
            </div>
            
            ${safeMessage ? `
              <div style="margin: 20px 0;">
                <h3 style="color: #555;">Message:</h3>
                <p style="white-space: pre-wrap; background-color: #f9f9f9; padding: 15px; border-left: 3px solid #f97316; border-radius: 3px;">
                  ${safeMessage}
                </p>
              </div>
            ` : ''}
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 12px;">
              <p>This email was sent from the CRUMS Leasing contact form on ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `;

        // Recipients
        const recipients = [
          'bledsoe@crumstrailers.com',
          'ambrosia@crumstrailers.com',
          'hector@crumstrailers.com',
          'info@crumsleasing.com',
          'lovedotmarketing@gmail.com'
        ];

        // Send email via SendGrid
        const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [
              {
                to: recipients.map(email => ({ email })),
                subject: emailSubject,
              }
            ],
            from: {
              email: 'info@crumsleasing.com',
              name: 'CRUMS Leasing Contact Form'
            },
            reply_to: {
              email: formData.email,
              name: formData.name
            },
            content: [
              {
                type: 'text/html',
                value: emailBody
              }
            ]
          }),
        });

        if (!sendGridResponse.ok) {
          const errorText = await sendGridResponse.text();
          console.error('SendGrid API error:', errorText);
          throw new Error(`SendGrid API error: ${sendGridResponse.status}`);
        }

        console.log('Email sent successfully via SendGrid');
      } catch (error: any) {
        console.error('Background email send failed:', error.message || error);
      }
    };

    // Start background task
    EdgeRuntime.waitUntil(sendEmailTask());

    // Return immediate response
    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in send-contact-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to send email' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});