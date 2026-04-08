

## Plan: Move Source Tag Before Name in Email Subject

### Change

**File: `supabase/functions/send-contact-email/index.ts`** — line 276

Current:
```
New Quote Request from Juan - trailer-leasing
```

New format:
```
[GPaid - texas-dry-van] Request from Juan - trailer-leasing
```

Replace line 276 with:

```typescript
const source = inferSource(formData);
const sourceLabel = source === 'Google (paid)' ? 'GPaid'
  : source === 'Google (organic)' ? 'Organic'
  : source === 'Bing (organic)' ? 'Bing'
  : source;
const campaignSuffix = formData.utm_campaign ? ` - ${escapeHtml(formData.utm_campaign)}` : '';
const sourceTag = `[${sourceLabel}${campaignSuffix}]`;
const emailSubject = `${sourceTag} Request from ${safeName} - ${safeService}`;
```

### Examples
- `[GPaid - texas-dry-van] Request from Juan - trailer-leasing`
- `[Organic] Request from Stevie - trailer-leasing`
- `[LinkedIn] Request from Omar - Trailer Rentals`
- `[Direct] Request from Kendall - trailer-leasing`
- `[Facebook - spring-promo] Request from Gurminder - trailer-leasing`

Single file change, ~6 lines replacing 1 line.

