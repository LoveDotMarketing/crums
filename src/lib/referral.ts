import { supabase } from "@/integrations/supabase/client";

export interface ReferralResult {
  success: boolean;
  error?: string;
  referral_id?: string;
}

export interface ProcessReferralResult {
  success: boolean;
  message: string;
  variant: "default" | "destructive";
}

/**
 * Validates the format of a CRUMS referral code
 * Format: CRUMS-XXXXXX (6 alphanumeric characters)
 */
export const isValidReferralCodeFormat = (code: string): boolean => {
  if (!code || !code.trim()) return false;
  const pattern = /^CRUMS-[A-Z0-9]{6}$/;
  return pattern.test(code.toUpperCase().trim());
};

/**
 * Normalizes a referral code to uppercase and trimmed
 */
export const normalizeReferralCode = (code: string): string => {
  return code.trim().toUpperCase();
};

/**
 * Maps backend error messages to user-friendly messages
 */
export const getReferralErrorMessage = (error: string): { message: string; variant: "default" | "destructive" } => {
  switch (error) {
    case "You cannot refer yourself":
      return {
        message: "Oops! You can't use your own referral code. Ask a friend to share theirs!",
        variant: "destructive",
      };
    case "This email has already been referred":
      return {
        message: "This email has already been referred by another customer.",
        variant: "default",
      };
    case "Invalid or inactive referral code":
      return {
        message: "This referral code is invalid or no longer active.",
        variant: "destructive",
      };
    default:
      return {
        message: error,
        variant: "destructive",
      };
  }
};

/**
 * Processes a referral code during signup
 * @param referralCode - The referral code entered by the user
 * @param email - The email of the user signing up
 * @returns ProcessReferralResult with success status, message, and toast variant
 */
export const processReferralCode = async (
  referralCode: string,
  email: string
): Promise<ProcessReferralResult | null> => {
  const normalizedCode = normalizeReferralCode(referralCode);
  
  if (!normalizedCode) {
    return null; // No code provided, nothing to process
  }

  try {
    const { data: referralResult, error: referralError } = await supabase.rpc(
      "create_referral",
      {
        p_referral_code: normalizedCode,
        p_referred_email: email,
      }
    );

    if (referralError) {
      console.error("Referral RPC error:", referralError);
      return {
        success: false,
        message: "Failed to process referral code. Please try again later.",
        variant: "destructive",
      };
    }

    if (referralResult) {
      const result = referralResult as unknown as ReferralResult;
      
      if (result.success) {
        return {
          success: true,
          message: "Referral code applied! You'll receive $250 off after lease approval.",
          variant: "default",
        };
      }
      
      if (result.error) {
        const { message, variant } = getReferralErrorMessage(result.error);
        return {
          success: false,
          message,
          variant,
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Referral processing error:", error);
    return null; // Non-critical, don't block signup flow
  }
};
