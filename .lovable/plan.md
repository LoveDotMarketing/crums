

## Expand Meta CAPI to All Required Events

### Overview
Meta has defined 12 events for complete Conversions API coverage. The current implementation only fires `Lead`. This plan maps each Meta event to your existing user actions and updates the edge function + frontend to fire them server-side with deduplication.

### Event-to-Page Mapping

| Meta Event | Where It Fires | Page/Component |
|---|---|---|
| **Lead** | Facebook landing form submit | `FacebookLanding.tsx` *(already done)* |
| **Contact** | Contact form submit | `Contact.tsx` |
| **CompleteRegistration** | Account signup complete | `GetStarted.tsx` |
| **SubmitApplication** | Application form submit | `customer/Application.tsx` |
| **AddPaymentInfo** | ACH/payment setup complete | `customer/PaymentSetup.tsx` |
| **InitiateCheckout** | Customer starts checkout flow | `customer/TrailerCheckout.tsx` |
| **Purchase** | Subscription activated / first payment | `customer/CheckoutComplete.tsx` or admin activation |
| **Schedule** | Rental request or dropoff scheduled | `customer/RentalRequest.tsx` |
| **Search** | Resource/tool search or trailer search | Could defer — low priority |
| **ViewContent** | Key landing pages (trailer pages, services) | `Index.tsx`, trailer pages |
| **FindLocation** | Locations page visit | `Locations.tsx` |
| **CustomizeProduct** | Calculator/tool usage | Resource calculators |
| **StartTrial** | Not applicable (no free trials) — skip or map to lease-to-own inquiry | Can skip |

### Changes

**1. Update `supabase/functions/meta-capi/index.ts`**
- Add support for optional `custom_data` (currency, value) for Purchase events
- Add `client_user_agent` pass-through (unhashed, per Meta spec)
- Add `client_ip_address` from request headers (unhashed)
- Add `fbc` and `fbp` cookie pass-through (unhashed) for better matching
- Add `lastName`, `city`, `state`, `zipCode` to the interface and hash them

**2. Update `src/lib/analytics.ts`**
- Create a reusable `fireMetaCapi()` helper that:
  - Generates a shared `eventId` (UUID)
  - Fires browser pixel via `trackFacebookEvent()` with `eventID`
  - Fires server-side via `supabase.functions.invoke('meta-capi')` with the same ID
  - Accepts optional PII (email, phone, name, city, state, zip) and custom_data
  - Reads `fbc`/`fbp` cookies from `document.cookie`
  - Passes `navigator.userAgent` as client_user_agent

**3. Update frontend pages** — Add `fireMetaCapi()` calls at each conversion point:
- `Contact.tsx` — fire `Contact` on form submit
- `GetStarted.tsx` — fire `CompleteRegistration` on successful signup
- `customer/Application.tsx` — fire `SubmitApplication` on submit
- `customer/PaymentSetup.tsx` — fire `AddPaymentInfo` on payment info saved
- `customer/TrailerCheckout.tsx` — fire `InitiateCheckout` on checkout start
- `customer/CheckoutComplete.tsx` — fire `Purchase` with value/currency
- `customer/RentalRequest.tsx` — fire `Schedule` on rental request submit
- `Locations.tsx` — fire `FindLocation` on page view
- `FacebookLanding.tsx` — refactor existing Lead to use the new helper
- Key landing pages — fire `ViewContent` on page view (Index, trailer pages)

**4. No edge function or config.toml changes needed** — the existing function and JWT-free config already support all events via the `eventName` parameter.

### Technical Detail: Enhanced Edge Function Payload

```text
user_data additions (hashed):
  - ln (last name)
  - ct (city)  
  - st (state)
  - zp (zip code)

user_data additions (NOT hashed):
  - client_user_agent
  - client_ip_address (from req headers)
  - fbc (click ID cookie)
  - fbp (browser ID cookie)

custom_data (for Purchase):
  - currency: "USD"
  - value: string
```

### Priority

High-value events first: **Contact**, **CompleteRegistration**, **SubmitApplication**, **AddPaymentInfo**, **Purchase**. Lower-value signals (ViewContent, FindLocation, Search) can follow.

