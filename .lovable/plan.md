

## Restore Deleted Customers and Prevent Accidental Permanent Deletion

### The Problem
The current "Delete Customer" button performs a **permanent hard delete** -- it removes the customer record and cascades through outreach logs, referral codes, referrals, tolls, and applications. Once deleted, there is no way to recover.

Your system already has an **archive** feature (soft delete with `status='archived'`, `archived_at`, `archived_by` columns), but the delete button bypasses it entirely.

### What We'll Change

**1. Replace "Delete" with "Archive" as the default action**
- The dropdown menu will show "Archive Customer" instead of "Delete Customer"
- Archiving sets `status = 'archived'`, `archived_at = now()`, `archived_by = admin name` -- no data is destroyed
- A separate "Permanently Delete" option will be available only for already-archived customers, with a stronger warning

**2. Add a "Restore Customer" button for archived customers**
- When viewing the archived customers list, each row gets a "Restore" action
- Restoring sets `status = 'active'`, clears `archived_at` and `archived_by`

**3. Check if the recently deleted customer can be recovered**
- Unfortunately, if the hard delete already ran, the record is gone from the database. I'll check the archived list to see if it's there instead.

### Files Changed

**`src/pages/admin/Customers.tsx`**
- Replace the delete mutation with an archive mutation (sets status to archived)
- Add a restore mutation (sets status back to active)
- Add "Restore" action in the dropdown for archived customers
- Move "Permanently Delete" behind a second confirmation, only available for archived records
- Update confirmation dialog text for archive vs. permanent delete

### Technical Details

```text
Current Flow:
  Delete Button --> Hard delete (cascading) --> Data gone forever

New Flow:
  Archive Button --> Soft delete (status='archived') --> Data preserved
  Restore Button --> Set status='active' --> Customer is back
  Permanent Delete --> Only for archived customers --> Extra confirmation --> Hard delete
```

No database changes needed -- the `archived_at`, `archived_by`, and `status` columns already exist.
