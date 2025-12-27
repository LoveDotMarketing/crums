import { useEffect, useRef } from 'react';
import { trackScrollDepth } from '@/lib/analytics';

const SCROLL_THRESHOLDS = [25, 50, 75, 100];

export const useScrollDepthTracking = (pageName: string) => {
  const trackedThresholds = useRef<Set<number>>(new Set());

  useEffect(() => {
    // Reset tracked thresholds when page changes
    trackedThresholds.current = new Set();

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollHeight > 0 
        ? Math.round((window.scrollY / scrollHeight) * 100) 
        : 0;

      SCROLL_THRESHOLDS.forEach((threshold) => {
        if (scrollPercent >= threshold && !trackedThresholds.current.has(threshold)) {
          trackedThresholds.current.add(threshold);
          trackScrollDepth(pageName, threshold);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Check initial scroll position
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pageName]);
};
