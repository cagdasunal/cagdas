/*!
 * home.js — scroll-driven editorial hero for cagd.as (homepage)
 *
 * Drives the EXISTING Webflow homepage hero (header.section_hero, .is-home). It
 * injects a faint big B&W portrait + a soft indigo aurora (centred) behind the
 * text. On first load the portrait + glow fade in and the portrait settles. As
 * you scroll the portrait brightens a touch then DISSOLVES (fades to invisible)
 * and the glow fades with it, while the next section rises into view — a smooth
 * hand-off. Nothing is pinned/frozen on screen.
 *
 * Scroll choreography (progress s = scrollY ÷ RANGE·viewport, lerp-smoothed):
 *   - portrait opacity 0.5 (rest) → ~0.75 (a touch less dark) → 0 (invisible). It
 *     also LAGS the scroll a little (parallax) so it lingers, large, while the
 *     section rises beneath it — so there's never an empty gap.
 *   - the soft indigo glow blooms slightly, then fades out with the portrait.
 *   - the hero text + the Webflow badge drift UP and fade out together (same
 *     time, same speed).
 *
 * Entrance: the portrait + glow fade in (~1100ms) and the portrait gently rises
 * + settles, once the photo decodes. The hero TEXT shows instantly.
 *
 * Responsive to Webflow breakpoints (992/768/480) — photo scale, glow scale and
 * the text/badge drift all step down on smaller screens. Reduced-motion-safe
 * (static faint hero, no scroll animation, no entrance). The clock (.time_*) +
 * availability dot (.icon_available) are owned by available-widget.js.
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

  const PHOTO_SRC = 'https://cdn.prod.website-files.com/69db63dc2e8675a7ac610755/6a2ef57e3f9feeabc21c4f1f_47035e26c90d647761dcb2cc2f53df5b_cagdasunal-transparent.png';
  // Soft indigo aurora. R≈G so even at low opacity / screen-blended it reads a
  // true blue-violet, never teal (plain #126ef5's green channel (110) makes a dim
  // blue go teal). Used at a soft opacity at rest, blooming a little on scroll.
  const GLOW_RGB = '72,66,248';
  const PHOTO_AR = '1984 / 2114';                 // the cutout's intrinsic aspect
  const PHOTO_H = 'min(82vh, 90vw, 920px)';       // sized by height; capped by width so it fits on mobile
  const PHOTO_TX = '-55%';                         // head x≈0.554 → shift left so it's centred with the nav
  const PHOTO_PARALLAX = 0.3;     // how much the portrait LAGS the scroll (lingers while the section rises)
  const RANGE = 1.0;              // scroll distance (× viewport) over which the choreography completes
  const LERP = 0.16;              // scrub smoothing toward the live scroll position
  const TEXT_DRIFT_PX = 140;      // px the hero text + badge drift up as they fade (× breakpoint factor)

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function smoothstep(v) { const x = clamp(v); return x * x * (3 - 2 * x); }
  // Radial-gradient for a glow blob. `big` = glowA's wider/softer falloff;
  // otherwise glowB's tighter core. Fixed colour — only the wrapper opacity animates.
  function glowGrad(big) {
    return big
      ? 'radial-gradient(closest-side, rgba(' + GLOW_RGB + ',0.34), rgba(' + GLOW_RGB + ',0.12) 48%, rgba(' + GLOW_RGB + ',0) 76%)'
      : 'radial-gradient(closest-side, rgba(' + GLOW_RGB + ',0.26), rgba(' + GLOW_RGB + ',0) 70%)';
  }

  function init() {
    const hero = document.querySelector('header.section_hero:not(.is-secondary)');
    if (!hero || !hero.querySelector('.is-home')) return; // homepage hero only
    const textcol = hero.querySelector('.header_content') || hero.querySelector('.header-wrapper');
    const content = hero.querySelector('.padding-global');
    if (!textcol || !content) return;
    if (hero.querySelector('.cagdas-hero-bg')) return; // already initialised

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Declared before any apply(0) call (incl. the reduced-motion branch) so they
    // aren't read in their temporal dead zone.
    let bp = { photoScale: 1.0, glowMul: 1.0, drift: 1.0 };
    let badgeHosts = null;
    let wcOn = true;                              // will-change currently on (set in the cssText below)

    // ---- Background layers (glow behind, portrait in front). ----
    const bg = document.createElement('div');
    bg.className = 'cagdas-hero-bg';
    bg.setAttribute('aria-hidden', 'true');
    bg.style.cssText = 'position:absolute;inset:0;overflow:hidden;z-index:0;pointer-events:none;opacity:0';

    const glow = document.createElement('div');
    glow.style.cssText = 'position:absolute;inset:0;z-index:0;transform-origin:50% 50%;will-change:opacity';
    // Both blobs centred (V + H) so the aurora's bright centre sits at the middle
    // of the hero; the breathing just scales them gently in place.
    const glowA = document.createElement('div');
    glowA.style.cssText = 'position:absolute;top:10%;left:10%;width:80%;height:80%;mix-blend-mode:screen;filter:blur(54px);background:' + glowGrad(true);
    const glowB = document.createElement('div');
    glowB.style.cssText = 'position:absolute;top:25%;left:25%;width:50%;height:50%;mix-blend-mode:screen;filter:blur(62px);background:' + glowGrad(false);
    glow.appendChild(glowA);
    glow.appendChild(glowB);

    const photo = document.createElement('div');
    photo.style.cssText = 'position:absolute;left:50%;bottom:0;z-index:1;height:' + PHOTO_H + ';aspect-ratio:' + PHOTO_AR + ';width:auto;opacity:0.5;' +
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
    hero.appendChild(bg);

    // ---- Responsive sizing keyed to Webflow breakpoints (992 / 768 / 480). ----
    function computeBp() {
      const w = window.innerWidth;
      // photoScale ≤1 so `contain` shows the WHOLE photo; the glow + the text/badge
      // drift step down on smaller screens so the motion stays proportional.
      if (w >= 992)      bp = { photoScale: 1.0,  glowMul: 1.0,  drift: 1.0 };
      else if (w >= 768) bp = { photoScale: 1.0,  glowMul: 0.9,  drift: 0.85 };
      else if (w >= 480) bp = { photoScale: 0.96, glowMul: 0.8,  drift: 0.7 };
      else               bp = { photoScale: 0.92, glowMul: 0.68, drift: 0.6 };
      glow.style.transform = 'scale(' + (1.25 * bp.glowMul) + ')';
    }
    computeBp();

    // ---- Badge: drifts up + fades with .header_content (same time, same speed).
    //      Non-pinned, so it scrolls with the page naturally; we only add the same
    //      drift (via margin-top, leaving its own breakpoint-dependent centring
    //      transform alone) + the same fade. pointer-events:none once invisible. ----
    function driveBadge(driftY, fade) {
      if (badgeHosts === null) {
        const n = document.querySelectorAll('.webflow_badge');
        if (!n.length) return;               // none yet (badge.js runs after us) — retry next frame
        badgeHosts = n;
      }
      for (let i = 0; i < badgeHosts.length; i++) {
        const h = badgeHosts[i];
        if (fade > 0.001) {
          h.style.transition = 'none';
          h.style.marginTop = driftY + 'px';
          h.style.opacity = String(1 - fade);
          h.style.pointerEvents = (1 - fade) < 0.05 ? 'none' : '';
        } else {
          h.style.transition = '';
          h.style.marginTop = '';
          h.style.opacity = '';
          h.style.pointerEvents = '';
        }
      }
    }

    // ---- Scroll choreography over s = scrollY ÷ (RANGE·viewport), 0→1. The hero
    //      is NOT pinned: as you scroll the next section rises into view while the
    //      portrait + glow DISSOLVE (fade to invisible) and the text drifts away —
    //      a smooth hand-off with no frozen frame and no empty gap. ----
    function apply(s) {
      const vh = window.innerHeight || 1;
      const bright = smoothstep(clamp(s / 0.3));            // a touch LESS DARK, early
      const hide = smoothstep(clamp((s - 0.32) / 0.6));     // then dissolves to invisible (~0.92)
      // will-change hygiene: only keep the photo/glow promoted to GPU layers while
      // they're actually animating; release them once fully dissolved (toggled at
      // the threshold, not every frame). Re-promoted when you scroll back up.
      const wantWC = hide < 0.995;
      if (wantWC !== wcOn) {
        wcOn = wantWC;
        photo.style.willChange = wantWC ? 'opacity,transform' : '';
        glow.style.willChange = wantWC ? 'opacity' : '';
      }
      photo.style.opacity = String((0.5 + 0.25 * bright) * (1 - hide));   // 0.5 → 0.75 → 0
      // Parallax lag: the portrait rises slower than the page so it lingers, large,
      // covering the hand-off while the section rises beneath it.
      photo.style.transform = 'translate(' + PHOTO_TX + ',' + (s * vh * PHOTO_PARALLAX) + 'px) scale(' + bp.photoScale + ')';
      glow.style.opacity = String(clamp((0.28 + 0.2 * bright) * (1 - hide)));   // soft → bloom → fade
      const driftY = -smoothstep(clamp(s / 0.85)) * TEXT_DRIFT_PX * bp.drift;
      const fade = smoothstep(clamp((s - 0.1) / 0.55));     // text + badge gone by ~0.65
      textcol.style.transform = 'translateY(' + driftY + 'px)';
      textcol.style.opacity = String(1 - fade);
      driveBadge(driftY, fade);
    }

    // Looping idle motion — Web Animations API (no <style> injection).
    function loop(el, frames, dur, opts) {
      if (!el.animate) return;
      const o = { duration: dur, iterations: Infinity, easing: 'ease-in-out' };
      if (opts) for (const k in opts) o[k] = opts[k];
      try { el.animate(frames, o); } catch (e) {}
    }

    // ---- Reduced motion: static faint hero, no scroll animation, no entrance. ----
    if (reduce) {
      bg.style.opacity = '1';
      apply(0);
      return;
    }

    window.__cagdasHeroFadesBadge = true; // badge.js yields its scroll-fade to us

    // Gentle scale-only "breathing" (centre origin) so the aurora stays centred.
    loop(glowA, [{ transform: 'scale(1)' }, { transform: 'scale(1.07)' }, { transform: 'scale(1)' }], 11000);
    loop(glowB, [{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], 14000);

    // ---- Entrance: portrait + glow fade in (~1100ms) and the portrait gently
    //      rises + settles, once the photo decodes. The hero text shows instantly. ----
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

    // ---- Scroll driver: lerp-smoothed rAF loop (≈ GSAP scrub, no dependency).
    //      Wakes on scroll/wheel/touch, sleeps at the rest extremes. ----
    let cur = 0, rafId = null;
    function frac() {
      const y = window.pageYOffset || document.documentElement.scrollTop || 0;
      return clamp(y / ((window.innerHeight || 1) * RANGE));
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

    apply(0);
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('wheel', wake, { passive: true });
    window.addEventListener('touchmove', wake, { passive: true });
    window.addEventListener('resize', function () { computeBp(); wake(); }, { passive: true });
    wake(); // sync to the current scroll position on load (e.g. refresh mid-page)
  }

  // Loaded with `defer` / in the footer, so the DOM is already parsed.
  init();
})();
