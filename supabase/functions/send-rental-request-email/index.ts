import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface RentalRequestData {
  phone_number: string;
  trailer_type: string;
  start_date?: string;
  secondary_contact_name?: string;
  secondary_contact_phone?: string;
  secondary_contact_relationship?: string;
  notes?: string;
  user_email?: string;
  user_name?: string;
}

function escapeHtml(text: string): string {
  if (!text) return '';
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData: RentalRequestData = await req.json();
    
    console.log('Received rental request:', { 
      phone: formData.phone_number,
      trailer_type: formData.trailer_type,
      user_email: formData.user_email
    });

    const safePhone = escapeHtml(formData.phone_number);
    const safeTrailerType = escapeHtml(formData.trailer_type);
    const safeStartDate = formData.start_date ? escapeHtml(formData.start_date) : 'Not specified';
    const safeSecondaryName = formData.secondary_contact_name ? escapeHtml(formData.secondary_contact_name) : '-';
    const safeSecondaryPhone = formData.secondary_contact_phone ? escapeHtml(formData.secondary_contact_phone) : '-';
    const safeRelationship = formData.secondary_contact_relationship ? escapeHtml(formData.secondary_contact_relationship) : '-';
    const safeNotes = formData.notes ? escapeHtml(formData.notes) : '';

    const emailSubject = `New Rental Request - ${safeTrailerType}`;

    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #f97316; padding-bottom: 10px;">
          New Rental Request Submission
        </h2>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Submitter Email:</strong> <a href="mailto:${escapeHtml(formData.user_email || '')}">${escapeHtml(formData.user_email || 'Not provided')}</a></p>
          <p style="margin: 10px 0;"><strong>Submitter Name:</strong> ${escapeHtml(formData.user_name || 'Not provided')}</p>
          <p style="margin: 10px 0;"><strong>Phone Number:</strong> ${safePhone}</p>
          <p style="margin: 10px 0;"><strong>Trailer Type:</strong> ${safeTrailerType}</p>
          <p style="margin: 10px 0;"><strong>Desired Start Date:</strong> ${safeStartDate}</p>
        </div>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #555; margin-top: 0;">Secondary Contact</h3>
          <p style="margin: 10px 0;"><strong>Name:</strong> ${safeSecondaryName}</p>
          <p style="margin: 10px 0;"><strong>Phone:</strong> ${safeSecondaryPhone}</p>
          <p style="margin: 10px 0;"><strong>Relationship:</strong> ${safeRelationship}</p>
        </div>

        ${safeNotes ? `
          <div style="margin: 20px 0;">
            <h3 style="color: #555;">Additional Notes:</h3>
            <p style="white-space: pre-wrap; background-color: #f9f9f9; padding: 15px; border-left: 3px solid #f97316; border-radius: 3px;">
              ${safeNotes}
            </p>
          </div>
        ` : ''}
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 12px;">
          <p>This email was sent from the CRUMS Leasing rental request form on ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;

    // Recipients
    const recipients = [
      'henry@crumsleasing.com',
      'eric@crumsleasing.com',
      'ambrosia@crumsleasing.com',
      'sales@crumsleasing.com'
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
          email: 'sales@crumsleasing.com',
          name: 'CRUMS Leasing Rental Request'
        },
        reply_to: {
          email: (formData.user_email || 'noreply@crumsleasing.com').replace(/[\r\n\t\x00-\x1f]/g, '').trim(),
          name: (formData.user_name || 'Customer').replace(/[\r\n\t\x00-\x1f]/g, '').trim().substring(0, 100)
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

    console.log('Rental request email sent successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in send-rental-request-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to send email' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
