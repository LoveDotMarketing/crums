

## Plan: Update Orange MATS Banner with Truck Image

### Change
Replace the `Newspaper` icon in the Event CTA Banner (lines 192-209 in `src/pages/Index.tsx`) with the uploaded truck image (`trailer-yard-game-blue-truck.webp`).

### Steps

1. **Copy uploaded image** → `public/images/trailer-yard-game-blue-truck.webp`
2. **Edit `src/pages/Index.tsx`** — In the Event CTA Banner section (~line 196):
   - Remove `Newspaper` icon
   - Replace with `<img src="/images/trailer-yard-game-blue-truck.webp" alt="Yard Run Game" className="h-8 w-8 flex-shrink-0 object-contain" />`
   - Remove `Newspaper` from the lucide-react import if no longer used elsewhere

