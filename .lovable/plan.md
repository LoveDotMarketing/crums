

## Plan: Auto-Confirmation Email for Contact Form Submissions

### What we are building
An automatic thank-you/confirmation email sent to anyone who fills out the contact form, plus a pre-built outreach template in the admin panel for reference.

### 1. Create Edge Function: `send-contact-confirmation/index.ts`
- Same pattern as `send-event-thank-you` (SendGrid, no JWT required)
- Accepts `{ name, email }` from the contact form
- Branded HTML email with:
  - CRUMS Leasing header
  - Thank you message with the customer's first name
  - "View Our Pricing" CTA button linking to `/price-sheet`
  - "Book a Trailer" CTA linking to `/get-started` with text about registering an account to reserve and get started
  - Social media links (Facebook, Instagram, LinkedIn, YouTube)
  - Footer with company info

### 2. Update `src/pages/Contact.tsx`
- After successful `send-contact-email` call (and not spam), fire `send-contact-confirmation` in the background:
  ```
  supabase.functions.invoke('send-contact-confirmation', {
    body: { name: formData.name, email: formData.email }
  }).catch(err => console.warn('Confirmation email failed:', err));
  ```

### 3. Also wire into landing pages
- Update `src/pages/FacebookLanding.tsx`, `GoogleLanding.tsx`, `LinkedInLanding.tsx` with the same background call after successful submission

### 4. Add outreach template in `email_templates` table
- Insert a pre-built "Contact Form Auto-Confirmation" template via the admin Outreach Templates tab so it's visible and editable as a reference template

### Files to create/modify
- **Create**: `supabase/functions/send-contact-confirmation/index.ts`
- **Modify**: `src/pages/Contact.tsx`
- **Modify**: `src/pages/FacebookLanding.tsx`
- **Modify**: `src/pages/GoogleLanding.tsx`
- **Modify**: `src/pages/LinkedInLanding.tsx`

