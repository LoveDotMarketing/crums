import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  email: string;
  role: "admin" | "mechanic";
  firstName?: string;
  lastName?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Create regular client to verify caller is admin
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get the JWT from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user is authenticated
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error("[invite-staff] Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if the caller is an admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (roleError || !roleData) {
      console.error("[invite-staff] Role check failed:", roleError);
      return new Response(
        JSON.stringify({ error: "Only administrators can invite staff" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { email, role, firstName, lastName }: InviteRequest = await req.json();

    // Validate input
    if (!email || !role) {
      return new Response(
        JSON.stringify({ error: "Email and role are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["admin", "mechanic"].includes(role)) {
      return new Response(
        JSON.stringify({ error: "Invalid role. Must be 'admin' or 'mechanic'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[invite-staff] Admin ${user.email} inviting ${email} as ${role}`);

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email.toLowerCase());

    let userId: string;

    if (existingUser) {
      // User exists - just update their role
      userId = existingUser.id;
      console.log(`[invite-staff] User ${email} already exists, updating role`);

      // Check if they already have this role
      const { data: existingRole } = await supabaseAdmin
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .eq("role", role)
        .single();

      if (existingRole) {
        // Send password reset email anyway
        const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
          type: "recovery",
          email: email.toLowerCase(),
        });

        if (resetError) {
          console.error("[invite-staff] Password reset error:", resetError);
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `User already has ${role} role. Password reset email sent.`,
            userId 
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      // Create new user with a random password (they'll reset it)
      const tempPassword = crypto.randomUUID() + "Aa1!";
      
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase(),
        password: tempPassword,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          first_name: firstName || "",
          last_name: lastName || "",
        },
      });

      if (createError) {
        console.error("[invite-staff] Create user error:", createError);
        return new Response(
          JSON.stringify({ error: `Failed to create user: ${createError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      userId = newUser.user.id;
      console.log(`[invite-staff] Created new user ${email} with id ${userId}`);
    }

    // Assign role to user
    const { error: roleInsertError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role });

    if (roleInsertError) {
      console.error("[invite-staff] Role insert error:", roleInsertError);
      // Don't fail - user was created, just role assignment failed
    }

    // Generate password reset link - this triggers the email hook automatically
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: email.toLowerCase(),
      options: {
        redirectTo: `${req.headers.get("origin") || "https://crumsleasing.com"}/reset-password`,
      },
    });

    if (linkError) {
      console.error("[invite-staff] Generate link error:", linkError);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `User created with ${role} role but password reset email could not be sent. They can use 'Forgot Password' to set their password.`,
          userId 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Email is sent automatically via the email hook - no need for resetPasswordForEmail
    console.log(`[invite-staff] Recovery email sent via hook to ${email}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${existingUser ? "Existing user updated" : "New user created"} with ${role} role. Password reset email sent to ${email}.`,
        userId 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[invite-staff] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
