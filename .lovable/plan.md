

# Simplify Payment Setup Page — Clean ACH vs Credit Card Selection

## Overview
Streamline the customer PaymentSetup page by removing redundant ACH explainer content and presenting two clear payment options with brief descriptions focused on the key differences.

## Changes — Single file: `src/pages/customer/PaymentSetup.tsx`

### 1. Rewrite the Payment Method Selection card (lines 587–655)
Replace the current radio options with cleaner, more direct descriptions:

- **ACH Bank Transfer** — "Connect your bank account directly. More setup steps but **no processing fees** on any payment."
- **Credit Card** — "Quick and easy setup. **Processing fees (2.9% + $0.30) are added to each payment** and covered by you."

Keep the example fee callout on the card option but make it shorter (one line).

### 2. Remove the collapsible "ACH vs Credit Card" comparison section (lines 870–931)
Delete **SECTION 7** entirely — the redundant collapsible that repeats the same ACH vs Card pros/cons. The key points are already covered in the simplified radio descriptions above.

### 3. Remove unused state and imports
- Remove `isAchInfoOpen` state (line 62) and `setIsAchInfoOpen`
- Remove `Collapsible`, `CollapsibleContent`, `CollapsibleTrigger` imports (line 16)
- Remove `ChevronDown` from lucide imports (line 29)
- Remove `Accordion`, `AccordionContent`, `AccordionItem`, `AccordionTrigger` import if only used in billing terms (keep if billing terms section remains — it is, so keep Accordion)

### Files changed
- `src/pages/customer/PaymentSetup.tsx` — simplify radio descriptions, remove collapsible comparison section, clean up imports/state

