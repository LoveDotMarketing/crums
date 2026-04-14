

## Plan: Create Trucking Games Hub Page

### What We're Building
A `/crums-trucking-games` page styled like a game store/arcade hub. It will feature the "Yard Run" game with a card and a "Play Now" button that opens the HTML game in a new browser tab. The layout supports adding more games later.

### Steps

**1. Copy game HTML to `public/games/`**
- Copy `crums-trucking-trailer-yard-run-game.html` to `public/games/yard-run.html`

**2. Create `src/pages/TruckingGames.tsx`**
- Navigation + Footer layout matching the rest of the site
- SEO component with title "Trucking Games - CRUMS Leasing"
- Hero section: "CRUMS Trucking Games" heading with arcade/game store vibe
- Game card grid layout (ready for multiple games)
- First card: "Yard Run" with a featured image/screenshot placeholder, description, and a "Play Now" button that calls `window.open('/games/yard-run.html', '_blank')`
- Card styled as "featured" with a badge

**3. Register route in `src/App.tsx`**
- Lazy import `TruckingGames`
- Add `<Route path="/crums-trucking-games" element={<TruckingGames />} />`

### Technical Notes
- The HTML game is fully self-contained (inline CSS/JS), so it works as a static file in `public/`
- Opening in a new window gives it full-screen canvas control without interfering with site navigation
- The page grid uses the same Card components as the rest of the site

