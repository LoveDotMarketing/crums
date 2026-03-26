

## Plan: Update Price Sheet with tiered pricing and flat-rate note

### Changes to `src/pages/PriceSheet.tsx`

**Update Dry Van pricing to show contract-based tiers:**

| Year | 2-Year Contract | Month-to-Month / 1-Year |
|------|----------------|------------------------|
| 2027 | $950/mo | $1,100/mo |
| 2024 | $800/mo | $850/mo |
| 2021 | $780/mo | — |
| 2020 | $750/mo | — |
| 2019 | $720/mo | — |
| 2018 | $700/mo | — |

- Restructure the dry van card to show two price columns: "2-Year Contract" and "Month-to-Month / 1 Year"
- Older models (2021 and below) keep single price column (only 2-year rate)

**Flatbed pricing stays as-is:** 2027 at $1,400/mo

**Add flat-rate messaging:**
- Add a highlighted note below the pricing cards: "Flat Rate — No Mileage Charges" with supporting text like "All lease rates are flat monthly fees. We do not charge per mile."

