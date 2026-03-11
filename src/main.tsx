import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { loadDeferredAnalytics } from "./lib/deferredAnalytics";
import { setLeadSourceUserProperties } from "./lib/analytics";

// Load analytics after the page is fully loaded to prevent favicon spinning
const initAnalytics = () => {
  setTimeout(() => {
    loadDeferredAnalytics();
    // Set lead source user properties after gtag is ready
    setTimeout(setLeadSourceUserProperties, 500);
  }, 100);
};

if (document.readyState === 'complete') {
  initAnalytics();
} else {
  window.addEventListener('load', initAnalytics);
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
