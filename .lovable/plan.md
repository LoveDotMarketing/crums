
# Billing and Trailer Management Review

## Executive Summary

After a thorough review of the billing, subscription, and trailer management system, I've identified the current state and gaps for each item on the checklist.

---

## Checklist Review

### 1. Discounts - Working

**Current Status**: Discounts are properly implemented with the recent fix.

**What's Working**:
- The `create-subscription` edge function correctly applies discounts using the `discounts` array format (line 255-257)
- Discount types supported: percentage, fixed, multi_trailer, promo_code
- Discounts are tracked in `applied_discounts` table
- Customer Billing page displays active discounts with applied date
- Admin can create and toggle discounts in the Billing dashboard

**No Changes Needed**

---

### 2. Trailer Swap/Add/Remove - NOT IMPLEMENTED

**Current Status**: This functionality does NOT exist in either admin or customer dashboards.

**Missing Features**:

| Action | Admin Dashboard | Customer Dashboard |
|--------|----------------|-------------------|
| Add trailer to existing subscription | Not available | Not available |
| Remove trailer from subscription | Not available | Not available |
| Swap trailer for another | Not available | Not available |

**Current Workaround**: Admin must cancel the entire subscription and create a new one.

**Required Implementation**:

1. **New Edge Function**: `modify-subscription/index.ts`
   - Accept actions: `add_trailer`, `remove_trailer`, `swap_trailer`
   - Update Stripe subscription items using `stripe.subscriptions.update()`
   - Update local `subscription_items` table
   - Handle trailer status changes (`is_rented`, `customer_id`)

2. **Admin UI Updates** (`src/pages/admin/Billing.tsx`):
   - Add "Manage Trailers" option in subscription dropdown menu
   - Create `ManageTrailersDialog` component with:
     - List of current trailers on subscription
     - Remove button for each trailer
     - Add trailer selection (from available trailers)
     - Swap trailer option

3. **Customer UI** (Optional):
   - Customers typically wouldn't self-manage trailers
   - Could add a "Request Trailer Change" support ticket option

---

### 3. Multiple Trailers Per Customer - WORKING

**Current Status**: Fully supported.

**Evidence**:
- `create-subscription` accepts `trailerIds: string[]` array (line 17)
- `subscription_items` table links multiple trailers to one subscription
- Customer Billing page displays all leased trailers in a table
- Admin CreateSubscriptionDialog supports multi-trailer selection with checkboxes

**No Changes Needed**

---

### 4. Customer Can See Billing/Invoicing and Assigned Trailers - WORKING

**Current Status**: Both are visible on customer pages.

**Customer Billing Page** (`/dashboard/customer/billing`):
- Subscription status, billing cycle, next billing date
- Current rate with per-cycle breakdown
- Security deposit status (paid/pending)
- Active discounts with visual badge
- Leased Trailers table (trailer #, type, start date, rate)
- Payment History table (date, period, amount, status)

**Customer Rentals Page** (`/dashboard/customer/rentals`):
- Grid of trailer cards with VIN, type, year, make/model
- Status badge (Leased)

**Customer Dashboard**:
- Stats card showing assigned trailer count
- Link to Rentals page

**Minor Enhancement Opportunity**: The Payment History could include invoice download links (requires Stripe hosted invoice URLs).

---

### 5. Customer Invoice Email After Payment - NOT CONFIGURED

**Current Status**: Stripe sandbox is NOT configured to send invoice emails automatically.

**Issue Identified**: 
Stripe has customer email receipt settings that must be enabled in the Stripe Dashboard:
- **Location**: Stripe Dashboard → Settings → Customer emails → Invoice and receipts
- **Setting**: "Email finalized invoices and credit notes to customers"
- **Alternative**: "Email receipts for successful payments"

**Why No Email Was Received**:
1. Stripe's automatic email setting is likely disabled (default for sandbox)
2. The subscription uses `payment_behavior: "default_incomplete"` which may affect invoice finalization
3. No custom invoice email implementation exists in the codebase

**Solutions**:

**Option A - Enable Stripe Automatic Emails (Recommended)**:
1. Go to Stripe Dashboard → Settings → Customer emails
2. Enable "Email finalized invoices and credit notes to customers"
3. This applies to both test and live modes

**Option B - Custom Invoice Email via Webhook**:
Add handling in `stripe-webhook/index.ts` for `invoice.paid` event:
```typescript
case "invoice.paid": {
  const invoice = event.data.object as Stripe.Invoice;
  // Send custom email with invoice PDF link
  await sendInvoicePaidEmail(supabase, invoice);
  break;
}
```

---

## Summary of Required Changes

### High Priority (Core Functionality Missing)

| Item | Status | Action Required |
|------|--------|----------------|
| Add/Remove/Swap Trailers | Not Implemented | Create new edge function + admin UI |
| Invoice Emails | Not Configured | Enable in Stripe Dashboard or implement custom |

### Already Working

| Item | Status |
|------|--------|
| Discounts | Working (recently fixed) |
| Multiple trailers per customer | Working |
| Customer billing visibility | Working |
| Customer trailer visibility | Working |

---

## Technical Implementation Plan

### Phase 1: Modify Subscription Edge Function

Create `supabase/functions/modify-subscription/index.ts`:

```text
Features:
- add_trailers: Add new trailer(s) to existing subscription
- remove_trailers: Remove trailer(s) from subscription  
- swap_trailer: Remove one trailer and add another in single operation

Stripe API calls:
- stripe.subscriptions.update() with items array
- Create new price for added trailers
- Set deleted: true for removed items

Database updates:
- Insert/update subscription_items
- Update trailers table (is_rented, customer_id)
```

### Phase 2: Admin UI for Trailer Management

Create `src/components/admin/ManageTrailersDialog.tsx`:

```text
UI Elements:
- Current trailers table with "Remove" buttons
- Available trailers dropdown for adding
- Quick "Swap" action (remove + add in one operation)
- Rate adjustment for new trailers
- Confirmation modal before changes
```

Update `src/pages/admin/Billing.tsx`:
- Add "Manage Trailers" to subscription dropdown menu

### Phase 3: Invoice Email Configuration

**Option A (Quick Fix)**:
- Document Stripe Dashboard settings for admin to configure
- No code changes needed

**Option B (Custom Implementation)**:
- Extend `stripe-webhook/index.ts` to send custom invoice emails
- Include invoice PDF link from Stripe
- Store email template in `email_templates` table

---

## Database Considerations

No schema changes required. Existing tables support all functionality:
- `customer_subscriptions` - One subscription per customer
- `subscription_items` - Multiple items per subscription (one per trailer)
- `trailers` - Status tracking and customer assignment
- `discounts` / `applied_discounts` - Discount tracking
- `billing_history` - Payment records

---

## Recommended Implementation Order

1. **Configure Stripe Invoice Emails** (15 minutes)
   - Enable in Stripe Dashboard for immediate fix

2. **Create modify-subscription edge function** (2-3 hours)
   - Core backend logic for trailer management

3. **Build ManageTrailersDialog component** (2-3 hours)
   - Admin UI for using the new edge function

4. **Testing** (1-2 hours)
   - Test add/remove/swap flows in sandbox
   - Verify invoice emails are sent
