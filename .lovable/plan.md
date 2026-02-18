
# Lease-to-Own Customer Portal Enhancement

## Current State

The customer portal has a basic Lease-to-Own balance tracker on the "My Rentals" page, but it's minimal and has several gaps:

- The balance calculation is unreliable (finds "any" subscription's billing total rather than the specific subscription)
- No contract end date or payoff date is displayed
- No payment schedule breakdown (how many payments remain, payment amount, etc.)
- No dedicated "Lease-to-Own" page or section — it's buried in the Rentals page
- No document storage for the lease-to-own agreement (the contract)
- No mention of the customer's responsibilities (DOT inspections, taxes) specific to lease-to-own
- Admin has no way to upload/attach the signed lease-to-own agreement document for a customer to view

---

## What We're Building

A dedicated **Lease-to-Own** section in the customer portal with:

1. **Full payment breakdown** — total buyout price, amount paid, remaining balance, monthly payment, projected payoff date based on contract start + payment count
2. **Ownership timeline** — visual progress bar with the contract start date and estimated ownership date
3. **Payment schedule table** — a month-by-month breakdown showing all payments made and expected future payments through payoff
4. **Lease-to-Own responsibilities section** — a clear, styled notice explaining the customer's obligations (DOT inspections, property taxes, insurance requirements specific to lease-to-own)
5. **Document section** — shows the signed lease-to-own agreement as a downloadable PDF if one has been uploaded by admin
6. **Admin: ability to upload/attach lease agreement document** — on the Billing admin page, admins can upload a PDF agreement per subscription and set the correct backdated contract start date

---

## Plan

### Step 1: Database — Add `lease_agreement_url` to `customer_subscriptions`

Add a column to store the uploaded lease-to-own agreement document URL. This is a nullable text column that stores a storage path.

Also add a storage policy for the existing `customer-documents` bucket to allow admins to upload and customers to download their own subscription documents.

### Step 2: Create a New Customer Page — `/dashboard/customer/lease-to-own`

Create `src/pages/customer/LeaseToOwn.tsx` with:

**Hero Section:**
- Prominent "Lease-to-Own Agreement" heading
- Badge showing "On Track to Ownership" or "Active Agreement"

**Three Summary Cards:**
- Total Buyout Price
- Amount Paid (from successful billing history)
- Remaining Balance

**Ownership Progress:**
- Visual progress bar (like current one but more detailed)
- Contract start date → Estimated ownership date
- "X payments remaining at $Y/mo"
- Estimated payoff date calculated from: remaining balance ÷ monthly rate = months remaining → add to today

**Payment Schedule Table:**
- Pull from `billing_history` (succeeded payments)
- Show date, amount, running total, and remaining balance for each payment
- Below paid history, show projected future payments (next N payments at monthly rate)

**Responsibilities Section:**
- Styled alert/info card explaining:
  - As a lease-to-own customer, you are responsible for annual DOT inspections
  - Property taxes on the trailer may be your responsibility (check with your state)
  - You must maintain adequate insurance coverage throughout the term
  - Contact us at the end of the agreement to initiate the title transfer process

**Documents Section:**
- If `lease_agreement_url` is set on the subscription: show a "Download Lease Agreement" button
- If not set: show a "Contact us to receive your signed lease agreement" message

### Step 3: Add Route + Nav Item

- Add route `/dashboard/customer/lease-to-own` in `App.tsx`
- Add "Lease to Own" nav item to `CustomerNav.tsx` — but only show it when the customer has an active lease-to-own subscription (conditionally rendered based on subscription type)

### Step 4: Fix the Balance Calculation on Rentals Page

The current `getLeaseToOwnInfo` function has a bug — it finds "any" subscription ID from `billingPaid` instead of finding the correct one for that specific item. Fix this by:
- Fetching the subscription ID properly in the query (include `subscription_id` in the items query)
- Mapping billing totals by the correct subscription ID

### Step 5: Admin — Upload Lease Agreement Document

In the admin Billing page, for subscriptions with `subscription_type = 'lease_to_own'`, add an "Upload Agreement" button in the subscription detail/actions area. This opens a dialog with:
- File upload input (PDF only)
- Contract start date field (to allow backdating)
- On save: uploads to `customer-documents` bucket, stores path in `lease_agreement_url`, updates `contract_start_date`

### Step 6: Dashboard Quick Link

On the Customer Dashboard, if the customer has a lease-to-own subscription, show a highlighted card/banner pointing them to the Lease-to-Own page.

---

## Technical Details

### Database Migration

```sql
-- Add lease agreement URL to customer_subscriptions
ALTER TABLE public.customer_subscriptions
  ADD COLUMN IF NOT EXISTS lease_agreement_url text NULL;

COMMENT ON COLUMN public.customer_subscriptions.lease_agreement_url IS
  'Storage path for the signed lease-to-own agreement document';
```

### Files Modified / Created

| File | Change |
|---|---|
| `supabase/migrations/[new].sql` | Add `lease_agreement_url` column |
| `src/pages/customer/LeaseToOwn.tsx` | NEW — Full lease-to-own portal page |
| `src/components/customer/CustomerNav.tsx` | Add conditional "Lease to Own" nav item |
| `src/App.tsx` | Add route for new page |
| `src/pages/customer/Rentals.tsx` | Fix balance calculation bug |
| `src/pages/customer/CustomerDashboard.tsx` | Add lease-to-own highlight card |
| `src/pages/admin/Billing.tsx` | Add Upload Agreement button for lease-to-own subscriptions |

### Payoff Date Calculation Logic

```typescript
// months_remaining = Math.ceil(remaining / monthly_rate)
// estimated_payoff = addMonths(contract_start_date, total_payments_expected)
// or simpler: addMonths(today, months_remaining)

const monthsRemaining = Math.ceil(remaining / monthlyRate);
const estimatedPayoff = addMonths(new Date(), monthsRemaining);
```

### Nav Conditional Rendering

The "Lease to Own" nav item will only appear if the customer has an active `lease_to_own` subscription type. The `CustomerNav` will accept an optional `showLeaseToOwn` prop, or fetch the subscription type itself via a lightweight query.

### Document Upload (Admin)

The document will be uploaded to the `customer-documents` bucket with path:
`lease-agreements/{subscription_id}/lease-agreement.pdf`

The RLS on `customer-documents` already allows authenticated users to read files. We'll ensure the path is scoped to the subscription so customers can only access their own document via a signed URL generated server-side or using the direct storage path with the customer's auth session.

### Do It Moving — Practical Note

Once this is built, the admin can:
1. Go to Billing → find Do It Moving's subscription
2. Set the `subscription_type` to `lease_to_own` if not already set
3. Set the `contract_start_date` to the backdated date from the original (lost) contract
4. Upload the new signed PDF agreement
5. Set `lease_to_own_total` on the subscription item (the buyout price)
6. The customer portal will immediately reflect the correct balance and payoff date
