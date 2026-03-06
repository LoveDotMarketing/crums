

## Problem

Archived flatbed trailers still appear in several places because those queries don't filter out `status = 'archived'`:

1. **Admin Dashboard** (`AdminDashboard.tsx` ~line 46) — fleet stats query fetches all trailers including archived, inflating the "Total" count
2. **Customer Detail** (`CustomerDetail.tsx` ~line 169) — assigned trailers query shows archived trailers under a customer's profile
3. **Customers list** (`Customers.tsx` ~line 163) — trailer/VIN lookup includes archived trailers
4. **Agent functions** (`agent-trailers-list/index.ts`) — no archived filter, so AI agent sees archived trailers too

## Fix

### 1. Admin Dashboard — exclude archived from fleet stats
Add `.neq("status", "archived")` to the trailers query at line 46.

### 2. Customer Detail — exclude archived from assigned trailers
Add `.neq("status", "archived")` to the query at line 171.

### 3. Customers list — exclude archived from trailer lookups
Add `.neq("status", "archived")` to the query at line 164.

### 4. Agent trailers list — exclude archived by default
Add `.neq("status", "archived")` to the query in `agent-trailers-list/index.ts` unless the caller explicitly requests archived status.

### Files to update
- `src/pages/admin/AdminDashboard.tsx` — 1 line
- `src/pages/admin/CustomerDetail.tsx` — 1 line
- `src/pages/admin/Customers.tsx` — 1 line
- `supabase/functions/agent-trailers-list/index.ts` — 1 line

