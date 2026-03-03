

## Plan: Upload Ground Link's 2025 Billing Statement

### What needs to happen

1. **Copy the PDF** into the project and upload it to the `customer-documents` storage bucket under `statements/31b4ef87-fad0-4e0b-901b-286bf5e0a182/` path.

2. **Insert a `customer_statements` record** for Ground Link (customer ID `31b4ef87-fad0-4e0b-901b-286bf5e0a182`) with:
   - `description`: "Download 2025 Billing Statement PDF"
   - `statement_date`: 2026-02-06 (date on the PDF)
   - `period_start`: 2025-07-01
   - `period_end`: 2025-12-17
   - `amount`: 29288.37 (total from statement)
   - `source`: "manual"
   - `file_url`: the storage path

### Visibility

Both roles already have access:
- **Admin**: The `CustomerStatementsPanel` component already shows statements with download buttons for any customer.
- **Customer**: The `StatementsCard` on the billing page already renders statements with a "PDF" download button. RLS policy on `customer_statements` already allows customers to SELECT their own records. Storage RLS on `customer-documents` needs to be verified to ensure customers can read their own files.

### Technical steps

1. Copy the uploaded PDF to a temporary location, then use a migration to upload it to storage via the edge function or directly insert the storage path.
2. Actually — simpler approach: Copy the PDF to `public/documents/` so it's always accessible, and set `file_url` to the public path. But this bypasses the private bucket strategy.
3. **Best approach**: Upload the PDF to the `customer-documents` bucket programmatically. Since we can't upload binary files via SQL migrations, we'll:
   - Copy the PDF to `public/documents/ground-link-2025-statement.pdf` temporarily
   - Insert the `customer_statements` record via SQL migration with `file_url` pointing to the storage path
   - Actually upload the file to storage using the admin panel's existing "Add Statement" feature

**Revised simplest approach**: 
- Insert the `customer_statements` DB record via migration with `file_url = NULL` initially
- Then use the existing admin Statements panel to upload the actual PDF file (replace the record or add the PDF)

**Even simpler**: Since the admin Statements panel already has full upload functionality, just:
1. Insert a DB record via migration with the correct metadata
2. Copy the PDF to the project as a public file at `public/documents/ground-link-2025-statement.pdf`  
3. Store `file_url` as a public URL path instead of a storage path — but this breaks the signed URL download logic

**Final approach — cleanest**:
1. Copy PDF into project
2. Write a small edge function or use existing tooling to upload it to `customer-documents` bucket  
3. Insert the `customer_statements` record pointing to the storage path

Actually, the most practical path given our tools:

1. **SQL migration**: Insert the `customer_statements` record with `file_url` set to `statements/31b4ef87-fad0-4e0b-901b-286bf5e0a182/2025-billing-statement.pdf`
2. **Manually upload** the PDF via the admin Statements panel (already built) — OR we can write a quick edge function to handle the upload

Let me check if there's a storage RLS policy allowing customers to download from `customer-documents`.

### Storage access check needed

The `customer-documents` bucket is private. We need to verify customers can create signed URLs for their own files. If not, we need to add a storage RLS policy.

### Summary

1. **Insert DB record** via SQL migration into `customer_statements` for Ground Link with description "Download 2025 Billing Statement PDF"
2. **Verify/add storage RLS** so customers can read their own statement files from the `customer-documents` bucket
3. **Upload the PDF** — use the existing admin Statements panel UI to attach the file, OR instruct user to use it

No code changes needed — the UI already shows statements for both admin and customer views. We just need the data + file in place.

