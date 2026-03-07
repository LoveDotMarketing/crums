// Deferred loading of third-party analytics to prevent favicon spinning
// These scripts load AFTER the window 'load' event to ensure the browser
// marks the page as "complete" before analytics begin loading

declare global {
  interface Window {
    __analyticsLoaded?: boolean;
    _linkedin_partner_id?: string;
    _linkedin_data_partner_ids?: string[];
    fbq: (...args: unknown[]) => void;
  }
}

export function loadDeferredAnalytics(): void {
  // Only run once
  if (window.__analyticsLoaded) return;
  window.__analyticsLoaded = true;

  // gtag stub is already initialized in index.html synchronously
  // This ensures tracking calls are queued even before this deferred script runs
  
  // Load Google Analytics 4
  const gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-FHB5E7Q0PK';
  
  gaScript.onload = () => {
    window.gtag('js', new Date());
    window.gtag('config', 'G-FHB5E7Q0PK');
    console.log('[Analytics] GA4 loaded successfully');
  };
  
  gaScript.onerror = () => {
    console.warn('[Analytics] GA4 script failed to load - likely blocked by ad blocker');
  };
  
  document.head.appendChild(gaScript);

  // LinkedIn Insight Tag - stub already initialized in index.html synchronously
  // Just load the actual script here
  const liScript = document.createElement('script');
  liScript.async = true;
  liScript.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
  document.head.appendChild(liScript);

  // Meta Pixel - stub already initialized in index.html synchronously
  const fbScript = document.createElement('script');
  fbScript.async = true;
  fbScript.src = 'https://connect.facebook.net/en_US/fbevents.js';
  fbScript.onload = () => {
    window.fbq('init', '1555487965511323');
    window.fbq('track', 'PageView');
    console.log('[Analytics] Meta Pixel loaded successfully');
  };
  fbScript.onerror = () => {
    console.warn('[Analytics] Meta Pixel failed to load - likely blocked by ad blocker');
  };
  document.head.appendChild(fbScript);
}
