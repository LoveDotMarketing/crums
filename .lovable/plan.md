

## Why Add Internal Links to Ad Landing Pages?

**Short answer: Don't add links to the landing pages themselves — add them to the thank-you pages.**

Ad landing pages are intentionally distraction-free funnels. Adding outbound links before conversion would hurt your conversion rate (every link is an exit). The link equity argument is real — paid traffic gives those pages authority that gets "trapped" — but conversion rate matters more than SEO equity on paid pages.

**Thank-you pages are the sweet spot.** The visitor has already converted, so now you want to:
- Distribute accumulated link equity to money pages and guides
- Keep the user on-site exploring (reduces bounce, builds brand familiarity)
- Cross-sell services (rentals, lease-to-own, fleet solutions)

---

## Plan

**Files to modify:** 3 thank-you pages
- `src/pages/GoogleThankYou.tsx`
- `src/pages/FacebookThankYou.tsx`
- `src/pages/LinkedInThankYou.tsx`

**What to add:** A `RelatedLinksSection` after the `</main>` closing tag on each page, with 6 contextual internal links per page:

| Link | Why |
|------|-----|
| `/dry-van-trailer-leasing` | Primary money page — reinforces what they just requested |
| `/services/lease-to-own` | Cross-sell a higher-commitment option |
| `/commercial-dry-van-trailer-for-lease-56171` | Show real inventory — builds confidence |
| `/resources/guides/owner-operator-basics` | Educational value for the audience |
| `/resources/tools/cost-per-mile` | Practical tool keeps them engaged |
| `/why-choose-crums` | Trust-building while they wait for callback |

Each page gets the same link set since they serve the same post-conversion audience. The section renders below `</main>` so it doesn't interfere with the conversion confirmation content or tracking pixels.

