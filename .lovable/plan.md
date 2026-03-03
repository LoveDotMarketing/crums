

## Create Big Bird Transportation Partner Profile

### What Already Exists
The partner referral infrastructure is fully built — the `partners` table, `partner_commissions` table, and the admin Referrals → Partners tab all exist and are functional. No code changes are needed.

### Data Insert

Insert one record into the `partners` table:

| Field | Value |
|-------|-------|
| name | Big Bird Transportation |
| company_name | Big Bird Inc |
| email | mercy@bigbirdinc.co |
| referral_code | BIGBIRD |
| commission_rate | 0.15 (15%) |
| notes | 15% commission for 12 months on referred customer contracts. Commission applies to initial contract period only. |
| is_active | true |

### Result
- Partner will appear in **Admin → Referrals → Partners** tab immediately
- Referral code `BIGBIRD` will be active and usable for lead tracking
- Commissions can be logged against this partner from the admin panel
- The existing partner detail view shows their commission history, owed/paid totals, and linked subscriptions

No code changes required.

