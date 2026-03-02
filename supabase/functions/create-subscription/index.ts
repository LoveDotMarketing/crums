import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Helper function to calculate next anchor date for billing cycle
function calculateNextAnchorDate(anchorDay: number | null): number | undefined {
  if (!anchorDay || anchorDay < 1 || anchorDay > 28) return undefined;
  
  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth(), anchorDay);
  
  // If the target day has passed this month, use next month
  if (targetDate <= now) {
    targetDate.setMonth(targetDate.getMonth() + 1);
  }
  
  return Math.floor(targetDate.getTime() / 1000);
}

interface TrailerBillingSchedule {
  billing_cycle?: string;
  billing_anchor_day?: number;
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
  subscriptionType?: "standard_lease" | "rent_for_storage" | "lease_to_own" | "repayment_plan";
  leaseToOwnTotal?: number; // Total buyout price for lease-to-own agreements
  billingAnchorDay?: number; // Admin-selected billing anchor day (1-28)
  trailerBillingSchedules?: Record<string, TrailerBillingSchedule>; // per-trailer billing overrides
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
    const { customerId, trailerIds, billingCycle, depositAmount, discountId, customRates, leaseToOwnFlags, endDate, subscriptionType, leaseToOwnTotal, billingAnchorDay, trailerBillingSchedules } = body;

    if (!customerId || !trailerIds?.length || !billingCycle) {
      throw new Error("Missing required fields: customerId, trailerIds, billingCycle");
    }

    // Check for existing subscriptions for this customer
    const { data: existingSubscriptions } = await supabaseClient
      .from("customer_subscriptions")
      .select("id, status, stripe_subscription_id, subscription_items(trailer_id)")
      .eq("customer_id", customerId);

    // Check if any requested trailers are already on an active/pending/paused subscription
    const activeSubscriptions = (existingSubscriptions || []).filter(
      s => ["active", "pending", "paused"].includes(s.status)
    );
    
    if (activeSubscriptions.length > 0) {
      const assignedTrailerIds = new Set(
        activeSubscriptions.flatMap(s => 
          (s.subscription_items || []).map((item: { trailer_id: string }) => item.trailer_id)
        )
      );
      const conflictingTrailers = trailerIds.filter(id => assignedTrailerIds.has(id));
      
      if (conflictingTrailers.length > 0) {
        throw new Error(`Trailer(s) are already assigned to an active subscription. Remove them from the existing subscription first.`);
      }
      
      logStep("Customer has existing active subscriptions, creating additional for split billing", {
        existingCount: activeSubscriptions.length
      });
    }

    // Check if any of the requested trailers are already rented
    const { data: rentedTrailers } = await supabaseClient
      .from("trailers")
      .select("id, trailer_number, is_rented, customer_id")
      .in("id", trailerIds)
      .eq("is_rented", true);

    // Filter out trailers already assigned to THIS customer — only block trailers rented by someone else
    const rentedByOthers = (rentedTrailers || []).filter(t => t.customer_id !== customerId);
    if (rentedByOthers.length > 0) {
      const rentedNumbers = rentedByOthers.map(t => t.trailer_number).join(", ");
      logStep("Some trailers are rented by other customers", { rentedByOthers });
      throw new Error(`Trailer(s) ${rentedNumbers} are already rented by another customer. Please select available trailers.`);
    }
    logStep("All requested trailers are available or already assigned to this customer");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get customer details
    const { data: customer, error: custError } = await supabaseClient
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();

    if (custError || !customer) throw new Error("Customer not found");
    logStep("Customer found", { customerId, email: customer.email });

    // Server-side ACH guard: verify customer has a payment method before creating subscription
    if (customer.email) {
      const { data: profileData } = await supabaseClient
        .from("profiles")
        .select("id")
        .eq("email", customer.email)
        .maybeSingle();
      
      if (profileData?.id) {
        const { data: appData } = await supabaseClient
          .from("customer_applications")
          .select("stripe_payment_method_id")
          .eq("user_id", profileData.id)
          .maybeSingle();
        
        if (!appData?.stripe_payment_method_id) {
          throw new Error("Customer has no ACH payment method linked. Set up ACH on their profile first.");
        }
        logStep("ACH payment method verified", { userId: profileData.id });
      } else {
        logStep("WARNING: No profile found for customer, skipping ACH guard", { email: customer.email });
      }
    }

    // Resolve global anchor day from admin input or customer application
    let globalAnchorDay = billingAnchorDay || null;
    if (!globalAnchorDay) {
      const { data: customerApplication } = await supabaseClient
        .from("customer_applications")
        .select("billing_anchor_day, user_id")
        .eq("user_id", (
          await supabaseClient
            .from("profiles")
            .select("id")
            .eq("email", customer.email)
            .maybeSingle()
        ).data?.id || "")
        .maybeSingle();
      globalAnchorDay = customerApplication?.billing_anchor_day || null;
    }
    
    logStep("Global billing anchor day", { 
      adminProvided: billingAnchorDay,
      resolved: globalAnchorDay
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

    // Calculate billing interval
    const intervalMap = {
      weekly: { interval: "week" as const, interval_count: 1 },
      biweekly: { interval: "week" as const, interval_count: 2 },
      semimonthly: { interval: "week" as const, interval_count: 2 },
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
      if (type.includes("flat") || type.includes("flatbed")) return 750;
      if (type.includes("refrigerated") || type.includes("reefer")) return 850;
      return 700;
    };

    // ==========================================
    // GROUP TRAILERS BY BILLING ANCHOR DAY
    // ==========================================
    // Each trailer resolves its anchor day from:
    //   1. trailerBillingSchedules[id]?.billing_anchor_day (per-trailer override)
    //   2. globalAnchorDay (admin-selected or application default)
    //   3. null (no anchor = Stripe default)
    const anchorGroups = new Map<string, typeof trailers>();
    
    for (const trailer of trailers) {
      const perTrailerSchedule = trailerBillingSchedules?.[trailer.id];
      const resolvedAnchor = perTrailerSchedule?.billing_anchor_day ?? globalAnchorDay ?? null;
      const groupKey = resolvedAnchor !== null ? String(resolvedAnchor) : "default";
      
      if (!anchorGroups.has(groupKey)) {
        anchorGroups.set(groupKey, []);
      }
      anchorGroups.get(groupKey)!.push(trailer);
    }

    logStep("Grouped trailers by anchor day", { 
      groups: Array.from(anchorGroups.entries()).map(([key, t]) => ({
        anchorDay: key,
        trailerCount: t.length,
        trailers: t.map(tr => tr.trailer_number)
      }))
    });

    // Determine subscription type
    const subType = subscriptionType || "standard_lease";
    
    // Map Stripe status to our allowed values
    const statusMap: Record<string, string> = {
      incomplete: "pending",
      incomplete_expired: "canceled",
      trialing: "active",
      active: "active",
      past_due: "active",
      canceled: "canceled",
      unpaid: "paused",
      paused: "paused",
    };

    // Track all created subscription IDs for the response
    const createdSubscriptions: Array<{ subscriptionId: string; stripeSubscriptionId: string; status: string; anchorDay: string }> = [];
    let primarySubscriptionId = "";
    let primaryStripeSubscriptionId = "";
    let primaryStatus = "";

    // Look for a canceled subscription to reuse (only for the FIRST group)
    const canceledSubscription = (existingSubscriptions || []).find(s => s.status === "canceled");
    const reuseExistingRow = canceledSubscription && activeSubscriptions.length === 0;
    let isFirstGroup = true;

    // ==========================================
    // CREATE A STRIPE SUBSCRIPTION PER GROUP
    // ==========================================
    for (const [groupKey, groupTrailers] of anchorGroups) {
      const anchorDay = groupKey === "default" ? null : parseInt(groupKey, 10);
      
      logStep(`Processing anchor group`, { anchorDay: groupKey, trailerCount: groupTrailers.length });

      // Create Stripe prices for this group's trailers
      const subscriptionItems: Stripe.SubscriptionCreateParams.Item[] = [];
      for (const trailer of groupTrailers) {
        const rate = customRates?.[trailer.id] ?? trailer.rental_rate ?? getDefaultRate(trailer.type);
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
        logStep("Created price for trailer", { trailerId: trailer.id, priceId: price.id, rate, group: groupKey });
      }

      // Only add deposit to the first group's subscription
      let depositInvoiceItem: Stripe.SubscriptionCreateParams.AddInvoiceItem | null = null;
      if (isFirstGroup && depositAmount && depositAmount > 0) {
        const depositPrice = await stripe.prices.create({
          unit_amount: Math.round(depositAmount * 100),
          currency: "usd",
          product_data: {
            name: "Security Deposit",
            metadata: { type: "security_deposit", internal_customer_id: customerId },
          },
        });
        depositInvoiceItem = { price: depositPrice.id };
        logStep("Created deposit price", { depositAmount, priceId: depositPrice.id });
      }

      // Build Stripe subscription params
      const subscriptionParams: Stripe.SubscriptionCreateParams = {
        customer: stripeCustomerId,
        items: subscriptionItems,
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
        metadata: { 
          internal_customer_id: customerId,
          deposit_amount: isFirstGroup ? (depositAmount?.toString() || "0") : "0",
          billing_cycle: billingCycle,
          billing_anchor_day: anchorDay?.toString() || "none",
        },
      };

      // Set billing cycle anchor
      const anchorTimestamp = calculateNextAnchorDate(anchorDay);
      if (anchorTimestamp) {
        subscriptionParams.billing_cycle_anchor = anchorTimestamp;
        subscriptionParams.proration_behavior = "none";
        logStep("Setting billing cycle anchor", { anchorDay, anchorTimestamp, group: groupKey });
      }

      if (depositInvoiceItem) {
        subscriptionParams.add_invoice_items = [depositInvoiceItem];
      }

      if (coupon) {
        subscriptionParams.discounts = [{ coupon: coupon.id }];
      }

      const subscription = await stripe.subscriptions.create(subscriptionParams);
      logStep("Created Stripe subscription", { 
        subscriptionId: subscription.id, group: groupKey, anchorDay,
        trailerCount: groupTrailers.length
      });

      // Calculate next billing date
      let nextBillingDate: string | null = null;
      if (subscription.current_period_end) {
        nextBillingDate = new Date(subscription.current_period_end * 1000).toISOString();
      }

      const mappedStatus = statusMap[subscription.status] ?? "pending";

      // Create or update customer_subscription record
      let custSub;
      let subError;

      if (isFirstGroup && reuseExistingRow && canceledSubscription) {
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
            subscription_type: subType,
          })
          .eq("id", canceledSubscription.id)
          .select()
          .single();
        custSub = data;
        subError = error;
        logStep("Updated existing subscription record", { id: custSub?.id, group: groupKey });
      } else {
        const { data, error } = await supabaseClient
          .from("customer_subscriptions")
          .insert({
            customer_id: customerId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: stripeCustomerId,
            billing_cycle: billingCycle,
            deposit_amount: isFirstGroup ? (depositAmount || null) : null,
            deposit_paid: false,
            status: mappedStatus,
            next_billing_date: nextBillingDate,
            end_date: endDate || null,
            subscription_type: subType,
          })
          .select()
          .single();
        custSub = data;
        subError = error;
        logStep("Created new subscription record", { id: custSub?.id, group: groupKey });
      }

      if (subError) throw new Error(`Failed to create subscription record for group ${groupKey}: ${subError.message}`);

      // Create subscription_items for each trailer in this group
      for (let i = 0; i < groupTrailers.length; i++) {
        const trailer = groupTrailers[i];
        const stripeItem = subscription.items.data[i];
        const rate = customRates?.[trailer.id] ?? trailer.rental_rate ?? getDefaultRate(trailer.type);
        const isLeaseToOwn = subscriptionType === "lease_to_own" ? true : (leaseToOwnFlags?.[trailer.id] ?? false);
        const ownershipTransferDate = isLeaseToOwn && endDate ? endDate : null;
        
        // Resolve per-trailer billing metadata
        const perTrailerSchedule = trailerBillingSchedules?.[trailer.id];
        const resolvedBillingCycle = perTrailerSchedule?.billing_cycle || billingCycle;
        const resolvedAnchorDay = perTrailerSchedule?.billing_anchor_day ?? anchorDay ?? null;

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
            lease_to_own_total: isLeaseToOwn && leaseToOwnTotal ? leaseToOwnTotal : null,
            billing_cycle: resolvedBillingCycle,
            billing_anchor_day: resolvedAnchorDay,
          });

        logStep("Created subscription item", { 
          trailerId: trailer.id, trailerNumber: trailer.trailer_number,
          billingCycle: resolvedBillingCycle, anchorDay: resolvedAnchorDay,
          group: groupKey
        });

        // Update trailer to mark as rented
        await supabaseClient
          .from("trailers")
          .update({ is_rented: true, customer_id: customerId })
          .eq("id", trailer.id);
      }

      // Track discount if applied (only on first group)
      if (isFirstGroup && discountId && custSub) {
        await supabaseClient
          .from("applied_discounts")
          .insert({
            subscription_id: custSub.id,
            discount_id: discountId,
          });
        logStep("Applied discount to subscription");
      }

      createdSubscriptions.push({
        subscriptionId: custSub.id,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        anchorDay: groupKey,
      });

      if (isFirstGroup) {
        primarySubscriptionId = custSub.id;
        primaryStripeSubscriptionId = subscription.id;
        primaryStatus = subscription.status;
      }

      isFirstGroup = false;
    }

    logStep("All subscription groups created", { 
      totalGroups: anchorGroups.size,
      subscriptions: createdSubscriptions 
    });

    return new Response(
      JSON.stringify({
        success: true,
        subscriptionId: primarySubscriptionId,
        stripeSubscriptionId: primaryStripeSubscriptionId,
        status: primaryStatus,
        // Include all created subscriptions for multi-group scenarios
        allSubscriptions: createdSubscriptions.length > 1 ? createdSubscriptions : undefined,
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
