/*!
 * home.js — scroll-driven editorial hero for cagd.as (homepage)
 *
 * Drives the EXISTING Webflow homepage hero (header.section_hero, .is-home). It
 * injects a faint big B&W portrait + a soft Webflow-indigo (#126ef5) aurora
 * (centred) behind the text, PINS the hero so the whole animation plays out "in
 * the first 100vh" before the next section appears, then runs a scroll-linked
 * choreography. The text stays the hero; the face lives on the background.
 *
 * Pin (GSAP ScrollTrigger):
 *   - The hero is pinned in the viewport for PIN_VIEWPORTS×100vh of scroll, so
 *     you still SEE the first 100vh while the animation runs — the section below
 *     only appears once it completes. The pin distance == the animation distance,
 *     so the section slides up exactly as the photo finishes hiding: no whitespace.
 *   - GSAP pins the hero AT its current position, so the hero's margin-top:-7rem
 *     can't cause the shift a hand-rolled position:sticky pin had.
 *   - Into the hero (behind the text, lifted via z-index — content not
 *     restructured): the centred indigo aurora + the portrait.
 *
 * Scroll choreography (progress p, GSAP scrub):
 *   - portrait gets LESS DARK almost immediately, then hides GRADUALLY, finishing
 *     exactly at the pin end (p≈1).
 *   - the indigo glow blooms with the brighten, then clears with the hide.
 *   - the hero text drifts UP and fades — "moves to the top and disappears" —
 *     and the Webflow badge fades out early (lockstep) so it reads as a fade.
 *
 * Entrance: the background fades in smoothly (~850ms) once the photo decodes.
 * The hero TEXT shows instantly (no on-load animation, per the brief).
 *
 * Responsive to Webflow breakpoints (992/768/480); reduced-motion-safe (no pin,
 * static faint 100vh hero). If GSAP can't load it falls back to a plain
 * scroll-driven (non-pinned) run. The clock (.time_*) + availability dot
 * (.icon_available) are owned by available-widget.js — not touched here.
 *
 * Deps: GSAP + ScrollTrigger (lazy-injected from cdnjs only on the homepage).
 * ZERO <style> injection (WAAPI + inline styles). Badge sync: sets
 * window.__cagdasHeroFadesBadge so badge.js yields its own scroll-fade.
 *
 * SSOT: sites/cagdas/scripts/src/home.js
 * Build: python3 scripts/site_deploy.py build --site cagdas --src home
 */
(function () {
  'use strict';

  if (window.__cagdasHomeHero) return; // guard against double-load
  window.__cagdasHomeHero = true;

  const PHOTO_SRC = 'https://cdn.prod.website-files.com/69db63dc2e8675a7ac610755/6a2ef57e3f9feeabc21c4f1f_47035e26c90d647761dcb2cc2f53df5b_cagdasunal-transparent.png';
  // Glow target (on scroll): a deep indigo-violet with R≈G so it reads true blue
  // even when dim/screen-blended — #126ef5's green channel (110) makes a dim blue
  // read teal, and the gray→blue interpolation would pass through green.
  const GLOW_RGB = [72, 66, 248];
  const GLOW_REST = [58, 58, 58];    // very dark NEUTRAL gray (at rest) — true grey, no green cast
  // Transparent cutout, anchored to the CENTRE-BOTTOM of the hero and sized by
  // height (the chest-cut edge sits at the viewport bottom, hidden at the fold;
  // no vignette mask — the alpha edges are clean). It stays STILL when idle (no
  // "living push-in") — only opacity animates, and only while you scroll.
  const PHOTO_AR = '1984 / 2114';                 // the cutout's intrinsic aspect
  const PHOTO_H = 'min(82vh, 90vw, 920px)';       // a bit bigger; capped by width so it fits on mobile
  // Head-centering: the head sits at x≈0.554 in this cutout → shift the box left
  // ~5% (translateX -55% vs -50%) so the head lands centred with the nav.
  const PHOTO_TX = '-55%';
  const PIN_VIEWPORTS = 0.8;     // how far (× viewport) the hero stays PINNED while the animation plays
  const LERP = 0.16;             // scrub smoothing for the no-GSAP fallback
  const TEXT_DRIFT_PX = 150;     // px the hero text drifts up across the pin

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function smoothstep(v) { const x = clamp(v); return x * x * (3 - 2 * x); }
  function lerp(a, b, t) { return Math.round(a + (b - a) * t); }
  // Radial-gradient for a glow blob in the given "r,g,b" colour. `big` = glowA's
  // wider/softer falloff; otherwise glowB's tighter core.
  function glowGrad(rgb, big) {
    return big
      ? 'radial-gradient(closest-side, rgba(' + rgb + ',0.34), rgba(' + rgb + ',0.12) 48%, rgba(' + rgb + ',0) 76%)'
      : 'radial-gradient(closest-side, rgba(' + rgb + ',0.26), rgba(' + rgb + ',0) 70%)';
  }

  function init() {
    const hero = document.querySelector('header.section_hero:not(.is-secondary)');
    if (!hero || !hero.querySelector('.is-home')) return; // homepage hero only
    const textcol = hero.querySelector('.header_content') || hero.querySelector('.header-wrapper');
    const content = hero.querySelector('.padding-global');
    if (!textcol || !content) return;
    if (hero.querySelector('.cagdas-hero-bg')) return; // already initialised

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Declared BEFORE the reduced-motion early return — apply(0) runs in that
    // branch and reads all of these, so they must be initialised (not in their
    // temporal dead zone) by the time it's called.
    let bp = { photoScale: 1.0, glowMul: 1.0 };  // responsive sizing (computeBp overwrites)
    let badgeHosts = null;
    let lastGlowRgb = '';
    let pinned = false;                          // true once GSAP pins the hero (badge is held fixed only then)

    // ---- Background layers (glow behind, portrait in front). ----
    const bg = document.createElement('div');
    bg.className = 'cagdas-hero-bg';
    bg.setAttribute('aria-hidden', 'true');
    bg.style.cssText = 'position:absolute;inset:0;overflow:hidden;z-index:0;pointer-events:none;opacity:0';

    const glow = document.createElement('div');
    glow.style.cssText = 'position:absolute;inset:0;z-index:0;opacity:0.204;transform-origin:50% 50%;will-change:opacity';
    // Both blobs centred (V + H) so the aurora's bright centre sits at the middle
    // of the hero; the drift animations just sway them gently around that centre.
    const glowA = document.createElement('div');
    glowA.style.cssText = 'position:absolute;top:10%;left:10%;width:80%;height:80%;mix-blend-mode:screen;filter:blur(54px)';
    const glowB = document.createElement('div');
    glowB.style.cssText = 'position:absolute;top:25%;left:25%;width:50%;height:50%;mix-blend-mode:screen;filter:blur(62px)';
    glow.appendChild(glowA);
    glow.appendChild(glowB);

    const photo = document.createElement('div');
    photo.style.cssText = 'position:absolute;left:50%;bottom:0;z-index:1;height:' + PHOTO_H + ';aspect-ratio:' + PHOTO_AR + ';width:auto;opacity:0.4;' +
      'transform:translate(' + PHOTO_TX + ',0) scale(1);transform-origin:50% 100%;will-change:opacity,transform';
    const living = document.createElement('div');
    living.style.cssText = 'position:absolute;inset:0;transform-origin:50% 50%';
    const img = document.createElement('img');
    img.src = PHOTO_SRC;
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:50% 100%;' +
      'filter:grayscale(1) contrast(1.05) brightness(0.92);display:block';
    living.appendChild(img);
    photo.appendChild(living);
    bg.appendChild(glow);
    bg.appendChild(photo);

    content.style.position = 'relative';
    content.style.zIndex = '2';

    // ---- Reduced motion: no pin, static faint 100vh hero, badge untouched. ----
    if (reduce) {
      hero.appendChild(bg);
      bg.style.opacity = '1';
      apply(0);
      return;
    }

    // ---- Parallax background (NOT pinned): the photo is a bottom-anchored layer
    //      inside the natural-height (100vh) hero — so the whole image is visible
    //      at rest and the next section follows immediately (no whitespace gap).
    //      On scroll the hero scrolls away normally while the photo LAGS behind
    //      (parallax) and fades. No sticky/track, so no margin-induced shift. ----
    hero.appendChild(bg);

    window.__cagdasHeroFadesBadge = true; // badge.js yields its scroll-fade to us

    // ---- Responsive sizing keyed to Webflow breakpoints (992 / 768 / 480). ----
    function computeBp() {
      const w = window.innerWidth;
      // photoScale ≤1 so `contain` shows the WHOLE photo (no edge crop); the
      // glow still steps down on smaller screens.
      if (w >= 992)      bp = { photoScale: 1.0,  glowMul: 1.0 };
      else if (w >= 768) bp = { photoScale: 1.0,  glowMul: 0.9 };
      else if (w >= 480) bp = { photoScale: 0.96, glowMul: 0.8 };
      else               bp = { photoScale: 0.92, glowMul: 0.68 };
      glow.style.transform = 'scale(' + (1.25 * bp.glowMul) + ')';
    }
    computeBp();

    // ---- Badge: moves with .header_content — same time, same speed. While the
    //      hero is pinned the badge is HELD in the viewport (position:fixed) and
    //      drifts up by the SAME amount as the text (via margin-top, so its own
    //      centring transform is untouched + it works at every breakpoint) and
    //      fades on the SAME curve. pointer-events:none once invisible so it can't
    //      block clicks. Reverts to badge.js's own placement at the very top. ----
    function driveBadge(p, driftY, textFade) {
      if (badgeHosts === null) {
        const n = document.querySelectorAll('.webflow_badge');
        if (!n.length) return;
        badgeHosts = n;
      }
      // Active only across the actual choreography (p<0.999) — once it's complete
      // the badge is invisible anyway, so let it fall back to badge.js's own
      // placement rather than staying frozen position:fixed below the hero.
      const active = p > 0.002 && p < 0.999;
      for (let i = 0; i < badgeHosts.length; i++) {
        const h = badgeHosts[i];
        if (active) {
          // Hold fixed only when GSAP actually pins the hero; in the non-pinned
          // fallback leave position alone so the badge scrolls with the page.
          h.style.position = pinned ? 'fixed' : '';
          h.style.transition = 'none';
          h.style.marginTop = driftY + 'px';
          h.style.opacity = String(1 - textFade);
          h.style.pointerEvents = (1 - textFade) < 0.05 ? 'none' : '';
        } else {
          h.style.position = '';
          h.style.transition = '';
          h.style.marginTop = '';
          h.style.opacity = '';
          h.style.pointerEvents = '';
        }
      }
    }

    // ---- Scroll choreography over the pin progress p (0→1). The hero is PINNED
    //      in the viewport for the whole of p, so the entire animation plays out
    //      "in the first 100vh" before the next section appears. Everything
    //      finishes by p≈1 — the photo hides exactly as the pin releases and the
    //      next section slides up, so there's no empty whitespace handoff. ----
    function apply(p) {
      // The image gets LESS DARK across the pin and STAYS visible — it disappears
      // by scrolling away with the hero once the pin releases, so the scroll-away
      // is never an empty black gap: the portrait is on screen right up until the
      // next section slides into its place.
      const lessdark = smoothstep(clamp(p / 0.5));
      photo.style.opacity = String(0.4 + 0.42 * lessdark);       // 0.40 → 0.82, brightens
      photo.style.transform = 'translate(' + PHOTO_TX + ',0) scale(' + bp.photoScale + ')';
      // Glow COLOUR: true dark GRAY at rest → indigo as you scroll. A near-black
      // grey can't bleed through the faint portrait as a colour wash on the face;
      // it warms to #126ef5 and blooms as the image brightens.
      const warm = smoothstep(clamp(p / 0.7));
      // Quantise the colour to ~14 steps so we only rewrite the blurred blobs'
      // background a handful of times across the ramp (a blurred + screen-blended
      // layer is the most expensive thing to repaint) — opacity stays continuous.
      const wq = Math.round(warm * 14) / 14;
      const rgbStr = lerp(GLOW_REST[0], GLOW_RGB[0], wq) + ',' + lerp(GLOW_REST[1], GLOW_RGB[1], wq) + ',' + lerp(GLOW_REST[2], GLOW_RGB[2], wq);
      if (rgbStr !== lastGlowRgb) {            // only repaint the (blurred) blobs when the quantised colour changes
        lastGlowRgb = rgbStr;
        glowA.style.background = glowGrad(rgbStr, true);
        glowB.style.background = glowGrad(rgbStr, false);
      }
      glow.style.opacity = String(clamp(0.36 + 0.3 * warm));
      // Text + badge drift up and fade TOGETHER — same time, same speed.
      const driftY = -smoothstep(clamp(p / 0.85)) * TEXT_DRIFT_PX;
      const textFade = smoothstep(clamp((p - 0.12) / 0.6));      // gone by ~0.72
      textcol.style.transform = 'translateY(' + driftY + 'px)';
      textcol.style.opacity = String(1 - textFade);
      driveBadge(p, driftY, textFade);
    }

    // Looping idle motion — Web Animations API (no <style> injection).
    function loop(el, frames, dur, opts) {
      if (!el.animate) return;
      const o = { duration: dur, iterations: Infinity, easing: 'ease-in-out' };
      if (opts) for (const k in opts) o[k] = opts[k];
      try { el.animate(frames, o); } catch (e) {}
    }
    // (no idle "living push-in" on the portrait — it stays still until you scroll)
    // Gentle scale-only "breathing" (transform-origin centre) so the aurora STAYS
    // centred — no translate/rotate drift that would push it off-centre.
    loop(glowA,
      [{ transform: 'scale(1)' }, { transform: 'scale(1.07)' }, { transform: 'scale(1)' }], 11000);
    loop(glowB,
      [{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], 14000);

    // ---- Entrance: when you first land, the portrait + glow FADE IN smoothly
    //      (~1100ms) and the portrait gently rises + settles (one-shot, doesn't
    //      touch apply()'s transform on `photo`). Fires once the photo decodes. ----
    (function revealBg() {
      function show() {
        bg.style.transition = 'opacity 1100ms cubic-bezier(0.22,1,0.36,1)';
        requestAnimationFrame(function () { bg.style.opacity = '1'; });
        loop(living,
          [{ transform: 'translateY(18px) scale(1.045)' }, { transform: 'translateY(0) scale(1)' }],
          1300, { iterations: 1, fill: 'forwards', easing: 'cubic-bezier(0.22,1,0.36,1)' });
        bg.addEventListener('transitionend', function te(ev) {
          if (ev.propertyName !== 'opacity') return;
          bg.removeEventListener('transitionend', te);
          bg.style.transition = '';
        });
      }
      if (img.complete && img.naturalWidth) requestAnimationFrame(show);
      else { img.addEventListener('load', show, { once: true }); img.addEventListener('error', show, { once: true }); }
      setTimeout(function () { if (bg.style.opacity !== '1') { bg.style.transition = ''; bg.style.opacity = '1'; } }, 1800);
    })();

    // ---- Pin via GSAP ScrollTrigger: hold the hero in the viewport while the
    //      animation plays out, so the whole thing happens "in the first 100vh"
    //      before the next section appears. Pin distance == animation distance →
    //      the section slides up exactly as the photo finishes hiding (no
    //      whitespace). GSAP pins the hero AT its current position, so the
    //      hero's margin-top:-7rem can't cause the shift a hand-rolled sticky
    //      pin had. If GSAP can't load, fall back to a plain scroll-driven run. ----
    apply(0);
    let started = false;

    function refresh() {
      computeBp();
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    }

    function startPin() {
      if (started) return true;
      if (!(window.gsap && window.ScrollTrigger)) return false;
      started = true;
      pinned = true;            // badge is held fixed only when the hero is genuinely pinned
      const g = window.gsap;
      g.registerPlugin(window.ScrollTrigger);
      g.to({ p: 0 }, {
        p: 1, ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: function () { return '+=' + Math.round((window.innerHeight || 1) * PIN_VIEWPORTS); },
          pin: hero,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: function (self) { apply(self.progress); },
          onRefresh: function (self) { apply(self.progress); }
        }
      });
      window.addEventListener('resize', refresh, { passive: true });
      return true;
    }

    function startFallback() {
      if (started) return;
      started = true;
      let cur = 0, rafId = null;
      function frac() {
        // Match the pinned path's distance (PIN_VIEWPORTS×100vh) so the
        // choreography completes at the same scroll depth in both code paths.
        const y = window.pageYOffset || document.documentElement.scrollTop || 0;
        return clamp(y / ((window.innerHeight || 1) * PIN_VIEWPORTS));
      }
      function frame() {
        const t = frac();
        cur += (t - cur) * LERP;
        const settled = Math.abs(t - cur) < 0.0004;
        if (settled) cur = t;
        apply(cur);
        if (settled && (t <= 0.001 || t >= 0.999)) { rafId = null; return; }
        rafId = requestAnimationFrame(frame);
      }
      function wake() { if (rafId === null) rafId = requestAnimationFrame(frame); }
      window.addEventListener('scroll', wake, { passive: true });
      window.addEventListener('wheel', wake, { passive: true });
      window.addEventListener('touchmove', wake, { passive: true });
      window.addEventListener('resize', function () { computeBp(); wake(); }, { passive: true });
      wake();
    }

    if (!startPin()) {
      const inject = function (src, cb) {
        const sc = document.createElement('script');
        sc.src = src; sc.async = true; sc.onload = cb; sc.onerror = cb;
        (document.head || document.documentElement).appendChild(sc);
      };
      inject('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js', function () {
        inject('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js', function () {
          if (!startPin()) startFallback();
        });
      });
      setTimeout(startFallback, 3500); // GSAP slow/blocked → don't leave the hero static
    }
  }

  // Loaded with `defer` / in the footer, so the DOM is already parsed.
  init();
})();
