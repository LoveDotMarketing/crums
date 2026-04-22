

## Plan: Sandbox vs Live visibility across admin app

Make sandbox subscriptions impossible to miss for staff, while keeping the customer-facing portal completely silent about sandbox state.

### 1. Admin Subscriptions list (`src/pages/admin/Billing.tsx`)

**New "Sandbox" column** in the subscriptions table:
- Header: `<TableHead>Mode</TableHead>` inserted between **Status** and **Actions**.
- Cell renders an amber badge `Sandbox` (icon: `FlaskConical`) when `sub.sandbox === true`, otherwise a small muted `Live` text. Amber styling: `bg-amber-100 text-amber-800 border-amber-200` (matches existing color conventions in the file).

**New filter chip** above the table, next to the search input:
- A small `ToggleGroup` (or three `Button` variants) with options: **All / Live only / Sandbox only**. Default `All`.
- New state: `const [sandboxFilter, setSandboxFilter] = useState<"all"|"live"|"sandbox">("all")`.
- Apply inside the existing `subscriptions.filter(...)` chain.
- Sandbox-only view also shows a subtle amber helper line: *"Showing N sandbox subscriptions — these route to Stripe test mode."*

**Query update**: ensure `sandbox` is selected in the `customer-subscriptions` query (it likely already is via `select("*")`; if not, add it).

### 2. Subscription detail header banner (`src/components/admin/EditSubscriptionPanel.tsx`)

Right after the existing header block (around line 390, before the `Subscription Type` card), render a persistent banner *only* when `subscription.sandbox === true`:

```tsx
<Alert className="border-amber-300 bg-amber-50 text-amber-900">
  <FlaskConical className="h-4 w-4" />
  <AlertTitle>Sandbox mode</AlertTitle>
  <AlertDescription>
    This subscription is in SANDBOX mode — charges use Stripe test keys.
    No real money moves.
  </AlertDescription>
</Alert>
```

Banner is sticky-visible (always rendered when sandbox=true, not dismissible) so admins can't forget while editing rates / running charges.

### 3. Billing history table — "Mode" column (`src/pages/admin/Billing.tsx`)

In the billing-history table (around line 2038):
- Add `<TableHead className="w-[70px]">Mode</TableHead>` near the right edge.
- Each row renders `row.stripe_mode`:
  - `"live"` → small muted text `Live` (text-xs text-muted-foreground).
  - `"test"` → small amber pill `TEST` (`text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-800`).
- `BillingHistoryItem` interface in the file gains `stripe_mode: "live" | "test"` (the column already exists in DB).
- The `select(...)` for `billing-history` query needs `stripe_mode` added to the field list.

### 4. Admin Dashboard stat (`src/pages/admin/AdminDashboard.tsx`)

New query `admin-sandbox-subs-count`:
```ts
const { data: sandboxSubsCount } = useQuery({
  queryKey: ["admin-sandbox-subs-count"],
  queryFn: async () => {
    const { count } = await supabase
      .from("customer_subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("sandbox", true);
    return count ?? 0;
  },
});
```

Add a new card in the stats grid (admin-only — placed after "Collected This Month"):
- Title: **Sandbox subscriptions**
- Value: `{sandboxSubsCount}`
- Icon: `FlaskConical`, amber tint
- The whole card is a `<button>` that navigates to `/dashboard/admin/billing?sandboxFilter=sandbox`.
- Card hidden when count is `0` to avoid visual clutter on healthy days. (Always visible if you'd prefer — easy toggle.)

In `Billing.tsx`, read `?sandboxFilter=` from `useSearchParams` on mount and seed `sandboxFilter` state so the deep link works.

### 5. Customer-facing safety check

Audit every customer page that renders subscription or billing data. None of the following will get any sandbox/test indicator:
- `src/pages/customer/Billing.tsx`
- `src/pages/customer/CustomerDashboard.tsx`
- `src/pages/customer/Statements.tsx`
- `src/components/admin/CustomerStatementsPanel.tsx` (used in admin context only — safe)

Confirmed by code search: `sandbox` / `stripe_mode` are not currently selected in any customer-facing query, so existing data fetches won't accidentally surface them. We won't add them either. No customer-facing change in this task.

### Files
1. `src/pages/admin/Billing.tsx` — Mode column on subscriptions table, sandbox filter chip, Mode column on billing-history table, `stripe_mode` added to `BillingHistoryItem` and the history `select(...)`, deep-link param read.
2. `src/components/admin/EditSubscriptionPanel.tsx` — persistent amber banner above content cards when `sandbox=true`.
3. `src/pages/admin/AdminDashboard.tsx` — sandbox-count query + clickable stat card.

### Out of scope
- No changes to customer portal pages (intentional — customers see nothing).
- No bulk sandbox toggle from the list (per-subscription only, matches existing detail-page workflow).
- No analytics/reporting separation by mode (later, if needed — `stripe_mode` is now stamped so it's queryable).
- No styling changes to existing Live rows (Live remains the unmarked default visual).

