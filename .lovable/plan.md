

## Problem

The "Set Up ACH" button is only visible inside the Application Info card, nested within the `{application && ...}` block (line 440). For customers without an application record (like Charlie Drago in the screenshot), the entire ACH section is hidden — showing only "No application on file."

The data dependency chain is: `customer.email` → `profiles` lookup → `customer_applications` lookup. If any link breaks (no profile match, no application), the ACH button disappears.

## Plan

### 1. Move ACH status out of the Application block

Add a standalone ACH status row to the **Customer Info** card (left column, lines 391-430) so it always appears regardless of application status. This ensures every customer profile shows ACH status and the setup button.

The ACH row will:
- Show "Linked" badge if `application?.stripe_payment_method_id` exists
- Show "Not Linked" badge + "Set Up ACH" button if profile exists but no payment method
- Show "No profile linked" message if no auth profile is found (ACH requires a profile to associate with Stripe)

### 2. Keep the ACH row in Application Info as well (optional removal)

Remove the duplicate ACH status from the Application Info card (lines 460-478) to avoid confusion — the single source of truth will be the Customer Info card.

### 3. Handle edge case: customer has profile but no application

The `create-ach-setup` edge function requires a `customer_applications` record to store `stripe_customer_id`. For customers without an application, we need to either:
- **Option A**: Auto-create a minimal application record when admin initiates ACH setup (status: `pending_review`)
- **Option B**: Show a message like "Application required before ACH setup" with a prompt

**Recommended: Option A** — the edge function already creates a Stripe customer and needs somewhere to store the `stripe_customer_id`. A minimal application record is the cleanest path.

### 4. Confirm subscription flow compatibility

No changes needed to `create-subscription` or `activate-subscription`. Both pull payment methods from Stripe directly. Once ACH is linked via the admin dialog, the subscription activation flow works identically regardless of who initiated the setup.

### Files to change

- **`src/pages/admin/CustomerDetail.tsx`** — Move ACH row to Customer Info card, remove from Application Info card
- **`supabase/functions/create-ach-setup/index.ts`** — Handle missing application by auto-creating a minimal record when admin initiates

