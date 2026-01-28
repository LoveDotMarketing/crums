import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MODIFY-SUBSCRIPTION] ${step}${detailsStr}`);
};

interface ModifyRequest {
  subscriptionId: string;
  action: "add_trailers" | "remove_trailers" | "swap_trailer";
  addTrailerIds?: string[];
  removeTrailerIds?: string[];
  swapFromTrailerId?: string;
  swapToTrailerId?: string;
  customRates?: Record<string, number>;
}

// Get type-based default rental rate
const getDefaultRate = (trailerType: string): number => {
  const type = trailerType?.toLowerCase() || "";
  if (type.includes("flat") || type.includes("flatbed")) return 750;
  if (type.includes("refrigerated") || type.includes("reefer")) return 850;
  return 700; // Dry Van default
};

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

    const body: ModifyRequest = await req.json();
    const { subscriptionId, action, addTrailerIds, removeTrailerIds, swapFromTrailerId, swapToTrailerId, customRates } = body;
    logStep("Request received", { subscriptionId, action });

    // Fetch the subscription with active items only
    const { data: subscription, error: subError } = await supabaseClient
      .from("customer_subscriptions")
      .select("*, subscription_items(id, trailer_id, stripe_subscription_item_id, monthly_rate, status)")
      .eq("id", subscriptionId)
      .single();

    if (subError || !subscription) {
      throw new Error("Subscription not found");
    }
    
    if (!subscription.stripe_subscription_id) {
      throw new Error("Subscription has no Stripe subscription ID");
    }
    
    if (subscription.status !== "active") {
      throw new Error(`Cannot modify subscription with status: ${subscription.status}. Only active subscriptions can be modified.`);
    }

    // Filter to only active subscription items for operations
    const activeSubscriptionItems = subscription.subscription_items?.filter(
      (item: { status: string }) => item.status === 'active'
    ) || [];
    
    logStep("Found subscription", { 
      stripeId: subscription.stripe_subscription_id,
      customerId: subscription.customer_id,
      totalItemCount: subscription.subscription_items?.length,
      activeItemCount: activeSubscriptionItems.length
    });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get billing interval from existing subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
    const existingItem = stripeSubscription.items.data[0];
    const recurringInterval = existingItem?.price?.recurring;
    
    if (!recurringInterval) {
      throw new Error("Could not determine billing interval from existing subscription");
    }

    const billingInterval = {
      interval: recurringInterval.interval,
      interval_count: recurringInterval.interval_count
    };
    logStep("Got billing interval", billingInterval);

    let itemsToAdd: Stripe.SubscriptionUpdateParams.Item[] = [];
    let itemsToRemove: Stripe.SubscriptionUpdateParams.Item[] = [];
    let addedTrailers: { id: string; rate: number; trailer_number: string }[] = [];
    let removedTrailerIds: string[] = [];

    // Handle SWAP action
    if (action === "swap_trailer") {
      if (!swapFromTrailerId || !swapToTrailerId) {
        throw new Error("swap_trailer requires swapFromTrailerId and swapToTrailerId");
      }

      // Find the subscription item to remove (from active items only)
      const itemToRemove = activeSubscriptionItems.find(
        (i: { trailer_id: string }) => i.trailer_id === swapFromTrailerId
      );
      
      if (!itemToRemove) {
        const activeIds = activeSubscriptionItems.map((i: { trailer_id: string }) => i.trailer_id);
        throw new Error(`Could not find active subscription item to swap from. Trailer ID: ${swapFromTrailerId}. Active trailer IDs: ${activeIds.join(', ') || 'none'}`);
      }

      // If stripe_subscription_item_id is null, we need to find it from Stripe
      let stripeItemIdToRemove = itemToRemove.stripe_subscription_item_id;
      
      if (!stripeItemIdToRemove) {
        logStep("stripe_subscription_item_id is null, looking up from Stripe", { trailerId: swapFromTrailerId });
        
        // Retrieve the Stripe subscription with expanded products
        const stripeSubWithProducts = await stripe.subscriptions.retrieve(
          subscription.stripe_subscription_id,
          { expand: ['items.data.price.product'] }
        );
        
        // Find the Stripe item that matches this trailer
        for (const stripeItem of stripeSubWithProducts.items.data) {
          const product = stripeItem.price?.product;
          if (typeof product === 'object' && product !== null && 'metadata' in product) {
            const productMetadata = (product as Stripe.Product).metadata;
            if (productMetadata?.trailer_id === swapFromTrailerId) {
              stripeItemIdToRemove = stripeItem.id;
              
              // Also update the local database with the correct stripe_subscription_item_id
              await supabaseClient
                .from("subscription_items")
                .update({ stripe_subscription_item_id: stripeItem.id })
                .eq("id", itemToRemove.id);
                
              logStep("Found and updated stripe_subscription_item_id", { 
                stripeItemId: stripeItem.id,
                localItemId: itemToRemove.id 
              });
              break;
            }
          }
          
          // Also try matching by price name containing trailer number
          const priceName = stripeItem.price?.nickname;
          const productName = typeof product === 'object' && product !== null ? (product as Stripe.Product).name : null;
          
          if (productName) {
            // Look up the trailer number for this trailer ID
            const { data: trailerData } = await supabaseClient
              .from("trailers")
              .select("trailer_number")
              .eq("id", swapFromTrailerId)
              .single();
              
            if (trailerData && productName.includes(trailerData.trailer_number)) {
              stripeItemIdToRemove = stripeItem.id;
              
              await supabaseClient
                .from("subscription_items")
                .update({ stripe_subscription_item_id: stripeItem.id })
                .eq("id", itemToRemove.id);
                
              logStep("Found stripe item by product name match", { 
                stripeItemId: stripeItem.id,
                productName 
              });
              break;
            }
          }
        }
        
        if (!stripeItemIdToRemove) {
          // Log all Stripe items for debugging
          const stripeItemsDebug = stripeSubWithProducts.items.data.map((item: Stripe.SubscriptionItem) => ({
            id: item.id,
            productName: typeof item.price?.product === 'object' ? (item.price.product as Stripe.Product).name : item.price?.product,
            metadata: typeof item.price?.product === 'object' ? (item.price.product as Stripe.Product).metadata : null
          }));
          logStep("Could not match Stripe item", { stripeItems: stripeItemsDebug, swapFromTrailerId });
          throw new Error(`Could not find Stripe subscription item for trailer. The subscription may be out of sync.`);
        }
      }
      
      logStep("Found stripe_subscription_item_id for swap", { stripeItemId: stripeItemIdToRemove });

      // Get new trailer
      const { data: newTrailer, error: trailerErr } = await supabaseClient
        .from("trailers")
        .select("*")
        .eq("id", swapToTrailerId)
        .single();

      if (trailerErr || !newTrailer) {
        throw new Error("New trailer not found");
      }
      if (newTrailer.is_rented) {
        throw new Error(`Trailer ${newTrailer.trailer_number} is already rented`);
      }

      const rate = customRates?.[swapToTrailerId] ?? newTrailer.rental_rate ?? getDefaultRate(newTrailer.type);

      // Create price for new trailer
      const price = await stripe.prices.create({
        unit_amount: Math.round(rate * 100),
        currency: "usd",
        recurring: billingInterval as Stripe.PriceCreateParams.Recurring,
        product_data: {
          name: `Trailer ${newTrailer.trailer_number} Lease`,
          metadata: { trailer_id: newTrailer.id },
        },
      });

      itemsToRemove.push({ id: stripeItemIdToRemove, deleted: true });
      itemsToAdd.push({ price: price.id });
      removedTrailerIds.push(swapFromTrailerId);
      addedTrailers.push({ id: swapToTrailerId, rate, trailer_number: newTrailer.trailer_number });
      
      logStep("Prepared swap", { from: swapFromTrailerId, to: swapToTrailerId, rate });
    }

    // Handle ADD action
    if (action === "add_trailers" && addTrailerIds?.length) {
      // Fetch trailers
      const { data: trailers, error: trailerErr } = await supabaseClient
        .from("trailers")
        .select("*")
        .in("id", addTrailerIds);

      if (trailerErr || !trailers?.length) {
        throw new Error("Trailers not found");
      }

      // Check if any are already rented
      const rentedTrailers = trailers.filter(t => t.is_rented);
      if (rentedTrailers.length > 0) {
        throw new Error(`Trailer(s) ${rentedTrailers.map(t => t.trailer_number).join(", ")} are already rented`);
      }

      for (const trailer of trailers) {
        const rate = customRates?.[trailer.id] ?? trailer.rental_rate ?? getDefaultRate(trailer.type);

        const price = await stripe.prices.create({
          unit_amount: Math.round(rate * 100),
          currency: "usd",
          recurring: billingInterval as Stripe.PriceCreateParams.Recurring,
          product_data: {
            name: `Trailer ${trailer.trailer_number} Lease`,
            metadata: { trailer_id: trailer.id },
          },
        });

        itemsToAdd.push({ price: price.id });
        addedTrailers.push({ id: trailer.id, rate, trailer_number: trailer.trailer_number });
      }
      
      logStep("Prepared add", { count: addedTrailers.length });
    }

    // Handle REMOVE action
    if (action === "remove_trailers" && removeTrailerIds?.length) {
      // Get Stripe subscription with expanded products for item lookup if needed
      let stripeSubExpanded: Stripe.Subscription | null = null;
      
      for (const trailerId of removeTrailerIds) {
        // Use activeSubscriptionItems to find items to remove
        const itemToRemove = activeSubscriptionItems.find(
          (i: { trailer_id: string }) => i.trailer_id === trailerId
        );
        
        if (!itemToRemove) {
          logStep("Warning: Could not find active subscription item for trailer", { trailerId });
          continue;
        }
        
        let stripeItemId = itemToRemove.stripe_subscription_item_id;
        
        // If stripe_subscription_item_id is null, look it up from Stripe
        if (!stripeItemId) {
          if (!stripeSubExpanded) {
            stripeSubExpanded = await stripe.subscriptions.retrieve(
              subscription.stripe_subscription_id,
              { expand: ['items.data.price.product'] }
            );
          }
          
          // Look up the trailer number
          const { data: trailerData } = await supabaseClient
            .from("trailers")
            .select("trailer_number")
            .eq("id", trailerId)
            .single();
          
          for (const stripeItem of stripeSubExpanded.items.data) {
            const product = stripeItem.price?.product;
            if (typeof product === 'object' && product !== null && 'metadata' in product) {
              if ((product as Stripe.Product).metadata?.trailer_id === trailerId) {
                stripeItemId = stripeItem.id;
                break;
              }
            }
            // Also try matching by product name
            if (trailerData && typeof product === 'object' && product !== null) {
              if ((product as Stripe.Product).name?.includes(trailerData.trailer_number)) {
                stripeItemId = stripeItem.id;
                break;
              }
            }
          }
          
          if (!stripeItemId) {
            logStep("Warning: Could not find Stripe item for trailer", { trailerId });
            continue;
          }
        }

        itemsToRemove.push({ id: stripeItemId, deleted: true });
        removedTrailerIds.push(trailerId);
      }
      
      // Prevent removing all trailers - use active items count
      const remainingItems = activeSubscriptionItems.length - removedTrailerIds.length + addedTrailers.length;
      if (remainingItems < 1) {
        throw new Error("Cannot remove all trailers from subscription. Cancel the subscription instead.");
      }
      
      logStep("Prepared remove", { count: removedTrailerIds.length });
    }

    // Update Stripe subscription
    if (itemsToAdd.length > 0 || itemsToRemove.length > 0) {
      const updateParams: Stripe.SubscriptionUpdateParams = {
        items: [...itemsToRemove, ...itemsToAdd],
        proration_behavior: "create_prorations",
      };

      const updatedSubscription = await stripe.subscriptions.update(
        subscription.stripe_subscription_id,
        updateParams
      );
      logStep("Updated Stripe subscription", { 
        id: updatedSubscription.id,
        itemCount: updatedSubscription.items.data.length 
      });

      // Update local database - remove items
      if (removedTrailerIds.length > 0) {
        // Mark subscription items as ended
        await supabaseClient
          .from("subscription_items")
          .update({ 
            status: "ended", 
            end_date: new Date().toISOString() 
          })
          .eq("subscription_id", subscriptionId)
          .in("trailer_id", removedTrailerIds);

        // Release trailers
        await supabaseClient
          .from("trailers")
          .update({ 
            is_rented: false, 
            customer_id: null, 
            status: "available" 
          })
          .in("id", removedTrailerIds);

        logStep("Released trailers", { count: removedTrailerIds.length });
      }

      // Update local database - add items
      if (addedTrailers.length > 0) {
        // Retrieve the updated subscription with expanded products to properly match items
        const expandedSubscription = await stripe.subscriptions.retrieve(
          subscription.stripe_subscription_id,
          { expand: ['items.data.price.product'] }
        );
        const newStripeItems = expandedSubscription.items.data;
        
        for (const trailer of addedTrailers) {
          let matchedStripeItemId: string | null = null;
          
          // Find matching Stripe item by product metadata or name
          for (const stripeItem of newStripeItems) {
            const product = stripeItem.price?.product;
            if (typeof product === 'object' && product !== null) {
              const productObj = product as Stripe.Product;
              
              // Try matching by metadata first
              if (productObj.metadata?.trailer_id === trailer.id) {
                matchedStripeItemId = stripeItem.id;
                break;
              }
              
              // Try matching by product name containing trailer number
              if (productObj.name?.includes(trailer.trailer_number)) {
                matchedStripeItemId = stripeItem.id;
                break;
              }
            }
          }
          
          if (matchedStripeItemId) {
            logStep("Matched Stripe item for trailer", { 
              trailerId: trailer.id, 
              trailerNumber: trailer.trailer_number,
              stripeItemId: matchedStripeItemId 
            });
          } else {
            logStep("Warning: Could not match Stripe item for trailer", { 
              trailerId: trailer.id, 
              trailerNumber: trailer.trailer_number 
            });
          }

          await supabaseClient
            .from("subscription_items")
            .insert({
              subscription_id: subscriptionId,
              trailer_id: trailer.id,
              monthly_rate: trailer.rate,
              stripe_subscription_item_id: matchedStripeItemId,
              status: "active",
              start_date: new Date().toISOString(),
            });

          // Mark trailer as rented
          await supabaseClient
            .from("trailers")
            .update({ 
              is_rented: true, 
              customer_id: subscription.customer_id,
              status: "rented"
            })
            .eq("id", trailer.id);
        }

        logStep("Added trailers to subscription", { count: addedTrailers.length });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        action,
        subscriptionId,
        addedTrailers: addedTrailers.map(t => ({ id: t.id, trailer_number: t.trailer_number, rate: t.rate })),
        removedTrailerIds,
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
