import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { loadDeferredAnalytics } from "./lib/deferredAnalytics";

// Load analytics after the page is fully loaded to prevent favicon spinning
if (document.readyState === 'complete') {
  setTimeout(loadDeferredAnalytics, 100);
} else {
  window.addEventListener('load', () => {
    setTimeout(loadDeferredAnalytics, 100);
  });
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
