# Verification — 14 October 2026

Environment: Windows, Node.js 24.14.1, npm 11.11.0, locally installed Google Chrome. All checks ran in the NeuroTwin workspace.

| Check | Result |
| --- | --- |
| Dependency installation | Completed; npm lockfile retained |
| `npm run lint` | Passed, no ESLint warnings or errors |
| `npm run typecheck` | Passed |
| `npm test` | 16 tests passed |
| `npm run test:e2e` | 6 Playwright scenarios passed |
| `npm run build` | Passed; all four app routes prerendered |
| Production smoke (`npm start -- --port 3001`) | `/`, `/assessment`, `/dashboard?demo=1`, `/privacy` returned HTTP 200; no uncaught browser JavaScript errors; both 3D views loaded |
| `npm audit --omit=dev` | 0 reported runtime vulnerabilities |
| Full dependency audit | 5 linked high advisories in development lint dependencies; see README |

Browser scenarios exercised the landing CTA, consent, numeric validation, an excluded reaction false start, five valid reaction trials, all five memory rounds with keyboard entry, final generation, reload persistence, deletion, demo separation, region selection, formula disclosure, JSON export, draft resumption, optional skipping, two-session history, unavailable localStorage, unavailable WebGL and a failed GLB request.

Desktop and mobile screenshots were inspected for anatomy, clipping, legibility and layout. A first inspection found missing cortex primitives: multi-material glTF nodes were groups, with anatomical metadata on parent nodes. Resolving that metadata restored the full cortex; final screenshots show the repaired model.

Screenshots:

- `screenshots/landing-desktop.png`
- `screenshots/dashboard-desktop.png`
- `screenshots/dashboard-mobile.png`

Chrome mobile viewport was 390 × 844, with no horizontal document overflow. Software WebGL was used for repeatable browser automation; physical mobile devices, hardware FPS, full screen-reader usability and other browser engines were not independently verified. These checks establish application behavior, not scientific validity of the illustrative indices.
