# Dead or Alive Technology — Website

A modern, futuristic single-page website for **Dead or Alive Technology Ltd**,
a device repair and IT support business in Wishaw, North Lanarkshire.

## Stack

Pure static HTML/CSS/JS — no build step, no dependencies. Host it anywhere
(GitHub Pages, Netlify, Cloudflare Pages, or any web host): just serve the
files in this folder.

| File          | Purpose                                      |
| ------------- | -------------------------------------------- |
| `index.html`  | All page content and structure               |
| `styles.css`  | Theme, layout, animations                    |
| `script.js`   | Nav, scroll reveals, stat counters, form     |
| `favicon.svg` | Pulse-line favicon                           |

## Changing the colour scheme

All brand colours are CSS variables at the top of `styles.css`:

```css
:root {
  --bg: #05080d;       /* page background          */
  --alive: #00e887;    /* primary neon-green accent */
  --dead: #ff3d5a;     /* red "flatline" accent     */
  --cyan: #25c9ff;     /* secondary accent          */
}
```

Change those values and the entire site updates.

## Before going live — placeholders to fill in

- **Phone number** — search `index.html` for `[Add phone number]`
- **Opening hours** — search for `[Add opening hours]`
- **Email** — currently `info@deadoralivetechnology.com` in `index.html`
  and `script.js`; update if you use a different address
- **Stats** — "Devices revived" and turnaround figures in the hero are
  illustrative; adjust the `data-count` values in `index.html`
- **Booking form** — currently opens the visitor's email client. For direct
  submissions, wire it to Formspree, Netlify Forms, or your own backend
  (see the note in `script.js`)

## Local preview

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```
