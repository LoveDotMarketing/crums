
# Add Payment Due Date Selection Feature

## Overview

Allow customers to select their preferred recurring payment due date (1st or 15th of the month) during ACH bank account setup. This preference will be visible to admins when creating subscriptions and used to set the Stripe billing cycle anchor.

---

## Workflow

```text
CUSTOMER FLOW:
+------------------+     +---------------------+     +-------------------+
|  PaymentSetup    | --> | confirm-ach-setup   | --> | customer_applications |
|  (select 1st/15) |     | (save preference)   |     | billing_anchor_day    |
+------------------+     +---------------------+     +-------------------+

ADMIN FLOW:
+----------------------+     +---------------------+     +-------------------+
| CreateSubscription   | --> | create-subscription | --> | Stripe billing_   |
| (sees preference)    |     | (uses anchor day)   |     | cycle_anchor      |
+----------------------+     +---------------------+     +-------------------+
```

---

## 1. Database Migration

Add a new column to store the customer's payment due date preference:

**Table**: `customer_applications`
**New Column**: `billing_anchor_day` (integer, nullable)

```sql
ALTER TABLE customer_applications
ADD COLUMN billing_anchor_day integer;

COMMENT ON COLUMN customer_applications.billing_anchor_day IS 
  'Preferred billing date: 1 for 1st of month, 15 for 15th of month';
```

---

## 2. Frontend: PaymentSetup.tsx

Add a date selector card in the setup flow, displayed before the "Link Bank Account" button.

**New State**:
```typescript
const [billingAnchorDay, setBillingAnchorDay] = useState<1 | 15>(1);
```

**New UI Section** (added before the action button):
- Header with Calendar icon: "Preferred Payment Due Date"
- Description: "Choose when you'd like your monthly payments to be due"
- Two selectable cards using RadioGroup:
  - "1st of the month"
  - "15th of the month"
- Visual feedback showing selected option

**Pass to confirm-ach-setup**:
```typescript
await supabase.functions.invoke("confirm-ach-setup", {
  body: {
    setupIntentId: setupIntent.id,
    paymentMethodId: setupIntent.payment_method,
    billingAnchorDay: billingAnchorDay,
  },
});
```

---

## 3. Edge Function: confirm-ach-setup

Update to receive and save the billing anchor day preference.

**Changes**:
```typescript
// Line 45: Add billingAnchorDay to destructuring
const { setupIntentId, paymentMethodId, billingAnchorDay } = await req.json();

// Lines 79-85: Update the application update to include billing_anchor_day
const { error: updateError } = await supabaseClient
  .from("customer_applications")
  .update({
    stripe_payment_method_id: pmId as string,
    payment_setup_status: "completed",
    billing_anchor_day: billingAnchorDay || null,
  })
  .eq("id", application.id);
```

---

## 4. Admin: CreateSubscriptionDialog.tsx

Show the customer's billing anchor preference when admin selects a customer.

**New Query** - Fetch customer's application to get their billing preference:
```typescript
const { data: customerApplication } = useQuery({
  queryKey: ["customer-application", selectedCustomerId],
  queryFn: async () => {
    if (!selectedCustomerId) return null;
    // First get user_id from customers table
    const { data: customer } = await supabase
      .from("customers")
      .select("user_id")
      .eq("id", selectedCustomerId)
      .single();
    
    if (!customer?.user_id) return null;
    
    const { data, error } = await supabase
      .from("customer_applications")
      .select("billing_anchor_day")
      .eq("user_id", customer.user_id)
      .single();
    
    if (error) return null;
    return data;
  },
  enabled: !!selectedCustomerId
});
```

**New UI Section** (displayed after customer selection):
- Info box showing customer's preferred payment date
- Display: "Customer's Preferred Payment Date: 1st of the month" or "15th of the month"
- If no preference set: "No preference set"
- Note: This is informational - admin uses this when deciding subscription timing

---

## 5. Edge Function: create-subscription

Use the customer's billing anchor preference when creating the Stripe subscription.

**Add helper function** at the top of the file:
```typescript
function calculateNextAnchorDate(anchorDay: number | null): number | undefined {
  if (!anchorDay || (anchorDay !== 1 && anchorDay !== 15)) return undefined;
  
  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth(), anchorDay);
  
  // If the target day has passed this month, use next month
  if (targetDate <= now) {
    targetDate.setMonth(targetDate.getMonth() + 1);
  }
  
  return Math.floor(targetDate.getTime() / 1000);
}
```

**Fetch customer's billing anchor preference**:
```typescript
// After line 115 (after getting customer details)
const { data: application } = await supabaseClient
  .from("customer_applications")
  .select("billing_anchor_day")
  .eq("user_id", customer.user_id)
  .maybeSingle();

logStep("Customer billing preference", { 
  anchorDay: application?.billing_anchor_day 
});
```

**Update subscription params** to use billing_cycle_anchor:
```typescript
// Replace trial_end with billing_cycle_anchor when anchor day is set
const subscriptionParams: Stripe.SubscriptionCreateParams = {
  customer: stripeCustomerId,
  items: subscriptionItems,
  payment_behavior: "default_incomplete",
  payment_settings: { save_default_payment_method: "on_subscription" },
  expand: ["latest_invoice.payment_intent"],
  metadata: { 
    internal_customer_id: customerId,
    deposit_amount: depositAmount?.toString() || "0",
  },
};

// Use billing_cycle_anchor if customer has preference, otherwise use trial period
const anchorDate = calculateNextAnchorDate(application?.billing_anchor_day);
if (anchorDate) {
  subscriptionParams.billing_cycle_anchor = anchorDate;
  logStep("Using billing cycle anchor", { anchorDate: new Date(anchorDate * 1000).toISOString() });
} else {
  // Fallback to 15-day trial for delayed first rent
  subscriptionParams.trial_end = Math.floor(Date.now() / 1000) + (15 * 24 * 60 * 60);
}
```

---

## 6. Customer: Billing.tsx

Display the customer's selected payment due date on their billing page.

**Add query for application** to get billing anchor:
```typescript
const { data: application } = useQuery({
  queryKey: ["customer-application-billing"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("customer_applications")
      .select("billing_anchor_day")
      .maybeSingle();
    if (error) return null;
    return data;
  },
});
```

**Add new stats card** in the grid (after "Current Rate" card):
```tsx
{application?.billing_anchor_day && (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Payment Due Date</CardTitle>
      <Calendar className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {application.billing_anchor_day === 1 ? "1st" : "15th"}
      </div>
      <p className="text-xs text-muted-foreground">of each month</p>
    </CardContent>
  </Card>
)}
```

---

## Files to Modify

| File | Change Type | Description |
|------|-------------|-------------|
| `customer_applications` table | Migration | Add `billing_anchor_day` column |
| `src/pages/customer/PaymentSetup.tsx` | Update | Add date selector UI with RadioGroup |
| `supabase/functions/confirm-ach-setup/index.ts` | Update | Save billing anchor preference |
| `src/components/admin/CreateSubscriptionDialog.tsx` | Update | Display customer's preference |
| `supabase/functions/create-subscription/index.ts` | Update | Use anchor in Stripe billing_cycle_anchor |
| `src/pages/customer/Billing.tsx` | Update | Display payment due date |

---

## User Experience Summary

### Customer Journey:
1. Application is approved
2. Customer navigates to Payment Setup
3. **NEW**: Customer selects preferred payment due date (1st or 15th)
4. Customer links bank account via Stripe Financial Connections
5. Preference is saved alongside payment method

### Admin Journey:
1. Opens Create Subscription dialog
2. Selects customer
3. **NEW**: Sees customer's preferred payment due date displayed
4. Assigns trailers, sets rates, deposit, etc.
5. Creates subscription - Stripe uses the billing anchor from customer preference

### Customer Visibility:
1. Billing page shows their selected payment due date
2. Next billing date reflects the anchor (1st or 15th)
