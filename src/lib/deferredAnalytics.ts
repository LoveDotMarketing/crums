// Deferred loading of third-party analytics to prevent favicon spinning
// These scripts load AFTER the window 'load' event to ensure the browser
// marks the page as "complete" before analytics begin loading

declare global {
  interface Window {
    __analyticsLoaded?: boolean;
    _linkedin_partner_id?: string;
    _linkedin_data_partner_ids?: string[];
  }
}

export function loadDeferredAnalytics(): void {
  // Only run once
  if (window.__analyticsLoaded) return;
  window.__analyticsLoaded = true;

  // Initialize dataLayer and gtag IMMEDIATELY (before script loads)
  // This ensures tracking calls are queued even if script hasn't loaded yet
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(...args: unknown[]) { 
    window.dataLayer.push(args); 
  };

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

  // Load LinkedIn Insight Tag
  window._linkedin_partner_id = "8556244";
  window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
  window._linkedin_data_partner_ids.push(window._linkedin_partner_id);

  // Initialize lintrk queue before script loads
  if (!window.lintrk) {
    window.lintrk = function(a: string, b?: { conversion_id: number }) {
      window.lintrk.q = window.lintrk.q || [];
      window.lintrk.q.push([a, b]);
    };
    window.lintrk.q = [];
  }

  const liScript = document.createElement('script');
  liScript.async = true;
  liScript.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
  document.head.appendChild(liScript);
}
