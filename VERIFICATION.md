# Verification — 25 September 2026

- Production build, TypeScript and ESLint: pass.
- Playwright against the production build with a local server-side API fixture: **16 passed, 2 intentionally skipped** across Chromium/Pixel and WebKit/iPhone profiles.
- Verified: landing; valid/invalid token; no horizontal overflow; manifest `start_url`; noindex and no-referrer; server secret absent from browser HTML; saved-token redirect; only unseen stamps animate; no replay on reload; reduced motion; stop facts/dates; enlarged-map zoom; complete reward; installation event capture even before hydration; standalone controls; one-time iPhone instructions; network-first offline reload with saved passport and banner.
- Engine-specific skips: iPhone instructions are tested in the WebKit/iPhone profile only; service-worker offline navigation on Windows is tested in Chromium only. These are not failed tests.
- Eleven JPGs generated at 1200 px and quality 82: 175–185 KiB each. Four-stamp and ten-stamp outputs visually checked against the supplied mockups. Coordinates and diameter are read directly from `slots.json`.
- Automated fixture tests used no real customer tokens or production data. After owner authorization, production was deployed and checked separately as described below.

## Still required before launch

- **Actual OS installation:** On a physical Android phone, open a personal link in Chrome and install; on an iPhone, open it in Safari → Share → Add to Home Screen. Fully close, then launch from the icon and verify the exact same `/p/{token}`. Test offline launch after the first successful online visit. Browser emulation cannot certify these OS actions.
- **Security update deferred by the owner:** Next.js 16.2.1 remains pinned despite known npm audit findings; the owner authorized deployment with this issue pending.
- Review hosting logs so bearer URLs are not retained in customer analytics/access logs.

## Production deployment

Published with owner authorization on 25 September 2026 at https://passport.edelweisspastryshop.ch (deployment `dpl_8aQNLihnDaXQPvTqrzqXGYspRtBH`). Both the custom domain and https://edelweiss-passport.vercel.app return HTTP 200 over HTTPS. Verified a generated email-card image, the invalid-passport screen and noindex metadata. The dashboard backend passed authenticated database reads and signed-ingest smoke checks without inserting customer/order fixtures. Production server-side API URL and shared read secret are configured in Vercel. Native-device installation remains pending.

Run locally after `npm ci` and `npx playwright install chromium webkit`: `npm run build` then `npm test`. The Playwright config launches its own API fixture and production Next server. It does not need `.env.local` and uses only synthetic test data.
