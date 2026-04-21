

## Plan: Make "Log Commission" understandable for non-technical staff

### Problem
Ambrosia opened the **Log Commission** dialog for Big Bird and saw a field labeled "Subscription ID" with placeholder "Paste subscription UUID." She has no idea what to paste — UUIDs aren't visible anywhere in the UI she'd browse, and the term itself is jargon.

### Root cause in `src/pages/admin/Referrals.tsx`
The dialog asks for a raw subscription UUID input. It only shows a "select an attributed customer" list when `selectedPartnerSubscriptions` (subscriptions where `partner_id = <this partner>`) returns rows. If no subscription has been tagged with `partner_id` for that partner, she's stuck with an empty box and no guidance.

### Fix — replace the UUID input with a customer-first picker

In the **Log Commission** dialog:

1. **Remove the "Subscription ID" label and free-text UUID input.** Replace with a labeled **"Customer Subscription"** combobox (searchable Select) that lists every active subscription, displayed as:
   `{Customer Name / Company} — {subscription_type} — ${monthly_total}/mo`
   Filter the list to subscriptions attributed to this partner first (sorted to top with a "★ Attributed to {partner.name}" badge), followed by all other active subscriptions. This way she can:
   - Quickly pick a Big Bird-attributed customer if one exists, OR
   - Pick *any* customer Big Bird referred even if the subscription wasn't tagged with `partner_id` at creation time.
2. **Add helper copy under the field:** "Pick the customer's subscription this commission is for. Big Bird earns 15% of their monthly lease for the first contract period."
3. **Auto-suggest commission amount** when a subscription is selected: pre-fill `commission_amount` with `monthly_total × partner.commission_rate` (rounded to 2 decimals). She can override.
4. **Auto-fill Period Start / Period End** with the current calendar month (1st → last day) when a subscription is selected. She can override.
5. **Keep the underlying database write unchanged** — `subscription_id` still stores the UUID; only the UI changes.

### Data fetch update
Extend the existing `partner-subscriptions` query (or add a new one) to fetch **all active customer subscriptions** with customer name/company and their items' `monthly_rate`, not just ones where `partner_id` is set. Sort attributed ones to the top in the picker.

### Files
1. `src/pages/admin/Referrals.tsx` — replace UUID input with searchable customer-subscription combobox, add helper text, auto-suggest amount + period dates, broaden the subscription query.

### Out of scope
- No DB schema changes.
- No edge function changes.
- The "B2B Referrals 15% on initial contract period only" rule (per memory) is preserved — just surfaced in the helper copy.

