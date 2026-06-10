#!/usr/bin/env node
/**
 * fetch-rates.mjs — daily USD-based FX snapshot for cagd.as/rates
 *
 * Runs in GitHub Actions (see update-rates.yml). Fetches current exchange rates,
 * normalises them to a small USD-based JSON, and writes it to
 *   <repo>/docs/data/rates.json   →  served at https://files.cagd.as/data/rates.json
 * The browser bundle (rates.js) reads that file, so no forex API is ever called
 * from a visitor's browser — they get a pre-computed, edge-cached file.
 *
 * Keyless + dependency-free (Node 20+ global fetch). Two independent sources for
 * resilience; the file is only overwritten when a source returns a sane payload,
 * so a bad upstream day can never blank the page.
 *
 *   Primary : open.er-api.com  (USD base, ~160 currencies, daily ~00:00 UTC)
 *   Fallback: frankfurter.app  (ECB, USD base, ~30 currencies)
 *
 * SSOT lives here (sites/cagdas/cron/); the runnable copy is mirrored to the
 * serving repo at cagdasunal/cagdas:scripts/fetch-rates.mjs. Keep them in sync.
 *
 * Usage:  node fetch-rates.mjs [--out <path>] [--dry-run]
 */
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
// Default output: <repo-root>/docs/data/rates.json. The script sits in either
// monorepo `sites/cagdas/cron/` or serving-repo `scripts/`; in the serving repo
// the repo root is one level up. We resolve from CWD by default so the workflow
// (which runs at repo root) is unambiguous, with a sensible fallback.
const argv = process.argv.slice(2);
const dryRun = argv.includes("--dry-run");
const outIdx = argv.indexOf("--out");
const OUT = outIdx !== -1 && argv[outIdx + 1]
  ? resolve(argv[outIdx + 1])
  : resolve(process.cwd(), "docs/data/rates.json");

const TIMEOUT_MS = 15000;
// Refuse a payload that is suspiciously thin (a broken upstream day). The
// fallback (frankfurter) returns ~30 currencies, the primary ~160, so 12 is a
// safe floor that rejects junk without ever blocking a healthy fallback.
const MIN_RATES = 12;

async function getJson(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "user-agent": "cagdas-rates-cron/1.0 (+https://cagd.as)" }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

// Source adapters → { rates: {CODE:Number}, updated: ISOString } or throw.
async function fromErApi() {
  const d = await getJson("https://open.er-api.com/v6/latest/USD");
  if (!d || d.result !== "success" || !d.rates || d.base_code !== "USD") {
    throw new Error("er-api: unexpected shape");
  }
  const updated = d.time_last_update_utc
    ? new Date(d.time_last_update_utc).toISOString()
    : new Date().toISOString();
  return { rates: d.rates, updated, source: "open.er-api.com" };
}

async function fromFrankfurter() {
  const d = await getJson("https://api.frankfurter.app/latest?from=USD");
  if (!d || !d.rates || d.base !== "USD") throw new Error("frankfurter: unexpected shape");
  const updated = d.date ? new Date(d.date + "T00:00:00Z").toISOString() : new Date().toISOString();
  return { rates: d.rates, updated, source: "frankfurter.app" };
}

function sanitise(raw) {
  const out = {};
  for (const [code, val] of Object.entries(raw)) {
    if (!/^[A-Z]{3}$/.test(code)) continue;          // ISO codes only
    const n = Number(val);
    if (!Number.isFinite(n) || n <= 0) continue;      // drop junk / zero
    out[code] = Math.round(n * 1e6) / 1e6;            // 6 dp keeps the file small + stable
  }
  out.USD = 1; // base by definition
  return out;
}

async function main() {
  let picked = null;
  for (const [name, fn] of [["primary", fromErApi], ["fallback", fromFrankfurter]]) {
    try {
      const got = await fn();
      const rates = sanitise(got.rates);
      const count = Object.keys(rates).length;
      if (count < MIN_RATES) throw new Error(`only ${count} rates`);
      picked = { base: "USD", updated: got.updated, source: got.source, rates };
      console.log(`✓ ${name} (${got.source}): ${count} currencies, updated ${got.updated}`);
      break;
    } catch (err) {
      console.warn(`✗ ${name} failed: ${err.message}`);
    }
  }

  if (!picked) {
    console.error("ERROR: all rate sources failed — leaving existing rates.json untouched.");
    process.exit(1);
  }

  // Stable key order so day-to-day diffs are minimal and reviewable.
  const ordered = {};
  Object.keys(picked.rates).sort().forEach((k) => { ordered[k] = picked.rates[k]; });
  const payload = {
    base: "USD",
    updated: picked.updated,
    source: picked.source,
    generated_by: "fetch-rates.mjs",
    rates: ordered
  };
  const json = JSON.stringify(payload, null, 2) + "\n";

  if (dryRun) {
    console.log(json);
    return;
  }
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, json, "utf8");
  console.log(`→ wrote ${OUT} (${json.length} bytes)`);
}

main().catch((err) => { console.error(err); process.exit(1); });
