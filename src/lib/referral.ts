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

export interface ValidationResult {
  valid: boolean;
  error?: string;
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
  const trimmed = code.trim().toUpperCase();
  // Auto-prepend CRUMS- if user entered just the 6-char suffix
  if (/^[A-Z0-9]{6}$/.test(trimmed)) {
    return `CRUMS-${trimmed}`;
  }
  return trimmed;
};

/**
 * Validates a referral code format and returns detailed validation result
 * Use this for client-side validation before making RPC calls
 */
export const validateReferralCode = (code: string): ValidationResult => {
  if (!code || !code.trim()) {
    return { valid: false, error: "Please enter a referral code" };
  }

  const normalizedCode = normalizeReferralCode(code);

  // Check for CRUMS prefix
  if (!normalizedCode.startsWith("CRUMS-")) {
    return { 
      valid: false, 
      error: "Referral codes start with 'CRUMS-' (e.g., CRUMS-ABC123)" 
    };
  }

  // Check suffix length
  const suffix = normalizedCode.replace("CRUMS-", "");
  if (suffix.length !== 6) {
    return { 
      valid: false, 
      error: "Referral code should be in format CRUMS-XXXXXX (6 characters after dash)" 
    };
  }

  // Check for valid characters (alphanumeric only)
  if (!/^[A-Z0-9]+$/.test(suffix)) {
    return { 
      valid: false, 
      error: "Referral code can only contain letters and numbers" 
    };
  }

  return { valid: true };
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
 * Validates format first, then makes RPC call to create referral
 * @param referralCode - The referral code entered by the user
 * @param email - The email of the user signing up
 * @returns ProcessReferralResult with success status, message, and toast variant
 */
/**
 * Checks if a code belongs to a partner (not a customer referral code).
 * Returns the partner id if found, null otherwise.
 */
export const checkPartnerCode = async (code: string): Promise<string | null> => {
  const { data } = await supabase
    .from("partners")
    .select("id")
    .eq("referral_code", code.toUpperCase().trim())
    .eq("is_active", true)
    .maybeSingle();
  return data?.id || null;
};

/**
 * Checks if a code belongs to a staff member.
 * Returns the staff_profile id if found, null otherwise.
 */
export const checkStaffCode = async (code: string): Promise<string | null> => {
  const { data } = await supabase
    .from("staff_profiles")
    .select("id")
    .eq("referral_code", code.toUpperCase().trim())
    .eq("is_active", true)
    .maybeSingle();
  return data?.id || null;
};

/**
 * Processes a referral code during signup.
 * Checks partner codes first, then customer referral codes.
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

  // Check if this is a partner code first (partner codes don't follow CRUMS-XXXXXX format)
  const partnerId = await checkPartnerCode(normalizedCode);
  if (partnerId) {
    // Partner code — store partner_id on subscription when it's created
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pending_partner_id", partnerId);
      sessionStorage.setItem("pending_partner_code", normalizedCode);
    }
    return {
      success: true,
      message: `Partner code ${normalizedCode} recognized! Your account will be linked to this partner.`,
      variant: "default",
    };
  }

  // Check if this is a staff referral code
  const staffProfileId = await checkStaffCode(normalizedCode);
  if (staffProfileId) {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pending_staff_referral_id", staffProfileId);
    }
    return {
      success: true,
      message: `Referral code ${normalizedCode} recognized! Your application will be linked to your sales rep.`,
      variant: "default",
    };
  }

  // Validate customer referral code format before making RPC call (fail fast)
  const validation = validateReferralCode(normalizedCode);
  if (!validation.valid) {
    return {
      success: false,
      message: validation.error || "Invalid referral code format",
      variant: "destructive",
    };
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

