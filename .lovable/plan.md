

## Plan: MATS 2026 Thank You Page with Full Navigation

### Changes

**1. Create `src/pages/MATS2026ThankYou.tsx`**
- Full-page layout with `<Navigation />` header and `<Footer />` 
- Thank you message with CheckCircle icon, "We've got your info" copy
- Social links section (Facebook, Instagram, LinkedIn, YouTube) matching Footer's existing links
- CTA buttons to explore services (e.g. "View Our Trailers", "Learn About Leasing")
- SEO component with noindex

**2. Update `src/pages/MATS2026.tsx`**
- Replace `setSubmitted(true)` with `navigate("/mats2026-thank-you")`
- Remove the inline thank-you card (the `if (submitted)` block)

**3. Update `src/App.tsx`**
- Add lazy import for `MATS2026ThankYou`
- Add route: `/mats2026-thank-you`

No database or backend changes needed.

