

## Issue: LinkedIn Form Honeypot False Positive

**Root cause**: The form's spam honeypot field (`website`) is being auto-filled by the browser. When this hidden field has a value, the form shows a fake "Success!" toast and returns early — never calling the edge function, never sending email, and never redirecting to the thank-you page.

This is a known problem with honeypot fields named `website` — browsers and password managers love to fill fields with that name.

### Fix

**1. Rename the honeypot field in `src/pages/LinkedInLanding.tsx`**
- Change the honeypot input's `name` from `website` to something browsers won't auto-fill (e.g., `company_url_confirm` or `address2`)
- Add `autocomplete="off"` and `tabIndex={-1}` to further prevent autofill
- Update the corresponding state field name and the check in the submit handler

This is a one-file change — just rename the honeypot field to something that won't trigger browser autofill.

