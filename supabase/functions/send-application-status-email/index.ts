import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StatusChangeRequest {
  applicationId: string;
  newStatus: string;
  customerEmail: string;
  customerName: string;
  adminNotes?: string;
}

const statusMessages: Record<string, { subject: string; heading: string; body: string; color: string }> = {
  pending_review: {
    subject: "Your CRUMS Leasing Application is Under Review",
    heading: "Application Under Review",
    body: "Thank you for submitting your application. Our team is now reviewing your information. This process typically takes 1-2 business days. We'll notify you as soon as a decision is made.",
    color: "#f59e0b"
  },
  approved: {
    subject: "Congratulations! Your CRUMS Leasing Application is Approved",
    heading: "Application Approved!",
    body: "Great news! Your application has been approved. Welcome to the CRUMS Leasing family! Our team will be in contact shortly to finalize your trailer assignment and schedule your pickup date.",
    color: "#22c55e"
  },
  rejected: {
    subject: "Update on Your CRUMS Leasing Application",
    heading: "Application Update",
    body: "After careful review, we are unable to approve your application at this time. If you have questions or would like to discuss this decision, please don't hesitate to contact us at (888) 570-4564.",
    color: "#ef4444"
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    // Verify the user is an admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { applicationId, newStatus, customerEmail, customerName, adminNotes }: StatusChangeRequest = await req.json();
    
    console.log('Processing status change email:', { applicationId, newStatus, customerEmail });

    // Validate status
    if (!statusMessages[newStatus]) {
      return new Response(
        JSON.stringify({ error: 'Invalid status for email notification' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const messageConfig = statusMessages[newStatus];
    const safeName = customerName.replace(/[<>&"']/g, '');

    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0d9488; margin: 0;">CRUMS Leasing</h1>
          </div>
          
          <div style="background-color: ${messageConfig.color}; color: white; padding: 15px 20px; border-radius: 6px; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 20px;">${messageConfig.heading}</h2>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Dear ${safeName},
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            ${messageConfig.body}
          </p>
          
          ${adminNotes ? `
            <div style="background-color: #f9fafb; border-left: 4px solid ${messageConfig.color}; padding: 15px; margin: 20px 0; border-radius: 0 6px 6px 0;">
              <p style="margin: 0; color: #555; font-size: 14px;">
                <strong>Additional Notes:</strong><br>
                ${adminNotes.replace(/[<>&"']/g, '')}
              </p>
            </div>
          ` : ''}
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              If you have any questions, please contact us:
            </p>
            <p style="color: #0d9488; font-size: 14px; margin: 10px 0;">
              <strong>Phone:</strong> (888) 570-4564<br>
              <strong>Website:</strong> <a href="https://crumsleasing.com" style="color: #0d9488;">crumsleasing.com</a>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">
              © ${new Date().getFullYear()} CRUMS Leasing. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

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
            to: [{ email: customerEmail }],
            subject: messageConfig.subject,
          }
        ],
        from: {
          email: 'sales@crumsleasing.com',
          name: 'CRUMS Leasing'
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

    console.log('Status change email sent successfully to:', customerEmail);

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in send-application-status-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to send email' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
