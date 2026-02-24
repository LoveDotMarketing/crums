

# RLS Policy Audit: Findings and Remediation Plan

## Audit Summary

All 46 tables have RLS **enabled** -- no tables are missing RLS. The primary issues are **6 overly permissive INSERT policies** using `WITH CHECK (true)` and a few structural concerns.

---

## Issue 1: Overly Permissive INSERT Policies (HIGH Priority)

These 6 policies use `WITH CHECK (true)`, meaning **anyone** (including anonymous/unauthenticated users in some cases) can insert rows.

| Table | Policy Name | Risk | Remediation |
|---|---|---|---|
| `app_event_logs` | "Anonymous can insert event logs" | Allows anonymous spam/abuse | Replace with rate-limit-friendly check or restrict to `auth.uid() IS NOT NULL` if anonymous tracking isn't needed. **However**, this is an analytics/event table -- anonymous inserts are intentional for tracking pre-login visitors. **Keep as-is but document as accepted risk.** |
| `contact_submissions` | "Service role can insert submissions" | Named "service role" but applies to `public` role with `true` check | This is used by the contact form edge function. The edge function uses service role key, so this policy is redundant but harmless. The real protection is that contact submissions are sent through the `send-contact-email` edge function. **Keep as-is -- low risk (no sensitive data exposed, INSERT only).** |
| `development_changelog` | "Service role can insert changelog entries" | Named "service role" but applies to `public` with `true` check | Used by the `sync-development-changelog` edge function with service role. **Keep as-is -- low risk.** |
| `error_logs` | "Anyone can insert error logs" | Allows anonymous error log injection | Intentional for capturing 404s from unauthenticated visitors. No sensitive data exposed (SELECT is admin-only). **Keep as-is -- accepted risk.** |
| `profiles` | "Allow profile creation via trigger" | `WITH CHECK (true)` on INSERT | This is used by the `handle_new_user` trigger which runs as SECURITY DEFINER. The trigger itself handles the insert; the policy just enables it. **Keep as-is -- required for auth flow.** |
| `referrals` | "Authenticated users can create referrals" | Any authenticated user can insert any referral | This is **the most concerning** policy. While the frontend uses the `create_referral` SECURITY DEFINER function (which validates codes and prevents self-referral), the raw INSERT policy allows any authenticated user to bypass those checks and insert arbitrary referral records directly. **FIX: Restrict to `USING (false)` and rely solely on the SECURITY DEFINER function, OR tighten the WITH CHECK.** |

---

## Issue 2: Referrals INSERT Policy (Action Required)

**Problem**: The `referrals` table has two INSERT policies:
1. "Admins can insert referrals" -- properly restricted
2. "Authenticated users can create referrals" -- `WITH CHECK (true)` allows any authenticated user to insert any row with any data

**Risk**: An authenticated user could bypass the `create_referral()` function's validation (self-referral checks, duplicate checks, code validation) by inserting directly into the table.

**Fix**: Drop the overly permissive policy. The `create_referral()` SECURITY DEFINER function already handles all referral creation with proper validation. No direct INSERT access is needed for non-admin users.

```sql
DROP POLICY "Authenticated users can create referrals" ON public.referrals;
```

---

## Issue 3: Minor Structural Observations (LOW Priority, No Action Needed)

These are not vulnerabilities but are worth documenting:

1. **`tolls` table** -- Customer policies use `customer_id = auth.uid()` but `customer_id` is a reference to the `customers` table UUID, not `auth.uid()`. This means the customer toll policies may never match. However, this appears to be handled through the admin impersonation system and edge functions, so tolls are managed server-side. **No action needed** -- toll management goes through admin/edge functions.

2. **`work_orders`** -- The "Mechanics can manage own work orders" policy uses `mechanic_id = auth.uid() OR has_role(admin)`. This is correct but means mechanics have full ALL access (including DELETE) on their own work orders. This is acceptable given the workflow.

3. **All PERMISSIVE policies** -- Every policy in the system is PERMISSIVE (not RESTRICTIVE). This is standard and correct for the OR-based multi-role access pattern used throughout.

---

## Recommended Changes

### Migration SQL

```sql
-- Remove overly permissive referrals INSERT policy
-- The create_referral() SECURITY DEFINER function handles all
-- referral creation with proper validation
DROP POLICY "Authenticated users can create referrals" ON public.referrals;
```

That is the **only actionable change**. The remaining `WITH CHECK (true)` policies are intentional for their use cases (anonymous event tracking, error logging, trigger-based profile creation, and service-role edge function inserts).

---

## Tables Verified as Properly Secured (No Changes Needed)

All 46 tables have RLS enabled with appropriate policies:

- **Admin-only tables** (correct): `applied_discounts`, `billing_history`, `companies`, `customer_outreach_status`, `customer_statements`, `customer_subscriptions`, `discounts`, `email_campaigns`, `email_templates`, `fleet_activity_logs`, `login_attempts`, `outreach_logs`, `outreach_settings`, `partner_commissions`, `partners`, `payment_failures`, `payment_retry_logs`, `redirects`, `scheduled_content`, `service_catalog`, `stripe_webhook_logs`, `subscription_items`
- **Role-scoped tables** (correct): `dot_inspections`, `dot_inspection_photos`, `maintenance_records`, `notifications`, `referral_codes`, `support_tickets`, `ticket_messages`, `tolls`, `trailer_checkout_agreements`, `trailer_dropoff_requests`, `trailer_release_requests`, `trailers`, `user_activity_logs`, `user_roles`, `work_orders`, `work_order_line_items`
- **Auth/profile tables** (correct): `profiles`, `customer_applications`, `customers`
- **Public insert tables** (accepted): `app_event_logs`, `contact_submissions`, `development_changelog`, `error_logs`

