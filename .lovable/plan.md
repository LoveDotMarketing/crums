
## Trailer Soft-Delete and Restore Feature

### The Problem
Currently, trailers can only be permanently deleted. Once deleted, they are completely removed from the system with no way to recover them. The database already has the necessary columns to support soft-delete (`archived_at`, `archived_by` via status change), but the UI only performs hard deletes.

### What We'll Build
A soft-delete system for trailers that:
1. **Archives** trailers instead of permanently deleting them (sets `status = 'archived'`)
2. **Filters out** archived trailers from the normal fleet view
3. **Shows archived trailers** in a separate list with restore functionality
4. **Restores** archived trailers back to `active` or `available` status
5. **Prevents accidental data loss** while maintaining the ability to permanently remove records

### Architecture Overview
```text
Trailer Deletion Flow:

BEFORE (Hard Delete):
  Delete Button --> Hard delete cascade --> Data lost forever

AFTER (Soft Delete with Restore):
  Archive Button --> Set status='archived' --> Data preserved
  Fleet View --> Filter out status='archived' --> Normal workflow
  Archived List --> Show status='archived' --> Admin can restore
  Restore Button --> Set status='available' --> Back in fleet
  Permanent Delete --> Only for archived records --> Extra confirmation
```

### Database Changes
**No schema changes needed.** The trailers table already has a `status` column that supports archive semantics. We'll use:
- `status = 'archived'` to indicate archived trailers
- Filter logic in queries to exclude archived trailers from normal views
- Separate admin page to view and restore archived trailers

### UI Changes

**1. Fleet.tsx (Update Archive/Delete Behavior)**
- Change "Delete Trailer" button to "Archive Trailer"
- Archive operation: `UPDATE trailers SET status = 'archived' WHERE id = ?`
- Remove data from normal fleet view (add `status != 'archived'` to query filter)
- Add button/link to view archived trailers

**2. TrailerDetail.tsx (Single Trailer Page)**
- Change "Delete" button label to "Archive"
- Archive sets `status = 'archived'`
- If already archived, show "Restore" and "Permanently Delete" buttons instead
- Restore sets `status = 'available'`

**3. New Admin Page: AdminArchivedTrailers.tsx**
- List all trailers with `status = 'archived'`
- Show trailer number, type, year, customer info, archive date
- Restore button (sets status back to 'available')
- Permanent delete button (only for archived records, with extra confirmation)
- Link in AdminSidebar

**4. AdminSidebar.tsx**
- Add link to "Archived Trailers" in Fleet section

### Implementation Files

**Files to Create:**
- `src/pages/admin/AdminArchivedTrailers.tsx` -- Manage archived trailers

**Files to Modify:**
- `src/pages/admin/Fleet.tsx` -- Change delete to archive, add filter
- `src/pages/admin/TrailerDetail.tsx` -- Archive/restore UI based on status
- `src/components/admin/AdminSidebar.tsx` -- Add sidebar link
- `src/App.tsx` -- Add route for archived trailers page

### Technical Details

**Archive operation** (soft delete):
```typescript
await supabase.from('trailers').update({ status: 'archived' }).eq('id', trailerId);
```

**Restore operation**:
```typescript
await supabase.from('trailers').update({ status: 'available' }).eq('id', trailerId);
```

**Filter logic** (exclude archived from normal fleet view):
```typescript
.neq('status', 'archived')  // Add to existing query
```

**Permanent delete** (only for archived):
```typescript
await supabase.from('trailers').delete().eq('id', trailerId);
```

### User Flow

**Admin Archives Trailer:**
1. Views Fleet Management page
2. Clicks "Archive" on a trailer row (not "Delete")
3. Confirms archive action
4. Trailer disappears from fleet list (not deleted, just hidden)
5. Toast: "Trailer {number} archived"

**Admin Views Archived Trailers:**
1. Clicks "Archived Trailers" link in sidebar
2. Sees list of all archived trailers with archive timestamp
3. Can restore any archived trailer
4. Can permanently delete archived trailers (with extra confirmation)

**Admin Restores Trailer:**
1. On archived trailers page, clicks "Restore"
2. Trailer status changes back to `available`
3. Trailer reappears in normal fleet view
4. Toast: "Trailer {number} restored"

### Prevents Accidental Loss
- Archive is reversible
- Normal "Delete" is gone
- Permanent deletion only available for already-archived records
- Extra confirmation required for permanent deletion
- All data preserved during archive period
