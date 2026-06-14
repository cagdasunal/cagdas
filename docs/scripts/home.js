/*!
 * home.js — scroll-driven editorial hero for cagd.as (homepage)
 *
 * Replaces the old "living blob" avatar effect entirely. Drives the EXISTING
 * Webflow homepage hero (header.section_hero, .is-home) — it injects a faint
 * big background portrait + a soft Webflow-indigo (#126ef5) aurora behind the
 * text, then animates the whole thing on scroll. The text stays the hero; the
 * face lives on the background (per the design brief).
 *
 * What it does:
 *   - INJECTS, into header.section_hero (which is position:relative; 100vh):
 *       • a glow layer  — two blurred, screen-blended #126ef5 radial blobs that
 *         slowly drift + hue-breathe (Web Animations API; no <style> injection).
 *       • a portrait    — the transparent B&W cutout, big + faint (opacity 0.4),
 *         centered, grayscale, vignetted via a radial mask, with a slow
 *         "living push-in" (~5% zoom + breathe). The existing text is lifted
 *         above both (z-index) — no HTML restructuring.
 *   - SCROLL choreography (smoothed lerp ≈ GSAP scrub, keyed to the first
 *     viewport — NOT pinned, so it never disturbs the Webflow IX2 section below):
 *       • portrait gets LESS DARK almost immediately (felt the moment you
 *         scroll), THEN hides GRADUALLY across the scroll (→ 0 by ~0.84 vh) so
 *         the fade-out is experienced, not abrupt.
 *       • the indigo glow blooms with the brighten, then clears with the hide.
 *       • the hero text drifts up from the first scroll — moving away with the
 *         badge — and fades a touch later.
 *   - ENTRANCE on load: the background fades in smoothly (~850ms ease-out) once
 *     the photo decodes. The hero TEXT is left untouched — it shows instantly
 *     (no on-load animation, per the brief).
 *   - Animation is RESPONSIVE to Webflow breakpoints (992 / 768 / 480): portrait
 *     scale + glow size step down on smaller screens.
 *   - Honors prefers-reduced-motion (static faint portrait, no loops, no scroll
 *     drive, text shown immediately).
 *   - Badge sync: sets window.__cagdasHeroFadesBadge and drives .webflow_badge
 *     .wfb-faded from this same scroll, so the badge fades in lock-step with the
 *     hero (badge.js yields to it — see badge.js scroll-fade guard).
 *
 * The clock (.time_*) and the availability dot (.icon_available) are owned by
 * available-widget.js — this script does NOT touch them.
 *
 * Design source: Claude Design "Hero Section Redesign" -> project/Hero.dc.html.
 * Self-contained: ZERO deps, ZERO <style> injection (WAAPI + inline styles only).
 *
 * SSOT: sites/cagdas/scripts/src/home.js
 * Build: python3 scripts/site_deploy.py build --site cagdas --src home
 */
(function () {
  'use strict';

  if (window.__cagdasHomeHero) return; // guard against double-load
  window.__cagdasHomeHero = true;

  // The transparent B&W cutout (provided by the user). Small AVIF, blends into
  // the black canvas — so it needs no opaque background, just a soft vignette.
  const PHOTO_SRC = 'https://cdn.prod.website-files.com/69db63dc2e8675a7ac610755/6a2ea142a77c1ee08c8fc77d_cagdasunal-transparent.avif';
  const GLOW = '18, 110, 245';   // #126ef5 — the Webflow-indigo aurora
  // Scroll timing (in viewport-fractions of scroll). Balance: the brighten is
  // near-immediate so it's felt the moment you scroll, but the hide is spread
  // across the scroll so the portrait fades out as you go (not abruptly).
  const BRIGHTEN = 0.2;          // vh for the portrait to reach its brightest
  const HIDE_AT = 0.22;          // vh where the portrait begins to hide
  const HIDE_SPAN = 0.62;        // vh over which it hides (finishes ~0.84vh)
  const TEXT_DRIFT_PX = 120;     // px the hero text drifts up (it moves away with the badge)
  const TEXT_DRIFT_VH = 0.72;    // vh over which that drift plays
  const LERP = 0.18;             // scrub smoothing toward the target scroll position

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function smoothstep(v) { const x = clamp(v); return x * x * (3 - 2 * x); }
  function rgba(a) { return 'rgba(' + GLOW + ', ' + a + ')'; }

  function init() {
    const hero = document.querySelector('header.section_hero:not(.is-secondary)');
    if (!hero || !hero.querySelector('.is-home')) return; // homepage hero only
    const textcol = hero.querySelector('.header-wrapper');
    if (!textcol) return;
    if (hero.querySelector('.cagdas-hero-bg')) return; // already initialised

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- Build the background layers (glow behind, portrait in front, both
    //      behind the text). One detached subtree, appended once. ----
    const bg = document.createElement('div');
    bg.className = 'cagdas-hero-bg';
    bg.setAttribute('aria-hidden', 'true');
    bg.style.cssText = 'position:absolute;inset:0;overflow:hidden;z-index:0;pointer-events:none;opacity:0';

    const glow = document.createElement('div');
    glow.style.cssText = 'position:absolute;inset:0;z-index:0;opacity:0.204;transform-origin:72% 46%;will-change:opacity,filter';
    const glowA = document.createElement('div');
    glowA.style.cssText = 'position:absolute;top:-6%;right:-8%;width:74%;height:108%;mix-blend-mode:screen;filter:blur(54px);' +
      'background:radial-gradient(closest-side, ' + rgba(0.34) + ', ' + rgba(0.12) + ' 48%, ' + rgba(0) + ' 76%)';
    const glowB = document.createElement('div');
    glowB.style.cssText = 'position:absolute;top:12%;right:4%;width:52%;height:74%;mix-blend-mode:screen;filter:blur(62px);' +
      'background:radial-gradient(closest-side, ' + rgba(0.26) + ', ' + rgba(0) + ' 70%)';
    glow.appendChild(glowA);
    glow.appendChild(glowB);

    const photo = document.createElement('div');
    photo.style.cssText = 'position:absolute;top:0;bottom:0;left:50%;z-index:1;width:clamp(520px, 58vw, 880px);opacity:0.4;' +
      'transform:translate(-50%,0) scale(1.16);transform-origin:50% 36%;will-change:opacity,transform;' +
      '-webkit-mask-image:radial-gradient(ellipse 62% 74% at 50% 40%, #000 36%, rgba(0,0,0,0) 82%);' +
      'mask-image:radial-gradient(ellipse 62% 74% at 50% 40%, #000 36%, rgba(0,0,0,0) 82%);' +
      '-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat';
    const living = document.createElement('div');
    living.style.cssText = 'position:absolute;inset:0;transform-origin:50% 36%';
    const img = document.createElement('img');
    img.src = PHOTO_SRC;
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:50% 42%;' +
      'filter:grayscale(1) contrast(1.05) brightness(0.92);display:block';
    living.appendChild(img);
    photo.appendChild(living);

    bg.appendChild(glow);
    bg.appendChild(photo);

    // Lift the existing hero content above the background (no HTML restructuring).
    const content = hero.querySelector('.padding-global') || textcol.parentNode;
    if (content) { content.style.position = 'relative'; content.style.zIndex = '2'; }
    hero.appendChild(bg);

    // ---- Responsive sizing keyed to Webflow breakpoints (992 / 768 / 480). ----
    let bp = { photoScale: 1.16, glowMul: 1.0 };
    function computeBp() {
      const w = window.innerWidth;
      if (w >= 992)      bp = { photoScale: 1.16, glowMul: 1.0 };
      else if (w >= 768) bp = { photoScale: 1.08, glowMul: 0.9 };
      else if (w >= 480) bp = { photoScale: 1.0,  glowMul: 0.8 };
      else               bp = { photoScale: 0.92, glowMul: 0.68 };
      glow.style.transform = 'scale(' + (1.25 * bp.glowMul) + ')';
    }
    computeBp();

    // ---- Badge sync: own the badge's scroll fade so it's in lock-step with the
    //      hero. badge.js yields when this flag is set (see its scroll guard). ----
    let badgeHosts = null;
    function driveBadge(s) {
      if (badgeHosts === null) {
        const n = document.querySelectorAll('.webflow_badge');
        if (!n.length) return;
        badgeHosts = n;
      }
      // badge.js's original feel (fade past 0.2vh, return under 0.1vh), now driven
      // here so it stays in lock-step with the hero.
      let faded = s > 0.2;
      if (s < 0.1) faded = false;
      for (let i = 0; i < badgeHosts.length; i++) badgeHosts[i].classList.toggle('wfb-faded', faded);
    }

    // ---- Scroll choreography (s = viewport-fractions scrolled). Brighten is
    //      near-immediate (felt the instant you scroll); the hide is spread
    //      across the scroll so the portrait fades out as you go. The hero text
    //      drifts up from the first scroll — moving away with the badge. ----
    function apply(s) {
      const lessdark = smoothstep(clamp(s / BRIGHTEN));
      const hide = smoothstep(clamp((s - HIDE_AT) / HIDE_SPAN));
      photo.style.opacity = String((0.4 + 0.26 * lessdark) * (1 - hide));
      photo.style.transform = 'translate(-50%,0) scale(' + bp.photoScale + ')';
      glow.style.opacity = String(clamp(0.34 * (0.6 + 0.7 * lessdark) * (1 - hide)));
      const drift = smoothstep(clamp(s / TEXT_DRIFT_VH));
      textcol.style.transform = 'translateY(' + (-drift * TEXT_DRIFT_PX) + 'px)';
      textcol.style.opacity = String(1 - smoothstep(clamp((s - 0.28) / 0.52)));
      driveBadge(s);
    }

    if (reduce) {
      // Static, faint hero. Show the bg + text immediately; no loops, no scroll.
      bg.style.opacity = '1';
      apply(0);
      return;
    }
    window.__cagdasHeroFadesBadge = true; // tell badge.js to yield the scroll-fade

    // Looping idle motion — Web Animations API (no <style> injection).
    function loop(el, frames, dur, opts) {
      if (!el.animate) return;
      const o = { duration: dur, iterations: Infinity, easing: 'ease-in-out' };
      if (opts) for (const k in opts) o[k] = opts[k];
      try { el.animate(frames, o); } catch (e) {}
    }
    loop(living, [{ transform: 'scale(1) translateY(0)' }, { transform: 'scale(1.05) translateY(-0.6%)' }], 15000, { direction: 'alternate' });
    loop(glowA,
      [{ transform: 'translate(0,0) scale(1) rotate(0deg)', offset: 0 },
       { transform: 'translate(-7%,5%) scale(1.18) rotate(7deg)', offset: 0.33 },
       { transform: 'translate(4%,-4%) scale(1.07) rotate(-5deg)', offset: 0.66 },
       { transform: 'translate(0,0) scale(1) rotate(0deg)', offset: 1 }], 19000);
    loop(glowB,
      [{ transform: 'translate(0,0) scale(1) rotate(0deg)', offset: 0 },
       { transform: 'translate(8%,-7%) scale(1.14) rotate(-9deg)', offset: 0.5 },
       { transform: 'translate(0,0) scale(1) rotate(0deg)', offset: 1 }], 25000);
    loop(glow,
      [{ filter: 'hue-rotate(-10deg) saturate(1)' },
       { filter: 'hue-rotate(16deg) saturate(1.16)' },
       { filter: 'hue-rotate(-10deg) saturate(1)' }], 21000);

    // ---- Entrance: just a quick fade-in of the injected background. The hero
    //      TEXT is left untouched — it shows instantly (no on-load animation). ----
    revealBg();

    function revealBg() {
      function show() {
        bg.style.transition = 'opacity 850ms cubic-bezier(0.22,1,0.36,1)';
        requestAnimationFrame(function () { bg.style.opacity = '1'; });
        bg.addEventListener('transitionend', function te(ev) {
          if (ev.propertyName !== 'opacity') return;
          bg.removeEventListener('transitionend', te);
          bg.style.transition = '';
        });
      }
      if (img.complete && img.naturalWidth) requestAnimationFrame(show);
      else { img.addEventListener('load', show, { once: true }); img.addEventListener('error', show, { once: true }); }
      setTimeout(function () { if (bg.style.opacity !== '1') { bg.style.transition = ''; bg.style.opacity = '1'; } }, 1500);
    }

    // ---- Drive the scroll progress with a smoothed lerp (scrub feel). The rAF
    //      loop only runs while easing toward the target, then sleeps. ----
    let cur = 0, target = 0, rafId = null;
    function scrollFrac() {
      const y = window.pageYOffset || document.documentElement.scrollTop || 0;
      const vh = window.innerHeight || 1;
      const s = y / vh;
      return s > 1.5 ? 1.5 : s; // cap so the lerp never chases a huge value
    }
    function frame() {
      cur += (target - cur) * LERP;
      if (Math.abs(target - cur) < 0.0005) { cur = target; apply(cur); rafId = null; return; }
      apply(cur);
      rafId = requestAnimationFrame(frame);
    }
    function wake() { if (rafId === null) rafId = requestAnimationFrame(frame); }
    function onScroll() { target = scrollFrac(); wake(); }

    apply(0);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { computeBp(); target = scrollFrac(); wake(); }, { passive: true });
    onScroll(); // sync to the current scroll position on load (e.g. refresh mid-page)
  }

  // Loaded with `defer` / in the footer, so the DOM is already parsed.
  init();
})();
