// Google Analytics 4 Tracking Utilities
// Measurement ID: G-FHB5E7Q0PK
// Last updated: December 2024

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

// Phone click tracking
export const trackPhoneClick = (location: string) => {
  trackEvent('phone_click', {
    event_category: 'engagement',
    location,
    phone_number: '(888) 570-4564',
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
    button_text: buttonText,
    page,
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
  });
};

// GA4 Dashboard URL for admin reference
export const GA4_DASHBOARD_URL = 'https://analytics.google.com/analytics/web/#/a377323275p515941987/reports/intelligenthome?params=_u..nav%3Dmaui';
