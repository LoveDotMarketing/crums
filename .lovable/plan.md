

## Plan: Sandbox toggle audit trail

Track every sandbox flip with who, when, why — and surface them on the Payments admin page.

### 1. Schema (one migration)

New table `public.subscription_sandbox_audit`:

| column | type | notes |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `subscription_id` | uuid NOT NULL | references `customer_subscriptions(id)` ON DELETE CASCADE |
| `from_sandbox` | boolean NOT NULL | state before the toggle |
| `to_sandbox` | boolean NOT NULL | state after the toggle |
| `changed_by` | uuid NULL | references `auth.users(id)` ON DELETE SET NULL |
| `changed_at` | timestamptz NOT NULL DEFAULT now() | |
| `reason` | text NULL | optional admin note |

Index: `(subscription_id, changed_at DESC)` and `(changed_at DESC)` for the global activity panel.

RLS: enabled. Single policy — admins can SELECT/INSERT (`has_role(auth.uid(), 'admin')`). No UPDATE/DELETE policies (immutable audit log).

### 2. Edge functions

**`enable-sandbox`** (existing) — at the very end of the success path, after the `customer_subscriptions` update, insert one audit row:
```ts
await adminClient.from("subscription_sandbox_audit").insert({
  subscription_id: subscriptionId,
  from_sandbox: false,
  to_sandbox: true,
  changed_by: userData.user.id,
  reason: reason ?? null,
});
```
Accept new optional `reason: string` field on the request body (trimmed, max 500 chars).

**`disable-sandbox`** (new edge function) — mirrors `enable-sandbox` shape:
1. Verify Bearer token + admin role (same pattern as `enable-sandbox`).
2. Read current `sandbox` value from `customer_subscriptions`.
3. `UPDATE customer_subscriptions SET sandbox = false WHERE id = $1`.
4. Insert audit row (`from_sandbox: true`, `to_sandbox: false`, `reason`).
5. Append `app_event_logs` row (`event_type: 'sandbox_disabled'`) for parity with enable.

The frontend currently disables sandbox via a direct table `update`. We switch it to call this new function so the audit trail is guaranteed (RLS on the new table won't trust client-side inserts, and we want consistent server-side stamping).

### 3. UI — confirmation dialog (`EditSubscriptionPanel.tsx`)

Both confirm dialogs (Enable + Disable) get an optional reason field:

```
┌─ Enable sandbox mode for this subscription? ─┐
│ • All future charges use Stripe test mode…   │
│ • You'll need to attach a test payment…      │
│ • Existing live charge history is preserved. │
│                                              │
│ Reason (optional)                            │
│ ┌──────────────────────────────────────────┐ │
│ │ e.g. Testing bi-weekly billing cycle     │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│         [Cancel]  [Enable sandbox]           │
└──────────────────────────────────────────────┘
```

Implementation:
- Add `enableReason` / `disableReason` state (cleared each open).
- `<Textarea>` (rows=2, maxLength=500) inside each `AlertDialog`.
- `handleEnableSandbox` passes `reason: enableReason.trim() || undefined` in the body.
- `handleDisableSandbox` switches from direct supabase update → `supabase.functions.invoke("disable-sandbox", { body: { subscriptionId, reason } })`.

### 4. UI — "Sandbox Activity" panel on `/dashboard/admin/payments`

New `SandboxActivityPanel` component placed below the existing payments table on `Payments.tsx` (the user said `/admin/settings/payments`; this app's actual route is `/dashboard/admin/payments` — same page, no separate Settings route exists, confirmed via App.tsx).

Query:
```ts
useQuery({
  queryKey: ["sandbox-audit-recent"],
  queryFn: async () => supabase
    .from("subscription_sandbox_audit")
    .select(`
      id, from_sandbox, to_sandbox, reason, changed_at, changed_by,
      customer_subscriptions ( id, customers ( full_name, company_name, email ) )
    `)
    .order("changed_at", { ascending: false })
    .limit(50)
});
```

Admin user names: a second query `supabase.from("profiles").select("id, full_name, email").in("id", changedByIds)` then merged in. (The audit row stores `auth.users.id`; profiles already mirror this.)

Rendered as a `Card` titled **Sandbox Activity** with a `Table`:

| Subscription | Admin | Change | Reason | When |
|---|---|---|---|---|
| Acme Logistics — link → /dashboard/admin/billing?subscription=… | Eric Crum | `Live → Sandbox` (amber arrow) | "Testing weekly cycle" | 2 min ago |

- Subscription cell links to existing edit panel via the same deep-link pattern Billing already uses (`?subscription=<id>`); falls back to the customer name as plain text if `customer_subscriptions` was deleted (cascade fires audit row stays via SET NULL — actually we cascade delete the audit row; so subscription always exists).
- Admin cell: full_name or email; "Unknown" if profile missing.
- Change cell: small badges — amber `Sandbox`, muted `Live`, with a `→` between.
- Reason: muted italic if null (`—`).
- When: `formatDistanceToNow(changed_at, { addSuffix: true })` with the absolute date as a tooltip.
- Empty state: "No sandbox toggles yet."
- Pagination: out of scope; the 50-row cap is plenty for v1. Future: link to a full audit page if it grows.

### 5. Files

1. **New migration** — `subscription_sandbox_audit` table + indexes + RLS policy.
2. **`supabase/functions/enable-sandbox/index.ts`** — accept `reason`, insert audit row.
3. **`supabase/functions/disable-sandbox/index.ts`** — new function (admin-verified, flips flag, inserts audit row, emits `app_event_logs`).
4. **`src/components/admin/EditSubscriptionPanel.tsx`** — add `Textarea` to both dialogs, switch disable handler to invoke the new edge function.
5. **`src/pages/admin/Payments.tsx`** — render new `SandboxActivityPanel` card below existing table.
6. **`src/components/admin/SandboxActivityPanel.tsx`** — new component (query + table).
7. **`src/integrations/supabase/types.ts`** — auto-regenerated.

### Out of scope

- No edit/delete of audit rows (immutable by RLS design).
- No CSV export of the audit log (easy add later).
- No email/Slack notification on sandbox flips.
- No standalone "/admin/settings/payments" route — the existing Payments admin page is the natural home and matches the request's intent.
- No reason-required policy — kept optional per the prompt.

