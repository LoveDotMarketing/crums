import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    if (!targetCustomerId) {
      console.log("[OutreachStatus] No matching customer found");
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
    let updateData: Record<string, string> = {};

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
        updateData = { unsubscribed: "true", unsubscribed_at: now };
        console.log(`[OutreachStatus] Marking unsubscribed for customer ${targetCustomerId}`);
        break;
      case "resubscribe":
        updateData = { unsubscribed: "false", unsubscribed_at: null as any };
        console.log(`[OutreachStatus] Marking resubscribed for customer ${targetCustomerId}`);
        break;
      default:
        return new Response(
          JSON.stringify({ success: false, error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
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
