

## Add 20 New Trailers to Fleet Inventory

### What will happen
A script will decode each VIN using the NHTSA API to get Make, Model, Year, Type, Axle Count, Body Material, and Suspension Type, then insert all 20 trailers into the fleet database with status "available".

### Trailer numbers
Your existing inventory uses 6-digit numbers (903637, 900887, etc.). The last 6 digits of these VINs (907007–907030) match that pattern, so those will be used as trailer numbers.

### VINs to process (20 trailers)
| VIN | Trailer # |
|-----|-----------|
| 1GR1P0620VJ907007 | 907007 |
| 1GR1P0622VJ907008 | 907008 |
| 1GR1P0624VJ907009 | 907009 |
| 1GR1P0628VJ907014 | 907014 |
| 1GR1P062XVJ907015 | 907015 |
| 1GR1P0621VJ907016 | 907016 |
| 1GR1P0623VJ907017 | 907017 |
| 1GR1P0625VJ907018 | 907018 |
| 1GR1P0627VJ907019 | 907019 |
| 1GR1P0623VJ907020 | 907020 |
| 1GR1P0625VJ907021 | 907021 |
| 1GR1P0627VJ907022 | 907022 |
| 1GR1P0629VJ907023 | 907023 |
| 1GR1P0620VJ907024 | 907024 |
| 1GR1P0622VJ907025 | 907025 |
| 1GR1P0624VJ907026 | 907026 |
| 1GR1P0628VJ907027 | 907027 |
| 1GR1P062XVJ907029 | 907029 |
| 1GR1P0626VJ907030 | 907030 |

### Technical approach
1. Run a script that calls the NHTSA vPIC API for each VIN to decode specifications
2. Insert all 20 trailers into the `trailers` table using the existing `company_id` (`fac613bd-c65f-42a5-b241-75afe75d53c5`)
3. Each trailer gets: status = "available", is_rented = false, rental_rate based on type (700 for Dry Van, 750 for Flatbed, 850 for Refrigerated), year_purchased = 2025

### Files changed
- No code file changes — this is a direct data operation using database insert

