import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Actions that require authentication vs public actions
const PUBLIC_ACTIONS = ["unsubscribe", "resubscribe"];
const AUTHENTICATED_ACTIONS = ["password_set", "profile_completed"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { action, email, customer_id } = await req.json();

    console.log(`[OutreachStatus] Action: ${action}, Email: ${email}, Customer ID: ${customer_id}`);

    // Validate action
    if (!action || ![...PUBLIC_ACTIONS, ...AUTHENTICATED_ACTIONS].includes(action)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For authenticated actions, verify the user is logged in
    if (AUTHENTICATED_ACTIONS.includes(action)) {
      const authHeader = req.headers.get("authorization");
      if (!authHeader) {
        console.log("[OutreachStatus] Auth required but no header for action:", action);
        return new Response(
          JSON.stringify({ error: "Authentication required" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        console.log("[OutreachStatus] Invalid token:", authError?.message);
        return new Response(
          JSON.stringify({ error: "Invalid authorization token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // For authenticated actions, verify the email matches the logged-in user
      // This prevents users from updating other users' statuses
      if (email && user.email !== email) {
        console.log("[OutreachStatus] Email mismatch:", user.email, "vs", email);
        return new Response(
          JSON.stringify({ error: "Email does not match authenticated user" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // For public actions (unsubscribe), require email to be provided
    if (PUBLIC_ACTIONS.includes(action) && !email && !customer_id) {
      return new Response(
        JSON.stringify({ success: false, error: "Email or customer_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find customer by email if no customer_id provided
    let targetCustomerId = customer_id;
    
    if (!targetCustomerId && email) {
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("email", email)
        .single();
      
      if (customer) {
        targetCustomerId = customer.id;
        console.log(`[OutreachStatus] Found customer by email: ${targetCustomerId}`);
      }
    }

    // If no customer found AND action is password_set, create a new customer record
    // This handles new website signups who aren't in the imported customers list
    if (!targetCustomerId && email && action === "password_set") {
      console.log(`[OutreachStatus] No customer found for ${email}, creating new customer record...`);
      
      // Look up profile to get name and phone
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, phone")
        .eq("email", email)
        .maybeSingle();
      
      // Generate unique account number
      const accountNumber = `ACC-${Date.now().toString(36).toUpperCase()}`;
      
      // Build full name from profile or use email prefix
      const fullName = profile 
        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || email.split('@')[0]
        : email.split('@')[0];
      
      // Create customer record
      const { data: newCustomer, error: createError } = await supabase
        .from("customers")
        .insert({
          email,
          full_name: fullName,
          account_number: accountNumber,
          phone: profile?.phone || null,
          status: "active",
        })
        .select()
        .single();
      
      if (createError) {
        console.error("[OutreachStatus] Failed to create customer:", createError);
      } else if (newCustomer) {
        targetCustomerId = newCustomer.id;
        console.log(`[OutreachStatus] Created new customer record for ${email}: ${targetCustomerId}`);
      }
    }

    if (!targetCustomerId) {
      console.log("[OutreachStatus] No matching customer found and could not create one");
      return new Response(
        JSON.stringify({ success: true, message: "No matching customer found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get or create outreach status record
    let { data: status } = await supabase
      .from("customer_outreach_status")
      .select("*")
      .eq("customer_id", targetCustomerId)
      .single();

    if (!status) {
      const { data: newStatus, error: insertError } = await supabase
        .from("customer_outreach_status")
        .insert({ customer_id: targetCustomerId })
        .select()
        .single();

      if (insertError) {
        console.error("[OutreachStatus] Failed to create status:", insertError);
        throw insertError;
      }
      status = newStatus;
    }

    const now = new Date().toISOString();
    let updateData: Record<string, string | boolean | null> = {};

    switch (action) {
      case "password_set":
        updateData = { password_set_at: now };
        console.log(`[OutreachStatus] Marking password set for customer ${targetCustomerId}`);
        break;
      case "profile_completed":
        updateData = { profile_completed_at: now };
        console.log(`[OutreachStatus] Marking profile completed for customer ${targetCustomerId}`);
        break;
      case "unsubscribe":
        updateData = { unsubscribed: true, unsubscribed_at: now };
        console.log(`[OutreachStatus] Marking unsubscribed for customer ${targetCustomerId}`);
        break;
      case "resubscribe":
        updateData = { unsubscribed: false, unsubscribed_at: null };
        console.log(`[OutreachStatus] Marking resubscribed for customer ${targetCustomerId}`);
        break;
    }

    const { error: updateError } = await supabase
      .from("customer_outreach_status")
      .update(updateData)
      .eq("customer_id", targetCustomerId);

    if (updateError) {
      console.error("[OutreachStatus] Update failed:", updateError);
      throw updateError;
    }

    console.log(`[OutreachStatus] Successfully updated status for customer ${targetCustomerId}`);

    return new Response(
      JSON.stringify({ success: true, customer_id: targetCustomerId, action }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[OutreachStatus] Error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
