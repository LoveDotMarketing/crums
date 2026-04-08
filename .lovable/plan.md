

## Fix: Staff Row Clickability + Auto-Create Staff Profiles

### Problem
The `invite-staff` edge function creates the auth user and assigns a role, but never creates a `staff_profiles` row. This causes two issues:
- Staff table rows aren't clickable (the click handler requires `staffProfileId`)
- Employee Dashboard shows "No Staff Profile Found"

### Solution

**1. Update `invite-staff` edge function** to auto-create a `staff_profiles` row when inviting any staff member. This includes generating a referral code (`CRUMS-XXXXXX`), setting the position based on role, and linking to the user.

**2. Make all staff rows clickable in `Staff.tsx`** — if a staff member somehow doesn't have a `staff_profiles` row (e.g. created before this fix), auto-create one when clicked, then navigate. Alternatively, always show the row as clickable and handle the missing profile gracefully in StaffDetail.

**3. Backfill existing staff** — add a one-time check: when the Staff list loads and finds users without `staff_profiles`, create entries for them automatically.

### Files changed

| File | Change |
|------|--------|
| `supabase/functions/invite-staff/index.ts` | After role insert, also insert into `staff_profiles` with generated referral code, position, and `is_active = true` |
| `src/pages/admin/Staff.tsx` | Make every row clickable. If no `staffProfileId`, create a `staff_profiles` row on click, then navigate. Remove the conditional cursor/click logic. |

### Key code addition in invite-staff

```typescript
// Generate referral code
const code = 'CRUMS-' + Math.random().toString(36).substring(2, 8).toUpperCase();
const position = role === 'mechanic' ? 'mechanic' : role === 'sales' ? 'salesman' : 'administrator';

await supabaseAdmin.from('staff_profiles').insert({
  user_id: userId,
  referral_code: code,
  position,
  is_active: true,
  commission_rate: role === 'sales' ? 0.15 : 0,
});
```

### Result
- Adam (and any future invitees) will immediately have a staff profile
- Their row on the Staff page will be clickable from the start
- Employee Dashboard will show their referral code, leads, and performance data

