

## Import Combined Customer Statement Data

### What the PDF contains
23 customers with individual invoice line items. Each line has: Date, Invoice #, Amount, Received, Balance. Customers are identified by name and sometimes company name.

### Plan

#### 1. Create an admin bulk-import edge function
A new edge function `import-customer-statements` that:
- Accepts a JSON array of `{ customer_name, company_name, date, invoice_number, amount, received, balance, description }` objects
- For each entry, looks up the customer by `full_name` (case-insensitive ILIKE match) in the `customers` table
- Skips entries where the customer can't be matched (returns a list of unmatched names)
- For matched customers, upserts into `customer_statements` using invoice number + customer_id as a dedup key to handle overlapping data
- Sets `description` to `"Invoice #XXXX"`, `source` to `"invoice"`, `statement_date` to the invoice date, `amount` to the invoiced amount
- Stores received/balance info in the `notes` field (e.g., `"Received: $750.00 | Balance: $0.00"`)

#### 2. Prepare the parsed data as a migration script
Rather than an edge function, a simpler approach: create a **database migration** that directly inserts all ~200+ line items. The migration will:
- Use a CTE or temp mapping of customer names to customer IDs via `SELECT id FROM customers WHERE lower(full_name) ILIKE ...`
- Insert each invoice line item into `customer_statements`
- Use `ON CONFLICT` or a pre-check to avoid duplicating rows if some data was already entered manually
- Delete any old PDF-based statement records that have a `file_url` set (the ones being replaced)

#### 3. Customer name → ID matching
The PDF uses these customer names (I'll need to match against `customers.full_name`):
- DeGreat Dynasty LLC (Dewayne DeGreat)
- Eisa Karami / Panjshire Express LLC
- Gerald Joseph Porter / Porter Transportation Services
- Helen Mang / Hope Light Express
- James E Guthrie / Trinity Freight LLC
- Jean Wilder Thelusma
- Kiara Galo Miguel Carcamo
- Laxley Hinds / Multi-Trucking
- Luis VillaReal
- Mohammadi Abdul Khaliq / AZP Trucking
- Monarch Trophy Studio
- Osundo
- Randy Gray / AMA United Transport
- Robert / RJ & R
- Robert Tsankov
- Rodrick Darnell McGill / Do It Moving
- Shakiya Harrison / BMS
- Singh Narenderjeet / Ground Link
- Stanley Tee Barnhisel / S&S Critical Transport LLC
- Stenson Davis
- Tracy Trucking
- Victoria Hernandez / Black Eagle Transportation

**Before writing the migration**, I'll query the `customers` table to get exact `full_name` values and IDs so the matching is precise.

#### 4. Clean up old PDF statements
The migration will also `DELETE FROM customer_statements WHERE file_url IS NOT NULL` for the affected customers, removing the legacy PDF-based records.

### Steps
1. Query existing customers to build the name→ID map
2. Write a single SQL migration inserting all line items from the PDF
3. Delete old file_url-based statement records in the same migration
4. Verify the customer-facing Statements page shows the new line items

### Technical notes
- The `customer_statements` table already has all needed columns: `statement_date`, `description`, `amount`, `source`, `notes`
- No schema changes needed
- The customer-facing Statements page built in the previous step will display these automatically
- Overlap handling: if some invoices were already entered, we'll use invoice number in the description as a natural dedup check

