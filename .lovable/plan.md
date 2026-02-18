
# Phase 1: Statements & Tax Records — Historical Statement Upload + Stripe Billing History View

## Overview

This adds three things:
1. A new **`customer_statements`** database table to store historical billing records
2. An **admin upload UI** on the Customers page (per-customer statement panel) so admins can upload PDF statements and manually enter past billing records
3. A **"Statements & Tax Records" section** at the bottom of the customer-facing Billing page (`/dashboard/customer/billing`) showing all their statements with download links

No QuickBooks integration is included — that is Phase 2.

---

## Database Changes

### New table: `customer_statements`

```sql
CREATE TABLE public.customer_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  statement_date date NOT NULL,
  period_start date,
  period_end date,
  amount numeric NOT NULL DEFAULT 0,
  description text NOT NULL,
  source text NOT NULL DEFAULT 'manual',  -- 'manual' | 'stripe' | 'quickbooks'
  file_url text,      -- storage path in customer-documents bucket
  notes text,
  created_by uuid,    -- admin who created/uploaded
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

**RLS Policies:**
- Admins: full CRUD (`has_role(auth.uid(), 'admin')`)
- Customers: SELECT only — their own records via `customer_id IN (SELECT c.id FROM customers c JOIN profiles p ON lower(p.email) = lower(c.email) WHERE p.id = auth.uid())`

---

## Files Changed

| File | Change |
|---|---|
| Migration | Create `customer_statements` table + RLS |
| `src/pages/admin/Customers.tsx` | Add "Statements" section per customer in the expanded row/panel |
| `src/components/admin/CustomerStatementsPanel.tsx` | NEW — admin UI for uploading PDFs and manually adding statement records per customer |
| `src/pages/customer/Billing.tsx` | Add "Statements & Tax Records" card at the bottom |

---

## Admin UI — CustomerStatementsPanel Component

A new component `src/components/admin/CustomerStatementsPanel.tsx` that admins can open per customer. It will be launched from the Customers page via a **"Statements"** button in the customer row's action menu (next to the existing Edit/View actions).

The panel is a **Dialog** containing:

**Tab 1 — View Statements:** A table of all `customer_statements` for the selected customer, showing:
- Date
- Description  
- Period (if set)
- Amount
- Source badge (Manual / Stripe)
- Download PDF button (if `file_url` is set — generates a fresh signed URL from the `customer-documents` bucket)
- Delete button

**Tab 2 — Add Statement:** A form to manually enter a new record:
- Description (text, required)
- Statement Date (date picker, required)
- Amount (number, required)
- Period Start / Period End (optional date range, for tax purposes)
- Notes (optional textarea)
- PDF Upload (file input, optional — uploads to `customer-documents/statements/{customerId}/{filename}`)

On save, it inserts a row into `customer_statements` with `source = 'manual'`.

---

## Admin Customers Page Change

In `src/pages/admin/Customers.tsx`, add a **"Statements"** item to the existing `DropdownMenu` action menu for each customer row. Clicking it opens `CustomerStatementsPanel` as a dialog, passing the `customerId` and `customerName`.

---

## Customer Billing Page Change

In `src/pages/customer/Billing.tsx`, add a new **"Statements & Tax Records"** card at the bottom of the page. It:

1. Fetches `customer_statements` for the current customer using their `customerRecord?.id`
2. Shows a table with columns: Date, Description, Period, Amount, Download
3. Shows a **tax year filter** (dropdown: "All", "2025", "2024", "2023") — filters by `statement_date` year
4. Shows an empty state with a friendly message if no statements exist yet: "No statements on file yet. Contact us if you need past records for tax purposes."
5. The Download button for PDF statements generates a signed URL from Supabase storage on click

The query key is `["customer-statements", customerRecord?.id]` and only runs when `customerRecord?.id` is set.

The section is shown **regardless** of whether the customer has an active subscription — useful for customers who may have ended their lease but need tax records.

---

## Storage

PDF statements are uploaded to the existing **`customer-documents`** private bucket under the path:
```
statements/{customerId}/{timestamp}-{filename}
```

Signed URLs are generated on-demand (60-minute expiry) using the existing pattern from the document storage architecture — no long-lived URLs stored.

---

## What is NOT included (Phase 2)

- QuickBooks OAuth integration
- Customer name matching tool
- Automatic import from QuickBooks

---

## Technical Notes

- The `customer_statements` table uses `customer_id` (UUID from `customers` table), consistent with the existing pattern
- Admin storage uploads use the service role via edge function — but since the existing `customer-documents` bucket already accepts admin uploads via the client (as seen in the lease agreement upload in `admin/Billing.tsx`), the same direct upload pattern will be used
- The customer RLS SELECT policy mirrors the pattern used in `billing_history` and `customer_subscriptions`
