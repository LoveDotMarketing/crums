import { useEffect, useRef } from "react";

/**
 * Injects JSON-LD structured data directly into the DOM via document.head,
 * bypassing react-helmet-async to avoid schema conflicts and ensure
 * crawlers always see the structured data.
 */
export const useStructuredData = (schema: object | object[] | undefined) => {
  const scriptRefs = useRef<HTMLScriptElement[]>([]);

  useEffect(() => {
    // Clean up any previous scripts from this hook instance
    scriptRefs.current.forEach((el) => {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
    scriptRefs.current = [];

    if (!schema) return;

    const schemas = Array.isArray(schema) ? schema : [schema];

    schemas.forEach((s) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.text = JSON.stringify(s);
      script.setAttribute("data-structured-data", "true");
      document.head.appendChild(script);
      scriptRefs.current.push(script);
    });

    return () => {
      scriptRefs.current.forEach((el) => {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
      scriptRefs.current = [];
    };
  }, [schema]);
};
