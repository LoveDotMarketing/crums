

## Plan: Add `game_launch` tracking to TruckingGames hub

### Change
Add a `trackEvent('game_launch', { game_name: game.id })` call to both click points in `src/pages/TruckingGames.tsx`:

1. **Image link click** (line 57) — wrap in an `onClick` handler that fires the event before navigating
2. **Play Now button** (line 82) — fire the event before `window.open`

### Steps
1. Import `trackEvent` from `@/lib/analytics`
2. Create a helper function `handleGameLaunch(game)` that calls `trackEvent('game_launch', { game_name: game.id })` then opens the URL
3. Update the image `<a>` tag to use `onClick` with `e.preventDefault()` + the helper
4. Update the Button `onClick` to use the same helper

Single file edit, no other changes needed.

