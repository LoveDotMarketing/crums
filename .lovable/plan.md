

# Redesign ACH Payment Setup Page - "No Charges Until Trailer Assignment" First

## Overview

Completely restructure the Payment Setup page to lead with the most important message: **linking your bank account does NOT charge you anything**. Billing only begins when we assign a trailer.

---

## Page Structure (New Order)

```text
+--------------------------------------------------+
|  HERO ALERT: NO CHARGES TODAY                    |
|  "You're only linking for future billing.        |
|   No charges until we assign your trailer."      |
+--------------------------------------------------+
|  WHAT YOU'RE DOING TODAY                         |
|  Simple 3-point summary                          |
+--------------------------------------------------+
|  BILLING TIMELINE (Visual)                       |
|  Shows when charges actually happen              |
+--------------------------------------------------+
|  PAYMENT DATE SELECTION                          |
|  1st or 15th (existing)                          |
+--------------------------------------------------+
|  LINK BANK ACCOUNT BUTTON                        |
+--------------------------------------------------+
|  WHY ACH? (Collapsed/Secondary)                  |
+--------------------------------------------------+
|  EXPANDED FAQ                                    |
+--------------------------------------------------+
```

---

## Detailed Changes

### 1. Hero Alert - "No Charges Today" (NEW - Top of Page)

Add a prominent, reassuring alert as the FIRST thing customers see:

**Design**: Full-width card with green/success styling and large icon

**Content**:
```
🔒 You Won't Be Charged Today

You're simply linking your bank account for future billing. 
No money will be withdrawn until:
• We assign a trailer to your account
• You receive notification of your first charge

This is just an authorization - not a payment.
```

**Styling**: Green border, CheckCircle icon, large text, prominent placement

---

### 2. "What You're Doing Today" Section (NEW)

Replace the current card header with a clear, simple explanation:

**Content**:
```
What You're Doing Today

✓ Authorizing CRUMS Leasing to collect future payments
✓ Selecting your preferred payment due date (1st or 15th)
✓ That's it - no charges, no commitments today
```

---

### 3. Billing Timeline (NEW)

Visual timeline showing exactly when charges occur:

```
TIMELINE:

[TODAY] ────────────────────────────────────────────────────────
   📋 Link your bank account (no charge)
   
[WHEN WE ASSIGN YOUR TRAILER] ──────────────────────────────────
   💰 $1,000 security deposit charged
   📧 You'll receive email notification first
   
[RECURRING MONTHLY] ────────────────────────────────────────────
   📅 Monthly rent on your selected date (1st or 15th)
   💳 Automatic - no action needed from you
```

**Each step has:**
- Clear icon
- Description
- "NO CHARGE" badge on today's step

---

### 4. What is ACH? (Collapsible/Secondary)

Move the ACH explanation to AFTER the main action, as additional context:

**Content** (in collapsible card):
```
What is ACH?

ACH (Automated Clearing House) is the same secure system used for:
• Direct deposit of paychecks
• Utility and mortgage payments
• Government benefit payments

Why we use ACH instead of credit cards:
• Lower fees = lower costs for you
• Direct bank connection = no expired cards or declined payments
• Reliable = helps avoid payment failures and service interruptions
```

---

### 5. Enhanced FAQ Section

Convert to Accordion component with these questions:

| Question | Answer |
|----------|--------|
| **Will I be charged when I link my account?** | No. Linking your account is just an authorization. No charges are made until we assign a trailer to your account. You'll receive email notification before your first charge. |
| **When does billing actually start?** | Billing starts when we assign a trailer to your account. Your $1,000 security deposit is charged first, then monthly rent begins on your selected date (1st or 15th). |
| **What happens if a payment fails?** | Per your lease agreement, you'll receive notifications at Day 0, 3, and 5. A 7-day grace period applies. ACH helps avoid these issues with reliable direct bank connection. |
| **Can I use a credit card instead?** | CRUMS Leasing only accepts ACH. This keeps processing fees low and ensures reliable payments. Credit cards often decline, causing service interruptions. |
| **Is my bank information secure?** | Yes. We use Stripe, a PCI Level 1 certified processor. Your credentials are never stored on our servers. |
| **What if my bank isn't supported?** | We'll verify via micro-deposits (1-2 business days). Two small deposits appear in your account for you to confirm. |

---

### 6. Payment Terms Reference

Add subtle reference to lease agreement terms:

```
Important: Payment Terms

Your lease agreement outlines our payment policies including the 7-day grace 
period for failed payments. ACH provides a reliable direct bank connection 
that helps avoid payment issues.

[View Lease Agreement Terms →]
```

---

## File to Modify

| File | Changes |
|------|---------|
| `src/pages/customer/PaymentSetup.tsx` | Complete restructure with new sections |

---

## Components Used

- **Alert** - Hero "No Charges" message
- **Card** - Content sections
- **Badge** - "NO CHARGE" emphasis
- **Accordion** - FAQ section
- **Separator** - Between sections
- **RadioGroup** - Payment date selection (existing)

---

## Key Messaging Hierarchy

1. **FIRST**: "You won't be charged today"
2. **SECOND**: What you're doing (simple 3 points)
3. **THIRD**: Timeline showing when charges happen
4. **FOURTH**: Select payment date + Link button
5. **FIFTH**: Additional context (Why ACH, FAQ)

