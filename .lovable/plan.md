

## Fix: "Failed to add trailer" for staff without company_id

### Root Cause
Eric Bledsoe's profile (`eric@crumsleasing.com`) has `company_id: NULL`. When adding a trailer, the code uses the logged-in user's `company_id` from their profile. Since it's null, `companyId` stays as an empty string `""`, which fails the UUID NOT NULL constraint on the `trailers` table.

All existing trailers use the same company ID: `fac613bd-c65f-42a5-b241-75afe75d53c5`.

### Plan

**1. Database fix — set Eric's company_id**
Run a migration to set the correct `company_id` on Eric's profile so he can add trailers immediately.

**2. Code fix — add fallback in `Fleet.tsx`**
When the admin's profile has no `company_id`, fall back to fetching it from an existing trailer in the fleet. This prevents this issue from happening for any future staff member.

In `src/pages/admin/Fleet.tsx` around line 162-165, after the profile fetch, add a fallback:

```typescript
if (profileData?.company_id) {
  setCompanyId(profileData.company_id);
} else {
  // Fallback: get company_id from existing trailers
  const { data: existingTrailer } = await supabase
    .from("trailers")
    .select("company_id")
    .limit(1)
    .single();
  if (existingTrailer?.company_id) {
    setCompanyId(existingTrailer.company_id);
  }
}
```

Also add a guard in `handleAddTrailer` to show a clear error if `companyId` is still empty:
```typescript
if (!companyId) {
  toast.error("Company configuration missing. Contact admin.");
  return;
}
```

### Files changed
- **Database migration** — UPDATE Eric's profile with correct company_id
- `src/pages/admin/Fleet.tsx` — fallback logic + guard

