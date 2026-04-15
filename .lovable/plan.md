

## Plan: Add Desktop-Only Scroll Animations to Homepage

A lightweight Intersection Observer hook that triggers CSS fade/slide-up animations as sections scroll into view. Desktop only (≥768px via `prefers-reduced-motion` and media query), zero external libraries, no layout shift.

### Approach

**1. Create a `useScrollReveal` hook** (`src/hooks/useScrollReveal.ts`)
- Uses `IntersectionObserver` with `threshold: 0.15` and `rootMargin: '0px 0px -50px 0px'`
- Returns a `ref` callback that registers elements
- On intersection, adds a `data-revealed="true"` attribute
- Checks `window.matchMedia('(min-width: 768px)')` — on mobile, elements are immediately visible (no animation)
- Respects `prefers-reduced-motion: reduce`

**2. Add reveal CSS classes to `src/index.css`**
Three animation variants, all CSS-only:
- `.reveal-up` — fade in + translateY(30px → 0), 0.6s ease-out
- `.reveal-left` — fade in + translateX(-30px → 0), 0.6s ease-out  
- `.reveal-scale` — fade in + scale(0.95 → 1), 0.5s ease-out

All start with `opacity: 0` and transition on `[data-revealed="true"]`. Wrapped in `@media (min-width: 768px)` so mobile gets no animation overhead.

**3. Apply to homepage sections** (`src/pages/Index.tsx`)

| Section | Animation | Stagger |
|---------|-----------|---------|
| Hero badge + h1 + subtitle | `.reveal-up` | Already visible on load (no observer, pure CSS with delay) |
| Hero CTA buttons | `.reveal-up` with 0.3s delay | CSS delay only |
| Trust bar (4 icons) | `.reveal-up` per item | 100ms stagger via inline `--delay` |
| Ready to Roll cards (3) | `.reveal-scale` per card | 150ms stagger |
| CRUMS Story thumbnail | `.reveal-up` | Single element |
| Veterans banner | `.reveal-left` | Single element |
| Reviews cards (3) | `.reveal-up` per card | 100ms stagger |
| Core Values cards (6) | `.reveal-up` per card | 100ms stagger |
| Equipment cards (2) | `.reveal-scale` per card | 150ms stagger |
| Why Choose Us image + text | `.reveal-left` (image), `.reveal-up` (text) | — |
| Final CTA | `.reveal-up` | Single element |

**4. Hero entrance (no observer — immediate)**
The hero text gets a simple CSS animation on load:
- Badge: 0.2s delay fade-up
- H1: 0.4s delay fade-up
- Subtitle: 0.6s delay fade-up
- Buttons: 0.8s delay fade-up

This complements the orange bar's slide-in-brake (which fires at ~0.9s).

### Performance considerations
- Pure CSS transitions (GPU-composited `transform` + `opacity` only)
- Single shared `IntersectionObserver` instance for all elements
- `content-deferred` sections already use `content-visibility: auto` — animations layer on top cleanly
- No JS animation libraries added
- Observer disconnects after all elements revealed

### Files changed
1. `src/hooks/useScrollReveal.ts` — new hook (~40 lines)
2. `src/index.css` — add reveal animation classes (~30 lines)
3. `src/pages/Index.tsx` — add refs and className additions to existing sections

