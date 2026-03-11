// Google Analytics 4 Tracking Utilities
// Measurement ID: G-FHB5E7Q0PK
// Last updated: January 2025

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
    __analyticsLoaded?: boolean;
    _linkedin_partner_id?: string;
    _linkedin_data_partner_ids?: string[];
    fbq: (...args: unknown[]) => void;
  }
}

// Track page views (for SPA navigation)
export const trackPageView = (path: string, title?: string, pageType?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const params: Record<string, string> = {
      page_path: path,
      page_title: title || document.title,
    };
    if (pageType) params.page_type = pageType;
    window.gtag('config', 'G-FHB5E7Q0PK', params);
    console.log('[Analytics] Page view tracked:', path);
  }
};

// Track custom events
export const trackEvent = (
  eventName: string,
  parameters?: Record<string, string | number | boolean>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

// Pre-defined event trackers for common actions
export const trackFormSubmission = (formName: string, success: boolean = true) => {
  trackEvent('form_submit', {
    form_name: formName,
    success: success,
  });
};

export const trackConversion = (
  conversionType: 'signup' | 'quote_request' | 'rental_request' | 'application_submit',
  value?: number
) => {
  trackEvent('conversion', {
    conversion_type: conversionType,
    value: value || 0,
  });
};

export const trackLogin = (method: string = 'email') => {
  trackEvent('login', { method });
};

export const trackSignup = (method: string = 'email') => {
  trackEvent('sign_up', { method });
};

export const trackReferralAction = (action: 'copy_code' | 'share_code', code?: string) => {
  trackEvent('referral_action', {
    action,
    referral_code: code || '',
  });
};

export const trackOutboundLink = (url: string) => {
  trackEvent('click', {
    event_category: 'outbound',
    event_label: url,
  });
};

// Phone click tracking
export const trackPhoneClick = (location: string) => {
  trackEvent('phone_click', {
    event_category: 'engagement',
    location,
    phone_number: '(888) 570-4564',
    page_path: window.location.pathname,
    page_title: document.title,
  });
};

// Form funnel tracking
export const trackFormStart = (formName: string, firstField?: string) => {
  trackEvent('form_start', {
    form_name: formName,
    first_field: firstField || '',
  });
};

export const trackFormProgress = (formName: string, section: string, completionPercent: number) => {
  trackEvent('form_progress', {
    form_name: formName,
    section,
    completion_percent: completionPercent,
  });
};

// Signup funnel tracking
export const trackSignupStarted = (source: string) => {
  trackEvent('signup_started', { source });
};

export const trackSignupFailed = (errorType: string) => {
  trackEvent('signup_failed', { error_type: errorType });
};

// Application tracking
export const trackApplicationStarted = () => {
  trackEvent('application_started', { event_category: 'conversion' });
};

export const trackApplicationSectionComplete = (section: string) => {
  trackEvent('application_section_complete', {
    event_category: 'conversion',
    section,
  });
};

// CTA clicks
export const trackCtaClick = (buttonText: string, page: string, destination?: string) => {
  trackEvent('cta_click', {
    cta_text: buttonText,
    cta_location: page,
    destination: destination || '',
  });
};

// Calculator usage
export const trackCalculatorUse = (calculatorType: string, hasResult: boolean) => {
  trackEvent('calculator_use', {
    calculator_type: calculatorType,
    has_result: hasResult,
  });
};

// Chatbot interactions
export const trackChatbotOpen = () => {
  trackEvent('chatbot_open', { event_category: 'engagement' });
};

export const trackChatbotMessage = () => {
  trackEvent('chatbot_message_sent', { event_category: 'engagement' });
};

// Scroll depth tracking
export const trackScrollDepth = (pageName: string, depth: number) => {
  trackEvent('scroll_depth', {
    page_name: pageName,
    percent_scrolled: depth,
    event_category: 'engagement',
    page_path: window.location.pathname,
  });
};

// Set GA4 user properties from lead source session data
export const setLeadSourceUserProperties = () => {
  if (typeof window === 'undefined' || !window.gtag) return;
  try {
    const raw = sessionStorage.getItem('crums_lead_source');
    if (!raw) return;
    const data = JSON.parse(raw) as Record<string, string | undefined>;
    const props: Record<string, string> = {};
    if (data.utm_source) props.lead_utm_source = data.utm_source;
    if (data.utm_medium) props.lead_utm_medium = data.utm_medium;
    if (data.utm_campaign) props.lead_utm_campaign = data.utm_campaign;
    if (data.utm_term) props.lead_utm_term = data.utm_term;
    if (data.utm_content) props.lead_utm_content = data.utm_content;
    if (data.referrer) props.lead_referrer = data.referrer;
    if (data.landing_page) props.lead_landing_page = data.landing_page;
    if (Object.keys(props).length > 0) {
      window.gtag('set', 'user_properties', props);
    }
  } catch {
    // silently fail
  }
};

// Meta Pixel event tracking (with optional eventID for server-side deduplication)
export const trackFacebookEvent = (
  eventName: string,
  parameters?: Record<string, string | number | boolean>,
  eventID?: string
) => {
  if (typeof window !== 'undefined' && window.fbq) {
    const opts = eventID ? { eventID } : undefined;
    if (parameters) {
      window.fbq('track', eventName, parameters, opts);
    } else {
      window.fbq('track', eventName, {}, opts);
    }
    console.log('[Analytics] Meta Pixel event:', eventName, eventID ? `(eventID: ${eventID})` : '');
  }
};

// Reusable Meta CAPI + Pixel helper with deduplication
export interface FireMetaCapiOptions {
  eventName: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  sourceUrl?: string;
  customData?: Record<string, string | number>;
  pixelParams?: Record<string, string | number | boolean>;
}

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export const fireMetaCapi = (options: FireMetaCapiOptions) => {
  const eventId = crypto.randomUUID();

  // Browser pixel
  trackFacebookEvent(options.eventName, options.pixelParams, eventId);

  // Server-side CAPI (non-blocking, direct fetch to avoid dynamic import issues)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (supabaseUrl && supabaseKey) {
    fetch(`${supabaseUrl}/functions/v1/meta-capi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
      },
      body: JSON.stringify({
        eventName: options.eventName,
        eventId,
        email: options.email,
        phone: options.phone,
        firstName: options.firstName,
        lastName: options.lastName,
        city: options.city,
        state: options.state,
        zipCode: options.zipCode,
        sourceUrl: options.sourceUrl || (typeof window !== 'undefined' ? window.location.href : undefined),
        clientUserAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        fbc: getCookie('_fbc'),
        fbp: getCookie('_fbp'),
        customData: options.customData,
      }),
    }).catch((err) => console.warn('[Meta CAPI] fetch failed:', err));
  }
};

// GA4 Dashboard URL for admin reference
export const GA4_DASHBOARD_URL = 'https://analytics.google.com/analytics/web/#/a377323275p515941987/reports/intelligenthome?params=_u..nav%3Dmaui';
