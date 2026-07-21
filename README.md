# EMI Prototype v2

Hi-fi interactive prototype for **easy memory item** — "Memory items that stick — and make you better."

Imported from the Claude Design project *High fidelity prototype design*
(`EMI Prototype v2.dc.html`).

This is a **PWA** — installable, runs fully offline, **no backend required**.
`index.html` is the design-compiler runtime (`support.js` rendering the
prototype) with React/ReactDOM/Babel and the Inter font **vendored locally**, so
nothing is fetched from a CDN. A service worker precaches the whole app shell.

## Files

| File | What it is |
| --- | --- |
| `index.html` | **The PWA.** Same markup as the `.dc.html` source + a local `window.__resources` map (points the runtime at `vendor/` instead of unpkg), local font, PWA `<head>` tags, and service-worker registration. Deploy and install this. |
| `manifest.webmanifest` | Web app manifest — name, icons, colours, `display: standalone`. |
| `sw.js` | Service worker. Precaches the app shell (listed in `PRECACHE`) and serves cache-first, so the installed app works offline from first launch. |
| `icons/` | App icons (`icon.svg`, `icon-192.png`, `icon-512.png` — `any maskable`; `apple-touch-icon.png`). Generated from the brand mark. |
| `vendor/` | Local copies of `react` / `react-dom` / `@babel/standalone` (18.3.1 / 7.29.0) and the Inter font (`inter.css` + `fonts/*.woff2`). Makes the app CDN-free and offline-capable. |
| `EMI Prototype v2.dc.html` | **Editable source.** Claude Design compiler format (`<x-dc>`, `sc-if`/`sc-for`, `{{ }}` bindings) rendered by `support.js`. Edit here, then re-apply changes to `index.html`. |
| `support.js` | Design-compiler runtime. Parses the markup and renders it; resolves CDN deps through `window.__resources` when present. |
| `ios-frame.jsx` | `IOSDevice` bezel/status-bar component (imported via `<x-import>`). |
| `EMI Prototype v2 (standalone).html` | Old single-file export — **truncated at 256 KB and does not render**. Kept only as a stub; ignore it. |

## Run it

### Locally (to test install / offline)
Service workers only run over `http://localhost` or `https://`, so serve it —
opening `index.html` from `file://` won't register the worker:

```sh
./serve.sh          # http://localhost:8000/  → open, then DevTools ▸ Application to inspect/install
```

To verify offline: load once, stop the server, reload — it still runs from cache.

### Deploy (static host, no backend)
Upload the whole folder to any static host — GitHub Pages, Netlify, Vercel,
Cloudflare Pages. They serve over HTTPS, which is all a PWA needs. On the phone,
open the URL and use **Add to Home Screen** (iOS Safari) or the **Install**
prompt (Android Chrome). After the first load it runs offline.

> When you change `index.html`, an icon, or anything in `vendor/`, bump
> `CACHE_VERSION` in `sw.js` so installed clients pick up the new version.
> Add any new precached file to the `PRECACHE` list in `sw.js`.

## Editing

Edit the markup and the `<script data-dc-script>` logic block inside
`EMI Prototype v2.dc.html`, then mirror the change into `index.html` (the two
share the same body; `index.html` only adds the PWA/vendor wiring in `<head>`
and a SW-registration script before `</body>`). `support.js` and `ios-frame.jsx`
rarely need changes.

To push edits back to the Claude Design project, use the `/design-sync` flow.
