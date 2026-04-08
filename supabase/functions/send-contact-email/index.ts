import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function inferSource(data: any): string {
  if (data.landing_page?.startsWith('/lp/')) return 'Google (paid)';
  if (data.utm_source) {
    const medium = (data.utm_medium || '').toLowerCase();
    if (['cpc', 'ppc', 'paid'].includes(medium)) return `${data.utm_source} (paid)`;
    return data.utm_source;
  }
  if (data.referrer) {
    try {
      const hostname = new URL(data.referrer).hostname.toLowerCase();
      if (hostname.includes('syndicatedsearch')) return 'Google (paid)';
      if (hostname.includes('google')) return 'Google (organic)';
      if (hostname.includes('bing')) return 'Bing (organic)';
      if (hostname.includes('yahoo')) return 'Yahoo (organic)';
      if (hostname.includes('facebook') || hostname.includes('fb.com')) return 'Facebook';
      if (hostname.includes('linkedin')) return 'LinkedIn';
      if (hostname.includes('twitter') || hostname.includes('x.com')) return 'X/Twitter';
      return hostname;
    } catch { return 'Referral'; }
  }
  return 'Direct';
}

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
  website?: string; // Honeypot field
  _timestamp?: number;
  // Lead source tracking fields
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  landing_page?: string;
  current_page?: string;
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

// Expanded list of known disposable email domains (50+)
const disposableEmailDomains = [
  // Common disposable services
  'mailinator.com', 'tempmail.com', 'throwaway.email', 'guerrillamail.com',
  'sharklasers.com', 'temp-mail.org', '10minutemail.com', 'fakeinbox.com',
  'trashmail.com', 'mailnesia.com', 'tempinbox.com', 'dispostable.com',
  'yopmail.com', 'maildrop.cc', 'getairmail.com', 'mohmal.com',
  // Additional common disposable domains
  'guerrillamail.info', 'guerrillamail.biz', 'guerrillamail.de', 'guerrillamail.net',
  'spam4.me', 'grr.la', 'guerrillamail.org', 'spamgourmet.com', 'mytemp.email',
  'getnada.com', 'tempail.com', 'emailondeck.com', 'mailcatch.com', 'trbvm.com',
  'tempr.email', 'fakemail.net', 'throwawaymail.com', 'mintemail.com', 'spambox.us',
  'mailsac.com', 'burnermail.io', 'inboxkitten.com', 'mailforspam.com', 'tempmailaddress.com',
  'disposablemail.com', 'mailtemp.net', 'fakermail.com', 'emailfake.com', '33mail.com',
  'anonymbox.com', 'courrieltemporaire.com', 'spamfree24.org', 'incognitomail.org',
  'crazymailing.com', 'deadaddress.com', 'e4ward.com', 'jetable.org', 'kasmail.com',
  'mailexpire.com', 'mailmoat.com', 'mailnull.com', 'mailzilla.org', 'nomail.xl.cx',
  'sofimail.com', 'spamcero.com', 'spamherelots.com', 'trashymail.com', 'uggsrock.com',
  'wegwerfmail.de', 'wegwerfmail.net', 'wegwerfmail.org', 'zoemail.org', 'mailinator2.com'
];

function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  
  // Exact match check
  if (disposableEmailDomains.includes(domain)) return true;
  
  // Check for common disposable patterns in domain name
  const disposablePatterns = ['tempmail', 'throwaway', 'fakeinbox', 'trashmail', 'disposable', 'mailinator'];
  return disposablePatterns.some(pattern => domain.includes(pattern));
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
      ip: clientIP,
      utm_source: formData.utm_source,
      utm_medium: formData.utm_medium,
      referrer: formData.referrer
    });

    // Initialize Supabase client for rate limiting
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // === SPAM DETECTION ===
    let spamReason: string | null = null;

    // 1. Honeypot check - if filled, it's a bot (bots fill all fields)
    if (formData.website && formData.website.trim() !== '') {
      spamReason = 'Honeypot triggered';
    }

    // 2. Timestamp validation - reject if submitted too quickly (< 3 seconds)
    if (!spamReason && formData._timestamp) {
      const timeSpent = Date.now() - formData._timestamp;
      if (timeSpent < 3000) {
        spamReason = 'Submission too fast';
      }
    }

    // 3. Validate required fields
    if (!formData.name || !formData.company || !formData.email || !formData.phone) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Name validation
    if (!spamReason && !isValidName(formData.name)) {
      spamReason = 'Invalid name pattern';
    }

    // 5. Company validation
    if (!spamReason && !isValidCompany(formData.company)) {
      spamReason = 'Invalid company pattern';
    }

    // 6. Phone validation
    if (!spamReason && !isValidPhone(formData.phone)) {
      spamReason = 'Invalid phone pattern';
    }

    // 7. Disposable email check
    if (!spamReason && isDisposableEmail(formData.email)) {
      spamReason = 'Disposable email domain';
    }

    // 8. Rate limiting - check submissions in last hour
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

    // Log the submission for tracking with lead source data
    const { error: logError } = await supabase
      .from('contact_submissions')
      .insert({
        ip_address: clientIP,
        email: formData.email,
        is_spam: spamReason !== null,
        spam_reason: spamReason,
        // Lead source tracking
        utm_source: formData.utm_source || null,
        utm_medium: formData.utm_medium || null,
        utm_campaign: formData.utm_campaign || null,
        utm_term: formData.utm_term || null,
        utm_content: formData.utm_content || null,
        referrer: formData.referrer || null,
        landing_page: formData.landing_page || null,
        current_page: formData.current_page || null,
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
            
            <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #0369a1; margin: 0 0 10px 0; font-size: 14px;">📊 Lead Source Information</h3>
              <table style="font-size: 13px; color: #555;">
                <tr><td style="padding: 2px 10px 2px 0;"><strong>Source:</strong></td><td>${escapeHtml(inferSource(formData))}</td></tr>
                <tr><td style="padding: 2px 10px 2px 0;"><strong>Medium:</strong></td><td>${escapeHtml(formData.utm_medium || '-')}</td></tr>
                ${formData.utm_campaign ? `<tr><td style="padding: 2px 10px 2px 0;"><strong>Campaign:</strong></td><td>${escapeHtml(formData.utm_campaign)}</td></tr>` : ''}
                ${formData.utm_term ? `<tr><td style="padding: 2px 10px 2px 0;"><strong>Keyword:</strong></td><td>${escapeHtml(formData.utm_term)}</td></tr>` : ''}
                ${formData.referrer ? `<tr><td style="padding: 2px 10px 2px 0;"><strong>Referrer:</strong></td><td>${escapeHtml(formData.referrer)}</td></tr>` : ''}
                <tr><td style="padding: 2px 10px 2px 0;"><strong>Landing Page:</strong></td><td>${escapeHtml(formData.landing_page || '/')}</td></tr>
                <tr><td style="padding: 2px 10px 2px 0;"><strong>Form Page:</strong></td><td>${escapeHtml(formData.current_page || '/contact')}</td></tr>
              </table>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 12px;">
              <p>This email was sent from the CRUMS Leasing contact form on ${new Date().toLocaleString()}</p>
              <p>Submitter IP: ${clientIP}</p>
            </div>
          </div>
        `;

        // Recipients
        const recipients = [
          'eric@crumsleasing.com',
          'ambrosia@crumsleasing.com',
          'sales@crumsleasing.com',
          'lovedotmarketing@gmail.com',
          'adam@crumsleasing.com'
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
              // Sanitize email header values to prevent header injection
              // Remove newlines, carriage returns, and other control characters
              email: formData.email.replace(/[\r\n\t\x00-\x1f]/g, '').trim(),
              name: formData.name.replace(/[\r\n\t\x00-\x1f]/g, '').trim().substring(0, 100)
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
