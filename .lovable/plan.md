

## Add "Needs Attention" Card to Applications Page

### Problem
Admins need a quick way to see which active/approved customers still haven't signed their lease agreement or completed ACH payment setup, so they can follow up.

### Solution
Add a new summary card component above the applications table that queries `customer_applications` (approved, with incomplete payment setup) and `customer_subscriptions` (active/pending, without signed lease) to surface customers needing action.

### Changes

**1. New component: `src/components/admin/NeedsAttentionCard.tsx`**

A card with two sections:
- **ACH Not Completed**: Approved applications where `payment_setup_status` is NOT `completed` (i.e. `pending`, `sent`, or null)
- **Lease Not Signed**: Active/pending subscriptions where `lease_agreement_url` is null AND `docusign_completed_at` is null

Each section shows a mini table with customer name, email, status, and a quick-action button (send ACH setup email / view customer). The card hides if both lists are empty.

Query approach:
- ACH: Query `customer_applications` with `status = approved` and `payment_setup_status != completed`, join profiles
- Lease: Query `customer_subscriptions` with `status in (active, pending)` and `docusign_completed_at is null` and `lease_agreement_url is null`, join customers for name/email

**2. Update: `src/pages/admin/Applications.tsx`**

- Import and render `<NeedsAttentionCard />` between the stats cards and the search/filter section

### Files Modified
| File | Change |
|------|--------|
| `src/components/admin/NeedsAttentionCard.tsx` | New component showing customers missing ACH or lease signature |
| `src/pages/admin/Applications.tsx` | Import and render the new card |

