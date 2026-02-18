
# Add Microsoft Clarity Tracking Code

## What This Is

Microsoft Clarity is a free behavior analytics tool that records user sessions, heatmaps, and click tracking. This is a one-file change — adding the Clarity script snippet to `index.html`.

## Where It Goes

The Clarity script will be added inside the `<head>` tag, alongside the existing GA4 and LinkedIn stubs. Since it's an async script that self-initializes, it fits cleanly with the existing pattern of "stubs initialized synchronously, heavy scripts loaded async."

The snippet will be placed just before the closing `</head>` tag (after the OG/Twitter meta tags), clearly labeled as a separate analytics block.

## File Modified

| File | Change |
|---|---|
| `index.html` | Add Microsoft Clarity script snippet inside `<head>` before `</head>` |

## The Addition

```html
<!-- Microsoft Clarity -->
<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "vjea8e1y0x");
</script>
```

## Notes

- **No performance impact** — the script is already async (`t.async=1`) so it won't block page rendering or the LCP hero image
- **No additional code changes needed** — Clarity auto-instruments all clicks, scrolls, and session recordings once the tag is present
- **Project ID** `vjea8e1y0x` is embedded in the snippet as provided
- This does not interfere with GA4 or LinkedIn tracking
