

## Plan: Expand `agent-public-fleet-info` Response Fields

### What Changes

Update the edge function to return individual trailer records with VIN, Type, Year, Make, Material (body_material), rental_rate (price), and availability status — instead of grouping into counts.

### File Modified

**`supabase/functions/agent-public-fleet-info/index.ts`**

1. Update the `.select()` query to include: `vin, type, year, make, body_material, rental_rate, status, is_rented`
2. Replace the grouping logic with a simple map that returns each trailer as:
   ```json
   {
     "vin": "1GRAA0622HB123456",
     "type": "Dry Van",
     "year": 2024,
     "make": "Great Dane",
     "material": "Aluminum",
     "price": 800,
     "available": true
   }
   ```
3. Keep the same response shape — `available` array, `totalAvailable` count, `pricing`, and `leaseTerms` all stay the same
4. The request format (`{ "type": "dry van" }`) and auth remain unchanged — nothing the bot calls changes

### Response Shape (after)

```json
{
  "available": [
    {
      "vin": "1GRAA...",
      "type": "Dry Van",
      "year": 2024,
      "make": "Great Dane",
      "material": "Aluminum",
      "price": 800,
      "available": true
    }
  ],
  "totalAvailable": 12,
  "pricing": { ... },
  "leaseTerms": { ... }
}
```

### Technical Details
- `material` maps from the `body_material` column
- `price` maps from the `rental_rate` column (numeric, nullable — will be `null` if not set)
- `available` is always `true` in this response since we filter for `status = 'available'` and `is_rented = false`
- VINs are semi-public identifiers used on registrations; no sensitive data is exposed
- Sorted by year descending

