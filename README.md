# cagdas

Static JS served at https://files.cagd.as — managed from [cagdasunal/webflow](https://github.com/cagdasunal/webflow) monorepo.

Do not edit `docs/scripts/*` here directly — they are build output. Edit the source in the monorepo (`sites/cagdas/scripts/src/`) and rebuild with `scripts/site_deploy.py`.

## Bundles

| Bundle | Embed | Purpose |
|---|---|---|
| `audio-player.min.js` | `<script src="https://files.cagd.as/scripts/audio-player.min.js" defer></script>` | "Hear how I say Çağdaş" voice-clip play button — mounts into any `.audio-wrapper` div (glow + play arrow that morphs into a 5-bar equalizer). Default clip: `docs/audio/cagdas-name.m4a`. |
