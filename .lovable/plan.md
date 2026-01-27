
# Fix Quick Start Signup Flow - Status Value Alignment

## Problem Summary
The signup flow has several places where invalid status values are used that don't match the database constraint. The `customer_applications` table only allows: `'new'`, `'pending_review'`, `'approved'`, and `'rejected'`.

**Code is using invalid values:**
- `'incomplete'` - used in GetStarted.tsx and Application.tsx
- `'pending'` - used in Application.tsx

## Changes Required

### 1. Fix GetStarted.tsx (Full Form Submission)
**File:** `src/pages/GetStarted.tsx`
**Line 318:** Change `'incomplete'` to `'new'`

```text
Before: const applicationStatus = hasDocuments ? 'pending_review' : 'incomplete';
After:  const applicationStatus = hasDocuments ? 'pending_review' : 'new';
```

### 2. Fix Application.tsx (Customer Application Page)
**File:** `src/pages/customer/Application.tsx`
**Line 262:** Fix both invalid status values

```text
Before: status: calculateProgress() === 100 ? "pending" : "incomplete",
After:  status: calculateProgress() === 100 ? "pending_review" : "new",
```

### 3. Fix ApplicationAlert.tsx (Status Check)
**File:** `src/components/customer/ApplicationAlert.tsx`
**Line 39:** Update the status check to use valid value

```text
Before: if (applicationStatus === 'incomplete') {
After:  if (applicationStatus === 'new') {
```

Also update the messaging to make sense for "new" applications (since "new" now represents applications that need more info).

## Technical Details

| Location | Current Value | Correct Value |
|----------|--------------|---------------|
| GetStarted.tsx:318 | `'incomplete'` | `'new'` |
| Application.tsx:262 | `"pending"` | `"pending_review"` |
| Application.tsx:262 | `"incomplete"` | `"new"` |
| ApplicationAlert.tsx:39 | `'incomplete'` | `'new'` |

## Flow After Fix

1. **Quick Start** → Creates application with status `'new'` (already fixed)
2. **Full Form (from prompt)** → Updates to `'pending_review'` if docs uploaded, stays `'new'` if not
3. **Application Page Updates** → Uses `'pending_review'` when complete, `'new'` when incomplete
4. **Dashboard Alerts** → Correctly shows "Complete Your Application" for `'new'` status

## Testing Steps
1. Create a new account via Quick Start form
2. Verify application record is created with status `'new'`
3. Continue to full form and submit with documents
4. Verify status updates to `'pending_review'`
5. Check dashboard shows correct status tracker progression
