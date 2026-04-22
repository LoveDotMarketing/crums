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

// Helper function to calculate next anchor date for monthly billing cycle
function calculateNextAnchorDate(anchorDay: number | null): number | undefined {
  if (!anchorDay || anchorDay < 1 || anchorDay > 28) return undefined;
  
  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth(), anchorDay);
  
  if (targetDate <= now) {
    targetDate.setMonth(targetDate.getMonth() + 1);
  }
  
  return Math.floor(targetDate.getTime() / 1000);
}

// Helper function to calculate next occurrence of a weekday for weekly billing
function calculateNextWeekdayAnchor(dayOfWeek: number): number | undefined {
  if (dayOfWeek < 0 || dayOfWeek > 6) return undefined;
  
  const now = new Date();
  const currentDay = now.getDay();
  let daysUntil = dayOfWeek - currentDay;
  if (daysUntil <= 0) daysUntil += 7;
  
  const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntil);
  targetDate.setHours(0, 0, 0, 0);
  
  return Math.floor(targetDate.getTime() / 1000);
}

interface TrailerBillingSchedule {
  billing_cycle?: string;
  billing_anchor_day?: number;
}

interface SubscriptionRequest {
  customerId: string;
  trailerIds: string[];
  billingCycle: "weekly" | "biweekly" | "monthly" | "semimonthly";
  depositAmount?: number;
  discountId?: string;
  customRates?: Record<string, number>;
  leaseToOwnFlags?: Record<string, boolean>;
  endDate?: string;
  subscriptionType?: "standard_lease" | "6_month_lease" | "24_month_lease" | "month_to_month" | "rent_for_storage" | "lease_to_own" | "repayment_plan";
  leaseToOwnTotal?: number;
  billingAnchorDay?: number;
  trailerBillingSchedules?: Record<string, TrailerBillingSchedule>;
  firstBillingDate?: string;
}

const VALID_BILLING_CYCLES = ["weekly", "biweekly", "semimonthly", "monthly"];
const VALID_SUB_TYPES = ["standard_lease", "6_month_lease", "24_month_lease", "month_to_month", "rent_for_storage", "lease_to_own", "repayment_plan"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rollback tracker — records every Stripe object we create so we can undo on failure
  const rollbackActions: Array<{ type: "subscription" | "invoice"; id: string }> = [];
  const trailersMarkedRented: string[] = [];

  try {
    logStep("Function started");

    const liveStripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!liveStripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

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

    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) throw new Error("Admin access required");
    logStep("Admin verified", { adminId: userData.user.id });

    const body: SubscriptionRequest = await req.json();
    const { customerId, trailerIds, billingCycle, depositAmount, discountId, customRates, leaseToOwnFlags, endDate, subscriptionType, leaseToOwnTotal, billingAnchorDay, trailerBillingSchedules, firstBillingDate } = body;

    // ==========================================
    // STRICT VALIDATION
    // ==========================================
    if (!customerId || !trailerIds?.length || !billingCycle) {
      throw new Error("Missing required fields: customerId, trailerIds, billingCycle");
    }
    if (!VALID_BILLING_CYCLES.includes(billingCycle)) {
      throw new Error(`Invalid billingCycle: ${billingCycle}. Must be one of: ${VALID_BILLING_CYCLES.join(", ")}`);
    }
    const subType = subscriptionType || "standard_lease";
    if (!VALID_SUB_TYPES.includes(subType)) {
      throw new Error(`Invalid subscriptionType: ${subType}. Must be one of: ${VALID_SUB_TYPES.join(", ")}`);
    }
    // Validate weekly anchor days (must be 0-6 for day-of-week)
    if ((billingCycle === "weekly" || billingCycle === "biweekly") && billingAnchorDay !== undefined) {
      if (billingAnchorDay < 0 || billingAnchorDay > 6) {
        throw new Error(`Invalid weekly anchor day: ${billingAnchorDay}. For weekly billing, use 0 (Sun) through 6 (Sat).`);
      }
    }

    // Check for existing subscriptions for this customer
    const { data: existingSubscriptions } = await supabaseClient
      .from("customer_subscriptions")
      .select("id, status, stripe_subscription_id, subscription_items(trailer_id)")
      .eq("customer_id", customerId);

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

    // Check if any of the requested trailers are already rented by someone else
    const { data: rentedTrailers } = await supabaseClient
      .from("trailers")
      .select("id, trailer_number, is_rented, customer_id")
      .in("id", trailerIds)
      .eq("is_rented", true);

    const rentedByOthers = (rentedTrailers || []).filter(t => t.customer_id !== customerId);
    if (rentedByOthers.length > 0) {
      const rentedNumbers = rentedByOthers.map(t => t.trailer_number).join(", ");
      throw new Error(`Trailer(s) ${rentedNumbers} are already rented by another customer.`);
    }

    // Fetch full trailer records
    const { data: trailers, error: trailerFetchError } = await supabaseClient
      .from("trailers")
      .select("id, trailer_number, type, year, make, model, rental_rate, customer_id")
      .in("id", trailerIds);

    if (trailerFetchError || !trailers?.length) {
      throw new Error("Failed to fetch trailer details for the requested trailers.");
    }
    logStep("Fetched trailer records", { count: trailers.length });

    // Stripe instance is initialized after we resolve the application sandbox flag below
    let stripe: Stripe;

    // Get customer details
    const { data: customer, error: custError } = await supabaseClient
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();

    if (custError || !customer) throw new Error("Customer not found");
    logStep("Customer found", { customerId, email: customer.email });

    // ==========================================
    // RESOLVE APPLICATION RECORD (hardened for repeat customers)
    // ==========================================
    let appRecord: { stripe_payment_method_id: string | null; stripe_customer_id: string | null; sandbox_stripe_customer_id: string | null; sandbox: boolean | null; id: string; payment_method_type: string | null } | null = null;
    let profileIdForStripe: string | null = null;

    if (customer.email) {
      const { data: profileData } = await supabaseClient
        .from("profiles")
        .select("id")
        .ilike("email", customer.email)
        .maybeSingle();

      if (profileData?.id) {
        profileIdForStripe = profileData.id;
        // Use order + limit instead of maybeSingle to handle repeat customers
        const { data: appRows } = await supabaseClient
          .from("customer_applications")
          .select("stripe_payment_method_id, stripe_customer_id, id, payment_method_type")
          .eq("user_id", profileData.id)
          .not("stripe_payment_method_id", "is", null)
          .order("updated_at", { ascending: false })
          .limit(1);
        appRecord = appRows?.[0] ?? null;

        // If no row with a PM, try without the PM filter (customer may exist but PM is null)
        if (!appRecord) {
          const { data: appRowsFallback } = await supabaseClient
            .from("customer_applications")
            .select("stripe_payment_method_id, stripe_customer_id, id, payment_method_type")
            .eq("user_id", profileData.id)
            .order("updated_at", { ascending: false })
            .limit(1);
          appRecord = appRowsFallback?.[0] ?? null;
        }
      }
    }

    // Fallback: look up by customer_id (also hardened)
    if (!appRecord) {
      const { data: appByCustomerRows } = await supabaseClient
        .from("customer_applications")
        .select("stripe_payment_method_id, stripe_customer_id, id, payment_method_type")
        .eq("customer_id", customerId)
        .order("updated_at", { ascending: false })
        .limit(1);
      appRecord = appByCustomerRows?.[0] ?? null;
    }

    logStep("Application record lookup", {
      found: !!appRecord,
      storedPmId: appRecord?.stripe_payment_method_id ?? null,
      storedStripeCustomer: appRecord?.stripe_customer_id ?? null,
      pmType: appRecord?.payment_method_type ?? null,
    });

    // --- Step 1: Resolve the Stripe Customer ---
    let stripeCustomerId: string | null = null;

    if (appRecord?.stripe_customer_id) {
      try {
        const existingCust = await stripe.customers.retrieve(appRecord.stripe_customer_id);
        if (existingCust && !(existingCust as any).deleted) {
          stripeCustomerId = appRecord.stripe_customer_id;
          logStep("Stripe customer from application record is valid", { stripeCustomerId });
        }
      } catch {
        logStep("Stored stripe_customer_id is invalid, falling back to search");
      }
    }

    if (!stripeCustomerId && customer.email) {
      const stripeCustomers = await stripe.customers.list({ email: customer.email, limit: 10 });
      for (const sc of stripeCustomers.data) {
        if ((sc as any).deleted) continue;
        const pms = await stripe.paymentMethods.list({ customer: sc.id, limit: 1 });
        if (pms.data.length > 0) {
          stripeCustomerId = sc.id;
          logStep("Found Stripe customer with PMs via email search", { stripeCustomerId });
          break;
        }
      }
    }

    if (!stripeCustomerId) {
      if (appRecord?.id) {
        await supabaseClient
          .from("customer_applications")
          .update({ payment_setup_status: "pending", stripe_payment_method_id: null })
          .eq("id", appRecord.id);
      }
      throw new Error("No valid Stripe customer with payment methods found for this email. Customer needs to re-complete payment setup.");
    }

    if (appRecord && appRecord.stripe_customer_id !== stripeCustomerId && profileIdForStripe) {
      await supabaseClient
        .from("customer_applications")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("user_id", profileIdForStripe);
    }

    // --- Step 2: Resolve Payment Method ---
    let verifiedPmId: string | null = null;

    if (appRecord?.stripe_payment_method_id) {
      try {
        const pm = await stripe.paymentMethods.retrieve(appRecord.stripe_payment_method_id);
        if (pm.customer === stripeCustomerId) {
          verifiedPmId = pm.id;
          logStep("Stored PM verified", { pmId: pm.id });
        }
      } catch {
        logStep("Stored PM retrieval failed");
      }
    }

    if (!verifiedPmId) {
      const preferredType = appRecord?.payment_method_type === "card" ? "card" : "us_bank_account";
      const fallbackType = preferredType === "card" ? "us_bank_account" : "card";

      for (const pmType of [preferredType, fallbackType]) {
        const methods = await stripe.paymentMethods.list({
          customer: stripeCustomerId,
          type: pmType as any,
          limit: 1,
        });
        if (methods.data.length > 0) {
          verifiedPmId = methods.data[0].id;
          logStep(`Found live PM via search`, { pmId: verifiedPmId, type: pmType });
          break;
        }
      }
    }

    if (!verifiedPmId) {
      if (appRecord?.id) {
        await supabaseClient
          .from("customer_applications")
          .update({ payment_setup_status: "pending", stripe_payment_method_id: null })
          .eq("id", appRecord.id);
      }
      throw new Error("Customer's payment method is no longer valid. Their payment setup has been reset — please have them re-link ACH or card.");
    }

    if (appRecord && appRecord.stripe_payment_method_id !== verifiedPmId) {
      await supabaseClient
        .from("customer_applications")
        .update({ stripe_payment_method_id: verifiedPmId })
        .eq("id", appRecord.id);
    }

    // ==========================================
    // GROUP TRAILERS BY CYCLE + ANCHOR (not anchor alone)
    // ==========================================
    const intervalMap = {
      weekly: { interval: "week" as const, interval_count: 1 },
      biweekly: { interval: "week" as const, interval_count: 2 },
      semimonthly: { interval: "week" as const, interval_count: 2 },
      monthly: { interval: "month" as const, interval_count: 1 },
    };

    const { getDefaultRate } = await import("../_shared/billing.ts");

    // Each trailer resolves: cycle + anchor → group key
    const anchorGroups = new Map<string, { trailers: typeof trailers; groupCycle: string; anchorDay: number | null }>();
    
    for (const trailer of trailers) {
      const perTrailerSchedule = trailerBillingSchedules?.[trailer.id];
      const resolvedCycle = perTrailerSchedule?.billing_cycle || billingCycle;
      const resolvedAnchor = perTrailerSchedule?.billing_anchor_day ?? billingAnchorDay ?? null;
      
      // Validate weekly anchor (must be day-of-week 0-6)
      if ((resolvedCycle === "weekly" || resolvedCycle === "biweekly") && resolvedAnchor !== null && (resolvedAnchor < 0 || resolvedAnchor > 6)) {
        logStep("WARNING: Invalid weekly anchor, ignoring", { trailerId: trailer.id, anchor: resolvedAnchor });
      }
      
      const groupKey = `${resolvedCycle}:${resolvedAnchor ?? "default"}`;
      
      if (!anchorGroups.has(groupKey)) {
        anchorGroups.set(groupKey, { trailers: [], groupCycle: resolvedCycle, anchorDay: resolvedAnchor });
      }
      anchorGroups.get(groupKey)!.trailers.push(trailer);
    }

    logStep("Grouped trailers by cycle+anchor", { 
      groups: Array.from(anchorGroups.entries()).map(([key, g]) => ({
        key,
        cycle: g.groupCycle,
        anchorDay: g.anchorDay,
        trailerCount: g.trailers.length,
        trailers: g.trailers.map(tr => tr.trailer_number)
      }))
    });

    // Block global firstBillingDate for multi-group setups
    if (anchorGroups.size > 1 && firstBillingDate) {
      throw new Error("Cannot use a single First Billing Date when trailers are split across multiple billing groups. Remove the First Billing Date or put all trailers on the same schedule.");
    }

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

    const createdSubscriptions: Array<{ subscriptionId: string; stripeSubscriptionId: string; status: string; groupKey: string }> = [];
    let primarySubscriptionId = "";
    let primaryStripeSubscriptionId = "";
    let primaryStatus = "";

    const canceledSubscription = (existingSubscriptions || []).find(s => s.status === "canceled");
    const reuseExistingRow = canceledSubscription && activeSubscriptions.length === 0;
    let isFirstGroup = true;

    // ==========================================
    // CREATE A STRIPE SUBSCRIPTION PER GROUP
    // ==========================================
    for (const [groupKey, group] of anchorGroups) {
      const { trailers: groupTrailers, groupCycle, anchorDay } = group;
      const groupBillingInterval = intervalMap[groupCycle as keyof typeof intervalMap] || intervalMap[billingCycle];
      
      logStep(`Processing group`, { groupKey, trailerCount: groupTrailers.length, groupCycle, anchorDay });

      // Create Stripe prices using the GROUP's billing interval
      const subscriptionItems: Stripe.SubscriptionCreateParams.Item[] = [];
      for (const trailer of groupTrailers) {
        const rate = customRates?.[trailer.id] ?? trailer.rental_rate ?? getDefaultRate(trailer.type);
        const price = await stripe.prices.create({
          unit_amount: Math.round(rate * 100),
          currency: "usd",
          recurring: groupBillingInterval,
          product_data: {
            name: `Trailer ${trailer.trailer_number} Lease`,
            metadata: { trailer_id: trailer.id },
          },
        });
        subscriptionItems.push({ price: price.id });
        logStep("Created price", { trailerId: trailer.id, rate, group: groupKey });
      }

      // Build Stripe subscription params
      const subscriptionParams: Stripe.SubscriptionCreateParams = {
        customer: stripeCustomerId,
        items: subscriptionItems,
        default_payment_method: verifiedPmId || undefined,
        payment_behavior: "allow_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
        metadata: { 
          internal_customer_id: customerId,
          deposit_amount: isFirstGroup ? (depositAmount?.toString() || "0") : "0",
          billing_cycle: groupCycle,
          billing_anchor_day: anchorDay?.toString() || "none",
        },
      };

      // Set billing cycle anchor
      let anchorTimestamp: number | undefined;
      let isDelayedStart = false;
      
      if (firstBillingDate) {
        const fbDate = new Date(firstBillingDate + "T00:00:00Z");
        const fbTimestamp = Math.floor(fbDate.getTime() / 1000);
        const nowTimestamp = Math.floor(Date.now() / 1000);
        
        const maxDirectAnchorSeconds = (groupCycle === "weekly" || groupCycle === "biweekly")
          ? 13 * 24 * 3600
          : 25 * 24 * 3600;
        
        if ((fbTimestamp - nowTimestamp) <= maxDirectAnchorSeconds) {
          anchorTimestamp = fbTimestamp;
          logStep("Using direct anchor mode", { firstBillingDate, anchorTimestamp, mode: "direct_anchor" });
        } else {
          // Delayed start: trial_end only, NO billing_cycle_anchor
          isDelayedStart = true;
          subscriptionParams.trial_end = fbTimestamp;
          subscriptionParams.proration_behavior = "none";
          logStep("Using delayed-start mode (trial_end only)", { 
            firstBillingDate, trialEnd: fbTimestamp,
            mode: "delayed_trial_only",
            billing_cycle_anchor: "OMITTED"
          });
        }
      } else if ((groupCycle === "weekly" || groupCycle === "biweekly") && anchorDay !== null) {
        anchorTimestamp = calculateNextWeekdayAnchor(anchorDay);
        logStep("Using weekly anchor", { dayOfWeek: anchorDay, anchorTimestamp });
      } else {
        anchorTimestamp = calculateNextAnchorDate(anchorDay);
      }
      
      if (anchorTimestamp && !isDelayedStart) {
        subscriptionParams.billing_cycle_anchor = anchorTimestamp;
        subscriptionParams.proration_behavior = "none";
        logStep("Setting billing_cycle_anchor", { anchorTimestamp, mode: "direct_anchor" });
      }

      if (coupon) {
        subscriptionParams.discounts = [{ coupon: coupon.id }];
      }

      // Duplicate subscription guard: check for recent subscription with same customer + trailers
      const recentCutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { data: recentSubs } = await supabaseClient
        .from("customer_subscriptions")
        .select("id, created_at, subscription_items(trailer_id)")
        .eq("customer_id", customerId)
        .gte("created_at", recentCutoff);

      if (recentSubs && recentSubs.length > 0) {
        const groupTrailerIds = new Set(groupTrailers.map(t => t.id));
        const isDuplicate = recentSubs.some(sub => {
          const subTrailerIds = (sub.subscription_items || []).map((si: any) => si.trailer_id);
          return subTrailerIds.length > 0 && subTrailerIds.every((tid: string) => groupTrailerIds.has(tid));
        });
        if (isDuplicate) {
          throw new Error("A subscription for these trailers was already created in the last 10 minutes. If this is intentional, wait and try again.");
        }
      }

      // Generate deterministic idempotency key (10-minute bucket)
      const timeBucket = Math.floor(Date.now() / 600000);
      const trailerKey = groupTrailers.map(t => t.id).sort().join(",");
      const idempotencyKey = `create-sub_${customerId}_${groupKey}_${timeBucket}_${trailerKey}`.substring(0, 255);
      logStep("Using idempotency key", { idempotencyKey });

      let subscription: Stripe.Subscription;
      try {
        subscription = await stripe.subscriptions.create(subscriptionParams, {
          idempotencyKey,
        });
        rollbackActions.push({ type: "subscription", id: subscription.id });
      } catch (stripeSubErr: any) {
        const stripeMsg = stripeSubErr?.message || String(stripeSubErr);
        logStep("FATAL: stripe.subscriptions.create failed", { error: stripeMsg, stripeCustomerId, pmId: verifiedPmId });
        throw new Error(`Stripe subscription creation failed: ${stripeMsg}`);
      }
      logStep("Created Stripe subscription", { 
        subscriptionId: subscription.id, groupKey,
        stripeStatus: subscription.status,
      });

      // ==========================================
      // DEPOSIT (first group only)
      // ==========================================
      let depositChargedDuringCreation = false;
      let depositInvoiceResult: { paidInvoice: any; isCard: boolean; finalAmount: number } | null = null;
      if (isFirstGroup && depositAmount && depositAmount > 0) {
        logStep("Charging deposit as standalone invoice", { depositAmount });
        
        try {
          const depositPreferredType = appRecord?.payment_method_type ?? null;
          const cardFirst = depositPreferredType === "card";
          const primaryType = cardFirst ? "card" : "us_bank_account";
          const fallbackType2 = cardFirst ? "us_bank_account" : "card";

          const primaryMethods = await stripe.paymentMethods.list({
            customer: stripeCustomerId,
            type: primaryType,
            limit: 1,
          });
          let depositPaymentMethodId: string | null = primaryMethods.data[0]?.id ?? null;

          if (!depositPaymentMethodId) {
            const fallbackMethods = await stripe.paymentMethods.list({
              customer: stripeCustomerId,
              type: fallbackType2,
              limit: 1,
            });
            depositPaymentMethodId = fallbackMethods.data[0]?.id ?? null;
          }

          const { calculateCardSurcharge } = await import("../_shared/billing.ts");
          let isDepositCard = false;
          let finalDepositAmount = depositAmount;
          let depositSurcharge = 0;
          if (depositPaymentMethodId) {
            const pmInfo = await stripe.paymentMethods.retrieve(depositPaymentMethodId);
            isDepositCard = pmInfo.type === "card";
            if (isDepositCard) {
              const result = calculateCardSurcharge(depositAmount);
              finalDepositAmount = result.adjustedAmount;
              depositSurcharge = result.surcharge;
              logStep("Card surcharge applied to deposit", { base: depositAmount, surcharge: depositSurcharge, total: finalDepositAmount });
            }
          }

          const depositInvoice = await stripe.invoices.create({
            customer: stripeCustomerId,
            auto_advance: false,
            pending_invoice_items_behavior: "exclude",
            metadata: { type: "security_deposit", subscription_id: subscription.id },
          }, {
            idempotencyKey: `${subscription.id}_deposit`,
          });
          rollbackActions.push({ type: "invoice", id: depositInvoice.id });

          await stripe.invoiceItems.create({
            customer: stripeCustomerId,
            invoice: depositInvoice.id,
            amount: Math.round(finalDepositAmount * 100),
            currency: "usd",
            description: isDepositCard ? `Security Deposit (includes $${depositSurcharge.toFixed(2)} card processing fee)` : "Security Deposit",
          });

          const finalizedInvoice = await stripe.invoices.finalizeInvoice(depositInvoice.id);
          const payParams: any = {};
          if (depositPaymentMethodId) payParams.payment_method = depositPaymentMethodId;
          const paidInvoice = await stripe.invoices.pay(finalizedInvoice.id, payParams);
          logStep("Deposit payment initiated", { invoiceId: paidInvoice.id, status: paidInvoice.status });

          // Audit log: deposit charged
          try {
            await supabaseClient.from("app_event_logs").insert({
              user_id: userData.user.id,
              user_email: userData.user.email,
              event_category: "admin_action",
              event_type: "customer_charged",
              description: `Deposit of $${finalDepositAmount.toFixed(2)} charged to ${customer.full_name} (${customer.email}) via subscription creation`,
              metadata: {
                customer_id: customerId,
                customer_email: customer.email,
                amount: finalDepositAmount,
                charge_type: "security_deposit",
                stripe_invoice_id: paidInvoice.id,
                payment_method: isDepositCard ? "card" : "ach",
                surcharge: depositSurcharge,
                admin_id: userData.user.id,
                admin_email: userData.user.email,
                source: "create-subscription",
              },
              page_url: "/dashboard/admin/billing",
            });
          } catch (logErr: any) {
            logStep("WARNING: Deposit audit log failed", { error: logErr.message });
          }

          depositChargedDuringCreation = true;
          depositInvoiceResult = { paidInvoice, isCard: isDepositCard, finalAmount: finalDepositAmount };
        } catch (depositError) {
          const msg = depositError instanceof Error ? depositError.message : String(depositError);
          logStep("FATAL: Deposit charge failed, rolling back", { error: msg });
          // Rollback is handled by the outer catch block
          throw new Error(`Deposit charge failed: ${msg}. Subscription was not created. Please verify the customer's payment method is valid.`);
        }
      }

      // Calculate next billing date
      let nextBillingDate: string | null = null;
      if (subscription.current_period_end) {
        nextBillingDate = new Date(subscription.current_period_end * 1000).toISOString();
      }

      const mappedStatus = statusMap[subscription.status] ?? "pending";

      // Create or update customer_subscription record — use GROUP's cycle, not the global one
      let custSub;
      let subError;

      if (isFirstGroup && reuseExistingRow && canceledSubscription) {
        const { data, error } = await supabaseClient
          .from("customer_subscriptions")
          .update({
            stripe_subscription_id: subscription.id,
            stripe_customer_id: stripeCustomerId,
            billing_cycle: groupCycle as any,
            deposit_amount: depositAmount || null,
            deposit_paid: depositChargedDuringCreation,
            deposit_paid_at: depositChargedDuringCreation ? new Date().toISOString() : null,
            status: mappedStatus,
            next_billing_date: nextBillingDate,
            end_date: endDate || null,
            subscription_type: subType as any,
            // Clear stale values from old contract
            grace_period_start: null,
            grace_period_end: null,
            failed_payment_count: 0,
            contract_start_date: new Date().toISOString().split("T")[0],
          })
          .eq("id", canceledSubscription.id)
          .select()
          .single();
        custSub = data;
        subError = error;
        logStep("Updated existing subscription record", { id: custSub?.id, groupKey });
      } else {
        const { data, error } = await supabaseClient
          .from("customer_subscriptions")
          .insert({
            customer_id: customerId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: stripeCustomerId,
            billing_cycle: groupCycle as any,
            deposit_amount: isFirstGroup ? (depositAmount || null) : null,
            deposit_paid: isFirstGroup ? depositChargedDuringCreation : false,
            deposit_paid_at: (isFirstGroup && depositChargedDuringCreation) ? new Date().toISOString() : null,
            status: mappedStatus,
            next_billing_date: nextBillingDate,
            end_date: endDate || null,
            subscription_type: subType as any,
            contract_start_date: new Date().toISOString().split("T")[0],
          })
          .select()
          .single();
        custSub = data;
        subError = error;
        logStep("Created new subscription record", { id: custSub?.id, groupKey });
      }

      if (subError) {
        throw new Error(`Failed to create subscription record for group ${groupKey}: ${subError.message}`);
      }

      // Create subscription_items for each trailer
      for (let i = 0; i < groupTrailers.length; i++) {
        const trailer = groupTrailers[i];
        const stripeItem = subscription.items.data[i];
        const rate = customRates?.[trailer.id] ?? trailer.rental_rate ?? getDefaultRate(trailer.type);
        const isLeaseToOwn = subscriptionType === "lease_to_own" ? true : (leaseToOwnFlags?.[trailer.id] ?? false);
        const ownershipTransferDate = isLeaseToOwn && endDate ? endDate : null;
        
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

        // Update trailer to mark as rented
        await supabaseClient
          .from("trailers")
          .update({ is_rented: true, customer_id: customerId, status: "rented" })
          .eq("id", trailer.id);
        trailersMarkedRented.push(trailer.id);
      }

      // ==========================================
      // POST-CREATION: billing_history for deposit + first-period safety net
      // ==========================================
      if (isFirstGroup && depositInvoiceResult && custSub) {
        await supabaseClient.from("billing_history").insert({
          subscription_id: custSub.id,
          amount: depositInvoiceResult.finalAmount,
          net_amount: depositInvoiceResult.finalAmount,
          status: "processing",
          stripe_payment_intent_id: typeof depositInvoiceResult.paidInvoice.payment_intent === "string"
            ? depositInvoiceResult.paidInvoice.payment_intent
            : depositInvoiceResult.paidInvoice.payment_intent?.id ?? null,
          stripe_invoice_id: depositInvoiceResult.paidInvoice.id,
          payment_method: depositInvoiceResult.isCard ? "card" : "ach",
        });
        logStep("Created billing_history record for deposit");
      }

      // First-period safety net REMOVED — deposit covers first period;
      // monthly trailer fee bills on the scheduled billing_cycle_anchor date.

      // Track discount
      if (isFirstGroup && discountId && custSub) {
        await supabaseClient
          .from("applied_discounts")
          .insert({ subscription_id: custSub.id, discount_id: discountId });
      }

      createdSubscriptions.push({
        subscriptionId: custSub.id,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        groupKey,
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

    // ==========================================
    // AUDIT LOGGING — trace who created this subscription and all charges
    // ==========================================
    try {
      const supabaseForLogs = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );
      const adminId = userData.user.id;
      const adminEmail = userData.user.email;
      const trailerNumbers = trailers.map(t => t.trailer_number);

      // 1. Subscription created event
      await supabaseForLogs.from("app_event_logs").insert({
        user_id: adminId,
        user_email: adminEmail,
        event_category: "admin_action",
        event_type: "subscription_created",
        description: `Created ${subType} subscription for customer ${customer.full_name} (${customer.email}) — trailers: ${trailerNumbers.join(", ")}`,
        metadata: {
          customer_id: customerId,
          customer_email: customer.email,
          customer_name: customer.full_name,
          trailer_ids: trailerIds,
          trailer_numbers: trailerNumbers,
          subscription_type: subType,
          billing_cycle: billingCycle,
          deposit_amount: depositAmount || 0,
          admin_id: adminId,
          admin_email: adminEmail,
          subscriptions: createdSubscriptions,
        },
        page_url: "/dashboard/admin/billing",
      });
      logStep("Audit log: subscription_created inserted");
    } catch (auditErr: any) {
      // Non-fatal: don't fail the subscription over a log entry
      logStep("WARNING: Audit log insert failed", { error: auditErr.message });
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscriptionId: primarySubscriptionId,
        stripeSubscriptionId: primaryStripeSubscriptionId,
        status: primaryStatus,
        allSubscriptions: createdSubscriptions.length > 1 ? createdSubscriptions : undefined,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR — initiating rollback", { message: errorMessage });

    // ==========================================
    // ROLLBACK: cancel Stripe objects + release trailers
    // ==========================================
    try {
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (stripeKey && rollbackActions.length > 0) {
        const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
        for (const action of rollbackActions.reverse()) {
          try {
            if (action.type === "subscription") {
              await stripe.subscriptions.cancel(action.id);
              logStep("Rollback: canceled Stripe subscription", { id: action.id });
            } else if (action.type === "invoice") {
              try {
                await stripe.invoices.voidInvoice(action.id);
                logStep("Rollback: voided Stripe invoice", { id: action.id });
              } catch {
                // Invoice may not be voidable (already paid/draft)
                logStep("Rollback: could not void invoice (may be paid or draft)", { id: action.id });
              }
            }
          } catch (rollbackErr: any) {
            logStep("Rollback warning: failed to undo Stripe object", { id: action.id, error: rollbackErr.message });
          }
        }
      }

      // Release trailers that were marked rented
      if (trailersMarkedRented.length > 0) {
        const supabaseClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
          { auth: { persistSession: false } }
        );
        for (const tid of trailersMarkedRented) {
          await supabaseClient
            .from("trailers")
            .update({ is_rented: false, customer_id: null, status: "available" })
            .eq("id", tid);
        }
        logStep("Rollback: released trailers", { count: trailersMarkedRented.length });
      }
    } catch (rollbackError: any) {
      logStep("CRITICAL: Rollback itself failed", { error: rollbackError.message });
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
