#!/usr/bin/env node
/**
 * generate-sitemap.mjs — curated sitemap.xml for cagd.as, hosted on GitHub Pages.
 *
 * Runs in GitHub Actions (see update-sitemap.yml). Fetches Webflow's own published
 * sitemap at https://cagd.as/sitemap.xml (the authority on which pages are
 * sitemap-included), normalises + sorts the <loc> URLs, and writes a clean copy to
 *   <repo>/docs/sitemap.xml   ->  served at https://files.cagd.as/sitemap.xml
 *
 * Why re-host Webflow's sitemap on files.cagd.as instead of just using
 * cagd.as/sitemap.xml: a version-controlled, cron-maintained copy on a stable URL
 * we control (and can curate later). For Google to use it for cagd.as URLs it MUST
 * be declared in cagd.as/robots.txt (the cross-host sitemap rule):
 *   Sitemap: https://files.cagd.as/sitemap.xml
 *
 * Keyless + dependency-free (Node 20+ global fetch). Defensive: the file is only
 * overwritten when the fetch returns a sane sitemap (>= MIN_URLS same-origin URLs),
 * so a broken Webflow response can never blank the published sitemap.
 *
 * SSOT lives here (sites/cagdas/cron/); the runnable copy is mirrored to the serving
 * repo at cagdasunal/cagdas:scripts/generate-sitemap.mjs. Keep them in sync.
 *
 * Usage:  node generate-sitemap.mjs [--out <path>] [--source <url>] [--dry-run]
 */
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const ORIGIN = "https://cagd.as";
const SOURCE_DEFAULT = `${ORIGIN}/sitemap.xml`;
const TIMEOUT_MS = 15000;
const MIN_URLS = 3; // a sane sitemap has at least this many; fewer => treat the fetch as broken

const argv = process.argv.slice(2);
const dryRun = argv.includes("--dry-run");
const outIdx = argv.indexOf("--out");
const OUT = outIdx !== -1 && argv[outIdx + 1]
  ? resolve(argv[outIdx + 1])
  : resolve(process.cwd(), "docs/sitemap.xml");
const srcIdx = argv.indexOf("--source");
const SOURCE = srcIdx !== -1 && argv[srcIdx + 1] ? argv[srcIdx + 1] : SOURCE_DEFAULT;

async function fetchText(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "user-agent": "cagdas-sitemap-bot (+https://cagd.as)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

function extractLocs(xml) {
  const locs = [];
  const re = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) locs.push(m[1].trim());
  return locs;
}

// Same-origin only, collapse accidental double slashes, drop trailing slash,
// dedupe, and order deterministically (root first, then alphabetical) so the
// output is stable and the cron commits only on a real URL-set change.
function normalize(locs) {
  const seen = new Set();
  const out = [];
  for (const raw of locs) {
    if (!raw || !raw.startsWith(ORIGIN)) continue;
    const u = raw.replace(/([^:])\/{2,}/g, "$1/").replace(/\/+$/, "") || ORIGIN;
    if (!seen.has(u)) {
      seen.add(u);
      out.push(u);
    }
  }
  out.sort((a, b) => (a === ORIGIN ? -1 : b === ORIGIN ? 1 : a.localeCompare(b)));
  return out;
}

function buildXml(urls) {
  const body = urls.map((u) => `  <url>\n    <loc>${u}</loc>\n  </url>`).join("\n");
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${body}\n` +
    `</urlset>\n`
  );
}

async function main() {
  let xml;
  try {
    xml = await fetchText(SOURCE);
  } catch (err) {
    console.error(`error: could not fetch ${SOURCE}: ${err.message}`);
    console.error("Refusing to overwrite the sitemap — keeping the last good copy.");
    return 1;
  }
  const urls = normalize(extractLocs(xml));
  if (urls.length < MIN_URLS) {
    console.error(`error: parsed only ${urls.length} same-origin URL(s) from ${SOURCE} (min ${MIN_URLS}); refusing to write.`);
    return 1;
  }
  const output = buildXml(urls);
  if (dryRun) {
    process.stdout.write(output);
    console.error(`[dry-run] ${urls.length} URLs — not written.`);
    return 0;
  }
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, output, "utf8");
  console.log(`Wrote ${urls.length} URLs to ${OUT}`);
  for (const u of urls) console.log(`  ${u}`);
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
