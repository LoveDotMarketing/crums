import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

interface TwilioResponse {
  calls: TwilioCall[];
  next_page_uri: string | null;
  page: number;
  page_size: number;
}

// CRUMS Leasing business phone number - only show calls for this number
const BUSINESS_PHONE_NUMBER = '+18885704564';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate admin authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;

    // Check admin role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Twilio credentials
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      return new Response(
        JSON.stringify({ error: 'Twilio credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse query parameters
    const url = new URL(req.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const direction = url.searchParams.get('direction') || 'all';
    const limit = parseInt(url.searchParams.get('limit') || '50');

    // Build Twilio API URL with filters
    const twilioUrl = new URL(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`);
    twilioUrl.searchParams.set('PageSize', Math.min(limit, 100).toString());
    
    if (startDate) {
      twilioUrl.searchParams.set('StartTime>', startDate);
    }
    if (endDate) {
      twilioUrl.searchParams.set('StartTime<', endDate);
    }

    // Fetch from Twilio
    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
    const twilioResponse = await fetch(twilioUrl.toString(), {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    if (!twilioResponse.ok) {
      const errorText = await twilioResponse.text();
      console.error('Twilio API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch call logs from Twilio' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data: TwilioResponse = await twilioResponse.json();

    // Filter to only show calls involving the CRUMS business number
    let calls = data.calls.filter(call => {
      const normalizedFrom = call.from.replace(/\D/g, '');
      const normalizedTo = call.to.replace(/\D/g, '');
      const normalizedBusiness = BUSINESS_PHONE_NUMBER.replace(/\D/g, '');
      return normalizedFrom === normalizedBusiness || normalizedTo === normalizedBusiness;
    });

    // Filter by direction if specified
    if (direction !== 'all') {
      calls = calls.filter(call => {
        if (direction === 'inbound') {
          return call.direction === 'inbound';
        } else if (direction === 'outbound') {
          return call.direction.startsWith('outbound');
        }
        return true;
      });
    }

    // Format response
    const formattedCalls = calls.map(call => ({
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
      priceUnit: call.price_unit
    }));

    // Calculate stats
    const today = new Date().toISOString().split('T')[0];
    const todaysCalls = formattedCalls.filter(call => 
      call.startTime && call.startTime.startsWith(today)
    );
    
    const stats = {
      total: formattedCalls.length,
      todayTotal: todaysCalls.length,
      inbound: formattedCalls.filter(c => c.direction === 'inbound').length,
      outbound: formattedCalls.filter(c => c.direction === 'outbound').length,
      completed: formattedCalls.filter(c => c.status === 'completed').length,
      missed: formattedCalls.filter(c => ['busy', 'no-answer', 'failed', 'canceled'].includes(c.status)).length,
      totalDuration: formattedCalls.reduce((sum, c) => sum + c.duration, 0)
    };

    return new Response(
      JSON.stringify({ calls: formattedCalls, stats }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
