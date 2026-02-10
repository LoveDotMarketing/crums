

## Enhance Mechanic ID Verification for Customer Pickup

### What This Does
When a customer arrives at the yard to pick up their trailer, the mechanic needs to confirm the person is who they claim to be. The system already has a pending pickups queue and a checkout dialog with an ID verification step, but currently the driver's license is only shown as a clickable link. This update will display the customer's uploaded ID photo **inline** so the mechanic can visually compare it to the person standing in front of them, alongside the customer's profile name for a side-by-side identity check.

### Current Flow (already working)
1. Admin schedules a release -- appears in mechanic's "Pending Customer Pickups" queue
2. Mechanic starts DOT inspection on the trailer
3. After inspection, mechanic opens the Customer Checkout dialog
4. Dialog checks eligibility (application approved, ID uploaded, ACH linked)
5. **ID Verification step** -- mechanic confirms physical ID matches (currently just a "View Document" link)
6. Final release -- trailer marked as rented

### Changes

**1. Customer Checkout Dialog -- Inline ID Display (`src/components/mechanic/CustomerCheckoutDialog.tsx`)**
- Replace the "View Document" external link with an inline `<img>` tag showing the driver's license front photo directly in the dialog
- Add a second inline image for the driver's license back
- Display the customer's **full name** and **company** prominently above the images so the mechanic can compare name-on-ID vs name-on-file
- Add a visual "Name on File" badge next to the images for quick cross-reference
- Keep the external link as a fallback "Open Full Size" option beneath the image

**2. Pending Releases Queue -- Customer Name Visibility (`src/components/mechanic/PendingReleasesQueue.tsx`)**
- Already shows customer name, company, phone, and pickup date -- no changes needed here

### Technical Details

**CustomerCheckoutDialog.tsx -- ID Verify Step (lines ~440-504):**
- Replace the simple link with an image grid:
  - Front of license displayed as an inline image (max-height constrained for the dialog)
  - Back of license displayed as an inline image
  - Both images clickable to open full-size in a new tab
- Add a prominent "Name on File" section showing `customer.full_name` and `customer.company_name` so the mechanic can compare it to the name printed on the physical ID
- Add visual cues: a bordered comparison card with the profile name on one side and the ID image on the other

**Image source:** The driver's license URLs come from `customer_applications.drivers_license_url` and `drivers_license_back_url`, which are already fetched during the eligibility check and passed through `eligibility.profile.drivers_license_url`.

