

## Add 10 Customer Billing Statements

### Customer Matching (PDF → Database)

| # | PDF File | Customer Name | Customer ID | Total Amount | Period |
|---|----------|--------------|-------------|-------------|--------|
| 1 | AMA-United-Transport-Randy-Gray | AMA United Transport | `e76ccd9a` | $4,600.00 | Jul–Dec 2025 |
| 2 | AZP-Trucking-Mohammadi-Abdul-Khaliq | Mohammadi Abdul Khaliq | `e0b4b14f` | $2,400.00 | Nov–Dec 2025 |
| 3 | Black-Eagle-Transportation-Victoria-Hernandez | VICTORIA Hernandez | `e0d1df48` | $6,875.00 | May–Dec 2025 |
| 4 | BMS-Shakiya-Harrison | BMS Logistics LLC | `806bcfe9` | $3,217.40 | May–Nov 2025 |
| 5 | DeGreat-Dynasty-LLC-Dewayne-DeGreat | Dewayne DeGreat | `78334079` | $50,330.85 | Feb–Apr 2025 |
| 6 | Do-It-Moving-Rodrick-Darnell-McGill | Roderick McGill | `20085873` | $5,750.00 | Jul–Dec 2025 |
| 7 | Ducky-Kiara-Carcamo | Miguel Carcamo (Ducky Transport) | `bda76180` | $5,600.00 | May–Dec 2025 |
| 8 | Fisneur-Jean-Florida-DL | Fisneur Jean | `911d288a` | $12,300.00 | Jan–Dec 2025 |
| 9 | Hope-Light-Express-Helen-Mang | Hope Light Express- Helen Mang | `65cf6271` | $7,100.00 | Jun–Nov 2025 |
| 10 | Luis-VillaReal | Luis Villareal | `53f2c6ca` | $4,000.00 | Apr–Jul 2025 |

All statement dates are **2026-02-06**.

### Steps (same pattern as Ground Link)

1. **Copy all 10 PDFs** to `public/documents/` as temporary project files
2. **Upload all 10 PDFs** to the `customer-documents` storage bucket under each customer's `statements/{customer_id}/` path
3. **Insert 10 `customer_statements` records** via data insert — each with description "Download 2025 Billing Statement PDF", the extracted amounts, date ranges, and `file_url` pointing to the storage path

No code changes needed — the existing Statements page and admin panel already display and download these records.

