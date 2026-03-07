import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const PIXEL_ID = '1555487965511323';

interface MetaCapiRequest {
  eventName: string;
  eventId: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  sourceUrl?: string;
  clientUserAgent?: string;
  fbc?: string;
  fbp?: string;
  customData?: Record<string, string | number>;
}

async function sha256Hash(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json() as MetaCapiRequest;
    const { eventName, eventId, email, phone, firstName, lastName, city, state, zipCode, sourceUrl, clientUserAgent, fbc, fbp, customData } = body;

    console.log(`[Meta CAPI] Processing ${eventName} event, id=${eventId}`);

    const accessToken = Deno.env.get('META_CAPI_TOKEN');
    if (!accessToken) {
      console.warn('[Meta CAPI] Token not configured, skipping');
      return new Response(JSON.stringify({ success: true, skipped: true, reason: 'token_not_configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build user_data with SHA256-hashed PII per Meta requirements
    const userData: Record<string, string> = {};
    if (email) userData.em = await sha256Hash(email);
    if (phone) {
      const digits = phone.replace(/\D/g, '');
      const normalized = digits.length === 10 ? `1${digits}` : digits;
      userData.ph = await sha256Hash(normalized);
    }
    if (firstName) userData.fn = await sha256Hash(firstName);
    if (lastName) userData.ln = await sha256Hash(lastName);
    if (city) userData.ct = await sha256Hash(city);
    if (state) userData.st = await sha256Hash(state);
    if (zipCode) userData.zp = await sha256Hash(zipCode);

    // Unhashed fields per Meta spec
    if (clientUserAgent) userData.client_user_agent = clientUserAgent;
    if (fbc) userData.fbc = fbc;
    if (fbp) userData.fbp = fbp;

    // Client IP from request headers
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('cf-connecting-ip')
      || req.headers.get('x-real-ip');
    if (clientIp) userData.client_ip_address = clientIp;

    const eventData: Record<string, unknown> = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: sourceUrl || 'https://crumsleasing.com',
      action_source: 'website',
      user_data: userData,
    };

    // Add custom_data for events like Purchase
    if (customData && Object.keys(customData).length > 0) {
      eventData.custom_data = customData;
    }

    const eventPayload = { data: [eventData] };

    console.log('[Meta CAPI] Sending payload:', JSON.stringify(eventPayload));

    const response = await fetch(
      `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventPayload),
      }
    );

    const responseData = await response.text();

    if (!response.ok) {
      console.error('[Meta CAPI] API error:', response.status, responseData);
      return new Response(JSON.stringify({ success: false, error: `Meta API returned ${response.status}` }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[Meta CAPI] Success:', responseData);
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[Meta CAPI] Error:', error.message);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
