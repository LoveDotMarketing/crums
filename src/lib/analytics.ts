// Google Analytics 4 Tracking Utilities
// Measurement ID: G-FHB5E7Q0PK

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Track page views (for SPA navigation)
export const trackPageView = (path: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-FHB5E7Q0PK', {
      page_path: path,
      page_title: title || document.title,
    });
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

// GA4 Dashboard URL for admin reference
export const GA4_DASHBOARD_URL = 'https://analytics.google.com/analytics/web/#/p478449955/reports/intelligenthome';
