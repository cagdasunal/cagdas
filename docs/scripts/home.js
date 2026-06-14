/*!
 * home.js — scroll-driven editorial hero for cagd.as (homepage)
 *
 * Drives the EXISTING Webflow homepage hero (header.section_hero, .is-home). It
 * injects a faint big B&W portrait + a soft Webflow-indigo (#126ef5) aurora
 * behind the text, PINS the hero (sticky) so the animation plays out over a long
 * scroll, then runs a scroll-linked choreography. The text stays the hero; the
 * face lives on the background (per the design brief).
 *
 * Structure (matches Claude Design "Hero Section Redesign" Hero.dc.html, which
 * uses a 200vh track + a position:sticky 100vh section):
 *   - The hero becomes a tall TRACK (PIN×100vh). Its content is wrapped in a
 *     sticky STAGE (top:0; height:100vh; overflow:hidden) so the hero stays
 *     pinned in the viewport while you scroll through the track — you scroll
 *     more, so you experience the animation more.
 *   - Into the stage (behind the text, which is lifted via z-index — no HTML
 *     restructuring of the content itself): the indigo aurora + the portrait.
 *
 * Scroll choreography (progress p = how far through the pinned track, smoothed
 * by a lerp ≈ GSAP scrub):
 *   - portrait gets LESS DARK almost immediately (felt the moment you scroll),
 *     then hides GRADUALLY across the whole pin so the fade-out is experienced.
 *   - the indigo glow blooms with the brighten, then clears with the hide.
 *   - the hero text drifts UP and fades — "moves to the top and disappears" —
 *     and the Webflow badge is held in the viewport and faded in LOCKSTEP with
 *     the text, so the two disappear together.
 *
 * Entrance: the background fades in smoothly (~850ms) once the photo decodes.
 * The hero TEXT shows instantly (no on-load animation, per the brief).
 *
 * Responsive to Webflow breakpoints (992/768/480); reduced-motion-safe (no pin,
 * static faint 100vh hero). The clock (.time_*) + availability dot
 * (.icon_available) are owned by available-widget.js — not touched here.
 *
 * Self-contained: ZERO deps, ZERO <style> injection (WAAPI + inline styles).
 * Badge sync: sets window.__cagdasHeroFadesBadge so badge.js yields its own
 * scroll-fade (see its scroll guard).
 *
 * SSOT: sites/cagdas/scripts/src/home.js
 * Build: python3 scripts/site_deploy.py build --site cagdas --src home
 */
(function () {
  'use strict';

  if (window.__cagdasHomeHero) return; // guard against double-load
  window.__cagdasHomeHero = true;

  const PHOTO_SRC = 'https://cdn.prod.website-files.com/69db63dc2e8675a7ac610755/6a2ebdc6b835d8b66988481a_cagdasunal-full.png';
  const GLOW = '18, 110, 245';   // #126ef5 — the Webflow-indigo aurora
  const PHOTO_W = 'clamp(440px, 50vw, 760px)';
  // Head-centering: in this photo the head is already horizontally centred
  // (x≈0.50), so the box is centred (translateX -50%) and `cover` crops to the
  // centre strip — the head lands centred with the nav. Re-derive if the photo
  // changes (analyse the head's x-fraction and offset translateX by that).
  const PHOTO_TX = '-50%';
  const PIN = 2.2;               // hero track height (× viewport) → ~120vh of pinned scroll
  const LERP = 0.16;             // scrub smoothing toward the target progress
  const TEXT_DRIFT_PX = 200;     // px the hero text drifts up across the pin

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function smoothstep(v) { const x = clamp(v); return x * x * (3 - 2 * x); }
  function rgba(a) { return 'rgba(' + GLOW + ', ' + a + ')'; }

  function init() {
    const hero = document.querySelector('header.section_hero:not(.is-secondary)');
    if (!hero || !hero.querySelector('.is-home')) return; // homepage hero only
    const textcol = hero.querySelector('.header-wrapper');
    const content = hero.querySelector('.padding-global');
    if (!textcol || !content) return;
    if (hero.querySelector('.cagdas-hero-bg')) return; // already initialised

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- Background layers (glow behind, portrait in front). ----
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
    photo.style.cssText = 'position:absolute;top:0;bottom:0;left:50%;z-index:1;width:' + PHOTO_W + ';opacity:0.4;' +
      'transform:translate(' + PHOTO_TX + ',0) scale(1);transform-origin:50% 36%;will-change:opacity,transform;' +
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

    content.style.position = 'relative';
    content.style.zIndex = '2';

    // ---- Reduced motion: no pin, static faint 100vh hero, badge untouched. ----
    if (reduce) {
      hero.appendChild(bg);
      bg.style.opacity = '1';
      apply(0);
      return;
    }

    // ---- Pin: wrap the content in a sticky stage inside a tall track. The hero
    //      stays in the viewport while you scroll through PIN×100vh. ----
    const stage = document.createElement('div');
    stage.className = 'cagdas-hero-stage';
    stage.style.cssText = 'position:sticky;top:0;height:100vh;width:100%;overflow:hidden;display:flex;flex-flow:column;justify-content:center';
    hero.insertBefore(stage, content);
    stage.appendChild(bg);      // behind
    stage.appendChild(content); // above (z-index:2)
    hero.style.height = (PIN * 100) + 'vh';
    hero.style.maxHeight = 'none';
    hero.style.display = 'block';

    window.__cagdasHeroFadesBadge = true; // badge.js yields its scroll-fade to us

    // ---- Responsive sizing keyed to Webflow breakpoints (992 / 768 / 480). ----
    let bp = { photoScale: 1.16, glowMul: 1.0 };
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

    // ---- Badge: held in the viewport during the pin and faded in lockstep with
    //      the text (same curve), so the two disappear together. Outside the pin
    //      it reverts to badge.js's own placement (it's already faded/off-screen
    //      past the pin, so the position swap is invisible). ----
    let badgeHosts = null;
    function driveBadge(p, textFade) {
      if (badgeHosts === null) {
        const n = document.querySelectorAll('.webflow_badge');
        if (!n.length) return;
        badgeHosts = n;
      }
      // Active fade zone: hold the badge fixed in the viewport and fade it inline
      // in lockstep with the text. Outside it, hand back to badge.js's placement
      // (position cleared) and use the .wfb-faded class once gone — the class
      // sets pointer-events:none so an invisible badge can never block clicks.
      const active = p > 0.002 && p < 0.82;
      for (let i = 0; i < badgeHosts.length; i++) {
        const h = badgeHosts[i];
        if (active) {
          h.classList.remove('wfb-faded');
          h.style.position = 'fixed';     // stay in the viewport with the pinned hero
          h.style.transition = 'none';
          h.style.opacity = String(1 - textFade);
          h.style.pointerEvents = (1 - textFade) < 0.05 ? 'none' : '';
        } else {
          h.style.position = '';
          h.style.transition = '';
          h.style.opacity = '';
          h.style.pointerEvents = '';
          h.classList.toggle('wfb-faded', p > 0.5); // gone past the pin; shown at the top
        }
      }
    }

    // ---- Scroll choreography over the pin progress p (0 → 1). ----
    function apply(p) {
      const lessdark = smoothstep(clamp(p / 0.18));          // brighten — near-immediate
      const hide = smoothstep(clamp((p - 0.22) / 0.7));      // hide — gradual across the pin
      photo.style.opacity = String((0.4 + 0.26 * lessdark) * (1 - hide));
      photo.style.transform = 'translate(' + PHOTO_TX + ',0) scale(' + bp.photoScale + ')';
      glow.style.opacity = String(clamp(0.34 * (0.6 + 0.7 * lessdark) * (1 - hide)));
      const textFade = smoothstep(clamp((p - 0.3) / 0.5));   // text fades from ~0.3
      textcol.style.transform = 'translateY(' + (-smoothstep(clamp(p / 0.8)) * TEXT_DRIFT_PX) + 'px)';
      textcol.style.opacity = String(1 - textFade);
      driveBadge(p, textFade);
    }

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

    // ---- Entrance: smooth background fade-in once the photo decodes. ----
    (function revealBg() {
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
    })();

    // ---- Pin progress: how far through the track the sticky stage has scrolled,
    //      smoothed by a lerp for a buttery scrub feel. ----
    let cur = 0, target = 0, rafId = null;
    function pinProgress() {
      // The hero is the first section, so page scrollY directly measures how far
      // into the pinned track we are — immune to the hero's margin-top:-7rem
      // (which would skew a getBoundingClientRect().top formula).
      const total = hero.offsetHeight - window.innerHeight;
      const y = window.pageYOffset || document.documentElement.scrollTop || 0;
      return clamp(total > 0 ? y / total : 0);
    }
    function frame() {
      const t = pinProgress();          // always chase the LIVE scroll position
      cur += (t - cur) * LERP;
      const settled = Math.abs(t - cur) < 0.0004;
      if (settled) cur = t;
      apply(cur);
      // Stay awake through the pin so we always track live scroll (no missed-event
      // freeze on momentum); sleep only at the rest extremes (top / fully past).
      if (settled && (t <= 0.001 || t >= 0.999)) { rafId = null; return; }
      rafId = requestAnimationFrame(frame);
    }
    function wake() { if (rafId === null) rafId = requestAnimationFrame(frame); }

    apply(0);
    // Wake on any input that can move the scroll position. Once awake the loop
    // tracks live scroll each frame and only sleeps at the rest extremes, so a
    // single event is enough to run the choreography to completion.
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('wheel', wake, { passive: true });
    window.addEventListener('touchmove', wake, { passive: true });
    window.addEventListener('resize', function () { computeBp(); wake(); }, { passive: true });
    wake(); // sync to the current scroll position on load (e.g. refresh mid-page)
  }

  // Loaded with `defer` / in the footer, so the DOM is already parsed.
  init();
})();
