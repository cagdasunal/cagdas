#!/usr/bin/env node
/**
 * generate-llms.mjs — llms.txt for cagd.as, driven by the sitemap, hosted on GitHub Pages.
 *
 * Runs in GitHub Actions (see update-llms.yml). Reads Webflow's published sitemap at
 * https://cagd.as/sitemap.xml (the source of which pages exist), fetches each page's
 * <title> + meta description, and writes an llms.txt (llmstxt.org format) to
 *   <repo>/docs/llms.txt   ->  served at https://files.cagd.as/llms.txt
 *
 * The cron regenerates this every 12h and commits ONLY when the file changes — so a
 * change to the sitemap (a page added/removed) or to a page's title/description flows
 * through to llms.txt, and an unchanged run is a no-op. Same output format as CEL's
 * tools/llms/generate-llms.sh, minus the npx llmstxt dependency.
 *
 * Keyless + dependency-free (Node 20+ global fetch). Defensive: only overwrites when
 * the sitemap returns a sane set of URLs (>= MIN_URLS), so a broken fetch never blanks it.
 *
 * SSOT lives here (sites/cagdas/cron/); the runnable copy is mirrored to the serving repo
 * at cagdasunal/cagdas:scripts/generate-llms.mjs. Keep them in sync.
 *
 * Usage:  node generate-llms.mjs [--out <path>] [--source <url>] [--dry-run]
 */
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const ORIGIN = "https://cagd.as";
const SOURCE_DEFAULT = `${ORIGIN}/sitemap.xml`;
const ORG_NAME = "Çağdaş Ünal";
const ORG_DESC =
  "Freelance Webflow developer building clean, custom, CMS-driven websites for agencies and businesses who care what's under the hood.";
// High-intent pages worth listing for an LLM but intentionally NOT in the sitemap
// (thin/utility pages Webflow keeps out of search indexing). Same-origin only.
const EXTRA_URLS = [`${ORIGIN}/call`];
const TIMEOUT_MS = 15000;
const MIN_URLS = 3; // a sane sitemap has at least this many; fewer => treat the fetch as broken

const argv = process.argv.slice(2);
const dryRun = argv.includes("--dry-run");
const arg = (flag) => {
  const i = argv.indexOf(flag);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : null;
};
const OUT = arg("--out") ? resolve(arg("--out")) : resolve(process.cwd(), "docs/llms.txt");
const SOURCE = arg("--source") || SOURCE_DEFAULT;

const ENTITIES = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&#x27;": "'", "&#x2F;": "/", "&nbsp;": " " };
function decode(s) {
  return (s || "")
    .replace(/&#x?[0-9a-f]+;|&[a-z]+;/gi, (e) => {
      if (ENTITIES[e] !== undefined) return ENTITIES[e];
      const n = e.startsWith("&#x") ? parseInt(e.slice(3, -1), 16) : e.startsWith("&#") ? parseInt(e.slice(2, -1), 10) : NaN;
      return Number.isFinite(n) ? String.fromCodePoint(n) : e;
    })
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchText(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { "user-agent": "cagdas-llms-bot (+https://cagd.as)" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

function extractLocs(xml) {
  const out = [];
  const re = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const u = m[1].trim().replace(/([^:])\/{2,}/g, "$1/").replace(/\/+$/, "") || ORIGIN;
    if (u.startsWith(ORIGIN) && !out.includes(u)) out.push(u);
  }
  out.sort((a, b) => (a === ORIGIN ? -1 : b === ORIGIN ? 1 : a.localeCompare(b)));
  return out;
}

function slugTitle(url) {
  const path = url.slice(ORIGIN.length).replace(/^\//, "");
  if (!path) return ORG_NAME;
  return path.split("/").pop().replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

async function pageMeta(url) {
  try {
    const html = await fetchText(url);
    const head = html.slice(0, html.indexOf("</head>") + 7 || html.length);
    const title = decode((head.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]) || slugTitle(url);
    const desc = decode(
      (head.match(/<meta[^>]+name=["']description["'][^>]*content=["']([\s\S]*?)["']/i) ||
        head.match(/<meta[^>]+content=["']([\s\S]*?)["'][^>]+name=["']description["']/i) || [])[1]
    );
    return { url, title, desc };
  } catch {
    return { url, title: slugTitle(url), desc: "" };
  }
}

function buildLlms(pages) {
  const lines = [`# ${ORG_NAME}`, "", `> ${ORG_DESC}`, "", "## Pages", ""];
  for (const p of pages) lines.push(`- [${p.title}](${p.url})${p.desc ? `: ${p.desc}` : ""}`);
  lines.push("", "## Optional", "", `- [${ORG_NAME} Sitemap](${SOURCE}): XML sitemap with all indexed pages`, "");
  return lines.join("\n");
}

async function main() {
  let xml;
  try {
    xml = await fetchText(SOURCE);
  } catch (err) {
    console.error(`error: could not fetch ${SOURCE}: ${err.message}`);
    console.error("Refusing to overwrite llms.txt — keeping the last good copy.");
    return 1;
  }
  const urls = extractLocs(xml);
  if (urls.length < MIN_URLS) {
    console.error(`error: parsed only ${urls.length} same-origin URL(s) from ${SOURCE} (min ${MIN_URLS}); refusing to write.`);
    return 1;
  }
  // Add the curated extra pages (not in the sitemap), then re-sort root-first/alpha.
  for (const e of EXTRA_URLS) {
    const u = e.replace(/([^:])\/{2,}/g, "$1/").replace(/\/+$/, "") || ORIGIN;
    if (u.startsWith(ORIGIN) && !urls.includes(u)) urls.push(u);
  }
  urls.sort((a, b) => (a === ORIGIN ? -1 : b === ORIGIN ? 1 : a.localeCompare(b)));
  const pages = await Promise.all(urls.map(pageMeta));
  const output = buildLlms(pages);
  if (dryRun) {
    process.stdout.write(output);
    console.error(`[dry-run] ${pages.length} pages — not written.`);
    return 0;
  }
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, output, "utf8");
  console.log(`Wrote ${pages.length} pages to ${OUT}`);
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
