

## Plan: Add "Reset Payment Setup" to Customer Detail Page

**Problem**: Gerald Porter has no active subscription (all canceled), so he doesn't appear in the Billing subscriptions list. The "Reset Payment Setup" button currently only exists on the Applications page and inside the EditSubscriptionPanel — both require either finding his application or having an active subscription.

**Current workaround**: You can reset Porter's payment setup right now by going to **Applications** page and finding his application there (search by email `porter686868@gmail.com`). The reset button is on each application row.

**Proposed change**: Add a "Reset Payment Setup" button to the **Customer Detail** page so you can manage payment resets directly from any customer's profile, regardless of subscription status.

### Files changed

1. **`src/pages/admin/CustomerDetail.tsx`**
   - Add a "Reset Payment Setup" button in the customer's billing/payment section
   - Query the customer's `customer_applications` record to get the `applicationId`
   - Call the existing `reset-payment-setup` edge function when clicked
   - Show the current `payment_setup_status` from the application record
   - Only display the button when an application exists for the customer

No database or edge function changes needed — the `reset-payment-setup` function already handles everything.

