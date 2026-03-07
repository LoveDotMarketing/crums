

## Add ViewContent Meta CAPI on /lp/facebook Page Load

### Change
In `src/pages/FacebookLanding.tsx`, add a `fireMetaCapi` call for `ViewContent` inside the existing `useEffect` that runs on mount (around line 48-50), right after the `trackPageView` call.

```ts
useEffect(() => {
  trackPageView("/lp/facebook", "Facebook Landing Page");
  fireMetaCapi({
    eventName: 'ViewContent',
    sourceUrl: window.location.href,
  });
}, []);
```

Single file, single line addition. No other changes needed — the edge function and helper already support this event.

