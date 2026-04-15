

## Plan: Replace Yard Run Game File (v4 with GA4 Analytics)

### What's happening
Replace `public/games/yard-run.html` with the uploaded v4 file that includes built-in GA4 analytics tracking.

### GA4 Review — Confirmed Correct
- **Measurement ID**: `G-FHB5E7Q0PK` ✓ (matches site-wide GA4)
- **gtag config**: Standard async loader in `<head>` ✓
- **GA helper object**: Clean wrapper with try/catch error handling ✓
- **Device detection**: mobile vs desktop auto-tagged on all events ✓
- **game_name param**: `'yard-run'` consistently attached ✓

### Events tracked
| Event | Data |
|---|---|
| `game_start` | device type |
| `level_start` | level number, level name |
| `game_level_complete` | level, time, stars, resets |
| `game_all_levels_complete` | total time, session duration |
| `game_session_duration` | seconds on page |
| `game_retry` | level number |
| `trailer_hooked` | level, time to hook |
| `collision` | level, obstacle type |
| `destructible_hit` | level, object type |
| `level_abandon` | level, time spent |
| `horn_used` | level |
| `night_level_played` | level |
| `control_type` | input method |

### Change
1. Copy `user-uploads://crums-trucking-trailer-yard-run-game-4.html` → `public/games/yard-run.html` (overwrites existing)

No other file changes needed — the TruckingGames.tsx page already links to `/games/yard-run.html`.

