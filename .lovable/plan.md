

## Add Service Bubbles Below Hero CTAs

Add three pill/bubble-style links below the "Free Quote" and phone buttons in the hero section, linking to each service page.

### Changes

**`src/pages/Index.tsx`** (lines ~167-168)

Insert after the CTA button flex container (after line 167's closing `</div>`), before the closing `</div>` of the hero content:

```tsx
<div className="flex flex-wrap gap-3 justify-center mt-6">
  <Link to="/trailer-leasing" className="bg-primary-foreground/15 hover:bg-primary-foreground/25 border border-primary-foreground/30 text-primary-foreground rounded-full px-5 py-2 text-sm font-medium transition-colors">
    Trailer Leasing
  </Link>
  <Link to="/services/lease-to-own" className="bg-primary-foreground/15 hover:bg-primary-foreground/25 border border-primary-foreground/30 text-primary-foreground rounded-full px-5 py-2 text-sm font-medium transition-colors">
    Lease to Own
  </Link>
  <Link to="/services/rent-for-storage" className="bg-primary-foreground/15 hover:bg-primary-foreground/25 border border-primary-foreground/30 text-primary-foreground rounded-full px-5 py-2 text-sm font-medium transition-colors">
    Rent for Storage
  </Link>
</div>
```

Three translucent pill-shaped links, positioned directly beneath the existing hero buttons, matching the hero's color scheme.

