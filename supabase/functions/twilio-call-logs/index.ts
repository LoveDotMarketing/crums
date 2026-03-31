import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface TwilioCall {
  sid: string;
  from: string;
  from_formatted: string;
  to: string;
  to_formatted: string;
  direction: string;
  status: string;
  duration: string;
  start_time: string;
  end_time: string;
  price: string | null;
  price_unit: string;
}

interface TwilioRecording {
  sid: string;
  call_sid: string;
  duration: string;
  status: string;
}

interface TwilioResponse {
  calls: TwilioCall[];
  next_page_uri: string | null;
  page: number;
  page_size: number;
}

interface TwilioRecordingsResponse {
  recordings: TwilioRecording[];
}

const BUSINESS_PHONE_NUMBER = '+18885704564';

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

function determineSource(utm_medium: string | null, utm_source: string | null, utm_campaign: string | null, landing_page: string | null, referrer: string | null): { source: string; campaign: string | null } {
  const medium = (utm_medium || '').toLowerCase();
  const source = (utm_source || '').toLowerCase();
  const lp = (landing_page || '').toLowerCase();

  if (medium === 'cpc' || medium === 'ppc' || medium === 'paid' || source === 'google_ads') {
    return { source: 'Paid', campaign: utm_campaign || null };
  }
  if (lp.startsWith('/lp/google')) {
    return { source: 'Paid', campaign: utm_campaign || 'Google Ads' };
  }
  if (lp.startsWith('/lp/facebook')) {
    return { source: 'Paid', campaign: utm_campaign || 'Facebook Ads' };
  }
  if (lp.startsWith('/lp/linkedin')) {
    return { source: 'Paid', campaign: utm_campaign || 'LinkedIn Ads' };
  }
  if (medium === 'organic' || source === 'google' || source === 'bing') {
    return { source: 'Organic', campaign: null };
  }
  if (medium === 'referral') {
    return { source: 'Referral', campaign: utm_campaign || null };
  }
  if (referrer) {
    const ref = referrer.toLowerCase();
    if (ref.includes('google.') || ref.includes('bing.') || ref.includes('yahoo.') || ref.includes('duckduckgo.')) {
      return { source: 'Organic', campaign: null };
    }
  }
  return { source: 'Direct', campaign: null };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Use service role for DB lookups (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const userId = claimsData.claims.sub;

    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      return new Response(JSON.stringify({ error: 'Twilio credentials not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const url = new URL(req.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const direction = url.searchParams.get('direction') || 'all';
    const limit = parseInt(url.searchParams.get('limit') || '50');

    const twilioUrl = new URL(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`);
    twilioUrl.searchParams.set('PageSize', Math.min(limit, 100).toString());
    
    if (startDate) twilioUrl.searchParams.set('StartTime>', startDate);
    if (endDate) twilioUrl.searchParams.set('StartTime<', endDate);

    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
    const twilioResponse = await fetch(twilioUrl.toString(), {
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' }
    });

    if (!twilioResponse.ok) {
      console.error('Twilio API error:', await twilioResponse.text());
      return new Response(JSON.stringify({ error: 'Failed to fetch call logs from Twilio' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data: TwilioResponse = await twilioResponse.json();
    const normalizedBusiness = normalizePhone(BUSINESS_PHONE_NUMBER);

    let calls = data.calls.filter(call => {
      return normalizePhone(call.from) === normalizedBusiness || normalizePhone(call.to) === normalizedBusiness;
    });

    if (direction !== 'all') {
      calls = calls.filter(call => {
        if (direction === 'inbound') return call.direction === 'inbound';
        if (direction === 'outbound') return call.direction.startsWith('outbound');
        return true;
      });
    }

    // Fetch recordings for completed calls
    const recordingsMap = new Map<string, TwilioRecording>();
    const completedCalls = calls.filter(c => c.status === 'completed');
    
    if (completedCalls.length > 0) {
      await Promise.all(completedCalls.map(async (call) => {
        try {
          const resp = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls/${call.sid}/Recordings.json`,
            { headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' } }
          );
          if (resp.ok) {
            const d: TwilioRecordingsResponse = await resp.json();
            if (d.recordings?.length > 0) recordingsMap.set(call.sid, d.recordings[0]);
          }
        } catch (error) {
          console.error(`Failed to fetch recordings for call ${call.sid}:`, error);
        }
      }));
    }

    // === Source attribution: match phone numbers against DB ===
    const callerPhones = new Set<string>();
    for (const call of calls) {
      const externalPhone = call.direction === 'inbound' ? call.from : call.to;
      callerPhones.add(normalizePhone(externalPhone));
    }

    // Build source map: normalized phone -> { source, campaign }
    const sourceMap = new Map<string, { source: string; campaign: string | null }>();

    if (callerPhones.size > 0) {
      // Query customers + their applications for UTM data
      const { data: customers } = await supabaseAdmin
        .from('customers')
        .select('id, phone, email')
        .not('phone', 'is', null);

      // Query applications with UTM data
      const { data: applications } = await supabaseAdmin
        .from('customer_applications')
        .select('phone_number, utm_source, utm_medium, utm_campaign, landing_page, referrer');

      // Query phone leads
      const { data: phoneLeads } = await supabaseAdmin
        .from('phone_leads')
        .select('phone, status, notes');

      // Index applications by normalized phone
      const appByPhone = new Map<string, typeof applications extends (infer T)[] ? T : never>();
      if (applications) {
        for (const app of applications) {
          if (app.phone_number) {
            appByPhone.set(normalizePhone(app.phone_number), app);
          }
        }
      }

      // Index customers by normalized phone
      const customerPhones = new Set<string>();
      if (customers) {
        for (const c of customers) {
          if (c.phone) customerPhones.add(normalizePhone(c.phone));
        }
      }

      // Index phone leads by normalized phone
      const leadByPhone = new Map<string, typeof phoneLeads extends (infer T)[] ? T : never>();
      if (phoneLeads) {
        for (const pl of phoneLeads) {
          if (pl.phone) leadByPhone.set(normalizePhone(pl.phone), pl);
        }
      }

      for (const phone of callerPhones) {
        // Check application first (has UTM data)
        const app = appByPhone.get(phone);
        if (app) {
          sourceMap.set(phone, determineSource(app.utm_medium, app.utm_source, app.utm_campaign, app.landing_page, app.referrer));
          continue;
        }

        // Check phone leads
        const lead = leadByPhone.get(phone);
        if (lead) {
          sourceMap.set(phone, { source: 'Phone Lead', campaign: null });
          continue;
        }

        // Known customer but no UTM data
        if (customerPhones.has(phone)) {
          sourceMap.set(phone, { source: 'Direct', campaign: null });
          continue;
        }

        // Unknown caller
        sourceMap.set(phone, { source: 'Unknown', campaign: null });
      }
    }

    // Format response
    const formattedCalls = calls.map(call => {
      const recording = recordingsMap.get(call.sid);
      const externalPhone = call.direction === 'inbound' ? call.from : call.to;
      const phoneSource = sourceMap.get(normalizePhone(externalPhone)) || { source: 'Unknown', campaign: null };

      return {
        sid: call.sid,
        from: call.from,
        fromFormatted: call.from_formatted,
        to: call.to,
        toFormatted: call.to_formatted,
        direction: call.direction.startsWith('outbound') ? 'outbound' : call.direction,
        status: call.status,
        duration: parseInt(call.duration) || 0,
        startTime: call.start_time,
        endTime: call.end_time,
        price: call.price ? parseFloat(call.price) : null,
        priceUnit: call.price_unit,
        recordingSid: recording?.sid || null,
        recordingDuration: recording ? parseInt(recording.duration) || 0 : null,
        source: phoneSource.source,
        campaign: phoneSource.campaign,
      };
    });

    const today = new Date().toISOString().split('T')[0];
    const todaysCalls = formattedCalls.filter(call => call.startTime?.startsWith(today));
    
    const stats = {
      total: formattedCalls.length,
      todayTotal: todaysCalls.length,
      inbound: formattedCalls.filter(c => c.direction === 'inbound').length,
      outbound: formattedCalls.filter(c => c.direction === 'outbound').length,
      completed: formattedCalls.filter(c => c.status === 'completed').length,
      missed: formattedCalls.filter(c => ['busy', 'no-answer', 'failed', 'canceled'].includes(c.status)).length,
      totalDuration: formattedCalls.reduce((sum, c) => sum + c.duration, 0),
    };

    return new Response(JSON.stringify({ calls: formattedCalls, stats }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
