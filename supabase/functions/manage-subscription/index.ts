import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MANAGE-SUBSCRIPTION] ${step}${detailsStr}`);
};

interface ManageRequest {
  subscriptionId: string;
  action: "pause" | "resume" | "cancel";
  releaseTrailers?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify admin auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);

    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) throw new Error("Admin access required");
    logStep("Admin verified", { adminId: userData.user.id });

    const body: ManageRequest = await req.json();
    const { subscriptionId, action, releaseTrailers = true } = body;
    logStep("Request received", { subscriptionId, action, releaseTrailers });

    // Fetch the subscription
    const { data: subscription, error: subError } = await supabaseClient
      .from("customer_subscriptions")
      .select("*, subscription_items(id, trailer_id)")
      .eq("id", subscriptionId)
      .single();

    if (subError || !subscription) {
      throw new Error("Subscription not found");
    }
    logStep("Found subscription", { stripeId: subscription.stripe_subscription_id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    let newStatus: string;
    let stripeAction: string;

    // Handle Stripe subscription if it exists
    if (subscription.stripe_subscription_id) {
      try {
        if (action === "cancel") {
          await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
          stripeAction = "cancelled";
          logStep("Cancelled Stripe subscription");
        } else if (action === "pause") {
          await stripe.subscriptions.update(subscription.stripe_subscription_id, {
            pause_collection: { behavior: "void" }
          });
          stripeAction = "paused";
          logStep("Paused Stripe subscription");
        } else if (action === "resume") {
          await stripe.subscriptions.update(subscription.stripe_subscription_id, {
            pause_collection: null as unknown as Stripe.SubscriptionUpdateParams.PauseCollection
          });
          stripeAction = "resumed";
          logStep("Resumed Stripe subscription");
        }
      } catch (stripeError) {
        logStep("Stripe action failed, continuing with local update", { 
          error: stripeError instanceof Error ? stripeError.message : String(stripeError) 
        });
      }
    }

    // Map action to local status
    if (action === "cancel") {
      newStatus = "cancelled";
    } else if (action === "pause") {
      newStatus = "paused";
    } else {
      newStatus = "active";
    }

    // Update local subscription status
    const { error: updateError } = await supabaseClient
      .from("customer_subscriptions")
      .update({ status: newStatus })
      .eq("id", subscriptionId);

    if (updateError) throw new Error(`Failed to update subscription: ${updateError.message}`);
    logStep("Updated subscription status", { newStatus });

    // Release trailers if cancelling or pausing with release flag
    if ((action === "cancel" || (action === "pause" && releaseTrailers)) && subscription.subscription_items) {
      const trailerIds = subscription.subscription_items.map((item: { trailer_id: string }) => item.trailer_id);
      
      if (trailerIds.length > 0) {
        // Update subscription items to ended
        const endStatus = action === "cancel" ? "cancelled" : "paused";
        await supabaseClient
          .from("subscription_items")
          .update({ 
            status: endStatus,
            end_date: new Date().toISOString()
          })
          .eq("subscription_id", subscriptionId);

        // Release trailers back to inventory
        const { error: trailerError } = await supabaseClient
          .from("trailers")
          .update({ 
            is_rented: false,
            customer_id: null,
            status: "available"
          })
          .in("id", trailerIds);

        if (trailerError) {
          logStep("Warning: Failed to release some trailers", { error: trailerError.message });
        } else {
          logStep("Released trailers back to inventory", { count: trailerIds.length, trailerIds });
        }
      }
    }

    // If resuming, reactivate subscription items
    if (action === "resume") {
      await supabaseClient
        .from("subscription_items")
        .update({ status: "active", end_date: null })
        .eq("subscription_id", subscriptionId)
        .eq("status", "paused");
      
      logStep("Reactivated subscription items");
    }

    return new Response(
      JSON.stringify({
        success: true,
        action,
        subscriptionId,
        newStatus,
        trailersReleased: action === "cancel" || (action === "pause" && releaseTrailers)
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
