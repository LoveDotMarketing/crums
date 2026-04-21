

## Plan: Log every customer a partner brought in (paid or not)

### What Ambrosia wants
On Big Bird's partner detail page, she needs to log **every** customer Big Bird referred — even prospects who never signed up, and signed customers who aren't paying out commission yet. Today the only way to associate a customer with a partner is via the **Log Commission** dialog, which requires a real subscription + dollar amount.

### Solution: a new "Attributed Customers" log per partner

Add a new table `partner_referred_customers` that stores a simple, free-form log of any person/business a partner brought in. It's independent from billing/subscriptions — purely an attribution ledger.

**New table fields**
- `id` (uuid)
- `partner_id` (uuid → partners.id)
- `customer_name` (text, required) — e.g. "Royal Duck Logistics"
- `company_name` (text, optional)
- `email` (text, optional)
- `phone` (text, optional)
- `status` (text: `lead` | `signed_up` | `active_customer` | `lost`, default `lead`)
- `linked_customer_id` (uuid, optional → customers.id) — set if/when they become a CRUMS customer
- `linked_subscription_id` (uuid, optional → customer_subscriptions.id) — set if commission later applies
- `notes` (text, optional)
- `referred_at` (date, default today)
- `created_by` (uuid)
- `created_at`, `updated_at` (timestamps)

RLS: admin full access; `sales` read-only.

### UI changes — `src/pages/admin/Referrals.tsx`

In the **Partner Detail dialog** (the dialog that opens when you click Big Bird):

1. **New section above "Commissions": "Attributed Customers"**
   - Table columns: Customer, Company, Status badge, Referred Date, Linked CRUMS Customer (if any), Actions (edit / delete / "Link to Subscription").
   - Empty state: "No customers logged yet for {partner name}."
   - "+ Log Customer" button opens a dialog.

2. **"Log Customer" dialog** (new)
   - Customer Name * (text)
   - Company (text)
   - Email (text)
   - Phone (text)
   - Status (select: Lead / Signed Up / Active Customer / Lost — default Lead)
   - Optional: searchable "Link to existing CRUMS customer" combobox (if they're already in `customers` table — auto-populates name/email/company)
   - Notes (textarea)
   - Save → inserts into `partner_referred_customers`

3. **Smart linking**
   - If she sets status to "Active Customer" and links a CRUMS customer, show a quick-action button: **"Log Commission for this Customer"** that opens the existing Log Commission dialog pre-filtered to that customer's active subscriptions.
   - Conversely, in the existing **Log Commission** dialog: when she picks a subscription that belongs to a customer already in the partner's attributed log, auto-link the new commission row to that attribution entry (set `linked_subscription_id`).

4. **Partner card on the main Partners tab**
   - Add a small stat next to "Commissions": **"Customers brought in: {count}"** so Ambrosia sees at a glance how productive Big Bird has been even without payouts.

### What stays the same
- `partner_commissions` table — unchanged. Still used only for actual payouts.
- `Log Commission` dialog — unchanged from last release (searchable subscription picker, auto-suggested amount).
- Partners table, referral codes, customer-side referral flow — unchanged.

### Files
1. **New migration** — create `partner_referred_customers` table + RLS (admin all, sales read).
2. **`src/pages/admin/Referrals.tsx`** — add Attributed Customers section, Log Customer dialog, customer count stat, and the optional subscription auto-link in Log Commission.

### Out of scope
- No edge function changes.
- No automatic detection of "this new customer mentioned Big Bird" — purely manual logging by staff (matches Ambrosia's screenshot intent).
- No payout/commission logic changes — payouts still flow through `partner_commissions`.

