# Edelweiss Swiss Passport

Customer PWA for Edelweiss Pastry Shop. Next.js App Router, TypeScript and Tailwind; no database. Marketing Dashboard is the authoritative Passport API.

## Run

```sh
npm ci
cp .env.example .env.local
# Configure a test Dashboard URL and its server-only read secret.
npm run cards
npm run dev
```

Open http://localhost:3100. Personal links are `/p/{token}`. No customer data is fetched directly from Dashboard in a browser; the Server Component calls Dashboard with `PASSPORT_READ_SECRET`. Missing tokens show a friendly page; temporary API errors offer retry.

## Configuration

- `PASSPORT_API_BASE_URL`: Dashboard origin, e.g. `https://edelweiss-marketing-dashboard.vercel.app`.
- `PASSPORT_READ_SECRET`: must match Dashboard. Never prefix with `NEXT_PUBLIC_`.
- Intended public domain: `https://passport.edelweisspastryshop.ch`.
- Intended Vercel project: `prj_9p20GM5CEvUrsdAD4Ae5FW2aGnyI`.

Git-triggered deployments are disabled in `vercel.json`. No production deployment has been requested. After approval, link this repository to the specified Vercel project, configure its two server secrets and domain, and deliberately enable deployment. Do not add analytics or logging that records `/p/{token}` URLs. Application request/fetch URL logging is disabled; review platform access-log retention/redaction before launch because tokens are bearer links.

## Product rules, confirmed by the owner

One online order earns 1 stamp; subtotal strictly over $40 earns 2. The current passport ends at 10/10 and issues one 15% code, valid 30 days and usable once online. **No rollover and no next passport yet.** 9 + double ends at 10; later orders do not earn usable progress. A reward is never issued twice even after voiding/re-completing. This explicitly replaces the original brief's recurring cards/carryover. A future different passport will be a separate project.

## Assets and copy

All delivered assets are in `public/`, including reference mockups. `public/slots.json` is the single source of map coordinates, diameters and rotations. `src/lib/stops.json` is the versioned copy of the canonical Dashboard `src/lib/passport/stops.json`; update both repositories together if editorial content changes.

`npm run cards` (also `prebuild`) renders 11 JPGs at 1200 px wide, quality 82, with sharp. It fails if any exceeds 400 KB, and generates the 192 px icon. Output lives in `public/cards/card-00.jpg` through `card-10.jpg`. No personal information is included. Card images are committed so email URLs are available immediately after a future deployment.

## Installation and offline behavior

Each `/p/{token}/manifest.webmanifest` has a personal `id` and `start_url`; scope is `/` and display is standalone. Android captures `beforeinstallprompt`. Safari/iPhone shows Share → Add to Home Screen once and retains a help link; installed mode hides installation UI.

The service worker caches the map, stamps, hydration assets and the latest successful HTML for a visited personal URL. Personal navigations are network-first; cache is a fallback only. A server-side missing passport clears its cached page. Cached data stays on the device and is never treated as authority for reward redemption. An offline banner identifies cached data; reconnection reloads server state. A first-ever offline visit displays a connection message.

Local storage remembers the personal token (`edelweiss_passport_token`), per-passport viewed stamp count and installation-help dismissal. Private browsing/storage failure does not break the page. New stamps animate sequentially and honor reduced motion. Full-map view supports pinch, pan and keyboard-accessible zoom controls. `?calibrate=1` overlays the slots in development only.

## Checks

```sh
npm run cards
npx tsc --noEmit
npm run lint
npm run build
npm test
```

Browser tests must use a local API fixture, not customer tokens. Verify a 390 px viewport, valid/invalid links, no secret/PII in browser output, animation persistence, reduced motion, personal manifest, installation prompts and offline reload. Native home-screen installation still requires actual Android Chrome and iPhone Safari: install from a personal URL, fully close the app, tap its icon, and confirm it opens that same passport. Browser emulation cannot certify that OS action.

## Deferred dependency security update

The owner explicitly requested keeping Next.js 16.2.1 after reviewing the npm audit findings. Known critical/high dependency issues remain. Do not treat this build as cleared for production; update and re-audit before launch.

