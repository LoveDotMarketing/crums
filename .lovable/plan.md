

## Add Contract Start Date for DocuSign Completion

### What This Does
Adds a dedicated `contract_start_date` column to the `customer_subscriptions` table so that when a client completes their DocuSign contract, the exact contract start date is recorded and displayed on their profile. Currently, the profile shows `created_at` (when the subscription record was created in the system), which may differ from the actual contract signing date.

### Changes

**1. Database Migration**
- Add `contract_start_date` (date, nullable) to `customer_subscriptions`
- Add `docusign_envelope_id` (text, nullable) to `customer_subscriptions` for future DocuSign integration tracking
- Add `docusign_completed_at` (timestamptz, nullable) to `customer_subscriptions` to record when the signing was completed

**2. Customer Profile Page (`src/pages/customer/Profile.tsx`)**
- Update the "Contract Start" display to use `contract_start_date` when available, falling back to `created_at`
- Add the `contract_start_date`, `docusign_envelope_id`, and `docusign_completed_at` fields to the subscription query select
- If DocuSign was completed, show a "Contract Signed" date beneath the start date

**3. Admin Customers Page**
- Allow admins to set the `contract_start_date` when activating a subscription or editing contract details
- This field will later be auto-populated by the DocuSign webhook when the document integration is ready

### Technical Details

**Migration SQL:**
```sql
ALTER TABLE customer_subscriptions
  ADD COLUMN contract_start_date date,
  ADD COLUMN docusign_envelope_id text,
  ADD COLUMN docusign_completed_at timestamptz;
```

**Profile display logic (Profile.tsx, line ~341-345):**
- Change from: `format(new Date(subscription.created_at), "MMMM d, yyyy")`
- Change to: `format(new Date(subscription.contract_start_date || subscription.created_at), "MMMM d, yyyy")`
- Add label clarification: show "Contract Signed" with date if `docusign_completed_at` exists

**Subscription query update:**
- Add `contract_start_date, docusign_envelope_id, docusign_completed_at` to the select in the subscription query

### Future DocuSign Integration
Once the DocuSign document is ready, a webhook endpoint will be created to:
1. Receive the `envelope.completed` event from DocuSign
2. Match the envelope to the customer subscription via `docusign_envelope_id`
3. Auto-set `contract_start_date` and `docusign_completed_at`

