
# Add Application Status Indicator to Payment Setup Page

## What Exists Today

The `PaymentSetup.tsx` page already fetches `applicationStatus` and `paymentSetupStatus` from the `check-payment-status` edge function — it's stored in `paymentStatus.applicationStatus` — but nothing on the page ever displays it to the customer. The customer lands on the payment setup page with no visible context about where they are in the overall onboarding process.

## What Will Be Added

A compact **"Your Onboarding Progress"** status banner placed directly below the page heading, before all existing content. It will show a 3-step mini-tracker:

```text
[✓] Application Submitted  →  [ ] Under Review  →  [ ] Approved
```

The steps shown are:
1. Application Submitted
2. Under Review
3. Approved

The step states adapt to the actual `applicationStatus` value from the database:

| Status value | Step 1 | Step 2 | Step 3 |
|---|---|---|---|
| `new` | Active | Pending | Pending |
| `pending_review` | Complete | Active | Pending |
| `approved` | Complete | Complete | Complete (green) |
| `rejected` | Complete | Complete | Red — Rejected |

A short contextual message below the tracker will explain what the current status means, e.g.:
- `new` → "Your application is still being prepared. Our team will begin reviewing it shortly."
- `pending_review` → "Our team is reviewing your application. This typically takes 1-2 business days. You can complete payment setup now — no charges will occur until a trailer is assigned."
- `approved` → "Your application is approved! Complete bank linking below to finish onboarding."
- `rejected` → "Your application was not approved. Please call (888) 570-4564 for details."

## Why This Is the Right Approach

- Customers who are still in `pending_review` (like the Trinity Freight customer) now clearly understand their application is in review and payment setup can proceed independently — reducing confusion.
- The message for `pending_review` explicitly reassures that completing payment setup now is fine, reinforcing the "no charges today" message already on the page.
- No new data fetching is needed — `paymentStatus.applicationStatus` is already available in component state.
- The banner is compact and doesn't add visual clutter to the existing page layout.

## Technical Details

**File modified:** `src/pages/customer/PaymentSetup.tsx` only.

**Location in file:** Insert the new JSX block at line ~229, immediately after the existing `<div className="mb-6">` heading block and before the green "Payment Method Active" card or the main setup flow.

**No backend changes needed** — `applicationStatus` is already returned by `check-payment-status`.

**Implementation:**
- Inline JSX inside `PaymentSetup.tsx` — no new component file needed given the simple, single-use nature.
- Uses existing imported icons: `FileText`, `Clock`, `CheckCircle2`, `AlertCircle` (all already imported).
- Uses existing `cn` utility and existing UI components already in scope (`Card`, `CardContent`, `Badge`).
- The tracker only renders when `paymentStatus` is not null and `!hasPaymentMethod` — if payment is already complete, the status banner is hidden (not relevant once onboarding is done).

## Files Changed

| File | Change |
|---|---|
| `src/pages/customer/PaymentSetup.tsx` | Add application status tracker banner below the page heading |
