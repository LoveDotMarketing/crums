// LinkedIn Insight Tag Tracking Utilities

interface LinkTrkFunction {
  (action: string, data?: { conversion_id: number }): void;
  q?: [string, { conversion_id: number } | undefined][];
}

declare global {
  interface Window {
    lintrk: LinkTrkFunction;
  }
}

// Conversion IDs from LinkedIn Campaign Manager
// These will be populated when user provides them
export const LINKEDIN_CONVERSIONS = {
  PAGE_VIEW: 23575812,
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

/**
 * Track landing page view (ad click-through)
 */
export const trackLinkedInPageView = () => {
  trackLinkedInConversion(LINKEDIN_CONVERSIONS.PAGE_VIEW);
};
