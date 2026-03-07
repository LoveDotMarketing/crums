

## Thank You Page for LinkedIn Landing Page Conversion Tracking

Currently the LinkedIn landing page shows an inline success message after form submission. For proper conversion tracking (especially LinkedIn's URL-based conversion tracking), we need a dedicated thank-you page that the user redirects to after submission.

### Changes

**1. Create `src/pages/LinkedInThankYou.tsx`**
- Standalone thank-you page at `/lp/linkedin/thank-you`
- `noindex={true}` on the SEO component
- Fire conversion tracking events on page load (`useEffect`): `trackFormSubmission`, `trackConversion`, `trackLinkedInQuoteRequest`, and LinkedIn CAPI call
- Clean, branded layout matching the landing page style (no nav/footer)
- Clear confirmation message, next steps, phone number CTA
- No back-navigation to prevent double submissions

**2. Update `src/pages/LinkedInLanding.tsx`**
- After successful form submission, `navigate("/lp/linkedin/thank-you")` instead of setting `isSubmitted = true`
- Pass minimal data (name) via route state for personalization
- Remove inline success UI and the conversion tracking calls from this page (move them to thank-you page)

**3. Update `src/App.tsx`**
- Add lazy-loaded route for `/lp/linkedin/thank-you` → `LinkedInThankYou`

This gives LinkedIn a concrete URL to use as the conversion page in Campaign Manager, which is more reliable than event-based tracking alone.

