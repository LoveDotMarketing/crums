// LinkedIn Insight Tag Tracking Utilities

declare global {
  interface Window {
    lintrk: (action: string, data: { conversion_id: number }) => void;
  }
}

// Conversion IDs from LinkedIn Campaign Manager
// These will be populated when user provides them
export const LINKEDIN_CONVERSIONS = {
  QUOTE_REQUEST: 23575820,
  SIGNUP: 23575828,
  APPLICATION_SUBMIT: 23575836,
} as const;

/**
 * Track LinkedIn conversion via Insight Tag (browser-based)
 */
export const trackLinkedInConversion = (conversionId: number) => {
  if (typeof window !== 'undefined' && window.lintrk && conversionId > 0) {
    try {
      window.lintrk('track', { conversion_id: conversionId });
      console.log('[LinkedIn] Tracked conversion:', conversionId);
    } catch (error) {
      console.error('[LinkedIn] Failed to track conversion:', error);
    }
  }
};

/**
 * Track quote request conversion
 */
export const trackLinkedInQuoteRequest = () => {
  trackLinkedInConversion(LINKEDIN_CONVERSIONS.QUOTE_REQUEST);
};

/**
 * Track signup conversion
 */
export const trackLinkedInSignup = () => {
  trackLinkedInConversion(LINKEDIN_CONVERSIONS.SIGNUP);
};

/**
 * Track application submission conversion
 */
export const trackLinkedInApplicationSubmit = () => {
  trackLinkedInConversion(LINKEDIN_CONVERSIONS.APPLICATION_SUBMIT);
};
