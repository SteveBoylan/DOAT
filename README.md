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
  --bg: #ffffff;       /* page background                    */
  --alive: #3cb56e;    /* brand green — buttons / "alive"    */
  --blue: #3a6ab8;     /* brand blue — pulse line / wordmark */
  --dead: #e02d4b;     /* red "flatline" accent              */
}
```

The green and blue are matched to the Dead or Alive Technology logo
(blue EKG pulse and wordmark, green action buttons) on a clean white
background.

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

## Testing

`tests/abc-test.js` is an automated A/B/C cross-viewport suite
(A = desktop 1440px, B = tablet 768px, C = mobile 390px) that checks:
horizontal overflow, scroll-reveal visibility, stat counter animation,
hamburger menu open/navigate/close, desktop nav scrolling, form
validation, the mailto handoff, mobile tap-target sizes, and console
errors.

```sh
npm install playwright            # one-off
python3 -m http.server 8123 &     # serve the site
node tests/abc-test.js            # run the suite
```
