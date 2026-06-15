/*!
 * rates.js — currency WHEEL picker + odometer pricing for cagd.as/rates
 *
 * A faithful vanilla-JS port of the Claude Design handoff
 * (cagd-as-design-system → ui_kits/website/Rates Hero.html + rates-hero.jsx):
 * a swipeable iOS-style currency WHEEL, not a dropdown, plus odometer price
 * counting. BEHAVIOUR ONLY — the page is built in Webflow; this injects NO
 * <style> element. The one runtime widget (the wheel) is styled with inline
 * el.style.* (the faq.js pattern). Guard: __cagdasRates.
 *
 * ── The wheel ─────────────────────────────────────────────────────────────────
 * The hero currency code (`.price_dropdown`, the "USD") is an underlined link
 * with a chevron. Click it → a tall, solid-surfaced wheel opens CENTERED on the
 * trigger (overlaying the price), rows fade + shrink with distance from centre
 * (CSS mask gradient + per-row scale/opacity), and it loops infinitely. Spin it
 * by swipe/drag, trackpad/mouse-wheel, click-a-row-to-centre, or ↑/↓ arrows; it
 * snaps to the nearest row on release. Whatever rests at the centre IS the
 * selection — after ~0.5s resting the prices roll to it (live preview); the pick
 * commits when the wheel closes (click the centre row, Enter, Esc, click the
 * trigger, or click outside). The centred code reads at full hero size; the rest
 * are muted (#595959).
 *
 * ── Odometer pricing ──────────────────────────────────────────────────────────
 * Every `.price_value` (hero $40 + both plan cards) counts from its old amount to
 * the new one over ~360ms ease-out, tabular digits so nothing jitters. The symbol
 * (`.price_symbol`) shows only for the shared "$" glyph (USD/AUD/CAD/SGD) and is
 * HIDDEN for every other currency (EUR/GBP/JPY/ZAR/AED + the "kr" Scandinavians
 * DKK/NOK/SEK), where the code label carries the currency. Set per currency in
 * CURRENCIES. `.price_currency` (plan-card codes) + the hero
 * trigger show the 3-letter code. Plan amounts ≥ 1000 round to the nearest 10.
 *
 * ── "Include web design" toggle (`#webdesign`) ────────────────────────────────
 * Copy "+ Include web design" ⇄ "− Exclude web design"; swaps each plan price to
 * its web-design-included USD figure (`#price_plan-1`→2,100, `#price_plan-2`→3,750,
 * converted like any price) — the hero hourly rate is untouched (no id) — and
 * `.price_week-1`→3, `.price_week-2`→6. Click again to revert exactly (authored
 * values captured at load). Prices AND week badges roll through the same odometer.
 *
 * ── Rates data ────────────────────────────────────────────────────────────────
 * USD-based rates are fetched after load from files.cagd.as/data/rates.json
 * (refreshed daily by a GitHub Action — see sites/cagdas/cron/), cached in
 * localStorage, with a baked-in FALLBACK snapshot. USD always works (rate 1).
 *
 * Add/remove a currency: edit the CURRENCIES array (the only place); the wheel
 * order = array order. Deploy: see the rates.js Deploy note / docs/components.md.
 */
(function () {
  "use strict";
  if (window.__cagdasRates) return;
  window.__cagdasRates = true;

  // ───────────────────────────── ANALYTICS ───────────────────────────────────
  // Push behavioral events to the dataLayer for GTM-KCKHRLL5 → GA4 (matches the
  // events.js taxonomy). Inert until GTM is live. The /rates currency wheel +
  // pricing toggle are owned here, so this bundle emits their events directly:
  //   currency_picker_open · currency_select (currency) · web_design_toggle (web_design_included)
  // rates.js runs only on /rates, so page_type is always "rates". Carry the same page identity
  // (page_id / page_type / page_locale) as events.js so these events slice by page context in GA4.
  const RATES_PAGE_ID = document.documentElement.getAttribute("data-wf-page") || "";
  const RATES_PAGE_LOCALE = ((document.documentElement.getAttribute("lang") || "en").toLowerCase().split("-")[0]) || "en";
  const dlPush = (name, params) => {
    window.dataLayer = window.dataLayer || [];
    const o = { event: name, page_id: RATES_PAGE_ID, page_type: "rates", page_locale: RATES_PAGE_LOCALE };
    if (params) for (const k in params) if (Object.prototype.hasOwnProperty.call(params, k)) o[k] = params[k];
    window.dataLayer.push(o);
  };

  // ───────────────────────────── CONFIG ──────────────────────────────────────
  // [code, name, fallbackRate, symbol]. Wheel order = this order (matches the
  // design). The cron saves ~160 rates, so a new currency needs no cron change —
  // just add a row with a recent USD rate as the offline fallback.
  //
  // `symbol`: the glyph shown in `.price_symbol`, or "" to HIDE it (code only).
  // Policy (cagdas): show the symbol ONLY for the shared "$" glyph (USD/AUD/CAD/
  // SGD), where the glyph alone is ambiguous so the symbol+code pair is
  // informative. HIDE it for every other currency — unique/no-glyph ones
  // (EUR €, GBP £, JPY ¥, ZAR R, AED —) AND the "kr" Scandinavians (DKK/NOK/SEK,
  // hidden as clutter per user) — where the code already carries the currency.
  const CURRENCIES = [
    ["USD", "US Dollar", 1, "$"],
    ["EUR", "Euro", 0.865865, ""],
    ["GBP", "British Pound", 0.74738, ""],
    ["AED", "UAE Dirham", 3.6725, ""],
    ["AUD", "Australian Dollar", 1.422139, "$"],
    ["CAD", "Canadian Dollar", 1.394379, "$"],
    ["DKK", "Danish Krone", 6.459362, ""],
    ["JPY", "Japanese Yen", 160.279502, ""],
    ["NOK", "Norwegian Krone", 9.489863, ""],
    ["SEK", "Swedish Krona", 9.451967, ""],
    ["SGD", "Singapore Dollar", 1.28672, "$"],
    ["ZAR", "South African Rand", 16.504187, ""]
  ];

  const WEB_DESIGN = {
    // USD figure each plan shows when web design is included, keyed by element id
    // (converted like any price). The hero hourly rate has no id → never changes.
    planUsd: { "price_plan-1": 2100, "price_plan-2": 3750 },
    week1: 3,
    week2: 6,
    labelOn: "− Exclude web design"
  };

  // Wheel geometry (from the design): 46px rows, 7-row viewport, centred overlay.
  const ROW = 46;
  const VISIBLE = 7;
  const ODO_MS = 360;           // odometer duration
  const PREVIEW_MS = 500;       // rest-on-a-row before the price rolls to it

  // Colours (design tokens resolved to hex — the widget can't rely on Webflow vars)
  const PRIMARY = "#ededed";
  const SUBTLE = "#595959";
  const HOVER = "#8f8f8f";
  const NEUTRAL_900 = "#0e0e0e"; // border
  const NEUTRAL_950 = "#080808"; // surface

  const RATES_URL = "https://files.cagd.as/data/rates.json";
  const FETCH_TIMEOUT_MS = 6000;
  const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
  const LS_CURRENCY = "cagdas_rates_currency";
  const LS_CACHE = "cagdas_rates_cache";

  const reduce = typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const EASE = "cubic-bezier(0.22,1,0.36,1)";

  // ───────────────────────────── DOM ─────────────────────────────────────────
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));

  const trigger = $(".price_dropdown");
  const valueEls = $$(".price_value");
  if (!trigger || !valueEls.length) return; // not /rates — bail

  const symbolEls = $$(".price_symbol");
  const cardCodeEls = $$(".price_currency");
  const week1El = $(".price_week-1");
  const week2El = $(".price_week-2");
  const toggleBtn = document.getElementById("webdesign");

  const parseNum = (t) => {
    const n = parseFloat(String(t).replace(/[^0-9.\-]/g, ""));
    return isFinite(n) ? n : 0;
  };
  // Each price knows its USD base; a plan also carries the USD figure it shows
  // when web design is included (undefined for the hero → no web-design uplift).
  const prices = valueEls.map((el) => ({
    el: el, baseUsd: parseNum(el.textContent), webUsd: WEB_DESIGN.planUsd[el.id], shown: 0
  }));

  // The in-sentence hero price (no web-design figure → webUsd == null) and its
  // symbol. When the wheel is open we watch these for width changes and hold the
  // trigger steady (see repin / pinObserver) so the dropdown can't slide.
  const heroValueEl = (prices.filter((p) => p.webUsd == null)[0] || prices[0] || {}).el || null;
  const heroSymbolEl = heroValueEl
    ? (symbolEls.filter((s) => s.parentNode === heroValueEl.parentNode)[0] || null)
    : null;

  const week1Orig = week1El ? week1El.textContent : null;
  const week2Orig = week2El ? week2El.textContent : null;
  const toggleOff = toggleBtn ? toggleBtn.textContent.trim() : "+ Include web design";

  // Week badges count-animate on the web-design toggle (2→4 / 4→6 and back),
  // through the SAME countTo() odometer the prices use. `off` = the authored
  // value captured at load; `on` = the WEB_DESIGN target.
  const weekCounters = [];
  if (week1El) weekCounters.push({ el: week1El, on: WEB_DESIGN.week1, off: parseNum(week1Orig), shown: parseNum(week1Orig) });
  if (week2El) weekCounters.push({ el: week2El, on: WEB_DESIGN.week2, off: parseNum(week2Orig), shown: parseNum(week2Orig) });

  // ───────────────────────────── STATE ───────────────────────────────────────
  const N = CURRENCIES.length;
  const FALLBACK = {};
  const SYMBOL = {};
  CURRENCIES.forEach(([c, , r, s]) => { FALLBACK[c] = r; SYMBOL[c] = s || ""; });

  const state = { code: "USD", rates: cloneRates(FALLBACK), webDesign: false };

  // Clone rates, optionally merging `src` OVER a `base` (the baked FALLBACK) so a
  // source that omits a currency — e.g. the frankfurter fallback (ECB) has no AED
  // — keeps its baked rate instead of collapsing to rate 1 (the USD amount).
  // Non-positive / non-finite values are skipped so junk can never override a good
  // base rate. USD is forced to 1 (base by definition).
  function cloneRates(src, base) {
    const out = {};
    const merge = (obj) => {
      for (const k in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
        const v = Number(obj[k]);
        if (Number.isFinite(v) && v > 0) out[k] = v;
      }
    };
    if (base) merge(base);
    merge(src);
    out.USD = 1;
    return out;
  }
  const idxOf = (code) => { const i = CURRENCIES.findIndex(([c]) => c === code); return i < 0 ? 0 : i; };
  const rateOf = (code) => {
    const r = state.rates[code];
    return (typeof r === "number" && isFinite(r) && r > 0) ? r : 1;
  };

  function lsGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }
  function nowMs() { return (window.Date && Date.now) ? Date.now() : +new Date(); }

  // ───────────────────────────── PRICING ─────────────────────────────────────
  function roundUsd(usd, code) {
    const v = usd * rateOf(code);
    return v >= 1000 ? Math.round(v / 10) * 10 : Math.round(v);
  }
  const groupNum = (n) => {
    try { return Math.round(n).toLocaleString("en-US"); } catch (e) { return String(Math.round(n)); }
  };
  // The explicit per-currency glyph (4th CURRENCIES field), or "" to hide
  // .price_symbol so the code label carries the currency. See CURRENCIES policy.
  function glyphOf(code) { return SYMBOL[code] || ""; }

  // ── Odometer: count each .price_value from its shown amount to the target ──
  function applyCurrency(animate) {
    const code = state.code;
    const glyph = glyphOf(code);

    for (let i = 0; i < symbolEls.length; i++) {
      if (glyph) { symbolEls[i].textContent = glyph; symbolEls[i].style.display = ""; }
      else symbolEls[i].style.display = "none";
    }
    if (heroCode) heroCode.textContent = code;
    for (let c = 0; c < cardCodeEls.length; c++) cardCodeEls[c].textContent = code;

    for (let p = 0; p < prices.length; p++) {
      const pr = prices[p];
      const usd = (state.webDesign && pr.webUsd != null) ? pr.webUsd : pr.baseUsd;
      countTo(pr, roundUsd(usd, code), animate);
    }

    for (let w = 0; w < weekCounters.length; w++) {
      const wc = weekCounters[w];
      countTo(wc, state.webDesign ? wc.on : wc.off, animate);
    }
    if (toggleBtn) toggleBtn.textContent = state.webDesign ? WEB_DESIGN.labelOn : toggleOff;
  }

  function countTo(pr, target, animate) {
    if (pr._raf) { cancelAnimationFrame(pr._raf); pr._raf = null; }
    const from = pr.shown;
    if (!animate || reduce || from === target) {
      pr.shown = target; pr.el.style.fontVariantNumeric = "tabular-nums";
      pr.el.textContent = groupNum(target); return;
    }
    const t0 = performance.now();
    pr.el.style.fontVariantNumeric = "tabular-nums";
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / ODO_MS);
      const e = 1 - Math.pow(1 - k, 3);
      const v = Math.round(from + (target - from) * e);
      pr.shown = v; pr.el.textContent = groupNum(v);
      if (k < 1) pr._raf = requestAnimationFrame(tick); else pr._raf = null;
    };
    pr._raf = requestAnimationFrame(tick);
  }

  // Selecting a currency: roll the prices + relabel. persist only on commit.
  function setCurrency(code, persist) {
    if (code !== state.code) { state.code = code; applyCurrency(true); }
    if (persist) {
      lsSet(LS_CURRENCY, code);
      // Skip a no-op re-confirm of the currency the wheel opened on (open→scroll→land-back→commit)
      // so an open-then-dismiss can't log a phantom currency_select. A real change still fires.
      if (code !== openCode) dlPush("currency_select", { currency_code: code });
    }
  }

  // ───────────────────────────── TRIGGER (hero code + chevron) ───────────────
  // .price_dropdown becomes: [ codeBtn (code + chevron) ][ wheel panel ].
  // " per hour" sits after .price_dropdown in the <h1> and is untouched.
  trigger.textContent = "";
  trigger.style.position = "relative";
  trigger.style.display = "inline-block";

  const codeBtn = document.createElement("span");
  codeBtn.setAttribute("role", "button");
  codeBtn.setAttribute("tabindex", "0");
  codeBtn.setAttribute("aria-haspopup", "listbox");
  codeBtn.setAttribute("aria-expanded", "false");
  codeBtn.setAttribute("aria-label", "Change currency");
  codeBtn.style.cssText = [
    "font:inherit", "color:#fff", "cursor:pointer", "display:inline-flex",
    "align-items:baseline", "gap:0.1em", "line-height:inherit", "white-space:nowrap",
    "text-decoration:underline", "text-decoration-thickness:0.5px",
    "text-underline-offset:8px", "text-decoration-color:currentColor",
    "transition:color .25s, text-decoration-color .2s"
  ].join(";");
  const heroCode = document.createElement("span");
  heroCode.textContent = (trigger.getAttribute("data-code") || "USD");
  const chev = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  chev.setAttribute("width", "0.3em");
  chev.setAttribute("viewBox", "0 0 10 6");
  chev.setAttribute("fill", "none");
  chev.style.cssText = "align-self:center;transition:transform .3s " + EASE + ";";
  chev.innerHTML = '<path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"></path>';
  codeBtn.appendChild(heroCode);
  codeBtn.appendChild(chev);
  trigger.appendChild(codeBtn);

  codeBtn.addEventListener("mouseenter", () => {
    codeBtn.style.color = HOVER; codeBtn.style.textDecorationColor = "transparent";
  });
  codeBtn.addEventListener("mouseleave", () => {
    codeBtn.style.color = open ? HOVER : "#fff";
    codeBtn.style.textDecorationColor = open ? HOVER : "currentColor";
  });

  // ───────────────────────────── WHEEL ───────────────────────────────────────
  let open = false, openCode = null;
  let pos = 0;          // float wheel position (row units), unbounded → loops
  let drag = false;
  let dragInfo = null;
  let wheelTimer = null;
  let previewTimer = null;
  let pinAnchor = 0;    // trigger.offsetLeft captured at open (the stable position)

  const mod = (v) => ((v % N) + N) % N;
  const wrapD = (d) => { d = mod(d); return d > N / 2 ? d - N : d; };

  const panel = document.createElement("span");
  panel.setAttribute("role", "listbox");
  panel.setAttribute("aria-label", "Currency");
  panel.style.cssText = [
    "position:absolute", "z-index:999", "left:50%", "top:50%", "width:3.3em",
    "border-radius:10px", "background:" + NEUTRAL_950, "border:1.5px solid " + NEUTRAL_900,
    "box-shadow:0 40px 100px rgba(0,0,0,0.65), 0 6px 24px rgba(0,0,0,0.4)",
    "padding:0.3em 0", "font:inherit", "line-height:1", "opacity:0",
    "transform:translate(-50%,-50%) scale(0.92)", "pointer-events:none",
    "visibility:hidden"
  ].join(";");

  const viewport = document.createElement("span");
  const maskGrad = "linear-gradient(180deg, transparent 2%, #000 40%, #000 60%, transparent 98%)";
  viewport.style.cssText = [
    "position:relative", "display:block", "height:" + (ROW * VISIBLE) + "px",
    "touch-action:none", "cursor:grab", "overflow:hidden",
    "-webkit-mask-image:" + maskGrad, "mask-image:" + maskGrad
  ].join(";");

  const rowEls = CURRENCIES.map(([code, name]) => {
    const r = document.createElement("span");
    r.id = "cagdas-rate-opt-" + code;
    r.setAttribute("role", "option");
    r.setAttribute("aria-label", name);
    r.textContent = code;
    r.style.cssText = [
      "position:absolute", "left:0", "right:0", "top:50%", "height:" + ROW + "px",
      "display:flex", "align-items:center", "justify-content:center",
      "font:inherit", "font-size:1em", "line-height:1",
      "user-select:none", "-webkit-user-select:none", "will-change:transform,opacity"
    ].join(";");
    viewport.appendChild(r);
    return r;
  });
  panel.appendChild(viewport);
  trigger.appendChild(panel);
  panel.id = "cagdas-rate-listbox";
  codeBtn.setAttribute("aria-controls", panel.id);

  function renderWheel() {
    const base = mod(Math.round(pos));
    codeBtn.setAttribute("aria-activedescendant", rowEls[base].id); // announce the centred option to AT
    for (let i = 0; i < N; i++) {
      const d = wrapD(i - mod(pos)), ad = Math.abs(d);
      const centered = base === i;
      const sc = Math.max(0.45, ad < 1 ? 1 - 0.38 * ad : 0.62 - 0.085 * (ad - 1));
      const r = rowEls[i];
      r.style.transform = "translateY(" + (d * ROW - ROW / 2) + "px) scale(" + sc + ")";
      r.style.opacity = String(Math.max(0, 1 - 0.26 * ad));
      r.style.color = centered ? PRIMARY : SUBTLE;
      r.style.transition = (drag || reduce)
        ? "color .15s ease"
        : "transform .45s " + EASE + ", opacity .45s ease, color .2s ease";
      r.setAttribute("aria-selected", centered ? "true" : "false");
    }
  }

  function moveTo(p, withDrag) {
    pos = p;
    if (withDrag !== undefined) drag = withDrag;
    renderWheel();
    schedulePreview();
  }
  function snap() { drag = false; moveTo(Math.round(pos)); }
  function centerOn(i) { const base = Math.round(pos); moveTo(base + wrapD(i - mod(base)), false); }

  // While resting on a code ≠ current, roll the prices to it after PREVIEW_MS.
  function schedulePreview() {
    if (previewTimer) { clearTimeout(previewTimer); previewTimer = null; }
    if (!open || drag) return;
    const code = CURRENCIES[mod(Math.round(pos))][0];
    if (code === state.code) return;
    previewTimer = setTimeout(() => setCurrency(code, false), PREVIEW_MS);
  }

  // ── Keep the open wheel stable ──────────────────────────────────────────────
  // The hero price sits before the trigger in the SAME sentence, so when a live
  // preview changes the amount's width the line reflows and the trigger — plus the
  // wheel anchored to it — slides sideways. While the wheel is open we hold the
  // trigger at the exact screen position it had when it opened: measure how far it
  // has reflowed (offsetLeft is layout-only, unaffected by our own transform) and
  // translate it back. The sentence stays tight and normal (no reserved width, no
  // gap) — only the trigger's translate changes. A MutationObserver on the hero
  // amount fires repin on every digit change (incl. each odometer frame), before
  // paint, so the dropdown never visibly moves — and it survives rAF throttling.
  function repin() {
    if (!open) return;
    const dx = trigger.offsetLeft - pinAnchor;
    trigger.style.transform = dx ? "translateX(" + (-dx) + "px)" : "";
  }
  const pinObserver = (typeof MutationObserver === "function" && heroValueEl)
    ? new MutationObserver(repin) : null;

  // A viewport resize / orientation change while open reflows the whole line
  // without firing a price mutation, so the captured anchor goes stale. Drop the
  // stale compensation and re-anchor to the new layout (kept simple — resizing
  // mid-interaction is rare and the handler is cheap).
  function onResize() {
    if (!open) return;
    trigger.style.transform = "";
    pinAnchor = trigger.offsetLeft;
  }

  function openWheel() {
    if (open) return;
    open = true;
    openCode = state.code;   // remember the currency in effect at open (M1 phantom-select guard)
    dlPush("currency_picker_open");
    trigger.style.transform = "";          // measure the untransformed position
    pinAnchor = trigger.offsetLeft;
    if (pinObserver) {
      pinObserver.observe(heroValueEl, { childList: true, characterData: true, subtree: true });
      if (heroSymbolEl) pinObserver.observe(heroSymbolEl, { attributes: true, attributeFilter: ["style"] });
    }
    pos = idxOf(state.code); drag = false;
    codeBtn.setAttribute("aria-expanded", "true");
    codeBtn.style.color = HOVER; codeBtn.style.textDecorationColor = HOVER;
    chev.style.transform = "rotate(180deg)";
    panel.style.visibility = "visible";
    panel.style.pointerEvents = "auto";
    panel.style.opacity = "1";
    panel.style.transform = "translate(-50%,-50%) scale(1)";
    panel.style.transition = reduce ? "none"
      : "opacity .28s " + EASE + ", transform .42s " + EASE;
    renderWheel();
    document.addEventListener("mousedown", onDocDown, true);
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("resize", onResize);
  }

  function closeWheel() {
    if (!open) return;
    open = false; drag = false;
    if (previewTimer) { clearTimeout(previewTimer); previewTimer = null; }
    if (wheelTimer) { clearTimeout(wheelTimer); wheelTimer = null; }
    codeBtn.setAttribute("aria-expanded", "false");
    codeBtn.removeAttribute("aria-activedescendant");
    codeBtn.style.color = "#fff"; codeBtn.style.textDecorationColor = "currentColor";
    chev.style.transform = "none";
    panel.style.opacity = "0";
    panel.style.transform = "translate(-50%,-50%) scale(0.92)";
    panel.style.pointerEvents = "none";
    panel.style.transition = reduce ? "none"
      : "opacity .18s ease, transform .22s ease, visibility 0s linear .22s";
    panel.style.visibility = "hidden";
    document.removeEventListener("mousedown", onDocDown, true);
    document.removeEventListener("keydown", onKey, true);
    window.removeEventListener("resize", onResize);
    if (pinObserver) pinObserver.disconnect();
    trigger.style.transform = "";          // un-pin → sentence flows naturally again
  }

  function commitCentered() { setCurrency(CURRENCIES[mod(Math.round(pos))][0], true); }
  function closeAndCommit() { commitCentered(); closeWheel(); }

  codeBtn.addEventListener("click", (e) => { e.preventDefault(); open ? closeAndCommit() : openWheel(); });
  codeBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") { e.preventDefault(); openWheel(); }
  });

  function onDocDown(e) { if (!trigger.contains(e.target)) closeAndCommit(); }
  function onKey(e) {
    if (!open) return;
    if (e.key === "Escape" || e.key === "Enter") { e.preventDefault(); closeAndCommit(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); moveTo(Math.round(pos) + 1, false); }
    else if (e.key === "ArrowUp") { e.preventDefault(); moveTo(Math.round(pos) - 1, false); }
  }

  // Swipe / drag (pointer events on the viewport).
  viewport.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    try { viewport.setPointerCapture(e.pointerId); } catch (err) {}
    dragInfo = { y: e.clientY, p: pos, moved: false };
    drag = true; viewport.style.cursor = "grabbing";
  });
  viewport.addEventListener("pointermove", (e) => {
    if (!dragInfo) return;
    const dy = e.clientY - dragInfo.y;
    if (Math.abs(dy) > 4) dragInfo.moved = true;
    moveTo(dragInfo.p - dy / ROW, true);
  });
  viewport.addEventListener("pointerup", (e) => {
    const d = dragInfo; dragInfo = null; viewport.style.cursor = "grab";
    if (d && !d.moved) {
      // pointer capture retargets pointerup at the viewport → resolve tapped row by geometry
      const rect = viewport.getBoundingClientRect();
      const off = Math.round((e.clientY - (rect.top + rect.height / 2)) / ROW);
      const i = mod(Math.round(pos) + off);
      if (off === 0) { drag = false; closeAndCommit(); } else centerOn(i);
      return;
    }
    snap();
  });
  viewport.addEventListener("pointercancel", () => { dragInfo = null; viewport.style.cursor = "grab"; snap(); });

  // Trackpad / mouse-wheel spins it (passive:false so we can preventDefault).
  viewport.addEventListener("wheel", (e) => {
    if (!open) return;
    e.preventDefault();
    moveTo(pos + e.deltaY / 90, true);
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(snap, 130);
  }, { passive: false });

  // ───────────────────────────── WEB-DESIGN TOGGLE ───────────────────────────
  if (toggleBtn) {
    toggleBtn.setAttribute("aria-pressed", "false");
    toggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      state.webDesign = !state.webDesign;
      toggleBtn.setAttribute("aria-pressed", state.webDesign ? "true" : "false");
      applyCurrency(true);
      dlPush("web_design_toggle", { web_design_included: state.webDesign });
    });
  }

  // ───────────────────────────── RATES: cache → paint → fetch ────────────────
  (function seedFromCache() {
    const raw = lsGet(LS_CACHE);
    if (!raw) return;
    try {
      const c = JSON.parse(raw);
      if (c && c.rates && typeof c.savedAt === "number" &&
          (nowMs() - c.savedAt) < CACHE_MAX_AGE_MS && Object.keys(c.rates).length > 1) {
        state.rates = cloneRates(c.rates, FALLBACK);
      }
    } catch (e) {}
  })();

  const savedCode = lsGet(LS_CURRENCY);
  if (savedCode && idxOf(savedCode) >= 0 && CURRENCIES.some(([c]) => c === savedCode)) {
    state.code = savedCode;
  }

  applyCurrency(false); // first paint, no animation
  fetchRates();

  function fetchRates() {
    if (typeof window.fetch !== "function") return;
    const ctrl = (typeof AbortController === "function") ? new AbortController() : null;
    const timer = window.setTimeout(() => { if (ctrl) ctrl.abort(); }, FETCH_TIMEOUT_MS);
    const opts = { cache: "default", mode: "cors" };
    if (ctrl) opts.signal = ctrl.signal;
    window.fetch(RATES_URL, opts)
      .then((res) => (res && res.ok ? res.json() : null))
      .then((data) => {
        window.clearTimeout(timer);
        if (!data || !data.rates || typeof data.rates !== "object" ||
            !Object.keys(data.rates).length) return;
        state.rates = cloneRates(data.rates, FALLBACK);
        lsSet(LS_CACHE, JSON.stringify({ rates: data.rates, updated: data.updated || null, savedAt: nowMs() }));
        applyCurrency(false); // refresh prices to live rates without a jarring count
      })
      .catch(() => { window.clearTimeout(timer); });
  }
})();
