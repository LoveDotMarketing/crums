

# Fix Mobile Issues for ACH/Payment Setup

## Problem
The card setup modal uses `min-width:400px` which overflows on mobile screens (most phones are 360-390px wide). If Abdikarim chooses ACH, the Stripe Financial Connections flow handles mobile natively, but the card path would break visually.

The ACH bank-linking flow itself uses Stripe's hosted Financial Connections UI, which is fully mobile-responsive — no code changes needed there. The page layout uses `container mx-auto px-4 max-w-3xl` which is already mobile-friendly.

## Fix

**File:** `src/pages/customer/PaymentSetup.tsx` (~line 171)

Change the card modal container styling to be mobile-safe:
- Replace `min-width:400px;max-width:500px;` with `width:calc(100vw - 32px);max-width:500px;`
- Add `box-sizing:border-box;` to prevent padding overflow

This is a one-line CSS change. The ACH flow, page layout, radio buttons, and accordion sections are all already responsive.

## For Abdikarim's Setup
Everything else is ready to go. He can:
1. Log in on his phone
2. Go to Payment Setup from the dashboard menu
3. Select ACH (recommended, no fees)
4. Tap "Link Bank Account"
5. Stripe's mobile-optimized bank login opens
6. Connect his bank and confirm

No database or backend changes needed.

