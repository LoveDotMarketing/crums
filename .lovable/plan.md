
# Fix: ACH Setup Blocked by Application Status Check

## Root Cause

In `supabase/functions/create-ach-setup/index.ts`, line ~62, there is a hard check:

```typescript
if (application.status !== "approved") {
  throw new Error("Application must be approved before setting up payment");
}
```

This throws a 500 error back to the browser, which the frontend displays as "Edge Function returned a non-2xx status code."

The customer `trinityfreightllc@gmail.com` has a valid account and application but has not yet been approved, so they are completely blocked from linking their bank account.

## Why This Is Wrong

The ACH payment setup page was intentionally designed as a **decoupled onboarding step** — customers can (and should) be able to link their bank account at any point during the application process, not just after approval. The bank link is for **future billing authorization only** — no charges happen until a trailer is assigned. This was the explicit design decision documented in the system.

Requiring approval before bank linking creates a chicken-and-egg problem and worsens the customer onboarding experience.

## The Fix

**File:** `supabase/functions/create-ach-setup/index.ts`

Remove lines ~62–64:
```typescript
if (application.status !== "approved") {
  throw new Error("Application must be approved before setting up payment");
}
```

The function should still require:
- A valid authenticated user (keep)
- An existing application record (keep — `maybeSingle` or `single` query still needed so we have the `application.id` to save the Stripe customer ID back)

But the `status` check should be removed entirely. Customers with any application status (`pending_review`, `under_review`, `approved`, etc.) should be able to link their bank account.

## Files Changed

| File | Change |
|---|---|
| `supabase/functions/create-ach-setup/index.ts` | Remove the `application.status !== "approved"` guard check (~3 lines) |

## No Other Changes Needed

- The frontend payment setup page already handles this flow correctly
- The `confirm-ach-setup` function has no such status gate (already correct)
- No database migration needed
- No RLS changes needed
