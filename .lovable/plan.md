
# Partner Referral Program — Big Bird Trans

## What This Is

This is a **B2B partner referral system** — distinct from the existing customer-to-customer referral program ($250 one-time credit). Big Bird Trans is a **business partner** who earns a **15% monthly revenue share** for every active customer they bring to CRUMS, for the lifetime of that customer's original contract. When a customer renews, CRUMS keeps 100% — the partner commission only applies to the initial contract period.

---

## How It Differs from the Existing Referral System

| | Existing Referrals | Partner Referrals (Big Bird) |
|---|---|---|
| Who uses it | Individual customers | Business partners |
| Reward type | $250 one-time credit | 15% monthly revenue share |
| Duration | One-time on approval | Every month for contract duration |
| Applies on renewal | Yes (new referral) | No — original contract only |
| Tracked how | `referrals` table | New `partner_commissions` table |

---

## Database Changes Required

### 1. New Table: `partners`
Stores partner companies (like Big Bird Trans), their unique referral code, and commission rate.

```sql
CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company_name text,
  email text,
  phone text,
  referral_code text UNIQUE NOT NULL,
  commission_rate numeric NOT NULL DEFAULT 0.15,
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 2. New Column: `partner_id` on `customer_subscriptions`
Links a subscription to the partner who referred that customer. Only the **original** subscription gets the link — renewals are new subscriptions with no partner ID.

```sql
ALTER TABLE public.customer_subscriptions 
ADD COLUMN partner_id uuid REFERENCES public.partners(id);
```

### 3. New Table: `partner_commissions`
Tracks each monthly payout owed to a partner per subscription billing cycle. Auto-calculated at 15% of the `net_amount` from `billing_history`.

```sql
CREATE TABLE public.partner_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partners(id),
  subscription_id uuid NOT NULL REFERENCES public.customer_subscriptions(id),
  billing_history_id uuid REFERENCES public.billing_history(id),
  commission_amount numeric NOT NULL,
  commission_rate numeric NOT NULL,
  billing_period_start date,
  billing_period_end date,
  status text NOT NULL DEFAULT 'pending',  -- pending, paid, voided
  paid_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

RLS policies: admin-only manage, no public access.

---

## Admin UI Changes

### New Tab in Admin → Referrals: "Partners"
A new tab alongside the existing "Referrals" and "Referral Codes" tabs.

**Partners Tab contains:**
- Create Partner button (dialog with: name, company, email, phone, referral code, commission rate)
- Partners table: Name | Company | Code | Commission Rate | Active Customers | Monthly Payout Owed | Status | Actions

**Partner Detail / Commission Tab:**
- Shows all subscriptions attributed to that partner
- For each subscription: Customer Name | Monthly Rate | Commission (15%) | Period | Status
- Running total of commissions owed vs. paid

### Admin → Billing: Subscription Row Enhancement
- Add a "Partner" column to the subscriptions table showing partner name + commission badge if a partner is linked
- In the subscription action menu (the `...` dropdown), add **"Assign Partner"** option — opens a dialog with a dropdown of all active partners, allowing manual assignment when a customer didn't use the referral code

### Partner Code Entry — Customer Signup / Application
- The existing referral code field (`?ref=CODE` URL param and signup form) will also check the `partners` table
- If the code matches a partner (not a customer referral code), it stores the `partner_id` on the subscription instead of creating a `referral` record

---

## Files to Create/Modify

| File | Change |
|---|---|
| `supabase/migrations/XXXXXX_partners.sql` | Create `partners`, `partner_commissions` tables + `partner_id` column on subscriptions |
| `src/pages/admin/Referrals.tsx` | Add "Partners" tab with partner management and commission tracking |
| `src/pages/admin/Billing.tsx` | Add "Assign Partner" action in subscription dropdown + partner badge on subscription rows |
| `src/lib/referral.ts` | Extend `processReferralCode` to check partner codes in addition to customer codes |
| `src/pages/GetStarted.tsx` (or signup form) | Handle `?ref=CODE` for partner codes at signup |

---

## Commission Calculation

Commissions are **not** automatically charged to Stripe — they are tracked as an internal obligation. Workflow:
1. Each time a billing_history record is created with `status = 'succeeded'` for a subscription that has a `partner_id`, an admin can generate the commission record (or this can be done manually via "Log Commission" in the Partners tab).
2. Admin marks commissions as "Paid" when the partner invoice is settled.
3. Dashboard shows total owed to each partner at a glance.

---

## Edge Cases Handled

- **Manual assignment**: If a customer doesn't enter the code, admin uses "Assign Partner" on the subscription from Billing
- **Renewals**: New subscriptions have no `partner_id` by default — the link only exists on the original contract
- **Commission rate changes**: The rate is locked at the time the commission record is created (stored per-record), not recalculated if the partner rate changes later
- **Deactivating a partner**: Setting a partner `is_active = false` hides them from new assignment but preserves all historical commission records
- **Conflict with existing referral codes**: Partner codes use a different namespace (e.g., `BIGBIRD-XXXX` or custom) — the system checks partners first, then customer referral codes

---

## Summary of What This Gives You

- A dedicated **Big Bird Trans partner profile** with a unique code (e.g., `BIGBIRD-2025`) you can include in the contract
- Every customer who enters that code at signup is automatically linked — partner revenue is tracked from day one
- Admins can manually link any customer subscription to Big Bird if the code wasn't entered
- A clear monthly commission dashboard showing exactly what is owed
- Renewals are protected — Big Bird only earns on the original contract period, not on customers who choose to stay
