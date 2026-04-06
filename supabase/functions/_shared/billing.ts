/**
 * Shared billing utilities used across edge functions.
 * Single source of truth for rates, intervals, and surcharge logic.
 */

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
