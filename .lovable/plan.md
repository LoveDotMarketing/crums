

# Fix Missing Business Name and Data Consistency

## Problems Found

1. **Miguel Carcamo's customer record** has "Ducky Transport LLC" in the `full_name` field instead of his actual name. The `company_name` field is empty. This means searching "Miguel" on the Customers page returns nothing.

2. **The customer Profile page** does not show or allow editing of Company Name. Customers have no way to enter their business name.

3. **The Rental Application** has fields for Business Address and Business Type but no field for the actual business/company name. So the company name never gets captured during onboarding.

4. **The sync trigger** (profiles -> customers) copies `company_name` from profiles, but since it's never set in profiles, it remains empty in customers.

---

## Plan

### Step 1: Add Company Name field to the Customer Profile page
Add a "Company Name" input field to `src/pages/customer/Profile.tsx` in the Personal Information section. Include it in the fetch, state, and save logic so it syncs to the `profiles` table (and via trigger to `customers`).

### Step 2: Add Company Name field to the Rental Application
Add a "Company / Business Name" input to `src/pages/customer/Application.tsx` in the Business Information section. This will save to the `profiles.company_name` field when the application is submitted, which then triggers the sync to the `customers` table.

### Step 3: Fix Miguel's data in the database
Run a database migration to:
- Update the `customers` record for `duckytransport@outlook.com`: set `full_name` to "Miguel Carcamo" and `company_name` to "Ducky Transport LLC"
- Update the `profiles` record: set `company_name` to "Ducky Transport LLC"

### Step 4: Improve admin customer search
Update the Customers page search in `src/pages/admin/Customers.tsx` to also match against linked profile `first_name`/`last_name`, so searching "Miguel" will find the customer even if `full_name` in the customers table differs.

---

## Technical Details

### Files Modified
- `src/pages/customer/Profile.tsx` -- Add company_name to state, fetch, form, and save
- `src/pages/customer/Application.tsx` -- Add company/business name field that saves to profiles.company_name
- `src/pages/admin/Customers.tsx` -- Extend search to include profile first/last name
- Database migration -- Fix Miguel's records and set company_name

### Profile Page Changes
```text
// Add to profile state
company_name: ""

// Add to fetchProfile
company_name: data.company_name || ""

// Add to handleSubmit update
company_name: profile.company_name

// Add field in the form between Email and Phone Number
<Label>Company Name</Label>
<Input value={profile.company_name} onChange={...} />
```

### Application Page Changes
Add a "Company / Business Name" field in the Business Information section that reads/writes to `profiles.company_name`. When saving the application, also update the profile's company_name.

### Data Fix Migration
```text
-- Fix Miguel Carcamo's records
UPDATE customers SET full_name = 'Miguel Carcamo', company_name = 'Ducky Transport LLC'
  WHERE lower(email) = 'duckytransport@outlook.com';

UPDATE profiles SET company_name = 'Ducky Transport LLC'
  WHERE lower(email) = 'duckytransport@outlook.com';
```

