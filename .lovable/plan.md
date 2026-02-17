

## Preventive Fixes: Customer Journey Pain Points

After reviewing every customer-facing page, here are the issues customers could hit -- and the fixes to prevent them.

---

### Issue 1: Document Upload Has No "Replace" Option

**Problem:** Once a document is uploaded (Driver's License, Insurance, DOT), the customer sees "Document uploaded" with a green checkmark but has NO way to re-upload if they uploaded the wrong file or a blurry photo. They're stuck.

**Fix:** Add a "Replace" button next to each uploaded document so the customer can re-upload without needing to contact support.

---

### Issue 2: No Application Created for Some Users

**Problem:** The `RentalRequest.tsx` page does an INSERT into `customer_applications` -- but if the customer already has one (from GetStarted signup), it will fail with a unique constraint error and show "Failed to submit rental request" with no helpful message. Conversely, customers who sign up via the Login page's quick signup never get a `customer_applications` record created until they visit the Application page, so the dashboard shows no status tracker.

**Fix:** Change the RentalRequest insert to an upsert, and ensure the Login page signup flow also creates a `customer_applications` record (like GetStarted does).

---

### Issue 3: Profile Page Doesn't Have the Same Data Loss Protection

**Problem:** The Profile page (`src/pages/customer/Profile.tsx`) has NO localStorage persistence. If a customer fills in their name and phone, then accidentally navigates away or their phone refreshes the tab, all typed data is lost. We fixed this on the Application page but the Profile page has the same vulnerability.

**Fix:** Add localStorage backup to the Profile page form, matching the pattern used in Application.tsx.

---

### Issue 4: Signed URL Expiration for Uploaded Documents

**Problem:** When customers upload documents, the app creates a signed URL with a 1-year expiration (`31536000` seconds). After 1 year, these URLs will break and the admin won't be able to view the customer's documents. The customer will see "Document uploaded" but the link behind it will be dead.

**Fix:** Switch from signed URLs to storing the storage path, and generate fresh signed URLs on demand when viewing documents. This also reduces security risk from long-lived signed URLs.

---

### Issue 5: No Error Recovery on Payment Setup

**Problem:** If the ACH bank linking (PaymentSetup page) fails partway through -- for example the bank modal crashes or the customer's internet drops during the Stripe confirmation step -- the page shows a generic "Failed to set up payment method" error. The customer has no idea if they should try again, wait, or call support.

**Fix:** Add specific error messages for common failure scenarios (bank modal closed, network timeout, verification required) and a clear "Try Again" button with guidance text.

---

### Technical Changes

| File | Change |
|------|--------|
| `src/pages/customer/Application.tsx` | Add "Replace" button for uploaded documents instead of showing only the green checkmark |
| `src/pages/customer/Profile.tsx` | Add localStorage backup/restore for form fields to prevent data loss on refresh |
| `src/pages/customer/RentalRequest.tsx` | Change INSERT to UPSERT on `customer_applications` to prevent duplicate constraint errors |
| `src/pages/Login.tsx` | After quick signup, create `customer_applications` record (matching GetStarted flow) |
| `src/pages/customer/PaymentSetup.tsx` | Improve error messages for bank linking failures with specific guidance |

