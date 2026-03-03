

## Add 2 Customer Billing Statements

### Customer Matching

| # | PDF | Customer | ID | Amount | Period |
|---|-----|----------|----|--------|--------|
| 1 | Trailer-Interchange-Jean-Wilder-Thelusma | Jean widler Thelusma | `8cbafc4c-2aeb-4406-9c2e-ab1a0366eb71` | $7,000.00 | May–Dec 2025 |
| 2 | Trinity-Freight-LLC-James-E-Guthrie | James E. Guthrie | `95f5ca11-8d03-42ca-98db-2d2fa0f495c0` | $2,250.00 | Sep–Nov 2025 |

### Steps

1. Copy both PDFs to `public/documents/` temporarily
2. Upload to `customer-documents` bucket under `statements/{customer_id}/2025-billing-statement.pdf`
3. Insert 2 `customer_statements` records with statement date 2026-02-06, description "Download 2025 Billing Statement PDF", and the amounts/periods above
4. Delete temp files

No code changes needed.

