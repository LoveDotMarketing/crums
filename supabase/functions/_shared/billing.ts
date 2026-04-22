/**
 * Shared billing utilities used across edge functions.
 * Single source of truth for rates, intervals, surcharge logic, and Stripe client selection.
 */
import Stripe from "https://esm.sh/stripe@18.5.0";

/** Default rental rate by trailer type */
export const getDefaultRate = (trailerType: string): number => {
  const type = trailerType?.toLowerCase() || "";
  if (type.includes("flat") || type.includes("flatbed")) return 750;
  if (type.includes("refrigerated") || type.includes("reefer")) return 850;
  return 700; // Dry Van default
};

/** Stripe billing interval map */
export const intervalMap = {
  weekly: { interval: "week" as const, interval_count: 1 },
  biweekly: { interval: "week" as const, interval_count: 2 },
  semimonthly: { interval: "week" as const, interval_count: 2 }, // Legacy alias — actually biweekly (26×/yr)
  monthly: { interval: "month" as const, interval_count: 1 },
} as const;

/**
 * Calculate card surcharge using reverse formula so the merchant nets the base amount.
 * adjustedAmount = (base + 0.30) / (1 − 0.029)
 */
export function calculateCardSurcharge(baseAmount: number): {
  adjustedAmount: number;
  surcharge: number;
} {
  const adjustedAmount = Math.round(((baseAmount + 0.30) / (1 - 0.029)) * 100) / 100;
  const surcharge = Math.round((adjustedAmount - baseAmount) * 100) / 100;
  return { adjustedAmount, surcharge };
}

// ============================================================================
// Per-subscription Stripe client selection (live vs sandbox/test)
// ============================================================================

export type StripeMode = "live" | "test";

export interface SubscriptionLike {
  sandbox?: boolean | null;
  stripe_customer_id?: string | null;
  sandbox_stripe_customer_id?: string | null;
}

// Cache clients per cold-start
let _liveClient: Stripe | null = null;
let _testClient: Stripe | null = null;

function getLiveClient(): Stripe {
  if (!_liveClient) {
    const key = Deno.env.get("STRIPE_SECRET_KEY");
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _liveClient = new Stripe(key, { apiVersion: "2025-08-27.basil" });
  }
  return _liveClient;
}

function getTestClient(): Stripe {
  if (!_testClient) {
    const key = Deno.env.get("STRIPE_TEST_SECRET_KEY");
    if (!key) {
      throw new Error(
        "STRIPE_TEST_SECRET_KEY is not configured. Set it before flipping a subscription to sandbox.",
      );
    }
    _testClient = new Stripe(key, { apiVersion: "2025-08-27.basil" });
  }
  return _testClient;
}

/**
 * Returns the appropriate Stripe client + customer ID for a subscription based on its sandbox flag.
 * - sandbox=true → test client + sandbox_stripe_customer_id (throws if either is missing)
 * - sandbox=false (or null) → live client + stripe_customer_id
 */
export function getStripeClient(subscription: SubscriptionLike): {
  stripe: Stripe;
  mode: StripeMode;
  customerId: string | null;
} {
  if (subscription?.sandbox === true) {
    if (!subscription.sandbox_stripe_customer_id) {
      throw new Error(
        "Subscription is in sandbox mode but has no sandbox_stripe_customer_id. " +
          "Create a test-mode customer in Stripe and set this field.",
      );
    }
    return {
      stripe: getTestClient(),
      mode: "test",
      customerId: subscription.sandbox_stripe_customer_id,
    };
  }
  return {
    stripe: getLiveClient(),
    mode: "live",
    customerId: subscription?.stripe_customer_id ?? null,
  };
}

/** Build a test-mode Stripe client (used by the webhook when verifying test signatures). Returns null if not configured. */
export function getTestClientOrNull(): Stripe | null {
  try {
    return getTestClient();
  } catch {
    return null;
  }
}

/** Build a live-mode Stripe client. */
export function getLiveStripeClient(): Stripe {
  return getLiveClient();
}
