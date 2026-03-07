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
  sourceUrl?: string;
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
    const { eventName, eventId, email, phone, firstName, sourceUrl } =
      await req.json() as MetaCapiRequest;

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
      // Normalize phone: digits only, prepend country code if needed
      const digits = phone.replace(/\D/g, '');
      const normalized = digits.length === 10 ? `1${digits}` : digits;
      userData.ph = await sha256Hash(normalized);
    }
    if (firstName) userData.fn = await sha256Hash(firstName);

    const eventPayload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          event_source_url: sourceUrl || 'https://crumsleasing.com/lp/facebook',
          action_source: 'website',
          user_data: userData,
        },
      ],
    };

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
