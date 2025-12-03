import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

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
  _timestamp?: number;
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

// Spam detection utilities
function isGibberish(text: string): boolean {
  if (!text || text.length < 2) return false;
  
  // Check for excessive consonants in a row (more than 4)
  const consonantPattern = /[bcdfghjklmnpqrstvwxyz]{5,}/i;
  if (consonantPattern.test(text)) return true;
  
  // Check for random character sequences
  const randomPattern = /[a-z]{1,2}[0-9]{1,2}[a-z]{1,2}[0-9]{1,2}/i;
  if (randomPattern.test(text)) return true;
  
  // Check vowel ratio - natural text has ~40% vowels
  const vowels = (text.match(/[aeiou]/gi) || []).length;
  const letters = (text.match(/[a-z]/gi) || []).length;
  if (letters > 5 && vowels / letters < 0.15) return true;
  
  return false;
}

function isValidName(name: string): boolean {
  const namePattern = /^[a-zA-Z][a-zA-Z\s\-'.]{1,99}$/;
  return namePattern.test(name) && !isGibberish(name);
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

function isValidCompany(company: string): boolean {
  if (company.length < 2 || company.length > 200) return false;
  const specialChars = (company.match(/[^a-zA-Z0-9\s\-&'.]/g) || []).length;
  if (specialChars > company.length * 0.3) return false;
  return !isGibberish(company);
}

// Known disposable email domains
const disposableEmailDomains = [
  'mailinator.com', 'tempmail.com', 'throwaway.email', 'guerrillamail.com',
  'sharklasers.com', 'temp-mail.org', '10minutemail.com', 'fakeinbox.com',
  'trashmail.com', 'mailnesia.com', 'tempinbox.com', 'dispostable.com',
  'yopmail.com', 'maildrop.cc', 'getairmail.com', 'mohmal.com'
];

function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return disposableEmailDomains.includes(domain);
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

  // Get client IP for rate limiting
  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                   req.headers.get('x-real-ip') || 
                   'unknown';

  try {
    const formData: ContactFormData = await req.json();
    console.log('Received contact form submission:', { 
      name: formData.name, 
      email: formData.email,
      ip: clientIP 
    });

    // Initialize Supabase client for rate limiting
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // === SPAM DETECTION ===
    let spamReason: string | null = null;

    // 1. Validate required fields
    if (!formData.name || !formData.company || !formData.email || !formData.phone) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Name validation
    if (!isValidName(formData.name)) {
      spamReason = 'Invalid name pattern';
    }

    // 3. Company validation
    if (!spamReason && !isValidCompany(formData.company)) {
      spamReason = 'Invalid company pattern';
    }

    // 4. Phone validation
    if (!spamReason && !isValidPhone(formData.phone)) {
      spamReason = 'Invalid phone pattern';
    }

    // 5. Disposable email check
    if (!spamReason && isDisposableEmail(formData.email)) {
      spamReason = 'Disposable email domain';
    }

    // 6. Rate limiting - check submissions in last hour
    if (!spamReason && clientIP !== 'unknown') {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count, error: countError } = await supabase
        .from('contact_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', clientIP)
        .gte('created_at', oneHourAgo);

      if (!countError && count !== null && count >= 3) {
        spamReason = 'Rate limit exceeded';
      }
    }

    // Log the submission for tracking
    const { error: logError } = await supabase
      .from('contact_submissions')
      .insert({
        ip_address: clientIP,
        email: formData.email,
        is_spam: spamReason !== null,
        spam_reason: spamReason
      });

    if (logError) {
      console.error('Error logging submission:', logError);
    }

    // If spam detected, return error response
    if (spamReason) {
      console.log('Spam detected:', spamReason, { email: formData.email, ip: clientIP });
      return new Response(
        JSON.stringify({ 
          spam: true, 
          message: 'Your submission could not be processed. Please try again or contact us directly at (888) 570-4564.' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // === SEND EMAIL (not spam) ===
    const sendEmailTask = async () => {
      try {
        // Prepare email content - escape all user inputs
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
              <p>Submitter IP: ${clientIP}</p>
            </div>
          </div>
        `;

        // Recipients
        const recipients = [
          'bledsoe@crumstrailers.com',
          'ambrosia@crumstrailers.com',
          'hector@crumstrailers.com',
          'sales@crumsleasing.com',
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
              email: 'sales@crumsleasing.com',
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
