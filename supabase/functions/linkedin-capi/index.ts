import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConversionRequest {
  conversionType: 'quote_request' | 'signup' | 'application_submit';
  email?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  value?: number;
}

/**
 * SHA256 hash for PII (email) - required by LinkedIn CAPI
 */
async function sha256Hash(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversionType, email, firstName, lastName, company, value } = 
      await req.json() as ConversionRequest;

    console.log(`[LinkedIn CAPI] Processing ${conversionType} conversion`);

    const accessToken = Deno.env.get('LINKEDIN_CAPI_TOKEN');
    if (!accessToken) {
      console.warn('[LinkedIn CAPI] Token not configured, skipping');
      return new Response(JSON.stringify({ success: true, skipped: true, reason: 'token_not_configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Map conversion types to LinkedIn conversion rule IDs from secrets
    const conversionEnvKey = `LINKEDIN_CONVERSION_${conversionType.toUpperCase()}`;
    const conversionRuleId = Deno.env.get(conversionEnvKey);
    
    if (!conversionRuleId) {
      console.log(`[LinkedIn CAPI] No conversion rule ID for ${conversionType} (${conversionEnvKey}), skipping`);
      return new Response(JSON.stringify({ success: true, skipped: true, reason: 'no_rule_id' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build user identifiers (hashed for privacy compliance)
    const userIds: Array<{ idType: string; idValue: string }> = [];
    if (email) {
      userIds.push({
        idType: 'SHA256_EMAIL',
        idValue: await sha256Hash(email),
      });
    }

    // Build user info object (optional fields)
    const userInfo: Record<string, string> = {};
    if (firstName) userInfo.firstName = firstName;
    if (lastName) userInfo.lastName = lastName;
    if (company) userInfo.companyName = company;

    // Build conversion payload per LinkedIn CAPI spec
    const conversionPayload = {
      conversion: `urn:lla:llaPartnerConversion:${conversionRuleId}`,
      conversionHappenedAt: Date.now(),
      user: {
        userIds: userIds.length > 0 ? userIds : undefined,
        userInfo: Object.keys(userInfo).length > 0 ? userInfo : undefined,
      },
      eventId: crypto.randomUUID(),
      conversionValue: value ? {
        currencyCode: 'USD',
        amount: value.toString(),
      } : undefined,
    };

    console.log('[LinkedIn CAPI] Sending conversion payload:', JSON.stringify(conversionPayload, null, 2));

    // Send to LinkedIn Conversions API - payload at root level, NOT in elements array
    const response = await fetch(
      'https://api.linkedin.com/rest/conversionEvents',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'LinkedIn-Version': '202511',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify(conversionPayload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[LinkedIn CAPI] API error:', response.status, errorText);
      // Don't throw - we don't want to fail the user's action if CAPI fails
      return new Response(JSON.stringify({ 
        success: false, 
        error: `LinkedIn API returned ${response.status}`,
        details: errorText 
      }), {
        status: 200, // Still return 200 to frontend - this is non-critical
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // LinkedIn may return empty body on success (201/204)
    const responseText = await response.text();
    console.log('[LinkedIn CAPI] Success:', response.status, responseText || '(empty body)');

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[LinkedIn CAPI] Error:', error.message);
    // Return success to frontend even on error - CAPI tracking should never block user actions
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
