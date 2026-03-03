

## Add 10 Customer Billing Statements

### Customer Matching

| # | PDF | Customer | ID | Amount | Period |
|---|-----|----------|----|--------|--------|
| 1 | Monarch-Trophy-Studio | **No match found in database** | — | $1,050.00 | Dec 2025 |
| 2 | MTED-Robert-Tsankov | MTED Transportation | `d8735e0b` | $13,950.00 | Jul–Dec 2025 |
| 3 | Multi-Trucking-Laxley-Hinds | Multi Trucking LLC | `ec0eb838` | $1,600.00 | Jul–Aug 2025 |
| 4 | Osundo | Osundo Justus | `ac19f4e5` | $6,300.00 | May–Nov 2025 |
| 5 | Panjshire-Express-Eisa-Karami | Panjshire Express LLC | `6cfa5ddf` | $5,575.00 | May–Dec 2025 |
| 6 | Porter-Transportation | Gerald Porter (Porter Transportation Services LLC) | `d41cab5d` | $8,000.00 | May–Nov 2025 |
| 7 | RJ-R-Robert | Robert RJ&R | `33a8a24e` | $11,048.00 | Apr–Nov 2025 |
| 8 | SS-Critical-Transport | Stanley Barrnhisel (S&S Critical Transport LLC) | `d9a135fc` | $1,500.00 | Sep 2025 |
| 9 | STENSON-DAVIS | Stenson Davis | `ea287dd5` | $7,060.00 | Jan–May 2025 |
| 10 | Tracy-Trucking | Tracy Trucking | `8558e3cd` | $15,300.00 | May–Dec 2025 |

### Issue: Monarch Trophy Studio

"Monarch Trophy Studio" does not exist as a customer in the database. I can either skip it or create the customer record first. Please let me know how to proceed for that one.

### Steps (same as previous batch)

1. **Copy all 10 PDFs** to `public/documents/` temporarily
2. **Upload all 10 PDFs** to `customer-documents` storage bucket under `statements/{customer_id}/2025-billing-statement.pdf`
3. **Insert 9 `customer_statements` records** (excluding Monarch unless instructed) with description "Download 2025 Billing Statement PDF", statement date 2026-02-06, and extracted amounts/periods
4. **Delete temp files** from `public/documents/`

No code changes needed.

