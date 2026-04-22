

## Fix: Disambiguate the profiles join in toggle-application-sandbox

The toggle is failing because the edge function's query embeds `profiles(...)` but `customer_applications` has two foreign keys pointing at `profiles` (`user_id` and `reviewed_by`). PostgREST throws an ambiguous-relationship error before the function ever gets to do its work, so the UI sees a generic non-2xx and you see no log line.

### Change

In `supabase/functions/toggle-application-sandbox/index.ts`, change the embed to specify the FK name:

```ts
profiles!customer_applications_user_id_fkey ( id, first_name, last_name, email )
```

That tells PostgREST to follow the `user_id` FK (the actual applicant), not `reviewed_by` (the staff member who reviewed it).

### Defensive cleanup in the same edit

1. Wrap the `.from("customer_applications").select(...)` call in a try and **log the raw `appErr`** before returning the 404 — right now any DB error gets masked as "Application not found", which hid this bug.
2. Add a `console.log("[toggle-application-sandbox] start", { applicationId, enable, force })` at the top of the handler so future failures show up in logs immediately after boot.

### Verification

1. Re-deploy (automatic).
2. Flip the **Sandbox Application** switch on Mark's customer page.
3. Expect: success toast, badge turns amber, banner appears at the top of the page.
4. Confirm an audit row exists:
   ```sql
   SELECT * FROM subscription_sandbox_audit
   WHERE application_id IS NOT NULL
   ORDER BY changed_at DESC LIMIT 5;
   ```

### Out of scope

- No schema changes — the columns and tables are correct.
- No frontend changes — `ApplicationSandboxCard.tsx` is fine; the bug is server-side only.

