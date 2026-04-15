

## Plan: Add Story Summary Above Lyrics

### Change
Add a "Story Summary" section between the video/credits area and the lyrics section in `src/pages/CrumsStory.tsx`.

### Content
A brief, respectful TLDR that captures the song's narrative: growing up in hardship, a mother's resilience and lessons (patience, kindness, perseverance), the leap into building CRUMS Leasing, the weight of responsibility, and staying true to those values while rising.

### Implementation
Edit `src/pages/CrumsStory.tsx` — insert a styled summary block (using the existing `bg-muted/50` card style) between the video section and the lyrics `<h2>`, containing:
- Heading: "Story Summary"
- 3-4 sentence paragraph summarizing the journey

Single file, ~10 lines added.

