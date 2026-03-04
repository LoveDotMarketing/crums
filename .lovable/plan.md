

## Add Date Filtering and CSV Export to Admin Statements Panel

The admin `CustomerStatementsPanel` (the dialog that opens when you click Statements on a customer profile) currently lacks date range filtering — it only has a basic CSV export button and a flat table. The customer-facing Statements page has these features but they're hidden when the customer has no data.

### Changes

#### 1. `src/components/admin/CustomerStatementsPanel.tsx`
Add the same date range filtering that exists on the customer-facing page:
- Add a `Select` dropdown with presets: All Time, Current Year, Last Year, Last 30 Days, Last 90 Days, Custom Range
- Add custom date range pickers (two date inputs) when "Custom Range" is selected
- Filter the displayed statements based on the selected range
- Update the CSV export to only export filtered statements
- Show a summary row with total count and filtered total amount

#### 2. `src/pages/customer/Statements.tsx`
- Move the CSV export button and date filter controls **inside** the card (below the header), so they're always visible even when no statements exist for the selected range — the empty state message is enough feedback
- Keep the Export CSV button visible but disabled when there are 0 filtered results

### Technical approach
- Reuse the same `date-fns` utilities (`subDays`, `startOfYear`, `endOfYear`) and `DatePreset` type pattern from the customer page
- Add `useMemo` for filtered statements and totals in the admin panel
- Both views will have consistent filtering behavior

