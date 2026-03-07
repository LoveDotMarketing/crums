

## Add Meta Conversions API (Server-Side)

### Overview
Create a new backend function that sends `Lead` events server-side to Meta's Graph API, mirroring the LinkedIn CAPI pattern. Both browser pixel and server event share a deduplication `event_id`.

### Secret
- **`META_CAPI_TOKEN`** — I'll prompt you to add it.

### Changes

**1. New backend function: `supabase/functions/meta-capi/index.ts`**
- No JWT required (Facebook landing page is public/unauthenticated)
- Accepts: `eventName`, `eventId`, `email`, `phone`, `firstName`, `sourceUrl`
- SHA256-hashes all PII per Meta's requirements
- POSTs to `https://graph.facebook.com/v21.0/1555487965511323/events`
- Always returns 200 to never block the user flow

**2. `supabase/config.toml`** — Add `verify_jwt = false` for `meta-capi`

**3. `src/lib/analytics.ts`** — Update `trackFacebookEvent` to accept optional `eventID` for deduplication

**4. `src/pages/FacebookLanding.tsx`**
- Generate a UUID `eventId` before submission
- Pass it to both `trackFacebookEvent('Lead', undefined, eventId)` (browser pixel) and invoke `meta-capi` with the same ID plus PII (email, phone, name)
- Fire both calls in parallel (non-blocking)

### Deduplication
Both browser pixel and server event share the same `event_id` so Meta automatically deduplicates — no double-counting.

