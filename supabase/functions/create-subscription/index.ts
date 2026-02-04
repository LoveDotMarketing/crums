import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Helper function to calculate next anchor date for billing cycle
function calculateNextAnchorDate(anchorDay: number | null): number | undefined {
  if (!anchorDay || (anchorDay !== 1 && anchorDay !== 15)) return undefined;
  
  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth(), anchorDay);
  
  // If the target day has passed this month, use next month
  if (targetDate <= now) {
    targetDate.setMonth(targetDate.getMonth() + 1);
  }
  
  return Math.floor(targetDate.getTime() / 1000);
}

interface SubscriptionRequest {
  customerId: string; // Our internal customer ID
  trailerIds: string[];
  billingCycle: "weekly" | "biweekly" | "monthly" | "semimonthly";
  depositAmount?: number;
  discountId?: string;
  customRates?: Record<string, number>; // trailerId -> custom rate override
  leaseToOwnFlags?: Record<string, boolean>; // trailerId -> lease to own flag
  endDate?: string; // Optional end date for fixed-term leases (YYYY-MM-DD)
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
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);

    // Check admin role
    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) throw new Error("Admin access required");
    logStep("Admin verified", { adminId: userData.user.id });

    const body: SubscriptionRequest = await req.json();
    const { customerId, trailerIds, billingCycle, depositAmount, discountId, customRates, leaseToOwnFlags, endDate } = body;

    if (!customerId || !trailerIds?.length || !billingCycle) {
      throw new Error("Missing required fields: customerId, trailerIds, billingCycle");
    }

    // Check for existing subscription for this customer (any status)
    const { data: existingSubscription } = await supabaseClient
      .from("customer_subscriptions")
      .select("id, status, stripe_subscription_id")
      .eq("customer_id", customerId)
      .maybeSingle();

    // If there's an active/pending/paused subscription, block creation
    if (existingSubscription && ["active", "pending", "paused"].includes(existingSubscription.status)) {
      logStep("Customer already has active subscription", { 
        existingId: existingSubscription.id, 
        status: existingSubscription.status 
      });
      throw new Error(`Customer already has an ${existingSubscription.status} subscription (ID: ${existingSubscription.id}). Please cancel or manage the existing subscription first.`);
    }
    
    // If there's a canceled subscription, we'll reuse that row
    const reuseExistingRow = existingSubscription && existingSubscription.status === "canceled";
    if (reuseExistingRow) {
      logStep("Found canceled subscription, will reuse row", { existingId: existingSubscription.id });
    } else {
      logStep("No existing subscription found, will create new row");
    }

    // Check if any of the requested trailers are already rented
    const { data: rentedTrailers } = await supabaseClient
      .from("trailers")
      .select("id, trailer_number, is_rented, customer_id")
      .in("id", trailerIds)
      .eq("is_rented", true);

    if (rentedTrailers && rentedTrailers.length > 0) {
      const rentedNumbers = rentedTrailers.map(t => t.trailer_number).join(", ");
      logStep("Some trailers are already rented", { rentedTrailers });
      throw new Error(`Trailer(s) ${rentedNumbers} are already rented. Please select available trailers.`);
    }
    logStep("All requested trailers are available");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get customer details
    const { data: customer, error: custError } = await supabaseClient
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();

    if (custError || !customer) throw new Error("Customer not found");
    logStep("Customer found", { customerId, email: customer.email });

    // Get customer's application to fetch billing anchor preference
    const { data: customerApplication } = await supabaseClient
      .from("customer_applications")
      .select("billing_anchor_day, user_id")
      .eq("user_id", (
        // First we need to find the user_id from profile matching customer email
        await supabaseClient
          .from("profiles")
          .select("id")
          .eq("email", customer.email)
          .maybeSingle()
      ).data?.id || "")
      .maybeSingle();
    
    logStep("Customer billing preference", { 
      anchorDay: customerApplication?.billing_anchor_day 
    });

    // Get trailers with rental rates
    const { data: trailers, error: trailerError } = await supabaseClient
      .from("trailers")
      .select("*")
      .in("id", trailerIds);

    if (trailerError || !trailers?.length) throw new Error("Trailers not found");
    logStep("Trailers found", { count: trailers.length });

    // Find or create Stripe customer
    let stripeCustomerId: string;
    const customers = await stripe.customers.list({ email: customer.email, limit: 1 });

    if (customers.data.length > 0) {
      stripeCustomerId = customers.data[0].id;
      logStep("Found existing Stripe customer", { stripeCustomerId });
    } else {
      const newCustomer = await stripe.customers.create({
        email: customer.email,
        name: customer.full_name,
        phone: customer.phone || undefined,
        metadata: { internal_customer_id: customerId },
      });
      stripeCustomerId = newCustomer.id;
      logStep("Created new Stripe customer", { stripeCustomerId });
    }

    // Calculate billing interval for recurring charges after initial payment
    // Note: semimonthly (twice monthly) uses biweekly as Stripe approximation
    const intervalMap = {
      weekly: { interval: "week" as const, interval_count: 1 },
      biweekly: { interval: "week" as const, interval_count: 2 },
      semimonthly: { interval: "week" as const, interval_count: 2 }, // ~twice monthly
      monthly: { interval: "month" as const, interval_count: 1 },
    };
    const billingInterval = intervalMap[billingCycle];

    // Get discount if provided
    let coupon: Stripe.Coupon | null = null;
    if (discountId) {
      const { data: discount } = await supabaseClient
        .from("discounts")
        .select("*")
        .eq("id", discountId)
        .eq("is_active", true)
        .single();

      if (discount) {
        // Create or find Stripe coupon
        const couponParams: Stripe.CouponCreateParams = {
          duration: "forever",
          metadata: { internal_discount_id: discountId },
        };

        if (discount.type === "percentage") {
          couponParams.percent_off = discount.value;
        } else {
          couponParams.amount_off = Math.round(discount.value * 100);
          couponParams.currency = "usd";
        }

        coupon = await stripe.coupons.create(couponParams);
        logStep("Created Stripe coupon", { couponId: coupon.id });
      }
    }

    // Get type-based default rental rate
    const getDefaultRate = (trailerType: string): number => {
      const type = trailerType?.toLowerCase() || "";
      if (type.includes("flat") || type.includes("flatbed")) {
        return 750;
      }
      if (type.includes("refrigerated") || type.includes("reefer")) {
        return 850;
      }
      // Dry Van default
      return 700;
    };

    // Create subscription items (prices) for each trailer
    const subscriptionItems: Stripe.SubscriptionCreateParams.Item[] = [];

    for (const trailer of trailers) {
      // Use custom rate if provided, otherwise fall back to trailer's rate or type-based default
      const rate = customRates?.[trailer.id] ?? trailer.rental_rate ?? getDefaultRate(trailer.type);

      // Create a price for this trailer
      const price = await stripe.prices.create({
        unit_amount: Math.round(rate * 100),
        currency: "usd",
        recurring: billingInterval,
        product_data: {
          name: `Trailer ${trailer.trailer_number} Lease`,
          metadata: { trailer_id: trailer.id },
        },
      });

      subscriptionItems.push({ price: price.id });
      logStep("Created price for trailer", { trailerId: trailer.id, priceId: price.id, rate, isCustomRate: !!customRates?.[trailer.id] });
    }

    // Create one-time deposit price if deposit amount is provided
    let depositInvoiceItem: Stripe.SubscriptionCreateParams.AddInvoiceItem | null = null;
    if (depositAmount && depositAmount > 0) {
      // Create a one-time price for the security deposit
      const depositPrice = await stripe.prices.create({
        unit_amount: Math.round(depositAmount * 100),
        currency: "usd",
        product_data: {
          name: "Security Deposit",
          metadata: { 
            type: "security_deposit",
            internal_customer_id: customerId,
          },
        },
      });
      
      depositInvoiceItem = { price: depositPrice.id };
      logStep("Created deposit price", { depositAmount, priceId: depositPrice.id });
    }

    // NEW BILLING FLOW: Charge deposit + first period's rent IMMEDIATELY
    // No trial period, no delayed anchor - customer pays upfront
    // Subsequent recurring charges happen based on billing cycle

    // Create the subscription - charges deposit + first period immediately
    const subscriptionParams: Stripe.SubscriptionCreateParams = {
      customer: stripeCustomerId,
      items: subscriptionItems,
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      metadata: { 
        internal_customer_id: customerId,
        deposit_amount: depositAmount?.toString() || "0",
        billing_cycle: billingCycle,
      },
    };

    // Add deposit as one-time invoice item on the first invoice (charged with first period rent)
    if (depositInvoiceItem) {
      subscriptionParams.add_invoice_items = [depositInvoiceItem];
      logStep("Adding deposit to first invoice", { depositAmount });
    }

    if (coupon) {
      subscriptionParams.discounts = [{ coupon: coupon.id }];
    }

    const subscription = await stripe.subscriptions.create(subscriptionParams);
    
    // Calculate what was charged on first invoice
    const firstPeriodRent = trailers.reduce((sum, trailer) => {
      const rate = customRates?.[trailer.id] ?? trailer.rental_rate ?? getDefaultRate(trailer.type);
      return sum + rate;
    }, 0);
    
    logStep("Created Stripe subscription with upfront charges", { 
      subscriptionId: subscription.id,
      hasDeposit: !!depositInvoiceItem,
      depositAmount: depositAmount || 0,
      firstPeriodRent,
      totalFirstInvoice: (depositAmount || 0) + firstPeriodRent,
      nextRecurringCharge: billingCycle
    });

    // Create customer_subscription record
    // Handle next_billing_date - subscription.current_period_end may be null for incomplete subscriptions
    let nextBillingDate: string | null = null;
    if (subscription.current_period_end) {
      nextBillingDate = new Date(subscription.current_period_end * 1000).toISOString();
    }
    logStep("Calculated next billing date", { periodEnd: subscription.current_period_end, nextBillingDate });

    // Map Stripe status to our allowed values: pending, active, paused, canceled
    // CRITICAL: Use "canceled" (single L) to match database constraint
    const statusMap: Record<string, string> = {
      incomplete: "pending",
      incomplete_expired: "canceled",
      trialing: "active",
      active: "active",
      past_due: "active", // Still active but needs attention
      canceled: "canceled",
      unpaid: "paused",
      paused: "paused",
    };
    const mappedStatus = statusMap[subscription.status] ?? "pending";
    logStep("Mapping subscription status", { stripeStatus: subscription.status, mappedStatus });

    // Create or update customer_subscription record
    let custSub;
    let subError;
    
    if (reuseExistingRow && existingSubscription) {
      // Update the existing canceled subscription row
      const { data, error } = await supabaseClient
        .from("customer_subscriptions")
        .update({
          stripe_subscription_id: subscription.id,
          stripe_customer_id: stripeCustomerId,
          billing_cycle: billingCycle,
          deposit_amount: depositAmount || null,
          deposit_paid: false,
          status: mappedStatus,
          next_billing_date: nextBillingDate,
          end_date: endDate || null,
        })
        .eq("id", existingSubscription.id)
        .select()
        .single();
      custSub = data;
      subError = error;
      logStep("Updated existing subscription record", { id: custSub?.id, endDate });
    } else {
      // Insert a new subscription row
      const { data, error } = await supabaseClient
        .from("customer_subscriptions")
        .insert({
          customer_id: customerId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: stripeCustomerId,
          billing_cycle: billingCycle,
          deposit_amount: depositAmount || null,
          deposit_paid: false,
          status: mappedStatus,
          next_billing_date: nextBillingDate,
          end_date: endDate || null,
        })
        .select()
        .single();
      custSub = data;
      subError = error;
      logStep("Created new subscription record", { id: custSub?.id, endDate });
    }

    if (subError) throw new Error(`Failed to create/update subscription record: ${subError.message}`);

    // Create subscription_items for each trailer
    for (let i = 0; i < trailers.length; i++) {
      const trailer = trailers[i];
      const stripeItem = subscription.items.data[i];
      const rate = customRates?.[trailer.id] ?? trailer.rental_rate ?? getDefaultRate(trailer.type);
      const isLeaseToOwn = leaseToOwnFlags?.[trailer.id] ?? false;

      // For lease-to-own, use the subscription end_date as ownership transfer date
      const ownershipTransferDate = isLeaseToOwn && endDate ? endDate : null;

      await supabaseClient
        .from("subscription_items")
        .insert({
          subscription_id: custSub.id,
          trailer_id: trailer.id,
          monthly_rate: rate,
          stripe_subscription_item_id: stripeItem?.id || null,
          status: "active",
          lease_to_own: isLeaseToOwn,
          ownership_transfer_date: ownershipTransferDate,
        });

      logStep("Created subscription item", { 
        trailerId: trailer.id, 
        leaseToOwn: isLeaseToOwn, 
        ownershipTransferDate 
      });

      // Update trailer to mark as rented
      await supabaseClient
        .from("trailers")
        .update({ is_rented: true, customer_id: customerId })
        .eq("id", trailer.id);
    }
    logStep("Created subscription items", { count: trailers.length });

    // Track discount if applied
    if (discountId && custSub) {
      await supabaseClient
        .from("applied_discounts")
        .insert({
          subscription_id: custSub.id,
          discount_id: discountId,
        });
      logStep("Applied discount to subscription");
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscriptionId: custSub.id,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
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
