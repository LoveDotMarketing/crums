

## Send Checkout Confirmation Email + Surface DocuSign in Customer Portal

Based on your notes, two things are missing from the current checkout flow:

### What's missing today
1. **No email is sent after checkout** — when the customer signs the DOT acknowledgment at `/dashboard/customer/checkout/:id`, the system updates the database and redirects to a "Complete" page, but no email goes out. You want a confirmation email with the DOT inspection summary so the customer has a record in their inbox.
2. **DocuSign/lease agreement not visible on the main customer dashboard** — the lease agreement URL exists on `customer_subscriptions.lease_agreement_url` but is only shown on the Lease-to-Own page and admin detail. Customers should see their signed contract on their main dashboard or profile.

### Plan

**1. Send checkout confirmation email (after customer signs DOT acknowledgment)**
- In `src/pages/customer/TrailerCheckout.tsx`, after the successful `handleSubmit` update, call the `send-outreach-email` edge function to email the customer a checkout confirmation.
- Email content: trailer number, type, VIN, inspection date, all checklist items (pass/fail), customer name/company, signed date — essentially a text version of the CheckoutComplete page.
- Uses existing `send-outreach-email` function (already handles SendGrid + logging).
- Also CC/BCC the admin emails (sales@crumsleasing.com) so you have a record too.

**2. Add "My Documents" section to customer dashboard**
- In `src/pages/customer/CustomerDashboard.tsx`, add a documents card that shows:
  - **Lease Agreement** (from `customer_subscriptions.lease_agreement_url`) with a "View" button that generates a signed URL
  - **Completed DOT Checkout forms** (from `dot_inspections` where `customer_acknowledged = true`) with links back to the checkout-complete page
- This gives customers a single place to find their signed documents.

### Files to change
- `src/pages/customer/TrailerCheckout.tsx` — add email send after successful checkout submission
- `src/pages/customer/CustomerDashboard.tsx` — add "My Documents" card showing lease agreement + completed checkout records

### Technical notes
- The email will be an HTML summary built from the inspection data already loaded in the component — no new backend function needed.
- For the lease agreement download, we use the same `supabase.storage.createSignedUrl` pattern already used in admin CustomerDetail and LeaseToOwn pages.
- The checkout email fires client-side after the DB update succeeds, so if it fails the checkout itself is not affected.

