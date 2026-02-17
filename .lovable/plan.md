

## Fix: Application Form Data Getting Lost

### Root Cause

There's a **race condition** between localStorage restore and the database fetch that causes the customer's typed data to be wiped out:

1. Page loads -- localStorage restores the user's previously typed data (good)
2. `fetchData()` runs and **overwrites the entire state** with database values (bad)
3. Since this customer's profile is all NULL in the database, the state gets reset to empty strings
4. The localStorage save effect then fires and **saves the now-empty state**, destroying the backup too

So every time the page loads or re-renders, all their work gets erased. This is especially bad on mobile where browsers reload tabs more aggressively.

Additionally, the localStorage save condition (line 125) only triggers if `first_name`, `company_address`, or `insurance_company` are truthy -- so if the user fills in other fields first (like phone, trailer type, documents), those edits are never saved to localStorage at all.

### The Fix

**1. Make `fetchData` merge with existing state instead of overwriting**

When fetching from the database, only overwrite a field if the database actually has a value for it. Preserve any locally-typed data that hasn't been saved to the DB yet.

```
setProfile(prev => ({
  first_name: profileData.first_name || prev.first_name || "",
  last_name: profileData.last_name || prev.last_name || "",
  ...
}));
```

Same for the application data -- merge instead of replace.

**2. Fix the localStorage save condition**

Change the guard condition to save whenever ANY field has data, not just three specific fields. This prevents silently dropping edits to phone, trailer type, documents, etc.

```
// Before (broken): only saves if these 3 specific fields are set
if (profile.first_name || application.company_address || application.insurance_company)

// After (fixed): saves whenever any meaningful data exists  
const hasData = Object.values(profile).some(v => v) || 
                Object.values(application).some(v => v && v !== 'new');
if (hasData) { ... }
```

**3. Add auto-save on blur (not just on submit)**

Currently the form only saves to the database when the user scrolls to the bottom and clicks "Save Application". Add a debounced auto-save that saves profile data after the user finishes typing in a field, so progress isn't lost if they navigate away.

### Files to Change

| File | Change |
|------|--------|
| `src/pages/customer/Application.tsx` | Fix fetchData merge logic, broaden localStorage save condition, add debounced auto-save |

### What This Fixes for Trinity Freight

- Their profile has all NULL fields in the database, so every page load was wiping their form
- Any data they typed was being overwritten within milliseconds by the empty database response
- After this fix, typed data will persist through page reloads and auto-save to the database as they go
