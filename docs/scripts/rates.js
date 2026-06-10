/*!
 * rates.js — live currency selector + "web design" price toggle for cagd.as/rates
 *
 * BEHAVIOUR ONLY. Every pixel of the page is built in Webflow; this bundle wires
 * up the two interactive bits the design needs and injects NO <style> element and
 * NO CSS rules. The dropdown menu it builds is a runtime-only widget (it does not
 * exist in Webflow), so that ONE element is styled with inline `el.style.*` — the
 * same pattern faq.js uses for its runtime open-state visuals. Nothing that lives
 * in Webflow is ever styled from here.
 *
 * ── What it drives ────────────────────────────────────────────────────────────
 * 1. Currency selector. The hero's currency code (`.price_dropdown`, the "USD" in
 *    "I charge $40 USD per hour") is the trigger. Click it → a dark dropdown of
 *    currencies. Pick one and EVERY price on the page re-renders in that currency:
 *      .price_symbol   → the currency symbol ($, €, £, ¥ …) — HIDDEN when the
 *                        currency has no clean symbol (CHF, SEK, AED … show the
 *                        code only).
 *      .price_value    → the amount, converted from its USD base and re-grouped.
 *      .price_currency → the 3-letter code on the plan cards (USD → EUR …).
 *      .price_dropdown → the 3-letter code in the hero (also the trigger label).
 *    The chosen currency is remembered (localStorage) so it sticks across reloads
 *    and pages.
 *
 * 2. "Include web design" toggle (`#webdesign`). Click it →
 *      • button copy   "+ Include web design"  ⇄  "− Exclude web design"
 *      • #price_plan    both plan prices DOUBLE (1,400→2,800 / 2,500→5,000, in USD
 *                       terms — the currency conversion is re-applied on top).
 *      • .price_week-1  week badge → 4   (its authored value is captured + restored)
 *      • .price_week-2  week badge → 6   (its authored value is captured + restored)
 *    Click again to revert everything to the exact original state. The hero hourly
 *    rate has no #price_plan id, so it is never doubled.
 *
 * ── Where the rates come from ─────────────────────────────────────────────────
 * After the page loads, it fetches a small JSON of USD-based rates from the CDN:
 *      https://files.cagd.as/data/rates.json
 * That file is refreshed once every 24h by a GitHub Action (see
 * sites/cagdas/cron/), so the browser never calls a forex API directly — it just
 * grabs a pre-computed, edge-cached file. Three layers of resilience:
 *      1. localStorage cache  — last good rates render instantly on the next load.
 *      2. baked-in FALLBACK   — a snapshot shipped in this bundle, used if there is
 *                               no cache yet and the fetch fails.
 *      3. live fetch          — always runs in the background and re-caches.
 * USD is always available (rate 1), so the selector works even fully offline.
 *
 * ── Adding / removing a currency ──────────────────────────────────────────────
 * Edit the CURRENCIES array below — that is the ONLY place. The cron already saves
 * all ~160 rates, so a newly-added currency needs no cron change; just give it a
 * symbol ('' to hide the symbol and show the code) and rebuild the bundle.
 *
 * Self-contained: zero dependencies, one optional network request, no globals
 * leaked. Guard: __cagdasRates. Design source: Claude Design "website" →
 * Rates Hero.html.
 */
(function () {
  "use strict";
  if (window.__cagdasRates) return;
  window.__cagdasRates = true;

  // ───────────────────────────── CONFIG ──────────────────────────────────────
  // The ONLY place to add/remove a currency. `symbol: ''` => the currency has no
  // clean glyph, so `.price_symbol` is hidden and only the 3-letter code shows.
  const CURRENCIES = [
    { code: "USD", symbol: "$",   name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "CAD", symbol: "CA$", name: "Canadian Dollar" },
    { code: "AUD", symbol: "A$",  name: "Australian Dollar" },
    { code: "CHF", symbol: "",    name: "Swiss Franc" },          // no glyph → code
    { code: "SEK", symbol: "",    name: "Swedish Krona" },
    { code: "NOK", symbol: "",    name: "Norwegian Krone" },
    { code: "DKK", symbol: "",    name: "Danish Krone" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    { code: "SGD", symbol: "S$",  name: "Singapore Dollar" },
    { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
    { code: "AED", symbol: "",    name: "UAE Dirham" },
    { code: "TRY", symbol: "₺", name: "Turkish Lira" },
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
    { code: "BRL", symbol: "R$",  name: "Brazilian Real" },
    { code: "MXN", symbol: "MX$", name: "Mexican Peso" },
    { code: "ZAR", symbol: "R",   name: "South African Rand" },
    { code: "PLN", symbol: "",    name: "Polish Złoty" }
  ];

  // "Include web design" behaviour. All four numbers live here.
  const WEB_DESIGN = {
    priceMultiplier: 2, // #price_plan prices are multiplied by this when ON
    week1: 4,           // .price_week-1 becomes this when ON
    week2: 6,           // .price_week-2 becomes this when ON
    labelOn: "− Exclude web design"   // − minus sign; the OFF label is the page's own copy
  };

  const RATES_URL = "https://files.cagd.as/data/rates.json";
  const FETCH_TIMEOUT_MS = 6000;
  const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // trust a saved render for 7 days
  const LS_CURRENCY = "cagdas_rates_currency";
  const LS_CACHE = "cagdas_rates_cache";
  const ACCENT = "#126ef5"; // brand blue (the "Webflow" accent / avatar glow)
  const UNDERLINE = "rgba(237,237,237,.4)";

  // Snapshot baked in at build time (open.er-api.com, USD base). Pure fallback —
  // the live file and the localStorage cache both override it. Refreshed whenever
  // the bundle is rebuilt; staleness here only matters fully-offline on a first
  // visit.
  const FALLBACK = {
    USD: 1, EUR: 0.865865, GBP: 0.74738, CAD: 1.394379, AUD: 1.422139,
    CHF: 0.798073, SEK: 9.451967, NOK: 9.489863, DKK: 6.459362, JPY: 160.279502,
    SGD: 1.28672, NZD: 1.7195, AED: 3.6725, TRY: 46.126087, INR: 95.40519,
    BRL: 5.173573, MXN: 17.430625, ZAR: 16.504187, PLN: 3.670793
  };

  // ───────────────────────────── DOM LOOKUP ──────────────────────────────────
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) =>
    Array.prototype.slice.call((root || document).querySelectorAll(sel));

  const trigger = $(".price_dropdown");
  const valueEls = $$(".price_value");
  if (!trigger || !valueEls.length) return; // not the /rates page — bail silently

  const symbolEls = $$(".price_symbol");
  const cardCodeEls = $$(".price_currency");
  const week1El = $(".price_week-1");
  const week2El = $(".price_week-2");
  const toggleBtn = document.getElementById("webdesign");

  // Capture the ORIGINAL state once, so "Exclude web design" can restore it
  // exactly and so each price knows its USD base. `#price_plan` marks a plan
  // price (the doubling targets); the hero rate has no id and is left alone.
  const parseNum = (txt) => {
    const n = parseFloat(String(txt).replace(/[^0-9.\-]/g, ""));
    return isFinite(n) ? n : 0;
  };
  const prices = valueEls.map((el) => ({
    el: el, baseUsd: parseNum(el.textContent), isPlan: el.id === "price_plan"
  }));
  const week1Orig = week1El ? week1El.textContent : null;
  const week2Orig = week2El ? week2El.textContent : null;
  const toggleOff = toggleBtn ? toggleBtn.textContent.trim() : "+ Include web design";

  // ───────────────────────────── STATE ───────────────────────────────────────
  function cloneRates(src) {
    const out = {};
    for (const k in src) {
      if (Object.prototype.hasOwnProperty.call(src, k)) out[k] = src[k];
    }
    out.USD = 1; // USD is the base by definition — never trust a stray value
    return out;
  }

  const state = { code: "USD", rates: cloneRates(FALLBACK), webDesign: false };

  function currencyOf(code) {
    for (let i = 0; i < CURRENCIES.length; i++) {
      if (CURRENCIES[i].code === code) return CURRENCIES[i];
    }
    return CURRENCIES[0];
  }
  function available(code) {
    return typeof state.rates[code] === "number" && isFinite(state.rates[code]) &&
      state.rates[code] > 0;
  }

  // localStorage helpers (Safari private mode throws on write — swallow it).
  function lsGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }
  function nowMs() { return (window.Date && Date.now) ? Date.now() : +new Date(); }

  // ───────────────────────────── FORMAT / RENDER ─────────────────────────────
  // Numbers are grouped with en-US commas (matching the page's "1,400") whatever
  // the currency — the symbol + code already localise it. Rounded to whole units.
  function formatAmount(value) {
    let rounded = Math.round(value);
    if (!isFinite(rounded)) rounded = 0;
    try { return rounded.toLocaleString("en-US"); }
    catch (e) { return String(rounded); }
  }

  function render() {
    const cur = currencyOf(state.code);
    const rate = available(state.code) ? state.rates[state.code] : 1;

    // Prices: base × (plan & web-design ? 2 : 1) × rate.
    for (let i = 0; i < prices.length; i++) {
      const p = prices[i];
      const mult = (p.isPlan && state.webDesign) ? WEB_DESIGN.priceMultiplier : 1;
      p.el.textContent = formatAmount(p.baseUsd * mult * rate);
    }

    // Symbols: show the glyph, or hide the element entirely when there is none.
    for (let s = 0; s < symbolEls.length; s++) {
      if (cur.symbol) { symbolEls[s].textContent = cur.symbol; symbolEls[s].style.display = ""; }
      else { symbolEls[s].style.display = "none"; }
    }

    // Codes: hero trigger label + plan-card codes.
    if (codeLabel) codeLabel.textContent = state.code;
    for (let c = 0; c < cardCodeEls.length; c++) cardCodeEls[c].textContent = state.code;

    // Week badges + toggle copy follow the web-design state.
    if (week1El) week1El.textContent = state.webDesign ? String(WEB_DESIGN.week1) : week1Orig;
    if (week2El) week2El.textContent = state.webDesign ? String(WEB_DESIGN.week2) : week2Orig;
    if (toggleBtn) toggleBtn.textContent = state.webDesign ? WEB_DESIGN.labelOn : toggleOff;

    paintActiveOption();
  }

  // ───────────────────────────── TRIGGER (hero "USD") ────────────────────────
  // Rebuild the trigger as: [code span][caret]. The code span is what render()
  // updates; the caret is a static affordance. " per hour" sits OUTSIDE this
  // span in the <h1>, so it is never touched.
  const codeLabel = document.createElement("span");
  codeLabel.textContent = (trigger.textContent || "USD").trim() || "USD";
  const caret = document.createElement("span");
  caret.textContent = "▾";
  caret.setAttribute("aria-hidden", "true");
  caret.style.cssText = "margin-left:4px;font-size:.62em;opacity:.55;vertical-align:middle;";
  trigger.textContent = "";
  trigger.appendChild(codeLabel);
  trigger.appendChild(caret);

  trigger.setAttribute("role", "button");
  trigger.setAttribute("tabindex", "0");
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-label", "Change currency");
  trigger.style.cursor = "pointer";
  trigger.style.borderBottom = "1px dashed " + UNDERLINE;
  trigger.style.transition = "color .15s ease, border-color .15s ease";
  trigger.addEventListener("mouseenter", () => {
    if (!menuOpen) { trigger.style.color = ACCENT; trigger.style.borderBottomColor = ACCENT; }
  });
  trigger.addEventListener("mouseleave", () => {
    if (!menuOpen) { trigger.style.color = ""; trigger.style.borderBottomColor = UNDERLINE; }
  });

  // ───────────────────────────── DROPDOWN MENU ───────────────────────────────
  let menu = null;          // the <div> listbox (built lazily, attached to body)
  let optionEls = [];       // current option elements, in DOM order
  let menuOpen = false;
  let activeIndex = -1;     // keyboard focus position

  function buildMenu() {
    if (menu && menu.parentNode) menu.parentNode.removeChild(menu);
    menu = document.createElement("div");
    menu.setAttribute("role", "listbox");
    menu.setAttribute("aria-label", "Currency");
    menu.style.cssText = [
      "position:absolute", "z-index:9999", "min-width:200px", "max-height:60vh",
      "overflow-y:auto", "padding:6px", "border-radius:12px",
      "background:#0e0e0e", "border:1px solid #242424",
      "box-shadow:0 12px 34px rgba(0,0,0,.55)",
      "font-family:Söhne,Arial,sans-serif", "font-size:.95rem",
      "color:#ededed", "display:none", "-webkit-overflow-scrolling:touch"
    ].join(";");

    optionEls = [];
    CURRENCIES.forEach((cur) => {
      if (!available(cur.code)) return; // skip a configured currency with no rate
      const opt = document.createElement("div");
      opt.setAttribute("role", "option");
      opt.setAttribute("tabindex", "-1");
      opt.setAttribute("data-code", cur.code);
      opt.style.cssText = [
        "display:flex", "justify-content:space-between", "align-items:center",
        "gap:18px", "padding:8px 12px", "border-radius:8px", "cursor:pointer",
        "white-space:nowrap", "transition:background .12s ease"
      ].join(";");

      const left = document.createElement("span");
      left.textContent = cur.code;
      left.style.fontWeight = "500";
      const right = document.createElement("span");
      right.textContent = cur.name;
      right.style.color = "#8f8f8f";
      right.style.fontSize = ".85rem";
      opt.appendChild(left);
      opt.appendChild(right);

      opt.addEventListener("mouseenter", () => setActive(optionEls.indexOf(opt), false));
      opt.addEventListener("click", () => choose(cur.code));
      menu.appendChild(opt);
      optionEls.push(opt);
    });

    document.body.appendChild(menu);
    paintActiveOption();
  }

  function paintActiveOption() {
    for (let i = 0; i < optionEls.length; i++) {
      const opt = optionEls[i];
      const selected = opt.getAttribute("data-code") === state.code;
      const focused = i === activeIndex;
      opt.setAttribute("aria-selected", selected ? "true" : "false");
      opt.style.background = focused ? "#1c1c1c" : "transparent";
      opt.style.color = selected ? ACCENT : "#ededed";
    }
  }

  function setActive(index, doFocus) {
    if (index < 0 || index >= optionEls.length) return;
    activeIndex = index;
    paintActiveOption();
    if (doFocus !== false && optionEls[index]) optionEls[index].focus();
  }

  function indexOfCode(code) {
    for (let i = 0; i < optionEls.length; i++) {
      if (optionEls[i].getAttribute("data-code") === code) return i;
    }
    return -1;
  }

  function positionMenu() {
    if (!menu) return;
    const r = trigger.getBoundingClientRect();
    let left = r.left + window.pageXOffset;
    const top = r.bottom + window.pageYOffset + 8;
    const menuW = menu.offsetWidth || 200;
    const maxLeft = window.pageXOffset + document.documentElement.clientWidth - menuW - 12;
    if (left > maxLeft) left = Math.max(window.pageXOffset + 12, maxLeft);
    menu.style.left = left + "px";
    menu.style.top = top + "px";
  }

  function openMenu() {
    if (menuOpen) return;
    if (!menu) buildMenu();
    menuOpen = true;
    menu.style.display = "block";
    trigger.setAttribute("aria-expanded", "true");
    trigger.style.color = ACCENT;
    trigger.style.borderBottomColor = ACCENT;
    positionMenu();
    const sel = indexOfCode(state.code);
    setActive(sel >= 0 ? sel : 0, true);
    document.addEventListener("mousedown", onDocDown, true);
    document.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("resize", positionMenu, true);
    window.addEventListener("scroll", positionMenu, true);
  }

  function closeMenu(returnFocus) {
    if (!menuOpen) return;
    menuOpen = false;
    if (menu) menu.style.display = "none";
    trigger.setAttribute("aria-expanded", "false");
    trigger.style.color = "";
    trigger.style.borderBottomColor = UNDERLINE;
    document.removeEventListener("mousedown", onDocDown, true);
    document.removeEventListener("keydown", onKeyDown, true);
    window.removeEventListener("resize", positionMenu, true);
    window.removeEventListener("scroll", positionMenu, true);
    if (returnFocus) trigger.focus();
  }

  function toggleMenu() { menuOpen ? closeMenu(false) : openMenu(); }

  function choose(code) {
    state.code = code;
    lsSet(LS_CURRENCY, code);
    render();
    closeMenu(true);
  }

  function onDocDown(e) {
    if (menu && (menu.contains(e.target) || trigger.contains(e.target))) return;
    closeMenu(false);
  }

  function onKeyDown(e) {
    if (!menuOpen) return;
    switch (e.key) {
      case "Escape": e.preventDefault(); closeMenu(true); break;
      case "ArrowDown": e.preventDefault(); setActive(Math.min(activeIndex + 1, optionEls.length - 1), true); break;
      case "ArrowUp": e.preventDefault(); setActive(Math.max(activeIndex - 1, 0), true); break;
      case "Home": e.preventDefault(); setActive(0, true); break;
      case "End": e.preventDefault(); setActive(optionEls.length - 1, true); break;
      case "Enter":
      case " ":
        if (activeIndex >= 0 && optionEls[activeIndex]) {
          e.preventDefault();
          choose(optionEls[activeIndex].getAttribute("data-code"));
        }
        break;
      case "Tab": closeMenu(false); break;
      default: break;
    }
  }

  trigger.addEventListener("click", (e) => { e.preventDefault(); toggleMenu(); });
  trigger.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault(); openMenu();
    }
  });

  // ───────────────────────────── WEB-DESIGN TOGGLE ───────────────────────────
  if (toggleBtn) {
    toggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      state.webDesign = !state.webDesign;
      toggleBtn.setAttribute("aria-pressed", state.webDesign ? "true" : "false");
      render();
    });
    toggleBtn.setAttribute("aria-pressed", "false");
  }

  // ───────────────────────────── RATES: cache → render → fetch ───────────────
  // 1) Seed from the localStorage cache if it is fresh, else keep the baked
  //    fallback. 2) Restore the saved currency. 3) First paint. 4) Fetch live.
  (function seedFromCache() {
    const raw = lsGet(LS_CACHE);
    if (!raw) return;
    try {
      const c = JSON.parse(raw);
      if (c && c.rates && typeof c.savedAt === "number" &&
          (nowMs() - c.savedAt) < CACHE_MAX_AGE_MS &&
          Object.keys(c.rates).length > 1) { // ignore a junk/empty cache → keep FALLBACK
        state.rates = cloneRates(c.rates);
      }
    } catch (e) {}
  })();

  const savedCode = lsGet(LS_CURRENCY);
  if (savedCode && currencyOf(savedCode).code === savedCode && available(savedCode)) {
    state.code = savedCode;
  }

  buildMenu();
  render();
  fetchRates();

  function fetchRates() {
    if (typeof window.fetch !== "function") return; // very old browser → fallback stays
    const ctrl = (typeof AbortController === "function") ? new AbortController() : null;
    const timer = window.setTimeout(() => { if (ctrl) ctrl.abort(); }, FETCH_TIMEOUT_MS);
    const opts = { cache: "default", mode: "cors" };
    if (ctrl) opts.signal = ctrl.signal;

    // The file ships Cache-Control: max-age=600, so the browser/CDN keep it fresh
    // within ~10 min on their own — no cache-buster needed for once-a-day data.
    window.fetch(RATES_URL, opts)
      .then((res) => (res && res.ok ? res.json() : null))
      .then((data) => {
        window.clearTimeout(timer);
        if (!data || !data.rates || typeof data.rates !== "object" ||
            !Object.keys(data.rates).length) return;
        const beforeSig = optionEls.map((o) => o.getAttribute("data-code")).join(",");
        state.rates = cloneRates(data.rates);
        lsSet(LS_CACHE, JSON.stringify({
          rates: data.rates, updated: data.updated || null, savedAt: nowMs()
        }));
        // a saved currency that only became available now can apply on this pass
        if (savedCode && available(savedCode)) state.code = savedCode;
        // Rebuild the menu ONLY if the available currency set actually changed —
        // avoids tearing down an open menu on every load (it almost never changes,
        // since configured currencies are in both the fallback and the live file).
        const afterSig = CURRENCIES.filter((c) => available(c.code))
          .map((c) => c.code).join(",");
        if (afterSig !== beforeSig) { if (menuOpen) closeMenu(false); buildMenu(); }
        render();
      })
      .catch(() => { window.clearTimeout(timer); /* keep cache/fallback */ });
  }
})();
