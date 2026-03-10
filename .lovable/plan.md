

# Update LinkedIn Quote Request Conversion ID

## Problem
The current conversion ID `23575820` maps to an old, inactive "Quote Request" conversion in LinkedIn Campaign Manager. The active "Quote Request - LP" conversion uses ID `24682812`.

## Change
**File:** `src/lib/linkedinAnalytics.ts`
- Update `QUOTE_REQUEST` from `23575820` to `24682812` in the `LINKEDIN_CONVERSIONS` constant.

That's it — one line change. The `trackLinkedInQuoteRequest()` function and the thank-you page already call this constant, so they'll automatically use the new ID.

