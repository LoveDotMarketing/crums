

## Fix: Lead Source "Direct" Label When Referrer is Google

### Problem
In `send-contact-email/index.ts` line 281, the Source field uses `formData.utm_source || 'Direct'`. When someone arrives from Google organic search, there's no `utm_source` — only a `referrer` of `https://www.google.com/`. So it incorrectly shows "Direct" instead of "Google (organic)".

### Solution
Add inline source inference logic in the edge function that checks the referrer when `utm_source` is missing — mirroring the `inferSourceType` logic from the frontend.

### Change

**File: `supabase/functions/send-contact-email/index.ts`**

Add a helper function that determines the display source:

```typescript
function inferSource(data: any): string {
  if (data.landing_page?.startsWith('/lp/')) return 'Google (paid)';
  if (data.utm_source) {
    const medium = (data.utm_medium || '').toLowerCase();
    if (['cpc', 'ppc', 'paid'].includes(medium)) return `${data.utm_source} (paid)`;
    return data.utm_source;
  }
  if (data.referrer) {
    try {
      const hostname = new URL(data.referrer).hostname.toLowerCase();
      if (hostname.includes('syndicatedsearch')) return 'Google (paid)';
      if (hostname.includes('google')) return 'Google (organic)';
      if (hostname.includes('bing')) return 'Bing (organic)';
      if (hostname.includes('yahoo')) return 'Yahoo (organic)';
      if (hostname.includes('facebook') || hostname.includes('fb.com')) return 'Facebook';
      if (hostname.includes('linkedin')) return 'LinkedIn';
      if (hostname.includes('twitter') || hostname.includes('x.com')) return 'X/Twitter';
      return hostname;
    } catch { return 'Referral'; }
  }
  return 'Direct';
}
```

Then replace line 281:
```
- formData.utm_source || 'Direct'
+ inferSource(formData)
```

### Files
| File | Action |
|------|--------|
| `supabase/functions/send-contact-email/index.ts` | Modify — add `inferSource` helper, use it for the Source field |

