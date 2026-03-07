

## Employee/Salesman Dashboard & Performance System

This is a significant new feature set. Here's the phased plan:

### Database Changes (3 new tables, 1 modified)

**1. `staff_profiles` table** — extends staff with sales-specific data
- `user_id` (uuid, references profiles), `referral_code` (text, unique, auto-generated like CRUMS-XXXXXX), `position` (text: salesman/admin/mechanic), `hire_date`, `base_salary`, `commission_rate` (default 0.15), `is_active`

**2. `staff_referral_codes` table** — links staff to their own referral codes (separate from customer referral_codes)
- `id`, `staff_id` (uuid), `code` (text, unique), `is_active`, `created_at`
- These codes will be checked during signup alongside customer and partner codes

**3. `performance_reviews` table** — quarterly reviews
- `id`, `staff_id`, `reviewer_id`, `review_quarter` (text: "2026-Q1"), `performance_rating` (1-5), `notes`, `goals`, `ai_summary` (text, for AI-generated call/email analysis), `bonus_amount`, `status` (draft/submitted/acknowledged), `created_at`

### Referral System Extension

Update `processReferralCode()` in `src/lib/referral.ts` to also check `staff_referral_codes` table (priority: partner > staff > customer). When a staff code is used, store `pending_staff_referral_id` in sessionStorage so the subscription creation flow links it.

Add a `staff_referral_id` column to `customer_applications` to track which salesman originated the lead.

### New Pages

**1. `src/pages/admin/StaffDetail.tsx`** — Admin view of individual employee
- Profile info, referral code, performance history
- Leads generated (applications with their staff code), converted sales, active subscriptions from their referrals
- Bonus calculation: count of converted referrals x commission rate x subscription value
- Quarterly review form with notes, rating, goals
- AI review button (uses Lovable AI to summarize Twilio call logs for this staff member)

**2. `src/pages/admin/EmployeeDashboard.tsx`** — Salesman's own dashboard (accessible when staff logs in)
- Their referral code (copy button)
- Stats cards: Total Leads, Converted Sales, Active Leases, Bonus Earned (current quarter + all-time)
- Table of leads that used their code with status (pending/approved/active)
- Quarterly review history (read-only, what admin wrote)
- Bonus breakdown per converted referral

### Routing & Navigation

- `/dashboard/admin/staff/:id` → StaffDetail (admin only)
- `/dashboard/admin/employee` → EmployeeDashboard (for logged-in staff member's own view)
- Add "Employee Dashboard" link to AdminSidebar under People group
- Staff table gets clickable rows → navigate to StaffDetail

### AI Performance Review

- Edge function `review-staff-performance` that:
  - Pulls Twilio call logs for the staff member's period
  - Pulls outreach logs / email activity
  - Sends to Gemini 2.5 Flash via Lovable AI for a summary of communication quality, volume, and recommendations
  - Stores result in `performance_reviews.ai_summary`

### Files to create/modify

| File | Action |
|---|---|
| **Database migration** | Create `staff_profiles`, `staff_referral_codes`, `performance_reviews` tables + add `staff_referral_id` to `customer_applications` |
| `src/pages/admin/StaffDetail.tsx` | **Create** — admin employee detail with reviews, referral stats, bonus info |
| `src/pages/admin/EmployeeDashboard.tsx` | **Create** — salesman self-service dashboard |
| `src/lib/referral.ts` | **Edit** — add staff code lookup in `processReferralCode` |
| `src/components/admin/AdminSidebar.tsx` | **Edit** — add Employee Dashboard link |
| `src/App.tsx` | **Edit** — add routes for StaffDetail and EmployeeDashboard |
| `src/pages/admin/Staff.tsx` | **Edit** — make rows clickable to navigate to StaffDetail |
| `supabase/functions/review-staff-performance/index.ts` | **Create** — AI-powered review summary edge function |

