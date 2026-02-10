import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-ACH-SETUP-EMAIL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const sendgridKey = Deno.env.get("SENDGRID_API_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!sendgridKey) throw new Error("SENDGRID_API_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify admin authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const adminUser = userData.user;
    if (!adminUser) throw new Error("User not authenticated");

    // Check if user is admin
    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", adminUser.id)
      .single();

    if (roleData?.role !== "admin") {
      throw new Error("Only admins can send ACH setup emails");
    }
    logStep("Admin authenticated", { adminId: adminUser.id });

    // Get request body
    const { applicationId, testMode } = await req.json();

    // Test mode: send email to admin's own email
    if (testMode) {
      logStep("Test mode enabled, sending to admin email");
      
      // Get admin's email from their profile
      const { data: adminProfile, error: adminProfileError } = await supabaseClient
        .from("profiles")
        .select("email, first_name")
        .eq("id", adminUser.id)
        .single();

      if (adminProfileError || !adminProfile?.email) {
        throw new Error("Could not find admin profile");
      }

      const setupUrl = "https://crums.lovable.app/dashboard/customer/payment-setup";

      // Send test email via SendGrid
      const emailResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sendgridKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: adminProfile.email }],
          }],
          from: {
            email: "support@crumsleasing.com",
            name: "CRUMS Leasing",
          },
          subject: "[TEST] Action Required: Complete Your CRUMS Payment Setup",
          content: [{
            type: "text/html",
            value: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #f59e0b; padding: 10px; text-align: center;">
                  <p style="color: #000; margin: 0; font-weight: bold;">⚠️ TEST EMAIL - This is a preview of the ACH setup email</p>
                </div>
                
                <div style="background-color: #1a1a2e; padding: 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0;">CRUMS Leasing</h1>
                </div>
                
                <div style="padding: 30px; background-color: #ffffff;">
                  <h2 style="color: #1a1a2e;">Hi ${adminProfile.first_name || 'Valued Customer'},</h2>
                  
                  <p style="color: #333; line-height: 1.6;">
                    Great news! Your lease application has been approved. To finalize your account and enable billing, 
                    please complete your payment setup by securely linking your bank account.
                  </p>
                  
                  <p style="color: #333; line-height: 1.6;">
                    Log in to your CRUMS account and follow the simple steps to connect your bank. Your financial 
                    information is fully protected through our secure verification process. This only takes a few minutes.
                  </p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${setupUrl}" 
                       style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; 
                              text-decoration: none; border-radius: 6px; font-weight: bold;
                              display: inline-block;">
                      Log In to Complete Setup
                    </a>
                  </div>
                  
                  <p style="color: #666; font-size: 14px; line-height: 1.6;">
                    If you have any questions about the payment setup process, please don't hesitate to contact us.
                  </p>
                  
                  <p style="color: #333; margin-top: 30px;">
                    Thank you for choosing CRUMS Leasing!<br>
                    <strong>The CRUMS Team</strong>
                  </p>
                </div>
                
                <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
                  <p>CRUMS Leasing | Trailer Leasing Solutions</p>
                  <p>This email was sent because your application was approved.</p>
                </div>
              </div>
            `,
          }],
        }),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        logStep("SendGrid error", { status: emailResponse.status, error: errorText });
        throw new Error("Failed to send test email");
      }

      logStep("Test email sent successfully", { to: adminProfile.email });

      return new Response(
        JSON.stringify({
          success: true,
          message: `Test ACH setup email sent to ${adminProfile.email}`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Normal mode: require applicationId
    if (!applicationId) throw new Error("applicationId is required");

    // Get the application details
    const { data: application, error: appError } = await supabaseClient
      .from("customer_applications")
      .select(`
        id,
        user_id,
        status,
        payment_setup_status,
        stripe_customer_id
      `)
      .eq("id", applicationId)
      .single();

    if (appError || !application) {
      throw new Error("Application not found");
    }

    if (application.status !== "approved") {
      throw new Error("Application must be approved before sending ACH setup email");
    }

    if (application.payment_setup_status === "completed") {
      throw new Error("Payment setup is already completed");
    }

    // Get user profile for email
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("id", application.user_id)
      .single();

    if (profileError || !profile?.email) {
      throw new Error("Could not find user profile or email");
    }
    logStep("Found user profile", { email: profile.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Find or create Stripe customer
    let customerId = application.stripe_customer_id;
    
    if (!customerId) {
      const customers = await stripe.customers.list({ email: profile.email, limit: 1 });
      
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: profile.email,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || undefined,
          metadata: {
            supabase_user_id: application.user_id,
          },
        });
        customerId = customer.id;
      }

      // Save customer ID
      await supabaseClient
        .from("customer_applications")
        .update({ stripe_customer_id: customerId })
        .eq("id", application.id);
      logStep("Stripe customer ready", { customerId });
    }

    // Generate the payment setup URL - always use production domain
    const setupUrl = "https://crums.lovable.app/dashboard/customer/payment-setup";

    // Send email via SendGrid
    const emailResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendgridKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: profile.email }],
        }],
        from: {
          email: "support@crumsleasing.com",
          name: "CRUMS Leasing",
        },
        subject: "Action Required: Complete Your CRUMS Payment Setup",
        content: [{
          type: "text/html",
          value: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #1a1a2e; padding: 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0;">CRUMS Leasing</h1>
              </div>
              
              <div style="padding: 30px; background-color: #ffffff;">
                <h2 style="color: #1a1a2e;">Hi ${profile.first_name || 'Valued Customer'},</h2>
                
                <p style="color: #333; line-height: 1.6;">
                  Great news! Your lease application has been approved. To finalize your account and enable billing, 
                  please complete your payment setup by securely linking your bank account.
                </p>
                
                <p style="color: #333; line-height: 1.6;">
                  Log in to your CRUMS account and follow the simple steps to connect your bank. Your financial 
                  information is fully protected through our secure verification process. This only takes a few minutes.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${setupUrl}" 
                     style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; 
                            text-decoration: none; border-radius: 6px; font-weight: bold;
                            display: inline-block;">
                    Log In to Complete Setup
                  </a>
                </div>
                
                <p style="color: #666; font-size: 14px; line-height: 1.6;">
                  If you have any questions about the payment setup process, please don't hesitate to contact us.
                </p>
                
                <p style="color: #333; margin-top: 30px;">
                  Thank you for choosing CRUMS Leasing!<br>
                  <strong>The CRUMS Team</strong>
                </p>
              </div>
              
              <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
                <p>CRUMS Leasing | Trailer Leasing Solutions</p>
                <p>This email was sent because your application was approved.</p>
              </div>
            </div>
          `,
        }],
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      logStep("SendGrid error", { status: emailResponse.status, error: errorText });
      throw new Error("Failed to send email");
    }

    // Update application status
    await supabaseClient
      .from("customer_applications")
      .update({
        payment_setup_status: "sent",
        payment_setup_sent_at: new Date().toISOString(),
      })
      .eq("id", application.id);

    logStep("Email sent successfully", { to: profile.email });

    return new Response(
      JSON.stringify({
        success: true,
        message: `ACH setup email sent to ${profile.email}`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
