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
  
  // If the target day has passed this month, use next month
  if (targetDate <= now) {
    targetDate.setMonth(targetDate.getMonth() + 1);
  }
  
  return Math.floor(targetDate.getTime() / 1000);
}

// Helper function to calculate next occurrence of a weekday for weekly billing
// dayOfWeek: 0=Sunday, 1=Monday, ..., 5=Friday, 6=Saturday
function calculateNextWeekdayAnchor(dayOfWeek: number): number | undefined {
  if (dayOfWeek < 0 || dayOfWeek > 6) return undefined;
  
  const now = new Date();
  const currentDay = now.getDay(); // 0=Sunday
  let daysUntil = dayOfWeek - currentDay;
  if (daysUntil <= 0) daysUntil += 7; // Always pick the NEXT occurrence
  
  const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntil);
  targetDate.setHours(0, 0, 0, 0);
  
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
  subscriptionType?: "standard_lease" | "6_month_lease" | "24_month_lease" | "rent_for_storage" | "lease_to_own" | "repayment_plan";
  leaseToOwnTotal?: number; // Total buyout price for lease-to-own agreements
  billingAnchorDay?: number; // Admin-selected billing anchor day (1-28)
  trailerBillingSchedules?: Record<string, TrailerBillingSchedule>; // per-trailer billing overrides
  firstBillingDate?: string; // Optional explicit first billing date (YYYY-MM-DD) — overrides anchor day calculation
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
    const { customerId, trailerIds, billingCycle, depositAmount, discountId, customRates, leaseToOwnFlags, endDate, subscriptionType, leaseToOwnTotal, billingAnchorDay, trailerBillingSchedules, firstBillingDate } = body;

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

    // Fetch full trailer records for all requested trailers
    const { data: trailers, error: trailerFetchError } = await supabaseClient
      .from("trailers")
      .select("id, trailer_number, type, year, make, model, rental_rate, customer_id")
      .in("id", trailerIds);

    if (trailerFetchError || !trailers?.length) {
      logStep("Failed to fetch trailer details", { trailerFetchError });
      throw new Error("Failed to fetch trailer details for the requested trailers.");
    }
    logStep("Fetched trailer records", { count: trailers.length });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get customer details
    const { data: customer, error: custError } = await supabaseClient
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();

    if (custError || !customer) throw new Error("Customer not found");
    logStep("Customer found", { customerId, email: customer.email });

    // ==========================================
    // RESOLVE STRIPE CUSTOMER FIRST, THEN MATCH PM
    // ==========================================
    let appRecord: { stripe_payment_method_id: string | null; stripe_customer_id: string | null; id: string; payment_method_type: string | null } | null = null;
    let profileIdForStripe: string | null = null;

    if (customer.email) {
      const { data: profileData } = await supabaseClient
        .from("profiles")
        .select("id")
        .ilike("email", customer.email)
        .maybeSingle();

      if (profileData?.id) {
        profileIdForStripe = profileData.id;
        const { data: appData } = await supabaseClient
          .from("customer_applications")
          .select("stripe_payment_method_id, stripe_customer_id, id, payment_method_type")
          .eq("user_id", profileData.id)
          .maybeSingle();
        appRecord = appData;
      }
    }

    // Fallback: look up by customer_id
    if (!appRecord) {
      const { data: appByCustomerId } = await supabaseClient
        .from("customer_applications")
        .select("stripe_payment_method_id, stripe_customer_id, id, payment_method_type")
        .eq("customer_id", customerId)
        .maybeSingle();
      appRecord = appByCustomerId;
    }

    logStep("Application record lookup", {
      found: !!appRecord,
      storedPmId: appRecord?.stripe_payment_method_id ?? null,
      storedStripeCustomer: appRecord?.stripe_customer_id ?? null,
      pmType: appRecord?.payment_method_type ?? null,
    });

    // --- Step 1: Resolve the Stripe Customer ---
    let stripeCustomerId: string | null = null;

    // Path 1: Try stored stripe_customer_id
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

    // Path 2: Fallback — search by email
    if (!stripeCustomerId && customer.email) {
      const stripeCustomers = await stripe.customers.list({ email: customer.email, limit: 10 });
      logStep("Email search returned Stripe customers", { count: stripeCustomers.data.length });

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
        logStep("Auto-reset payment_setup_status (no valid Stripe customer found)");
      }
      throw new Error("No valid Stripe customer with payment methods found for this email. Customer needs to re-complete payment setup.");
    }

    // Sync stripe_customer_id in DB if it changed
    if (appRecord && appRecord.stripe_customer_id !== stripeCustomerId && profileIdForStripe) {
      await supabaseClient
        .from("customer_applications")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("user_id", profileIdForStripe);
      logStep("Synced customer_applications.stripe_customer_id", { old: appRecord.stripe_customer_id, new: stripeCustomerId });
    }

    // --- Step 2: Resolve Payment Method ON this exact Stripe customer ---
    let verifiedPmId: string | null = null;

    // Check if stored PM belongs to THIS Stripe customer
    if (appRecord?.stripe_payment_method_id) {
      try {
        const pm = await stripe.paymentMethods.retrieve(appRecord.stripe_payment_method_id);
        if (pm.customer === stripeCustomerId) {
          verifiedPmId = pm.id;
          logStep("Stored PM verified — belongs to resolved Stripe customer", { pmId: pm.id });
        } else {
          logStep("Stored PM belongs to DIFFERENT Stripe customer — ignoring", {
            pmId: pm.id,
            pmCustomer: pm.customer,
            resolvedCustomer: stripeCustomerId,
          });
        }
      } catch (pmErr: any) {
        logStep("Stored PM retrieval failed — PM is dead", { pmId: appRecord.stripe_payment_method_id, error: pmErr.message });
      }
    }

    // If stored PM didn't work, search for a live PM on the resolved customer
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
          logStep(`Found live PM on Stripe customer via search`, { pmId: verifiedPmId, type: pmType });
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
        logStep("Auto-reset stale payment_setup_status", { applicationId: appRecord.id });
      }
      throw new Error("Customer's payment method is no longer valid. Their payment setup has been reset — please have them re-link ACH or card before creating a subscription.");
    }

    // Sync the verified PM back to the DB if different
    if (appRecord && appRecord.stripe_payment_method_id !== verifiedPmId) {
      await supabaseClient
        .from("customer_applications")
        .update({ stripe_payment_method_id: verifiedPmId })
        .eq("id", appRecord.id);
      logStep("Synced customer_applications.stripe_payment_method_id", { old: appRecord.stripe_payment_method_id, new: verifiedPmId });
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

    // Import shared default rate logic
    const { getDefaultRate } = await import("../_shared/billing.ts");

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
      const resolvedAnchor = perTrailerSchedule?.billing_anchor_day ?? billingAnchorDay ?? null;
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
      
      // Resolve effective billing cycle for this group from per-trailer overrides
      const firstTrailerSchedule = trailerBillingSchedules?.[groupTrailers[0].id];
      const groupBillingCycle = firstTrailerSchedule?.billing_cycle || billingCycle;
      const groupBillingInterval = intervalMap[groupBillingCycle as keyof typeof intervalMap] || billingInterval;
      
      logStep(`Processing anchor group`, { anchorDay: groupKey, trailerCount: groupTrailers.length, groupBillingCycle });

      // Create Stripe prices for this group's trailers using the GROUP's billing interval
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
        logStep("Created price for trailer", { trailerId: trailer.id, priceId: price.id, rate, group: groupKey, interval: groupBillingInterval });
      }

      // Deposit is charged ONLY via standalone invoice (Path B below).
      // We no longer add it as an add_invoice_item on the subscription to
      // prevent the dual-charge risk where both paths execute.

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
          billing_cycle: groupBillingCycle,
          billing_anchor_day: anchorDay?.toString() || "none",
        },
      };

      // Set billing cycle anchor — use explicit firstBillingDate if provided, else weekday/monthly anchor
      let anchorTimestamp: number | undefined;
      if (firstBillingDate) {
        // Admin explicitly chose the first billing date — use it directly as the anchor
        const fbDate = new Date(firstBillingDate + "T00:00:00Z");
        anchorTimestamp = Math.floor(fbDate.getTime() / 1000);
        logStep("Using explicit firstBillingDate as anchor", { firstBillingDate, anchorTimestamp, group: groupKey });
      } else if (groupBillingCycle === "weekly" && anchorDay !== null) {
        anchorTimestamp = calculateNextWeekdayAnchor(anchorDay);
        logStep("Using weekly anchor (next weekday)", { dayOfWeek: anchorDay, anchorTimestamp, group: groupKey });
      } else {
        anchorTimestamp = calculateNextAnchorDate(anchorDay);
      }
      if (anchorTimestamp) {
        subscriptionParams.billing_cycle_anchor = anchorTimestamp;
        subscriptionParams.proration_behavior = "none";
        logStep("Setting billing cycle anchor without prorations (deposit-only immediate charge)", { anchorDay, anchorTimestamp, group: groupKey });
      }

      // No add_invoice_items — deposit handled via standalone invoice below

      if (coupon) {
        subscriptionParams.discounts = [{ coupon: coupon.id }];
      }

      let subscription: Stripe.Subscription;
      try {
        subscription = await stripe.subscriptions.create(subscriptionParams);
      } catch (stripeSubErr: any) {
        const stripeMsg = stripeSubErr?.message || String(stripeSubErr);
        const stripeCode = stripeSubErr?.code || stripeSubErr?.type || "unknown";
        logStep("FATAL: stripe.subscriptions.create failed", { error: stripeMsg, code: stripeCode, stripeCustomerId, pmId: verifiedPmId });
        throw new Error(`Stripe subscription creation failed: ${stripeMsg}`);
      }
      logStep("Created Stripe subscription", { 
        subscriptionId: subscription.id, group: groupKey, anchorDay,
        trailerCount: groupTrailers.length,
        stripeStatus: subscription.status,
        latestInvoice: typeof subscription.latest_invoice === "string" ? subscription.latest_invoice : subscription.latest_invoice?.id,
      });

      // ==========================================
      // DEPOSIT: Charge as standalone invoice (single path — no dual-charge risk).
      // Uses idempotency key to prevent duplicate deposit charges.
      // ==========================================
      let depositChargedDuringCreation = false;
      let depositInvoiceResult: { paidInvoice: any; isCard: boolean; finalAmount: number } | null = null;
      if (isFirstGroup && depositAmount && depositAmount > 0) {
          logStep("Charging deposit as standalone invoice", { depositAmount });
          
          try {
            // Use the appRecord already resolved at the top of the function
            let depositPreferredType: string | null = appRecord?.payment_method_type ?? null;
            logStep("Deposit: customer preferred payment type", { depositPreferredType });

            // Resolve payment method: respect customer preference
            const cardFirst = depositPreferredType === "card";
            const primaryType = cardFirst ? "card" : "us_bank_account";
            const fallbackType = cardFirst ? "us_bank_account" : "card";

            const primaryMethods = await stripe.paymentMethods.list({
              customer: stripeCustomerId,
              type: primaryType,
              limit: 1,
            });

            let depositPaymentMethodId: string | null = primaryMethods.data[0]?.id ?? null;

            // Fallback: check other payment method type
            if (!depositPaymentMethodId) {
              const fallbackMethods = await stripe.paymentMethods.list({
                customer: stripeCustomerId,
                type: fallbackType,
                limit: 1,
              });
              depositPaymentMethodId = fallbackMethods.data[0]?.id ?? null;
              if (depositPaymentMethodId) {
                logStep(`Using ${cardFirst ? "ACH" : "card"} payment method for deposit (fallback)`, { pmId: depositPaymentMethodId });
              }
            } else {
              logStep(`Using ${cardFirst ? "card" : "ACH"} payment method for deposit (preferred)`, { pmId: depositPaymentMethodId });
            }

            // Detect card and apply surcharge
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

            // Create invoice with isolation and idempotency key to prevent duplicate deposits
            const depositInvoice = await stripe.invoices.create({
              customer: stripeCustomerId,
              auto_advance: false,
              pending_invoice_items_behavior: "exclude",
              metadata: { type: "security_deposit", subscription_id: subscription.id },
            }, {
              idempotencyKey: `${subscription.id}_deposit`,
            });

            // Attach deposit item explicitly to this invoice (with surcharge if card)
            await stripe.invoiceItems.create({
              customer: stripeCustomerId,
              invoice: depositInvoice.id,
              amount: Math.round(finalDepositAmount * 100),
              currency: "usd",
              description: isDepositCard ? `Security Deposit (includes $${depositSurcharge.toFixed(2)} card processing fee)` : "Security Deposit",
            });

            const finalizedInvoice = await stripe.invoices.finalizeInvoice(depositInvoice.id);
            logStep("Finalized standalone deposit invoice", { invoiceId: finalizedInvoice.id, amountDue: finalizedInvoice.amount_due });

            // Pay with the specific payment method if available, otherwise let Stripe use default
            const payParams: any = {};
            if (depositPaymentMethodId) payParams.payment_method = depositPaymentMethodId;
            const paidInvoice = await stripe.invoices.pay(finalizedInvoice.id, payParams);
            logStep("Standalone deposit invoice payment initiated", { invoiceId: paidInvoice.id, status: paidInvoice.status });

            depositChargedDuringCreation = true;
            depositInvoiceResult = { paidInvoice, isCard: isDepositCard, finalAmount: finalDepositAmount };
          } catch (depositError) {
            // Deposit failure is FATAL — subscription cannot proceed without payment
            const msg = depositError instanceof Error ? depositError.message : String(depositError);
            logStep("FATAL: Deposit charge failed, aborting subscription", { error: msg });
            
            // Clean up: cancel the Stripe subscription we just created
            try {
              await stripe.subscriptions.cancel(subscription.id);
              logStep("Rolled back Stripe subscription after deposit failure", { subscriptionId: subscription.id });
            } catch (cancelErr: any) {
              logStep("Warning: could not cancel Stripe subscription during rollback", { error: cancelErr.message });
            }
            
            throw new Error(`Deposit charge failed: ${msg}. Subscription was not created. Please verify the customer's payment method is valid.`);
          }
      }

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
            deposit_paid: depositChargedDuringCreation,
            deposit_paid_at: depositChargedDuringCreation ? new Date().toISOString() : null,
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
            deposit_paid: isFirstGroup ? depositChargedDuringCreation : false,
            deposit_paid_at: (isFirstGroup && depositChargedDuringCreation) ? new Date().toISOString() : null,
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
          .update({ is_rented: true, customer_id: customerId, status: "rented" })
          .eq("id", trailer.id);
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
        logStep("Created billing_history record for deposit", { subscriptionId: custSub.id });
      }

      // FIRST-PERIOD SAFETY NET: If billing anchor caused a $0 first invoice,
      // charge the first period immediately so the admin doesn't need to "Activate"
      if (isFirstGroup && custSub) {
        const invoices = await stripe.invoices.list({
          subscription: subscription.id,
          limit: 10,
        });
        const hasRealPayment = invoices.data.some(inv => inv.amount_paid > 0);

        if (!hasRealPayment) {
          logStep("No real payment on subscription — charging first period now");

          // Resolve payment method for first period charge
          let fpPaymentMethodId = verifiedPmId;
          
          // Use the appRecord already resolved at the top of the function
          let fpPreferredType: string | null = appRecord?.payment_method_type ?? null;

          const fpCardFirst = fpPreferredType === "card";
          const fpPrimaryType = fpCardFirst ? "card" : "us_bank_account";
          const fpFallbackType = fpCardFirst ? "us_bank_account" : "card";

          const fpPrimaryMethods = await stripe.paymentMethods.list({
            customer: stripeCustomerId,
            type: fpPrimaryType,
            limit: 1,
          });
          fpPaymentMethodId = fpPrimaryMethods.data[0]?.id ?? null;
          if (!fpPaymentMethodId) {
            const fpFallbackMethods = await stripe.paymentMethods.list({
              customer: stripeCustomerId,
              type: fpFallbackType,
              limit: 1,
            });
            fpPaymentMethodId = fpFallbackMethods.data[0]?.id ?? null;
          }

          if (fpPaymentMethodId) {
            await stripe.customers.update(stripeCustomerId, {
              invoice_settings: { default_payment_method: fpPaymentMethodId },
            });

            // Get subscription items to build first-period charge
            const stripeSubExpanded = await stripe.subscriptions.retrieve(subscription.id, {
              expand: ["items.data.price"],
            });

            const firstPeriodInvoice = await stripe.invoices.create({
              customer: stripeCustomerId,
              auto_advance: false,
              pending_invoice_items_behavior: "exclude",
              metadata: { type: "first_period_charge", subscription_id: subscription.id },
            });

            let totalAmount = 0;
            for (const item of stripeSubExpanded.items.data) {
              const unitAmount = item.price?.unit_amount || 0;
              if (unitAmount > 0) {
                await stripe.invoiceItems.create({
                  customer: stripeCustomerId,
                  invoice: firstPeriodInvoice.id,
                  amount: unitAmount,
                  currency: "usd",
                  description: item.price?.product
                    ? `First period - ${typeof item.price.product === "string" ? item.price.product : (item.price.product as any).name || "Lease"}`
                    : "First period charge",
                });
                totalAmount += unitAmount;
              }
            }

            // Detect card and apply surcharge
            const fpPmInfo = await stripe.paymentMethods.retrieve(fpPaymentMethodId);
            const fpIsCard = fpPmInfo.type === "card";
            if (fpIsCard && totalAmount > 0) {
              const baseAmount = totalAmount / 100;
              const adjustedAmount = Math.round(((baseAmount + 0.30) / (1 - 0.029)) * 100);
              const surcharge = adjustedAmount - totalAmount;
              if (surcharge > 0) {
                await stripe.invoiceItems.create({
                  customer: stripeCustomerId,
                  invoice: firstPeriodInvoice.id,
                  amount: surcharge,
                  currency: "usd",
                  description: "Card processing fee",
                });
                totalAmount += surcharge;
                logStep("Card surcharge applied to first period", { surcharge: surcharge / 100 });
              }
            }

            // Sanity ceiling
            const FIRST_PERIOD_CEILING_CENTS = 10000 * 100;
            if (totalAmount > FIRST_PERIOD_CEILING_CENTS) {
              logStep("First period exceeds ceiling, skipping auto-charge", { totalAmount: totalAmount / 100 });
            } else if (totalAmount > 0) {
              const finalized = await stripe.invoices.finalizeInvoice(firstPeriodInvoice.id);
              const paid = await stripe.invoices.pay(finalized.id, { payment_method: fpPaymentMethodId });
              logStep("First period invoice charged", { invoiceId: paid.id, status: paid.status, amountPaid: paid.amount_paid / 100 });

              await supabaseClient.from("billing_history").insert({
                subscription_id: custSub.id,
                amount: paid.amount_due / 100,
                net_amount: paid.amount_due / 100,
                status: "processing",
                stripe_payment_intent_id: typeof paid.payment_intent === "string"
                  ? paid.payment_intent
                  : paid.payment_intent?.id ?? null,
                stripe_invoice_id: paid.id,
                payment_method: fpIsCard ? "card" : "ach",
              });
              logStep("Created billing_history record for first period");
            }
          } else {
            logStep("Warning: no payment method found for first-period charge, will require manual activation");
          }
        }
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
