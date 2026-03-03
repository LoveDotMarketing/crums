

## What's Wrong

**Bug: "No Active Subscription" for Ground Link** — The subscription query on line 48 uses `.maybeSingle()`, but Ground Link has **2 subscriptions**. When Supabase returns multiple rows, `.maybeSingle()` errors out, so the entire billing page shows "No Active Subscription."

**Statements hidden behind subscription** — The Statements section (line 476) is inside the `subscription ? ... : "No Active Subscription"` conditional block. If the subscription query fails, customers can't see their statements either.

---

## Fix Plan

### 1. Support multiple subscriptions
Change the query from `.maybeSingle()` to fetch **all** subscriptions for the customer. Update the UI to show each subscription as its own section with its trailers, billing history, and status cards.

### 2. Move Statements outside the subscription conditional
The Statements & Tax Records section already exists (line 476) but is trapped inside the `subscription` conditional. Move it **outside** so it always renders when the customer record exists, regardless of subscription status. Add a dedicated "Statements" tab to the customer nav.

### 3. Add Statements tab to CustomerNav
Add a "Statements" link in `CustomerNav.tsx` pointing to `/dashboard/customer/statements` (or keep it as a tab on the billing page — since the statements section already exists, adding a separate tab in the nav makes it more discoverable).

---

## Technical Details

**File: `src/pages/customer/Billing.tsx`**
- Change subscription query: `.maybeSingle()` → no limit, fetch all, return array
- Rename `subscription` → `subscriptions` (array)
- Update all downstream queries (subscription_items, billing_history, applied_discounts) to work across multiple subscription IDs using `.in("subscription_id", subIds)`
- Restructure the UI: loop over subscriptions, show each one with its trailers/payments
- Move the Statements card **outside** the `!subscription` conditional so it renders based on `customerRecord?.id`

**File: `src/components/customer/CustomerNav.tsx`**
- Add "Statements" nav item

**File: `src/App.tsx`** (if needed)
- Add route for `/dashboard/customer/statements` if making it a separate page, OR keep it on the billing page (simpler)

The simpler approach: keep statements on the billing page but move the section outside the conditional, and add a "Statements" entry to the CustomerNav that links to `/dashboard/customer/billing#statements` or simply to the billing page with a scroll anchor.

