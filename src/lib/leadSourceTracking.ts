/**
 * Lead Source Tracking Utility
 * Captures UTM parameters, referrer, and landing page for attribution tracking
 * v2 - cleaned up for proper module resolution
 */

const STORAGE_KEY = 'crums_lead_source';

export interface LeadSourceData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  landing_page?: string;
  current_page?: string;
}

/**
 * Extract UTM parameters from the current URL
 */
function getUtmParams(): Partial<LeadSourceData> {
  const params = new URLSearchParams(window.location.search);
  
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_term: params.get('utm_term') || undefined,
    utm_content: params.get('utm_content') || undefined,
  };
}

/**
 * Get the referrer, filtering out internal navigation
 */
function getExternalReferrer(): string | undefined {
  const referrer = document.referrer;
  
  if (!referrer) return undefined;
  
  // Filter out internal referrers (same domain)
  try {
    const referrerUrl = new URL(referrer);
    const currentUrl = new URL(window.location.href);
    
    if (referrerUrl.hostname === currentUrl.hostname) {
      return undefined;
    }
    
    return referrer;
  } catch {
    return referrer;
  }
}

/**
 * Capture lead source data on first page load
 * Should be called once when the app initializes
 */
export function captureLeadSource(): void {
  // Check if we already have captured source data this session
  const existingData = sessionStorage.getItem(STORAGE_KEY);
  
  if (existingData) {
    // Already captured for this session, don't overwrite first-touch data
    return;
  }
  
  const utmParams = getUtmParams();
  const referrer = getExternalReferrer();
  const landingPage = window.location.pathname;
  
  // Only store if we have meaningful data
  const hasUtmData = Object.values(utmParams).some(v => v !== undefined);
  const hasReferrer = referrer !== undefined;
  
  if (hasUtmData || hasReferrer) {
    const sourceData: LeadSourceData = {
      ...utmParams,
      referrer,
      landing_page: landingPage,
    };
    
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sourceData));
  } else {
    // Store just the landing page for organic/direct visits
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      landing_page: landingPage,
    }));
  }
}

/**
 * Get all captured lead source data for form submission
 * Returns the first-touch attribution data plus current page
 */
export function getLeadSourceData(): LeadSourceData {
  const storedData = sessionStorage.getItem(STORAGE_KEY);
  
  let sourceData: LeadSourceData = {};
  
  if (storedData) {
    try {
      sourceData = JSON.parse(storedData);
    } catch {
      // Invalid JSON, ignore
    }
  }
  
  // Always include current page at time of form submission
  sourceData.current_page = window.location.pathname;
  
  return sourceData;
}

/**
 * Infer the source type for display purposes
 */
export function inferSourceType(data: LeadSourceData): string {
  if (data.utm_source) {
    const source = data.utm_source.toLowerCase();
    const medium = data.utm_medium?.toLowerCase() || '';
    
    if (medium === 'cpc' || medium === 'ppc' || medium === 'paid') {
      return `${source} (paid)`;
    }
    
    return source;
  }
  
  if (data.referrer) {
    try {
      const url = new URL(data.referrer);
      const hostname = url.hostname.toLowerCase();
      
      if (hostname.includes('google')) return 'Google (organic)';
      if (hostname.includes('bing')) return 'Bing (organic)';
      if (hostname.includes('yahoo')) return 'Yahoo (organic)';
      if (hostname.includes('facebook') || hostname.includes('fb.com')) return 'Facebook';
      if (hostname.includes('linkedin')) return 'LinkedIn';
      if (hostname.includes('twitter') || hostname.includes('x.com')) return 'X/Twitter';
      
      return hostname;
    } catch {
      return 'Referral';
    }
  }
  
  return 'Direct';
}
