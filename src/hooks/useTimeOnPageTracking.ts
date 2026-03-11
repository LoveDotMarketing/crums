import { useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/analytics';

// Track time milestones in seconds
const TIME_MILESTONES = [30, 60, 120, 300]; // 30s, 1min, 2min, 5min

export const useTimeOnPageTracking = (pageName: string) => {
  const startTime = useRef<number>(Date.now());
  const trackedMilestones = useRef<Set<number>>(new Set());
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset on page change
    startTime.current = Date.now();
    trackedMilestones.current = new Set();

    const checkMilestones = () => {
      const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);

      TIME_MILESTONES.forEach((milestone) => {
        if (timeSpent >= milestone && !trackedMilestones.current.has(milestone)) {
          trackedMilestones.current.add(milestone);
          trackEvent('time_on_page_milestone', {
            page_name: pageName,
            seconds: milestone,
            event_category: 'engagement',
            page_path: window.location.pathname,
          });
        }
      });
    };

    // Check every 10 seconds
    intervalRef.current = window.setInterval(checkMilestones, 10000);

    // Track when user leaves the page
    const handleBeforeUnload = () => {
      const totalTime = Math.floor((Date.now() - startTime.current) / 1000);
      trackEvent('time_on_page', {
        page_name: pageName,
        seconds: totalTime,
        event_category: 'engagement',
      });
    };

    // Track when visibility changes (user switches tabs)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const totalTime = Math.floor((Date.now() - startTime.current) / 1000);
        trackEvent('time_on_page', {
          page_name: pageName,
          seconds: totalTime,
          event_category: 'engagement',
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Track final time when navigating away via React Router
      const totalTime = Math.floor((Date.now() - startTime.current) / 1000);
      if (totalTime > 0) {
        trackEvent('time_on_page', {
          page_name: pageName,
          seconds: totalTime,
          event_category: 'engagement',
        });
      }
    };
  }, [pageName]);
};
