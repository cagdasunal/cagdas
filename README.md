# cagdas

Static JS served at https://files.cagd.as — managed from [cagdasunal/webflow](https://github.com/cagdasunal/webflow) monorepo.

Do not edit `docs/scripts/*` here directly. **First-party bundles** are build output — edit the source in the monorepo (`sites/cagdas/scripts/src/`) and rebuild with `scripts/site_deploy.py`. **Vendored libraries** (see below) are pinned upstream distributions — replace them from their monorepo SSOT (`sites/cagdas/scripts/vendor/`), never run them through the build.

## Bundles

| Bundle | Embed | Purpose |
|---|---|---|
| `audio-player.min.js` | `<script src="https://files.cagd.as/scripts/audio-player.min.js" defer></script>` | "Hear how I say Çağdaş" voice-clip play button — mounts into any `.audio-wrapper` div (glow + play arrow that morphs into a 5-bar equalizer). Default clip: `docs/audio/cagdas-name.m4a`. |
| `rates.min.js` | `<script src="https://files.cagd.as/scripts/rates.min.js" defer></script>` | `/rates` swipeable currency **wheel** (iOS-style, centered overlay) + **odometer** pricing + "Include web design" toggle (doubles the plan prices and count-animates the week badges). Reads `data/rates.json` (below). Add/remove a currency = edit the `CURRENCIES` array in the monorepo source (`sites/cagdas/scripts/src/rates.js`). |

## Generated data

| Path | Producer | Purpose |
|---|---|---|
| `docs/data/rates.json` | `.github/workflows/update-rates.yml` (daily) → `scripts/fetch-rates.mjs` | USD-based FX rates for `rates.min.js`. Keyless (open.er-api.com → frankfurter.app fallback). Committed only when the numbers change. SSOT of the script + workflow is the monorepo (`sites/cagdas/cron/`). Served at `https://files.cagd.as/data/rates.json`. |

## Vendored libraries

Pinned, self-hosted third-party libs (SSOT + provenance in the monorepo at `sites/cagdas/scripts/vendor/`). Not built — shipped exactly as the upstream distribution.

| Library | Version | Embed | Source |
|---|---|---|---|
| `gsap.min.js` | 3.12.5 | `<script src="https://files.cagd.as/scripts/gsap.min.js"></script>` | cdnjs (SRI-verified byte-identical) |
