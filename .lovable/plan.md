

## Revamp Customer Statements Page — Line Items with Rich Filtering & CSV Export

### Overview

Replace the current PDF-download-oriented Statements page with an on-page billing ledger. Each `customer_statements` row becomes a visible line item (date, description, amount) displayed newest-to-oldest. PDF upload/download flow is removed. A CSV export compiles the filtered view. Rich date-range presets let customers slice their billing history.

### Database Changes

**No schema changes needed.** The existing `customer_statements` table already has: `statement_date`, `description`, `amount`, `period_start`, `period_end`, `source`, `notes`. We reuse it as-is — each row = one line item.

After the UI is built, you'll provide 2 documents (PDF + spreadsheet). I'll parse the data and insert rows into `customer_statements` for each customer, replacing the old single-PDF-per-statement records.

### Changes to `src/pages/customer/Statements.tsx`

**Remove:**
- PDF download button column and `handleStatementDownload` function
- `downloadingId` state
- Storage signed URL logic

**Add:**

1. **Date range filter presets** (Select dropdown replacing the year-only filter):
   - All Time
   - Current Year (2026)
   - Last Year (2025)
   - Last 30 Days
   - Last 90 Days
   - Custom Range (shows two date pickers for start/end)

2. **Summary cards row** above the table:
   - Total charges for filtered period
   - Number of line items
   - Date range displayed

3. **Enhanced table columns:**
   - Date (statement_date, sorted newest first)
   - Description
   - Period (period_start – period_end if present)
   - Source (badge: manual / stripe)
   - Amount (right-aligned, currency formatted)
   - Notes (shown as tooltip or small text)

4. **CSV Export button** in the header:
   - Compiles the currently filtered line items
   - Columns: Date, Description, Period Start, Period End, Amount, Source, Notes
   - Downloads as `statements-{customerName}-{dateRange}.csv`

5. **Running total footer row** showing the sum of filtered amounts

### Changes to `src/components/admin/CustomerStatementsPanel.tsx`

**Update the "Add Statement" tab:**
- Remove the PDF file upload field (`pdfFile` state, file input, storage upload logic)
- Keep the manual entry form (description, date, amount, period, notes) — this is how you'll continue adding line items going forward

**Update the "View Statements" tab:**
- Remove the download button column for PDFs
- Add a CSV export button at the top
- Keep the delete functionality

### Data Migration Plan (after UI is ready)

Once you provide the 2 documents, I will:
1. Parse the line items from each format
2. Delete the old single-amount PDF statement records for affected customers
3. Insert individual line-item rows into `customer_statements` (one per charge/payment)
4. Remove orphaned PDF files from the `customer-documents` storage bucket

