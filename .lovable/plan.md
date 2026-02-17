

## Fix: Admin Dashboard Recent Activity Identity & Sorting

### Problem
1. Isaac Lee appears as "Lone Star Logistics Unlimited" because the activity feed shows `company_name` first, hiding the person's actual name
2. The feed only fetches by `created_at`, so recent application updates (saves, status changes) don't appear as new activity

### Changes

**File: `src/pages/admin/AdminDashboard.tsx`**

1. Change the customer name display for applications to show **both** name and company:
   - Format: `"Isaac Lee"` with company as subtitle, or `"Isaac Lee - Lone Star Logistics Unlimited"` if both exist
   - Fall back to email if no name is set

2. Sort applications by `updated_at` instead of `created_at` so recent saves/edits appear in the feed

3. Sort the combined activities list by recency (currently it just concatenates tolls then applications without interleaving by time)

### Technical Detail

Current code (line 163-176):
```typescript
// Shows company_name FIRST, hiding the person's name
const customerName = profile?.company_name || 
  [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || 
  "New Applicant";
```

New logic:
```typescript
// Show person's name first, company in parentheses
const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
const customerName = fullName 
  ? (profile?.company_name ? `${fullName} - ${profile.company_name}` : fullName)
  : profile?.company_name || profile?.email || "New Applicant";
```

Application query change:
- Sort by `updated_at` descending instead of `created_at`
- Use `updated_at` for the time display so it says "14 minutes ago" based on last update

Combined activity sort:
- Add a raw timestamp to each activity entry
- Sort the merged array by timestamp descending before slicing to 6

