/*!
 * home.js — "living blob" avatar animation for cagd.as
 *
 * Applies the finalized "cell under a microscope" effect to every .avatar-home
 * on the page: the IMAGE never moves — only its membrane (border-radius)
 * breathes, driven by 8 per-corner sine oscillators, with a Webflow-blue glow
 * edge (box-shadow). The element keeps its own size / object-fit / layout (set
 * in Webflow); this only animates border-radius and sets the glow + a
 * will-change hint. No <style> injection, no dependencies — all dynamic inline
 * styles, so nothing leaks to the page.
 *
 * Finalized look (per the design): liveliness 1.3, squish 14, glow edge
 * (#126ef5 = rgba(18,110,245,0.5)). Honors prefers-reduced-motion (static
 * membrane, no rAF loop).
 *
 * Design source: Claude Design "cagd.as Design System" -> project/Avatar Home.html
 *
 * Webflow usage: give the avatar <img> the class  avatar-home  (the image's own
 *   size / object-fit / box stay under your control), then load this bundle in
 *   the footer / before </body>, or with defer:
 *     <script src="https://files.cagd.as/scripts/home.min.js" defer></script>
 *
 * SSOT: sites/cagdas/scripts/src/home.js
 * Build: python3 scripts/site_deploy.py build --site cagdas --src home
 */
(function () {
  'use strict';

  if (window.__cagdasHomeAvatar) return; // guard against double-load
  window.__cagdasHomeAvatar = true;

  const TARGET = '.avatar-home';
  const LIVELINESS = 1.3;   // pulse rate — the design's finalized look (its lab default was 1.8; raise for livelier)
  const SQUISH = 14;        // how much the membrane deforms (%)
  const GLOW = 'inset 0 0 0 1px rgba(255,255,255,0.2), 0 0 18px 3px rgba(18,110,245,0.5)';
  // Distinct per-corner freqs + phases so the membrane never settles into an
  // obvious repeat (organic, cell-like).
  const FREQ = [1.00, 1.27, 0.83, 1.11, 0.92, 1.19, 1.04, 0.88];
  const PHASE = [0.0, 0.8, 1.9, 2.7, 3.6, 4.4, 5.2, 6.0];

  function radiusAt(time) {
    const r = [];
    for (let i = 0; i < 8; i++) r.push((50 + SQUISH * Math.sin(time * FREQ[i] + PHASE[i])).toFixed(2));
    return r[0] + '% ' + r[1] + '% ' + r[2] + '% ' + r[3] + '% / ' +
           r[4] + '% ' + r[5] + '% ' + r[6] + '% ' + r[7] + '%';
  }

  function init() {
    const els = document.querySelectorAll(TARGET);
    if (!els.length) return;

    // The glow + perf hint are constant — set them once.
    for (let i = 0; i < els.length; i++) {
      els[i].style.boxShadow = GLOW;
      els[i].style.willChange = 'border-radius';
    }

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      const radius = radiusAt(0); // static membrane shape, no motion
      for (let i = 0; i < els.length; i++) els[i].style.borderRadius = radius;
      return;
    }

    const start = performance.now();
    (function tick(now) {
      const radius = radiusAt(((now - start) / 1000) * LIVELINESS);
      for (let i = 0; i < els.length; i++) els[i].style.borderRadius = radius;
      requestAnimationFrame(tick);
    })(performance.now());
  }

  // Loaded with `defer` or in the footer, so the DOM is already parsed.
  init();
})();
