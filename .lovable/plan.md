

## Plan: MATS 2026 Follow-Up Email Campaign System

### What you have today
Your outreach system already lets you compose campaigns, select "MATS 2026 Event Leads" as the audience, use templates with personalization ({{customer_name}}), and send via SendGrid. Sent/failed status is logged per recipient.

### What's missing
- **No open tracking** — you can't tell if anyone opened the email
- **No unsubscribe tracking for event leads** — the unsubscribe system only covers customers, not event leads
- **No drip/follow-up sequence** — you can only send one-off blasts manually
- **No lead categorization** — all MATS leads are treated the same (no partner vs. prospect distinction)

### The plan

**1. Add a `lead_type` column to `event_leads`**
- Values: `prospect` (default), `partner`, `vendor`
- Add a dropdown in the Events tab so you can tag each lead
- Allow filtering by lead type when composing campaigns (e.g., send one email to prospects, a different one to partners)

**2. Add open tracking via SendGrid**
- Enable SendGrid's open tracking (it embeds a 1x1 pixel). This is a SendGrid account setting — no code change needed on your end.
- Add an `opened_at` column to `outreach_logs` so opens can be recorded
- Create a small `track-email-open` edge function that SendGrid calls via Event Webhook when an email is opened — it updates the outreach log
- Show open status (badge) in the campaign history / logs UI

**3. Add unsubscribe support for event leads**
- Add `unsubscribed` boolean column to `event_leads`
- Update `send-outreach-email` to check unsubscribe status before sending to event leads
- Add an unsubscribe link in outreach emails (already have `{{unsubscribe_url}}`) that marks event leads as unsubscribed

**4. Create email templates for the follow-up sequence**
- **Email 1 — "Great Meeting You"**: Warm intro, thanks for stopping by booth 38024, brief value prop, CTA to reply to eric@crumsleasing.com
- **Email 2 — "Quick Follow-Up" (prospects)**: Highlight trailer leasing benefits, link to price sheet, CTA to schedule a call
- **Email 3 — "Partnership Opportunity" (partners)**: Tailored for potential partners/vendors, CTA to discuss collaboration
- All templates stored in `email_templates` table, selectable from the Compose tab

**5. Campaign history dashboard improvements**
- Show per-recipient status: Sent, Opened, Failed, Unsubscribed
- Add open rate percentage to campaign summary cards

### Files to modify
- `event_leads` table — migration to add `lead_type` and `unsubscribed` columns
- `outreach_logs` table — migration to add `opened_at` column
- `supabase/functions/send-outreach-email/index.ts` — check unsubscribe status for event leads before sending
- `src/pages/admin/Outreach.tsx` — lead type dropdown in Events tab, lead type filter in Compose audience, open/unsubscribe badges in logs
- New edge function: `supabase/functions/track-email-open/index.ts` — receives SendGrid Event Webhook for open events
- Email templates created via the admin UI (or seeded via migration)

### What you'll need to do outside Lovable
- **SendGrid**: Enable open tracking in your SendGrid account (Settings → Tracking → Open Tracking → ON)
- **SendGrid Event Webhook**: Point it to the new `track-email-open` edge function URL so opens are recorded

### Sending workflow
1. Tag your MATS leads as prospect or partner in the Events tab
2. Go to Compose, select "MATS 2026 Event Leads" audience, optionally filter by lead type
3. Pick the "Great Meeting You" template, customize if needed, send
4. A few days later, check open rates in campaign history
5. Send follow-up #2 to those who opened (or all), using the prospect or partner template
6. Track engagement and close deals

