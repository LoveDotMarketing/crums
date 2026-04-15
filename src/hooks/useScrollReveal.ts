import { useEffect, useCallback, useRef } from "react";

export function useScrollReveal() {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef<Set<Element>>(new Set());

  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isDesktop || prefersReduced) {
      // Immediately reveal all registered elements on mobile or reduced motion
      elementsRef.current.forEach((el) => {
        el.setAttribute("data-revealed", "true");
      });
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-revealed", "true");
            observerRef.current?.unobserve(entry.target);
            elementsRef.current.delete(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );

    // Observe any elements already registered
    elementsRef.current.forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const ref = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    elementsRef.current.add(el);
    observerRef.current?.observe(el);
  }, []);

  return ref;
}
