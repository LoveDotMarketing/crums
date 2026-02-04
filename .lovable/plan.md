
# Subscription Type Options Implementation Plan

## Overview
Add four distinct subscription/lease type scenarios as selectable options in the subscription creation flow and display them on the subscription pages:
1. **Lease to Own** (already implemented at trailer level)
2. **Rent for Storage** (new)
3. **Standard 12 Month Lease** (new)
4. **Repayment Plan** (new - for failed payments recovery)

## Current State Analysis
- The system already has a `lease_to_own` boolean on the `subscription_items` table (trailer-level)
- Customer subscriptions support billing cycles (weekly, biweekly, semimonthly, monthly)
- The `CreateSubscriptionDialog` component handles subscription creation with trailer selection
- The admin Billing page displays subscription details

---

## Technical Implementation

### 1. Database Schema Changes

Add a new column to the `customer_subscriptions` table to track the subscription type at the subscription level:

```sql
-- Add subscription_type enum
CREATE TYPE subscription_type AS ENUM (
  'standard_lease',
  'rent_for_storage', 
  'lease_to_own',
  'repayment_plan'
);

-- Add column to customer_subscriptions
ALTER TABLE customer_subscriptions 
ADD COLUMN subscription_type subscription_type DEFAULT 'standard_lease';
```

**Note:** `lease_to_own` at the trailer level (in `subscription_items`) will be preserved for individual trailer tracking, while the subscription-level type provides the primary classification.

### 2. Update CreateSubscriptionDialog Component

**File:** `src/components/admin/CreateSubscriptionDialog.tsx`

Add a new section with checkboxes/radio buttons for subscription type selection:

- Add state: `subscriptionType` (string) to track selected type
- Add a new UI section before the trailer selection with four options:
  - Standard 12 Month Lease (default)
  - Rent for Storage
  - Lease to Own
  - Repayment Plan

**Behavior by Type:**
| Type | Auto End Date | Notes |
|------|--------------|-------|
| Standard 12 Month Lease | Sets end date to 12 months from start | Minimum lease term |
| Rent for Storage | Optional end date | Flexible storage arrangement |
| Lease to Own | Required end date | Ownership transfer date matches end date |
| Repayment Plan | Optional end date | For customers recovering from failed payments |

When "Lease to Own" is selected at the subscription level, automatically check all trailers' `leaseToOwn` checkbox.

### 3. Update Edge Function

**File:** `supabase/functions/create-subscription/index.ts`

- Add `subscriptionType` to the `SubscriptionRequest` interface
- Store the subscription type in the `customer_subscriptions` table
- When `subscriptionType` is `lease_to_own`, automatically set all trailer items' `lease_to_own` flag to true

### 4. Update Admin Billing Display

**File:** `src/pages/admin/Billing.tsx`

- Add a "Type" column to the subscriptions table
- Display the subscription type with appropriate badge styling:
  - Standard Lease: Default badge
  - Rent for Storage: Blue/info badge
  - Lease to Own: Green/primary badge with key icon
  - Repayment Plan: Amber/warning badge

### 5. Update Customer Profile Display

**File:** `src/pages/customer/Profile.tsx`

- Display the subscription type in the "Contract Details" section
- Add visual indication (badge or text) showing the lease type
- For Lease to Own, show ownership transfer date prominently

---

## UI Design

### CreateSubscriptionDialog - New Section
```
┌─────────────────────────────────────────────────────────────┐
│  Subscription Type                                          │
├─────────────────────────────────────────────────────────────┤
│  ○ Standard 12 Month Lease                                  │
│    Minimum 12-month commitment with recurring billing       │
│                                                             │
│  ○ Rent for Storage                                         │
│    Flexible rental for storage purposes                     │
│                                                             │
│  ○ Lease to Own                                             │
│    Customer will own trailer(s) at end of lease             │
│                                                             │
│  ○ Repayment Plan                                           │
│    Recovery plan for customers with failed payments         │
└─────────────────────────────────────────────────────────────┘
```

### Billing Page - Subscriptions Table
Add a "Type" column with colored badges:
- `Standard Lease` - neutral/outline badge
- `Rent for Storage` - blue badge with Storage icon
- `Lease to Own` - green badge with KeyRound icon
- `Repayment Plan` - amber badge with RefreshCw icon

---

## Files to Modify

| File | Changes |
|------|---------|
| Database migration | Add `subscription_type` enum and column |
| `src/components/admin/CreateSubscriptionDialog.tsx` | Add subscription type selection UI and state |
| `supabase/functions/create-subscription/index.ts` | Handle subscription type in creation logic |
| `src/pages/admin/Billing.tsx` | Display subscription type in table |
| `src/pages/customer/Profile.tsx` | Show subscription type to customer |
| `src/integrations/supabase/types.ts` | Auto-updated with new enum/column |

---

## Implementation Order

1. Create database migration for new enum and column
2. Update `CreateSubscriptionDialog` with type selection UI
3. Update `create-subscription` edge function to handle new field
4. Update admin Billing page to display subscription type
5. Update customer Profile page to show subscription type
6. Deploy edge function and test end-to-end
