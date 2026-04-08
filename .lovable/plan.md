

## Fix: Four Bugs Blocking Subscription Creation

### Bug 1 (CRITICAL): Wrong column names in trailer SELECT — line 157
The query fetches `trailer_type` and `default_rate`, but the actual database columns are `type` and `rental_rate`. PostgREST will return an error for non-existent columns, causing every subscription attempt to fail with "Failed to fetch trailer details."

**Fix:** Line 157 — change the SELECT from:
```
"id, trailer_number, trailer_type, year, make, model, default_rate, customer_id"
```
to:
```
"id, trailer_number, type, year, make, model, rental_rate, customer_id"
```

### Bug 2 (CRITICAL): Wrong property names after previous "fix" — lines 442, 692
The previous fix changed `trailer.rental_rate` to `trailer.default_rate` and `trailer.type` to `trailer.trailer_type`. But since the real columns are `rental_rate` and `type`, this was backwards. These need to be reverted to `trailer.rental_rate` and `trailer.type`.

**Fix:**
- Line 442: `trailer.default_rate` → `trailer.rental_rate`, `trailer.trailer_type` → `trailer.type`
- Line 692: same changes

### Bug 3: Deposit PM lookup queries by `customer_id` which is only populated on 46% of records — lines 529-535
The deposit payment-method-type lookup uses `.eq("customer_id", customerId)` on `customer_applications`. But `customer_id` is only populated on 27 of 58 records. When it's null, the query returns nothing, so `depositPreferredType` falls back to null and the system defaults to ACH — ignoring the customer's actual preference (e.g., card).

**Fix:** Use the `appRecord` already resolved at the top of the function (which correctly looks up via `user_id` first). Replace the deposit PM type query with:
```typescript
depositPreferredType = appRecord?.payment_method_type ?? null;
```

### Bug 4: First-period PM lookup has the same `customer_id` issue — lines 764-770
Identical problem to Bug 3 in the first-period safety-net block.

**Fix:** Same approach — use `appRecord?.payment_method_type` instead of a fresh query by `customer_id`.

### File
`supabase/functions/create-subscription/index.ts` — all four fixes in this single file. No migrations, no UI changes.

### Impact
- Bug 1 is a hard crash — this is the current blocker preventing any subscription from being created
- Bug 2 would cause wrong billing rates once Bug 1 is fixed
- Bugs 3-4 cause card customers to silently get billed via ACH when their `customer_applications.customer_id` is null

