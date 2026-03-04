

## Import Fisneur Jean's Billing Statements from PDF

The PDF contains billing data for Fisneur Jean (and likely other customers) that was not included in the first import. The customer record exists but has zero statement rows.

### Changes

#### 1. Data Import (database insert, no schema changes needed)

From the screenshot, Fisneur Jean's entries to insert into `customer_statements`:

| Date       | Invoice | Amount    | Description              |
|------------|---------|-----------|--------------------------|
| 01/17/2025 | 1234    | $2,400.00 | Invoice #1234            |
| 02/17/2025 | 1244    | $900.00   | Invoice #1244            |
| 03/12/2025 | 1237    | $900.00   | Invoice #1237            |
| 03/17/2025 | 1245    | $900.00   | Invoice #1245            |
| 06/16/2025 | 1285    | $900.00   | Invoice #1285            |
| 07/07/2025 | 1306    | $900.00   | Invoice #1306            |
| 07/16/2025 | 1316    | $900.00   | Invoice #1316            |
| 08/15/2025 | 1344    | $900.00   | Invoice #1344            |
| 09/15/2025 | 1375    | $900.00   | Invoice #1375            |
| 10/15/2025 | 1407    | $900.00   | Invoice #1407            |
| 11/15/2025 | 1427    | $900.00   | Invoice #1427 (unpaid)   |
| 12/15/2025 | 1452    | $900.00   | Invoice #1452 (unpaid)   |
| 01/15/2026 | 1472    | $900.00   | Invoice #1472 (unpaid)   |
| 02/15/2026 | 1485    | $900.00   | Invoice #1485 (unpaid)   |

- **customer_id**: `911d288a-fed6-41e7-805c-7c8544b353b3`
- **source**: `invoice`
- **Notes**: Mark invoices with $0 received as having a note like "Balance due: $900.00"

#### 2. Parse remaining customers from PDF

Since the PDF parsing failed, I'll need you to confirm: does this PDF contain **additional customers beyond Fisneur Jean** that also need importing? If so, I can attempt parsing again or you can share screenshots of each customer's section.

#### 3. No code changes needed

The Statements page and admin panel already support displaying, filtering, and exporting this data — it's purely a data import task.

