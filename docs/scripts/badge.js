/*!
 * badge.js — "Webflow Certified Partner" badge for cagd.as
 *
 * Injects a vertical corner badge into every .webflow_badge on the page:
 *   - "Certified Partner" set vertically (reads bottom-to-top) in WF Visual
 *     Sans — one SVG <text> run per word so the font's true kerning applies.
 *     The <g> is rotated -90deg at author time (baked into the SVG), so the
 *     badge is authored natively vertical rather than CSS-rotated.
 *   - A living Webflow-blue (#146EF5) seal whose inner glyph morphs between a
 *     filled checkmark and the Webflow "W" on a slow loop.
 *   - On hover: the label crossfades to "Verify on Webflow" and the seal
 *     resolves to the "W". This script renders NO link — wire the URL on the
 *     Webflow element itself (e.g. make .webflow_badge a Link Block).
 *   - Respects prefers-reduced-motion (renders the check statically, no loop).
 *
 * Self-contained — NO runtime dependencies. It injects its own scoped <style>
 *   (including the @font-face) and HTML, and does its own shape-morph (a small
 *   ring aligner + lerp, replacing the flubber dependency the prototype used).
 *   Injecting the badge's own CSS from JS is an intentional, scoped exception
 *   to the project's "never inject <style> from JS" rule, requested for this
 *   widget so it ships as a single drop-in file. NO page/site CSS is included.
 *
 * Design source: Claude Design "cagd.as Design System" -> project/Badge.html
 *
 * Webflow usage:
 *   1. Add an element with class  webflow_badge  where the badge should sit
 *      (e.g. a fixed/absolute corner wrapper, or a Link Block if it links out).
 *      The badge renders at 68x190 and centers inside it. The link is set on
 *      the Webflow element — this script does not add one.
 *   2. Load this bundle in the footer / before </body>, or with defer:
 *        <script src="https://files.cagd.as/scripts/badge.min.js" defer></script>
 *
 * SSOT: sites/cagdas/scripts/src/badge.js
 * Build: python3 scripts/site_deploy.py build --site cagdas --src badge
 */
(function () {
  'use strict';

  if (window.__cagdasWebflowBadge) return; // guard against double-load
  window.__cagdasWebflowBadge = true;

  const TARGET = '.webflow_badge';
  const STYLE_ID = 'cagdas-webflow-badge-styles';
  const FROM_LABEL = 'Certified Partner';
  const TO_LABEL = 'Verify on Webflow';
  const RING = 140;        // sample points per glyph (morph smoothness)
  const CYCLE = 9200;      // ms for one check -> W -> check loop

  // --- glyph path data (verbatim from Badge.html) -------------------------
  const CB_SEAL = "M1736 3129 c6 -10 -37 -40 -48 -33 -4 3 -6 -1 -3 -8 3 -7 -15 -33 -40 -57 -25 -24 -45 -47 -45 -52 0 -5 -7 -9 -15 -9 -8 0 -15 -5 -15 -11 0 -6 -7 -9 -15 -5 -8 3 -14 0 -12 -7 1 -7 -4 -11 -11 -9 -8 1 -11 -2 -8 -6 3 -5 -2 -19 -12 -30 -16 -19 -30 -20 -195 -21 -98 0 -182 -3 -188 -6 -5 -4 -9 -82 -9 -181 0 -168 -8 -223 -31 -209 -5 4 -9 1 -9 -5 0 -6 -4 -8 -10 -5 -6 4 -7 -1 -3 -11 5 -14 3 -16 -11 -11 -10 4 -15 3 -11 -3 8 -12 -96 -121 -107 -113 -5 2 -7 -1 -6 -9 2 -7 -5 -12 -14 -12 -11 1 -14 -4 -10 -14 4 -11 1 -14 -11 -9 -11 4 -14 2 -10 -8 3 -8 -2 -17 -10 -21 -27 -10 7 -104 38 -104 6 0 20 -9 30 -20 10 -11 15 -20 10 -20 -4 0 -2 -7 5 -15 7 -8 16 -13 20 -10 8 5 61 -51 54 -58 -6 -6 64 -67 76 -67 6 0 10 -74 10 -189 l0 -188 31 -7 c17 -3 105 -6 195 -6 94 0 164 -4 164 -9 0 -15 51 -72 60 -66 4 3 13 -2 20 -10 7 -8 9 -15 5 -15 -4 0 -2 -7 5 -15 7 -8 16 -12 21 -9 5 3 13 -5 18 -18 10 -26 75 -90 106 -105 22 -11 85 9 85 26 0 13 50 71 58 68 4 -1 8 3 10 8 7 20 35 44 45 38 6 -3 7 -1 3 5 -4 7 -1 12 9 12 9 0 14 3 11 8 -7 11 16 36 47 49 15 7 27 17 27 23 0 6 64 10 180 10 136 0 182 3 185 13 3 6 6 93 7 192 2 129 6 180 15 180 12 0 28 13 28 23 0 11 58 72 63 67 10 -10 31 17 25 32 -4 11 -2 14 5 9 6 -3 16 3 22 14 6 11 15 18 21 15 5 -4 9 1 9 9 0 9 3 15 8 14 4 -1 21 12 39 30 17 17 26 32 20 32 -8 0 -7 4 1 12 18 18 15 36 -8 43 -11 3 -20 12 -20 19 0 7 -12 22 -26 32 -15 10 -30 24 -35 29 -42 50 -67 73 -81 78 -10 4 -18 13 -18 22 0 8 -6 15 -13 15 -7 0 -21 15 -32 33 -17 28 -20 56 -23 208 l-4 177 -64 7 c-35 4 -109 3 -164 -1 -86 -6 -107 -4 -140 11 -22 10 -40 23 -40 30 0 7 -12 21 -26 31 -15 10 -32 25 -38 32 -39 46 -66 71 -85 82 -13 6 -20 14 -17 17 12 13 -37 47 -69 48 -19 1 -32 -2 -29 -6z";
  const CB_CHECK = "M1940 2430 c0 -5 -6 -9 -12 -7 -7 1 -12 -6 -12 -15 1 -10 -2 -18 -7 -18 -18 0 -160 -150 -153 -162 4 -7 3 -8 -4 -4 -7 4 -12 3 -12 -3 0 -6 -12 -14 -26 -17 -19 -5 -22 -9 -12 -15 7 -5 8 -9 2 -9 -5 0 -23 14 -39 30 -16 17 -25 30 -20 30 5 0 0 6 -10 14 -11 8 -23 12 -26 10 -4 -2 -6 4 -5 13 2 25 -30 27 -53 4 -12 -12 -25 -21 -31 -21 -5 0 -10 -5 -10 -11 0 -5 -4 -8 -8 -5 -4 2 -8 -5 -7 -17 0 -14 31 -54 83 -107 45 -47 90 -93 99 -102 18 -20 33 -23 33 -8 0 6 6 10 14 10 18 0 35 21 39 51 2 13 10 24 18 25 33 2 38 5 44 24 3 11 12 20 18 20 14 0 65 53 83 87 7 13 8 26 3 32 -6 8 -5 8 3 1 7 -5 15 -10 19 -10 15 0 89 77 89 92 0 26 -11 48 -21 42 -5 -3 -9 0 -9 6 0 14 -40 49 -57 50 -7 0 -13 -4 -13 -10z";
  const CB_W = "M1080 0L735.385 673.684H411.695L555.915 394.481H549.444C430.463 548.934 252.941 650.61 -0.000976562 673.684V398.344C-0.000976562 398.344 161.812 388.787 256.938 288.776H-0.000976562V0.0053214H288.77V237.515L295.252 237.489L413.254 0.0053214H631.644V236.009L638.125 235.999L760.555 0H1080Z";
  const G = "translate(0,450) scale(0.1,-0.1)";
  const SVGNS = 'http://www.w3.org/2000/svg';

  // --- scoped CSS (badge only; namespaced; nothing leaks to the page) -----
  const CSS = [
    "@font-face{font-family:'WF Visual Sans';src:url('https://dhygzobemt712.cloudfront.net/Fonts/VF/WFVisualSansVF.woff2') format('woff2');font-weight:100 900;font-style:normal;font-display:swap}",
    ".webflow_badge{--wfb-hover:#8f8f8f}",
    ".webflow_badge .wfb-corner{display:flex;align-items:center;justify-content:center;width:68px;height:190px;margin:0 auto}",
    ".webflow_badge .wfb-vlockup{display:flex;flex-direction:column;align-items:center;gap:9px}",
    ".webflow_badge .wfb-vsvg{display:block;overflow:visible}",
    ".webflow_badge .wfb-vword{font-family:'WF Visual Sans',\"Sohne\",\"Helvetica Neue\",Arial,sans-serif;font-weight:600;font-size:16px;letter-spacing:-0.1px;transform-box:fill-box;transition:opacity .4s ease,transform .55s cubic-bezier(.22,.9,.24,1)}",
    ".webflow_badge .wfb-vword.wfb-from{fill:#fff;opacity:1;transform:translateX(0)}",
    ".webflow_badge .wfb-vword.wfb-to{fill:var(--wfb-hover);opacity:0;transform:translateX(-7px)}",
    ".webflow_badge .wfb-corner:hover .wfb-vword.wfb-from{opacity:0;transform:translateX(7px)}",
    ".webflow_badge .wfb-corner:hover .wfb-vword.wfb-to{opacity:1;transform:translateX(0)}",
    ".webflow_badge .wfb-seal{position:relative;flex:none;display:inline-block;width:30px;height:30px}",
    ".webflow_badge .wfb-seal-bg{position:absolute;inset:0;width:100%;height:100%;display:block}",
    ".webflow_badge .wfb-glyphs{position:absolute;inset:0;display:grid;place-items:center}",
    ".webflow_badge .wfb-tween{display:block}"
  ].join("\n");

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    (document.head || document.documentElement).appendChild(style);
  }

  // --- vertical label SVG: one <text> run per word (true font kerning) ----
  // The <g> is rotated -90deg here (authored vertical), not on the container.
  function buildLabelSVG() {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.font = '600 16px "WF Visual Sans", "Sohne", "Helvetica Neue", Arial, sans-serif';
    try { ctx.letterSpacing = '-0.1px'; } catch (e) {}
    const esc = function (s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
    const track = Math.ceil(Math.max(ctx.measureText(FROM_LABEL).width, ctx.measureText(TO_LABEL).width)) + 2;
    const W = 20;
    const baseX = 14.5;
    return '<svg class="wfb-vsvg" width="' + W + '" height="' + track + '" viewBox="0 0 ' + W + ' ' + track + '" aria-hidden="true">' +
      '<g transform="translate(' + baseX + ',' + track + ') rotate(-90)">' +
        '<text class="wfb-vword wfb-from" x="0" y="0" text-anchor="start">' + esc(FROM_LABEL) + '</text>' +
        '<text class="wfb-vword wfb-to" x="0" y="0" text-anchor="start">' + esc(TO_LABEL) + '</text>' +
      '</g>' +
    '</svg>';
  }

  function sealHTML() {
    const bg = '<svg class="wfb-seal-bg" viewBox="86.7 136.5 181.2 180.5" xmlns="' + SVGNS + '">' +
      '<g transform="' + G + '"><path d="' + CB_SEAL + '" fill="#146EF5"/></g></svg>';
    const inner = '<div class="wfb-glyphs"><svg class="wfb-tween" width="16.2" height="16.2" viewBox="0 0 100 100" xmlns="' + SVGNS + '"><path fill="#fff"></path></svg></div>';
    return '<span class="wfb-seal">' + bg + inner + '</span>';
  }

  // --- sample a glyph path into RING evenly-spaced points in a 100x100 box -
  function sampleRing(d, flipY) {
    const svg = document.createElementNS(SVGNS, 'svg');
    svg.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:10px;height:10px;';
    const p = document.createElementNS(SVGNS, 'path');
    p.setAttribute('d', d);
    svg.appendChild(p);
    document.body.appendChild(svg);
    const bb = p.getBBox(), total = p.getTotalLength();
    const scale = 80 / Math.max(bb.width, bb.height);
    const ox = (100 - bb.width * scale) / 2, oy = (100 - bb.height * scale) / 2;
    const pts = [];
    for (let i = 0; i < RING; i++) {
      const pt = p.getPointAtLength(total * i / RING);
      const x = (pt.x - bb.x) * scale + ox;
      let y = (pt.y - bb.y) * scale + oy;
      if (flipY) y = 100 - y;
      pts.push([x, y]);
    }
    document.body.removeChild(svg);
    return pts;
  }

  // --- align `to` ring against `from` (best rotation + winding), so the
  //     point-by-point lerp morphs cleanly. Replaces flubber.interpolate
  //     for this equal-length two-ring case.
  function makeMorph(from, to) {
    const N = from.length;
    const rev = to.slice().reverse();
    const seqs = [to, rev];
    let best = null;
    for (let s = 0; s < seqs.length; s++) {
      const seq = seqs[s];
      for (let k = 0; k < N; k++) {
        let d = 0;
        for (let i = 0; i < N; i++) {
          const q = seq[(i + k) % N];
          const dx = from[i][0] - q[0], dy = from[i][1] - q[1];
          d += dx * dx + dy * dy;
          if (best && d > best.d) break; // prune
        }
        if (!best || d < best.d) best = { d: d, seq: seq, k: k };
      }
    }
    const aligned = new Array(N);
    for (let j = 0; j < N; j++) aligned[j] = best.seq[(j + best.k) % N];
    return function (t) {
      let out = '';
      for (let m = 0; m < N; m++) {
        const f = from[m], a = aligned[m];
        out += (m ? 'L' : 'M') + (f[0] + (a[0] - f[0]) * t).toFixed(2) + ' ' + (f[1] + (a[1] - f[1]) * t).toFixed(2);
      }
      return out + 'Z';
    };
  }

  // --- drive one seal's check<->W morph (auto loop + ease-to-W on hover) --
  function runSeal(pathEl, isHover) {
    const morph = makeMorph(sampleRing(CB_CHECK, true), sampleRing(CB_W, false));
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      pathEl.setAttribute('d', morph(0)); // static check
      return;
    }
    const ease = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
    const start = performance.now();
    let cur = 0;
    (function frame(now) {
      const p = ((now - start) % CYCLE) / CYCLE;
      let k;
      if (p < 0.26) k = 0;
      else if (p < 0.48) k = ease((p - 0.26) / 0.22);
      else if (p < 0.74) k = 1;
      else if (p < 0.96) k = 1 - ease((p - 0.74) / 0.22);
      else k = 0;
      const goal = isHover() ? 1 : k;
      cur += (goal - cur) * 0.10;
      pathEl.setAttribute('d', morph(cur));
      requestAnimationFrame(frame);
    })(performance.now());
  }

  function setup(host) {
    if (host.getAttribute('data-wfb-init') === '1') return;
    host.setAttribute('data-wfb-init', '1');

    // No link here — the badge is just the visual. Wrap .webflow_badge in a
    // Webflow link (or add the URL to it) to make it clickable.
    host.innerHTML =
      '<span class="wfb-corner">' +
        '<span class="wfb-vlockup">' + buildLabelSVG() + sealHTML() + '</span>' +
      '</span>';

    const corner = host.querySelector('.wfb-corner');
    let hover = false;
    corner.addEventListener('pointerenter', function () { hover = true; });
    corner.addEventListener('pointerleave', function () { hover = false; });

    const seal = host.querySelector('.wfb-tween path');
    if (seal) runSeal(seal, function () { return hover; });

    // Re-render only the text once the webfont loads, so kerning is exact —
    // without disturbing the running seal animation (separate SVG nodes).
    if (document.fonts && document.fonts.load) {
      document.fonts.load('600 16px "WF Visual Sans"').then(function () {
        const old = host.querySelector('.wfb-vsvg');
        if (old) old.outerHTML = buildLabelSVG();
      }).catch(function () {});
    }
  }

  function init() {
    injectStyles();
    const hosts = document.querySelectorAll(TARGET);
    for (let i = 0; i < hosts.length; i++) setup(hosts[i]);
  }

  // Loaded with `defer` or in the footer, so the DOM is already parsed.
  init();
})();
