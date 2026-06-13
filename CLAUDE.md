# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server (Vite, default http://localhost:5173)
npm run dev -- --host  # expose on LAN (use if port 5173 taken, Vite auto-increments)
npm run build      # production build → dist/
npm run preview    # serve dist/ locally
npm run lint       # ESLint
```

No test suite. No TypeScript.

## Stack

- **React 19 + Vite 8** — single-page app, no router
- **Tailwind CSS v4** — configured via `@tailwindcss/vite` plugin in `vite.config.js` (no `tailwind.config.js`; no `npx tailwindcss init`)
- **react-leaflet v5 + Leaflet 1.9** — map layer
- **Inter** — loaded from Google Fonts in `index.html`

## Architecture

Everything lives in `src/App.jsx` (~756 lines). No component files, no state management library.

### Component tree

```
App
├── MapContainer (Leaflet)
│   ├── TileLayer (CartoDB dark matter)
│   ├── CreateMarkersPane   — creates custom Leaflet pane (zIndex 650) on mount
│   ├── MapFlyTo            — flies map when selected project changes
│   ├── GeoJSON             — world choropleth (fetched once from holtzy/D3-graph-gallery)
│   └── MarkerLayer (memo)  — renders CircleMarkers; hover state kept internal
└── Right panel (div)
    ├── PillGroup filters   — region / type / rating (multi-select; [] = "All")
    ├── StatCards           — avg price, IG premium, top project
    ├── ProjectDetail       — shown when a marker is selected
    │   ├── PremiumDial     — SVG semicircle gauge, regional price position
    │   ├── SpotPriceInfo   — popover with outside-click dismiss
    │   └── CoBenefitDots
    └── Project list        — scrollable, filtered
```

### Key design decisions

**Layer z-index**: GeoJSON renders in `overlayPane` (zIndex 400); markers render in custom `markersPane` (zIndex 650). Without this split the choropleth blocks marker click events. `CreateMarkersPane` must be mounted inside `MapContainer` before `MarkerLayer`.

**MarkerLayer memoisation**: `MarkerLayer` is wrapped in `React.memo`. Hover state (`hoveredMarker`) lives inside it — if it were in `App`, every mouseover would re-render App and remount all CircleMarkers, dropping event listeners.

**`onSelect` stability**: defined with `useCallback([], [])` in App so memo comparison on MarkerLayer never breaks.

**Filter logic**: empty array = no filter (show all). `REGION_MAP` maps display label `'N. America'` → data value `'North America'`.

**Rating system**: `RATING_ORDER` array drives sort order and `ratingBand()` (which maps individual ratings to color groups: IG = AAA/AA/A, sub-IG = BBB/BB/B, junk = CCC/CC/D).

**GeoJSON**: fetched at runtime from GitHub (holtzy/D3-graph-gallery). No local copy. Fails silently.

### Color palette

| Token | Hex | Use |
|---|---|---|
| Background | `#0A1A14` | body, map bg |
| Surface | `#111F19` | cards, tooltips |
| Border | `#1E3328` | dividers |
| Muted text | `#8FA89F` | labels, sub-values |
| Accent green | `#1D9E75` | choropleth hover, interactive |
| Text | `#F0F4F2` | primary |

Marker colors from `markerColor()` — maps rating band to hex (green gradient for IG, amber for sub-IG, red for junk).

### CSS

`src/index.css` — Tailwind v4 import + Leaflet overrides (tooltip style, zoom controls, focus ring removal, panel scrollbar). `src/App.css` — unused legacy file from Vite template.
