

## Plan: Fix BMS Logistics Weekly Rate

### Problem
BMS Logistics (sub `sub_1TC08CLjIwiEGQIhyZWxvuSF`) has a Stripe price set to **$175/month** but should be **$244.56/week**.

### Steps

**1. Create correct weekly price in Stripe**
- Create a new Stripe price: $244.56, recurring weekly, on the same product (`prod_UAKnE4Y5JUjnlK`)

**2. Swap the subscription item**
- Update the Stripe subscription to replace the old monthly price item (`si_UAKnJZQevBfz8D`) with the new weekly price
- Use `proration_behavior: none` to avoid generating proration charges

**3. Update local database**
- Update `subscription_items.monthly_rate` to `244.56` for subscription `e88c3208-6337-4b4e-bd2a-78217f4653c0`

### Result
Going forward, Stripe will automatically bill BMS Logistics **$244.56 every week** instead of the incorrect monthly charge.

### Note
The already-paid $419.56 invoice will remain as-is in Stripe history. If you want to credit or adjust for the overcharge/undercharge, let me know and I can handle that separately.

