
# Add Contract Start & End Date to Two Admin Views

## What We're Changing

The user wants contract start and end dates displayed in two specific places so staff don't have to navigate away to answer that common customer question:

1. **Trailer Detail page** → Lessee Assignment section (under Assigned Customer, Agreement Type, Rate)
2. **Customer Form Dialog** → Assigned Trailers card (the customer edit/view panel, below the trailer list)

---

## Current State

### Location 1 — Trailer Detail: Lessee Assignment card (`src/pages/admin/TrailerDetail.tsx`)
- Currently shows: Assigned Customer | Agreement Type | Rate (3 columns)
- The `fetchAgreementType` function fetches `subscription_type` from `customer_subscriptions` but does NOT fetch `contract_start_date` or `end_date`
- Need to also fetch and store those two date fields

### Location 2 — Customer Form Dialog: Assigned Trailers card (`src/components/admin/CustomerFormDialog.tsx`)
- Currently shows: trailer number + badges + VIN on the left, rate on the right
- The customer trailers query fetches via `subscription_items` and joins to `trailers` but does NOT pull the parent subscription's dates
- Need to add `contract_start_date` and `end_date` from `customer_subscriptions` to that query

---

## Plan

### Step 1: `src/pages/admin/TrailerDetail.tsx`

**State additions:**
- `contractStartDate: string | null` 
- `contractEndDate: string | null`

**Data fetch update** in `fetchAgreementType`:
- Change the subscription query from `.select("subscription_type")` to `.select("subscription_type, contract_start_date, end_date")`
- Store both dates in state

**UI addition** — below the existing 3-column grid in the Lessee Assignment card, add a new row with two date fields:
- **Contract Start** — shows `contract_start_date` formatted as "MMM d, yyyy", or "—" if not set
- **Contract End** — shows `end_date` formatted as "MMM d, yyyy", or "Ongoing" if null

These are read-only display fields (not editable inline — editing is done via the "Edit Contract Dates" button in the Billing page).

---

### Step 2: `src/components/admin/CustomerFormDialog.tsx`

**Query update** in the `customerTrailers` query:
- Add `contract_start_date` and `end_date` to the subscription join:
  ```
  subscription:customer_subscriptions!inner(customer_id, contract_start_date, end_date)
  ```
- Map these fields into the returned trailer objects

**Interface update** — add `contract_start_date: string | null` and `end_date: string | null` to `TrailerInfo`

**UI addition** — below the "Total Monthly Revenue" line in the Assigned Trailers card, add a "Contract Period" row showing:
- If start date is set: "MMM d, yyyy → [End date or Ongoing]"
- If no start date: "—"

This appears as a single summary line for the customer's subscription period, since one subscription covers all their trailers.

---

## Technical Details

### No Database Migration Needed
Both `contract_start_date` and `end_date` already exist on `customer_subscriptions`. This is purely a UI display change.

### Files Modified

| File | Change |
|---|---|
| `src/pages/admin/TrailerDetail.tsx` | Add state + fetch dates + display in Lessee Assignment card |
| `src/components/admin/CustomerFormDialog.tsx` | Extend query to include subscription dates + display in Assigned Trailers card |

### Date Format
Using `date-fns` `format()` already imported in both files:
```typescript
format(new Date(contractStartDate), "MMM d, yyyy")
```

### Edge Cases
- Subscription exists but `contract_start_date` is null → show "—" or "Not set"
- `end_date` is null → show "Ongoing"
- No subscription at all → the dates section will be hidden (same as agreement type is hidden)
