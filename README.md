# The Weekly Truth

*All the news that appears to be true. Apparently.*

Thesis prototype 1: a newspaper whose every story is something pretending to be something else.
Click a story and the site throws an error. Press **Fix** and it breaks into its source: the real article behind the fake headline, with the images rebuilt as ASCII text.

## Open it

Double-click `index.html`, or visit the live site (GitHub Pages).

## What's where

| | |
|---|---|
| `index.html` | The front page, error window and code-page shell |
| `css/style.css` | All styling. Colours and line weight are at the top (`--blue`, `--red`, `--rule`) |
| `js/app.js` | Error stacking, the glitch transition, page switching |
| `js/code-pages.js` | The text of the eight code pages, ASCII art included |
| `assets/` | Images from the Figma file |

## Interaction

- Click a story → an **Error** window appears
- Click more stories → more errors stack on top
- **X** closes that window
- **Fix** glitches the page and opens that story's code page
- On a code page: press **Esc**, use the browser's back button, or click the first/last `<THE_DAILY_TRUTH>` line to return

Fonts: Instrument Serif, Fira Code and VT323 (Google Fonts), Arial / Arial Rounded MT Bold (system).
