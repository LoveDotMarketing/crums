

## Problem

The mechanic reports that once a work order is saved as a draft, they cannot reopen or edit it. This is because:

1. Work order cards in the list are **not clickable** — there's no click handler or link to open them.
2. The `WorkOrderForm` component only supports **creating** new work orders — it doesn't accept an existing work order to edit.

## Plan

### 1. Make WorkOrderForm support edit mode

- Add an optional `workOrder` prop (with its line items) to `WorkOrderForm`.
- When provided, pre-populate all form fields with existing data.
- On save/submit, use `update` instead of `insert` for the work order, and delete+re-insert line items.
- Only allow editing if status is `in_progress` (draft) or `needs_info`.

### 2. Make work order cards clickable

- In `WorkOrders.tsx`, add an `editingWorkOrder` state.
- When a draft/needs-info card is clicked, fetch the work order + its line items and pass them to `WorkOrderForm`.
- Show the form in edit mode (similar to how `showForm` works for new orders).
- Non-editable statuses (submitted, approved, etc.) open as read-only or show a toast saying it can't be edited.

### 3. Files to modify

- **`src/components/mechanic/WorkOrderForm.tsx`** — Accept optional `workOrder` + `lineItems` props; pre-fill form state in `useEffect`; switch between insert/update on save.
- **`src/pages/mechanic/WorkOrders.tsx`** — Add click handlers to cards; add state for editing; fetch line items when opening; pass data to `WorkOrderForm`.

### Technical details

- The form will receive `existingWorkOrder?: WorkOrder` and `existingLineItems?: LineItem[]`.
- `useEffect` will set all form state from the existing data when provided.
- On submit in edit mode: `supabase.from("work_orders").update({...}).eq("id", workOrder.id)`, then delete existing line items and re-insert.
- Cards with `in_progress` or `needs_info` status get `cursor-pointer` and an `onClick`; others remain non-clickable.

