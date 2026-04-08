import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // User client for auth verification
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Admin client for privileged operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify caller's JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      console.error("Failed to verify JWT:", claimsError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const callerId = claimsData.claims.sub;
    console.log("Caller ID:", callerId);

    // Verify caller is an admin
    const { data: callerRole, error: roleError } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId)
      .eq("role", "admin")
      .single();

    if (roleError || !callerRole) {
      console.error("Caller is not an admin:", roleError);
      return new Response(
        JSON.stringify({ error: "Only administrators can change staff roles" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { userId, role } = await req.json();

    if (!userId || !role) {
      return new Response(
        JSON.stringify({ error: "User ID and role are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate role
    if (!["admin", "mechanic", "sales"].includes(role)) {
      return new Response(
        JSON.stringify({ error: "Invalid role. Must be 'admin', 'mechanic', or 'sales'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Attempting to update role for user:", userId, "to:", role);

    // Prevent changing own role (safety)
    if (userId === callerId) {
      console.error("Admin attempted to change their own role");
      return new Response(
        JSON.stringify({ error: "You cannot change your own role" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check that target user exists and has a staff role
    const { data: targetRole, error: targetRoleError } = await adminClient
      .from("user_roles")
      .select("id, role")
      .eq("user_id", userId)
      .in("role", ["admin", "mechanic", "sales"])
      .single();

    if (targetRoleError || !targetRole) {
      console.error("Target user not found or not a staff member:", targetRoleError);
      return new Response(
        JSON.stringify({ error: "Staff member not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if role is already the same
    if (targetRole.role === role) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Staff member already has the ${role} role` 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update the user's role
    const { error: updateError } = await adminClient
      .from("user_roles")
      .update({ role })
      .eq("id", targetRole.id);

    if (updateError) {
      console.error("Failed to update user role:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update staff role" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Successfully updated role for user:", userId, "to:", role);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Staff role updated to ${role}` 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
