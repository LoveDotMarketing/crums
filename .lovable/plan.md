

## Clickable Subscription Rows → Edit Subscription Detail View

### Current State
- Subscription rows in the Billing table are not clickable
- Editing is limited to: contract dates (via dropdown), manage trailers (via dropdown), partner assignment (via dropdown)
- Fields like deposit amount, billing cycle, subscription type, deposit paid status, and notes are not editable after creation

### Plan

**1. Create a new `EditSubscriptionPanel` component**
- File: `src/components/admin/EditSubscriptionPanel.tsx`
- Full inline form (similar to the new Create Subscription tab approach) that loads when a subscription row is clicked
- Editable fields:
  - Subscription type (radio cards, same as create flow)
  - Billing cycle (monthly/weekly/biweekly/semimonthly)
  - Contract start date & end date (date pickers)
  - Deposit amount & deposit paid toggle
  - Notes/internal memo (textarea)
  - Status display (read-only, managed via actions)
- Shows the subscription's trailer list (read-only, with link to Manage Trailers)
- Save button updates `customer_subscriptions` row via Supabase
- Cancel button returns to subscription list

**2. Update Billing page to show edit panel on row click**
- File: `src/pages/admin/Billing.tsx`
- Add state: `selectedSubscriptionId`
- Make `TableRow` clickable with `onClick` → set selected ID and switch to a new `"edit-subscription"` tab
- Pass subscription data to `EditSubscriptionPanel`
- On save/cancel, clear selection and return to subscriptions tab
- Keep the existing dropdown menu actions (they still work independently)

**3. Make rows visually clickable**
- Add `cursor-pointer hover:bg-muted/50` to subscription `TableRow`s
- Prevent row click when clicking the dropdown menu actions (stopPropagation)

### Files to create/update
- **Create**: `src/components/admin/EditSubscriptionPanel.tsx`
- **Update**: `src/pages/admin/Billing.tsx` (add tab, row click handler, state)

No database changes needed.

