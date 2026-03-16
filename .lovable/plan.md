

## Current Toll Flow

Here's how tolls work today:

1. **Admin adds a toll** via the "Add Toll" dialog — enters customer, trailer, date, amount, location, authority, and notes
2. **Toll is stored** in the `tolls` table with status `pending`
3. **Admin can act** on pending tolls: "Charge" (creates a Stripe invoice via `charge-toll` edge function) or "Mark Paid" (manual)
4. **Automated reminders** — the `send-toll-reminders` edge function emails customers about pending tolls on a configurable interval
5. **Customer sees tolls** on their dashboard in real-time via Supabase realtime subscriptions
6. The `tolls` table has a `receipt_url` column (text) but it's **not used anywhere** in the current UI

**No photo upload capability exists today.** There's no way to attach a toll image, and the existing toll reminder email is plain text with toll details — no attachment support.

---

## Proposed Feature: Toll Photo Upload + Auto-Email

### What it does
When an admin adds or edits a toll, they can upload a photo of the toll notice. On upload, the system automatically sends an email to the customer with the toll photo attached, so they have a copy of what they owe.

### Implementation

**1. Use the existing `toll-receipts` storage bucket** (already exists, private) to store uploaded toll photos.

**2. Update `TollFormDialog`** — add a file upload input for a toll photo (image). On form submit, upload the image to `toll-receipts/{customer_id}/{toll_id}.{ext}`, save the storage path in the `receipt_url` column (already exists in the table).

**3. Add upload capability to the Tolls table** — add a small camera/image icon button on each toll row so admins can also attach a photo to existing tolls (not just new ones).

**4. Create a `send-toll-email` edge function** — triggered after a toll photo is uploaded. It:
   - Fetches the toll record + customer profile (email, name)
   - Generates a signed URL for the toll photo
   - Sends an email via SendGrid with the toll details and a link to view/download the photo
   - Sends from `noreply@crumsleasing.com` (same as existing toll reminders)

**5. Update the Tolls table UI** — show a small image indicator on rows that have a photo attached, and allow clicking to preview the image.

### Files changed
- `src/components/admin/TollFormDialog.tsx` — add photo upload field
- `src/pages/admin/Tolls.tsx` — add photo indicator column, upload button for existing tolls
- `supabase/functions/send-toll-email/index.ts` — new edge function to send toll photo email
- Database migration: RLS policy on `toll-receipts` bucket for admin uploads + signed URL access

