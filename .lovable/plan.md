

## Fix: Three Bugs in create-subscription That Will Crash Every Call

### Bugs Found

**Bug 1: `globalAnchorDay` is not defined (line 383)**
The code references `globalAnchorDay` but this variable was never declared. The request body destructures it as `billingAnchorDay` on line 104. This will throw a `ReferenceError` at runtime for every subscription creation attempt, just like the previous `trailers is not defined` crash.

**Bug 2: `trailer.rental_rate` — wrong column name (lines 442, 692)**
The SELECT query on line 157 fetches `default_rate`, but lines 442 and 692 reference `trailer.rental_rate`. This will silently resolve to `undefined`, causing every trailer to fall through to `getDefaultRate()` and ignore any custom default rate set on the trailer record. For customers with negotiated rates stored on the trailer, they'd be billed the generic type-based default instead.

**Bug 3: `trailer.type` — wrong column name (lines 442, 692)**
Same issue: the SELECT fetches `trailer_type` but the code calls `getDefaultRate(trailer.type)`. Since `trailer.type` is `undefined`, `getDefaultRate` will receive `undefined`, which won't match any type check and will always return the $700 dry van default — even for flatbeds ($750) and reefers ($850).

### Fix

**File: `supabase/functions/create-subscription/index.ts`**

1. **Line 383**: Change `globalAnchorDay` to `billingAnchorDay`
2. **Lines 442 and 692**: Change `trailer.rental_rate` to `trailer.default_rate` and `trailer.type` to `trailer.trailer_type`

All three are single-token renames — no logic changes, no new code.

### Impact
- Bug 1 is a hard crash (ReferenceError) — this is why Stevie's subscription failed
- Bugs 2-3 cause silent wrong billing rates for any trailer with a custom rate or non-dry-van type

