# cagdas

Static JS served at https://files.cagd.as — managed from [cagdasunal/webflow](https://github.com/cagdasunal/webflow) monorepo.

Do not edit `docs/scripts/*` here directly. **First-party bundles** are build output — edit the source in the monorepo (`sites/cagdas/scripts/src/`) and rebuild with `scripts/site_deploy.py`. **Vendored libraries** (see below) are pinned upstream distributions — replace them from their monorepo SSOT (`sites/cagdas/scripts/vendor/`), never run them through the build.

## Bundles

| Bundle | Embed | Purpose |
|---|---|---|
| `audio-player.min.js` | `<script src="https://files.cagd.as/scripts/audio-player.min.js" defer></script>` | "Hear how I say Çağdaş" voice-clip play button — mounts into any `.audio-wrapper` div (glow + play arrow that morphs into a 5-bar equalizer). Default clip: `docs/audio/cagdas-name.m4a`. |

## Vendored libraries

Pinned, self-hosted third-party libs (SSOT + provenance in the monorepo at `sites/cagdas/scripts/vendor/`). Not built — shipped exactly as the upstream distribution.

| Library | Version | Embed | Source |
|---|---|---|---|
| `gsap.min.js` | 3.12.5 | `<script src="https://files.cagd.as/scripts/gsap.min.js"></script>` | cdnjs (SRI-verified byte-identical) |
