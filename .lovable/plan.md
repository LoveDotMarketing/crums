

## Plan: Add Lead Source Attribution to Call Logs

### What this does
Match each caller's phone number against your database records (customers, applications, phone leads) to show whether they came from a paid ad, organic search, direct visit, or referral — right in the call logs table.

### How it works

**1. Update the edge function (`supabase/functions/twilio-call-logs/index.ts`)**
- After fetching calls from Twilio, collect all unique caller phone numbers
- Query these tables to find matches by phone number:
  - `customers` (has phone) → join to `customer_applications` (has `utm_source`, `utm_medium`, `utm_campaign`, `landing_page`)
  - `phone_leads` (has phone, notes about source)
  - `contact_submissions` (has `utm_source`, `utm_medium`, `utm_campaign` but no phone — skip this one)
- For each call, attach a `source` field: "Paid" (utm_medium = cpc/ppc), "Organic" (utm_medium = organic or referrer is search engine), "Direct" (no UTM but known customer), "Phone Lead" (matched in phone_leads), or "Unknown" (no match found)
- Also include `utm_campaign` when available so you can see which specific ad campaign

**2. Update the frontend (`src/pages/admin/CallLogs.tsx`)**
- Add a "Source" column to the table between "Status" and "Recording"
- Display color-coded badges: green for Paid, blue for Organic, gray for Direct, purple for Phone Lead, outline for Unknown
- Show the campaign name as smaller text below the badge when available
- Add a Source filter dropdown (All, Paid, Organic, Direct, Phone Lead, Unknown)

### Files to modify
- `supabase/functions/twilio-call-logs/index.ts` — add DB lookup for phone-to-source matching
- `src/pages/admin/CallLogs.tsx` — add Source column, badge, and filter

