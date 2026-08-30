# How to ask Claude — cagdas (files.cagd.as)

Just describe what you want in plain English. Claude reads `CLAUDE.md` automatically. Quick note below.

## Just say what you want
- "Add a new currency to the rates widget."
- "Update the audio-player button style."

## Good to know
- **This repo is a "mirror" — the real source lives in the `webflow` project.** So most edits actually happen
  over there and get copied here. Claude knows this and will edit the right place; you don't need to track it.
- Two files here (`rates.json`, `llms.txt`) update themselves automatically on a schedule — don't hand-edit
  them, and Claude won't either.
- Anything under `docs/` is **live on files.cagd.as**, so Claude treats changes here as production and will
  confirm before shipping.
