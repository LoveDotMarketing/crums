
# Add "Download Customers" CSV Export to Customer Management Page

## What's Being Added

A **Download Customers** button placed next to the existing **Add Customer** button in the page header. Clicking it immediately generates and downloads a CSV file containing the full customer profile data for all customers currently visible (respecting the active search/filter) — or all customers if no filter is active.

## Data Included in the CSV Export

The export will combine data already loaded on the page from three sources — `customers`, `profiles`, and `customer_applications` — since these are all fetched together in the existing `useQuery`. The exported columns will be:

| Column | Source |
|---|---|
| Account Number | customers |
| Full Name | customers |
| First Name | profiles |
| Last Name | profiles |
| Email | customers |
| Phone | customers |
| Company Name | customers |
| City | customers |
| State | customers |
| ZIP | customers |
| Home Address | profiles |
| Company Address | customer_applications |
| Business Type | customer_applications |
| DOT Number (URL) | customer_applications |
| Truck VIN | customer_applications |
| Trailer Type | customer_applications |
| Insurance Company | customer_applications |
| Secondary Contact Name | customer_applications |
| Secondary Contact Phone | customer_applications |
| Secondary Contact Relationship | customer_applications |
| Application Status | customer_applications |
| ACH Linked | computed |
| Payment Setup Status | customer_applications |
| Trailers Assigned | computed count |
| Trailer Numbers | computed (comma joined) |
| Outstanding Tolls ($) | computed |
| Referral Code | referral_codes |
| Referrals Sent | computed |
| Credits Earned ($) | computed |
| Was Referred | computed |
| Customer Status | customers |
| Payment Type | customers |
| Created At | customers |

## Technical Implementation

### What needs to change

**File: `src/pages/admin/Customers.tsx`** — two additions:

1. **Extend the existing `useQuery` data fetch** to also pull the extra application fields needed for the CSV that aren't currently fetched: `company_address`, `business_type`, `truck_vin`, `insurance_company`, `secondary_contact_name`, `secondary_contact_phone`, `secondary_contact_relationship`, `payment_setup_status`, `dot_number_url`. These get stored per-customer via the existing map. Profile's `home_address` is already being selected.

2. **Add `handleExportCSV` function** — a pure client-side function that:
   - Takes `sortedCustomers` (the currently filtered/sorted list) as its data source — so if a filter is active it exports only matching customers; if no filter, all customers
   - Builds CSV rows by mapping over each customer
   - Handles commas and quotes in fields using standard CSV escaping
   - Creates a `Blob`, generates a temporary download URL, triggers a `<a>` click, and revokes the URL
   - Names the file `customers-export-YYYY-MM-DD.csv`

3. **Add `Download` icon import** from `lucide-react`

4. **Add the button** in the header next to "Add Customer":
   ```
   [Download Customers]  [+ Add Customer]
   ```
   Button uses `variant="outline"` with a `Download` icon — visually secondary to the primary Add action.

### No backend changes needed
All the data is already being fetched on page load. The CSV is generated entirely in the browser — no new edge function, no new database query, no migrations.

### Scope: Export follows current filter/sort
- If the admin has filtered to "Active" status or searched for a specific name, the CSV will export only those matching rows — matching what they see on screen.
- The button label will say **"Download Customers"** when no filter is active, making it clear it exports everything visible.

## Files Changed

| File | Change |
|---|---|
| `src/pages/admin/Customers.tsx` | Add `handleExportCSV` function, extend application fields in data map, add Download button in header |
