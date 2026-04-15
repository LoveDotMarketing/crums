

## Plan: Add Upsert Logic to `create-phone-lead`

Modify the existing `create-phone-lead` edge function to check if a lead with the same phone number already exists. If it does, update the existing record (merge notes, update email/name if provided). If not, insert a new one.

### How it works

- On POST, after validating `name` and `phone`, query `phone_leads` for an existing row matching the phone number
- If found: update the existing row — append new notes (preserving old ones), update name/email if provided, keep the original `created_at` and `status`
- If not found: insert a new row (current behavior)
- Response includes an `action` field (`"created"` or `"updated"`) so the caller knows what happened

### Files changed

1. **`supabase/functions/create-phone-lead/index.ts`**
   - Add a SELECT query by phone number before insert
   - If match found, UPDATE with merged notes and optional field updates
   - If no match, INSERT as before
   - Return `{ ...data, action: "created" | "updated" }`

No database changes needed — the `phone_leads` table already supports all required operations via service role.

