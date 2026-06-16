/*!
 * photo-home.js — scroll-driven editorial hero for cagd.as (homepage), PHOTO-SEQUENCE variant
 *
 * Identical to home.js in every animation respect — the soft indigo aurora, the entrance fade,
 * the on-scroll brighten→DISSOLVE with a parallax lag, the hero text + Webflow badge drift — but the
 * single static portrait is replaced by a SCROLL-SCRUBBED IMAGE SEQUENCE: as you scroll, the same
 * lerp-smoothed progress `s` picks a transparent frame and draws it to a <canvas>, so the portrait
 * gently comes alive (a warm expression blooms + a subtle head movement) WITHOUT ever breaking eye
 * contact with the camera. The sequence is FRONT-LOADED (mapped to s/bp.playEnd) so the whole clip
 * plays inside the visible window, before the hero dissolves. Frames are transparent (the indigo glow
 * shows through) and pre-graded to the home.js look (grayscale, contrast 1.05, brightness 0.92), so
 * NO CSS filter is applied here.
 *
 * Frames: 121 transparent AVIF, ~17KB each (~2.0MB total), hosted on GitHub Pages (files.cagd.as).
 * The hero still DISSOLVES out on scroll, so the sequence is one-directional (no loop).
 *
 * Build: python3 scripts/site_deploy.py build --site cagdas --src photo-home
 * SSOT:  sites/cagdas/scripts/src/photo-home.js
 */
(function () {
  'use strict';

  if (window.__cagdasHomePhotoHero) return;     // guard against double-load
  window.__cagdasHomePhotoHero = true;

  // ---- Frame sequence (transparent, pre-graded AVIF on the GitHub-Pages CDN). ----
  const FRAME_BASE = 'https://files.cagd.as/hero-frames/';
  const FRAME_COUNT = 121;
  const FRAME_W = 927, FRAME_H = 920;           // native frame px (canvas bitmap size)
  function frameURL(i) { let n = '' + (i + 1); while (n.length < 3) n = '0' + n; return FRAME_BASE + 'f' + n + '.avif'; }

  const GLOW_RGB = '72,66,248';
  const PHOTO_AR = '927 / 920';                 // the sequence frame's intrinsic aspect
  const PHOTO_H  = 'min(82vh, 90vw, 920px)';    // sized by height; capped by width so it fits on mobile
  const PHOTO_TX = '-57%';                       // head x≈0.573 → shift left so it's centred with the nav
  const RANGE = 1.0;
  const LERP = 0.16;
  const TEXT_DRIFT_PX = 140;

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function smoothstep(v) { const x = clamp(v); return x * x * (3 - 2 * x); }
  function glowGrad(big) {
    return big
      ? 'radial-gradient(closest-side, rgba(' + GLOW_RGB + ',0.34), rgba(' + GLOW_RGB + ',0.12) 48%, rgba(' + GLOW_RGB + ',0) 76%)'
      : 'radial-gradient(closest-side, rgba(' + GLOW_RGB + ',0.26), rgba(' + GLOW_RGB + ',0) 70%)';
  }

  function init() {
    const hero = document.querySelector('header.section_hero:not(.is-secondary)');
    if (!hero || !hero.querySelector('.is-home')) return;
    const textcol = hero.querySelector('.header_content') || hero.querySelector('.header-wrapper');
    const content = hero.querySelector('.padding-global');
    if (!textcol || !content) return;
    if (hero.querySelector('.cagdas-hero-bg')) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let bp = { rest: 0.5, bright: 0.25, parallax: 0.3, glowPar: 0, glowShiftY: 0, hideAt: 0.32, hideSpan: 0.6, glowRest: 0.28, glowBloom: 0.2, glowMul: 1.0, drift: 1.0, driftSpan: 0.85, fadeStart: 0.1, fadeSpan: 0.55, playEnd: 0.42 };
    let badgeHosts = null;
    let wcOn = true;

    // ---- Background layers (glow behind, portrait canvas in front). ----
    const bg = document.createElement('div');
    bg.className = 'cagdas-hero-bg';
    bg.setAttribute('aria-hidden', 'true');
    bg.style.cssText = 'position:absolute;inset:0;overflow:hidden;z-index:0;pointer-events:none;opacity:0';

    const glow = document.createElement('div');
    glow.style.cssText = 'position:absolute;inset:0;z-index:0;transform-origin:50% 50%;will-change:opacity';
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
    const canvas = document.createElement('canvas');
    canvas.width = FRAME_W; canvas.height = FRAME_H;
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    const ctx = canvas.getContext('2d');
    living.appendChild(canvas);
    photo.appendChild(living);
    bg.appendChild(glow);
    bg.appendChild(photo);

    content.style.position = 'relative';
    content.style.zIndex = '2';
    hero.appendChild(bg);

    // ---- Preload the transparent frame sequence. Scrubbing draws decoded frames to the
    //      canvas (no src-swap hitch). drawFrame falls back to the last ready frame if a frame
    //      isn't decoded yet (fast scroll during preload), so it never blanks. ----
    const imgs = new Array(FRAME_COUNT);
    let lastDrawn = -1;
    for (let i = 0; i < FRAME_COUNT; i++) { const im = new Image(); im.decoding = 'async'; im.src = frameURL(i); imgs[i] = im; }
    function ready(im) { return im && im.complete && im.naturalWidth > 0; }
    function drawFrame(idx) {
      if (idx < 0) idx = 0; else if (idx >= FRAME_COUNT) idx = FRAME_COUNT - 1;
      let im = imgs[idx];
      if (!ready(im)) { if (lastDrawn < 0) { im = imgs[0]; if (!ready(im)) return; } else return; }
      else lastDrawn = idx;
      ctx.clearRect(0, 0, FRAME_W, FRAME_H);
      ctx.drawImage(im, 0, 0, FRAME_W, FRAME_H);
    }

    function computeBp() {
      const w = window.innerWidth, vh = window.innerHeight;
      let ph, pb;
      if (w >= 992) {                 // desktop — UNCHANGED (approved): static glow, slow content fade
        ph = 'min(82vh, 90vw, 920px)'; pb = '0';
        bp = { rest: 0.5,  bright: 0.25, parallax: 0.30, glowPar: 0,    glowShiftY: 0,    hideAt: 0.32, hideSpan: 0.60, glowRest: 0.28, glowBloom: 0.20, glowMul: 1.0,  drift: 1.0,  driftSpan: 0.85, fadeStart: 0.10, fadeSpan: 0.55, playEnd: 0.42 };
      } else if (vh < 560) {          // landscape phones / short viewports
        ph = 'min(90vh, 78vw)'; pb = '4vh';
        bp = { rest: 0.40, bright: 0.17, parallax: 0.40, glowPar: 0.40, glowShiftY: 0.12, hideAt: 0.42, hideSpan: 0.56, glowRest: 0, glowBloom: 0.85, glowMul: 0.95, drift: 0.7,  driftSpan: 0.42, fadeStart: 0.03, fadeSpan: 0.22, playEnd: 0.52 };
      } else if (w >= 768) {          // tablet portrait
        ph = 'min(90vh, 108vw)'; pb = '9vh';
        bp = { rest: 0.40, bright: 0.18, parallax: 0.42, glowPar: 0.42, glowShiftY: 0.15, hideAt: 0.42, hideSpan: 0.56, glowRest: 0, glowBloom: 0.85, glowMul: 0.98, drift: 0.85, driftSpan: 0.42, fadeStart: 0.03, fadeSpan: 0.22, playEnd: 0.52 };
      } else if (w >= 480) {          // large phone
        ph = 'min(88vh, 132vw)'; pb = '9vh';
        bp = { rest: 0.38, bright: 0.17, parallax: 0.45, glowPar: 0.45, glowShiftY: 0.16, hideAt: 0.44, hideSpan: 0.55, glowRest: 0, glowBloom: 0.85, glowMul: 0.95, drift: 0.7,  driftSpan: 0.42, fadeStart: 0.03, fadeSpan: 0.22, playEnd: 0.54 };
      } else {                        // phone
        ph = 'min(86vh, 150vw)'; pb = '9vh';
        bp = { rest: 0.36, bright: 0.16, parallax: 0.48, glowPar: 0.48, glowShiftY: 0.16, hideAt: 0.45, hideSpan: 0.55, glowRest: 0, glowBloom: 0.85, glowMul: 0.92, drift: 0.6,  driftSpan: 0.42, fadeStart: 0.03, fadeSpan: 0.22, playEnd: 0.54 };
      }
      photo.style.height = ph;
      photo.style.bottom = pb;
    }
    computeBp();

    function driveBadge(driftY, fade) {
      if (badgeHosts === null) {
        const n = document.querySelectorAll('.webflow_badge');
        if (!n.length) return;
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

    function apply(s) {
      const vh = window.innerHeight || 1;
      drawFrame(Math.round(clamp(s / bp.playEnd) * (FRAME_COUNT - 1)));   // <-- front-loaded scrub: whole clip plays by s=playEnd, before the dissolve
      const bright = smoothstep(clamp(s / 0.3));
      const hide = smoothstep(clamp((s - bp.hideAt) / bp.hideSpan));
      const wantWC = hide < 0.995;
      if (wantWC !== wcOn) {
        wcOn = wantWC;
        photo.style.willChange = wantWC ? 'opacity,transform' : '';
        glow.style.willChange = wantWC ? 'opacity,transform' : '';
      }
      const lag = s * vh * bp.parallax;
      photo.style.opacity = String((bp.rest + bp.bright * bright) * (1 - hide));
      photo.style.transform = 'translate(' + PHOTO_TX + ',' + lag + 'px)';
      glow.style.opacity = String(clamp((bp.glowRest + bp.glowBloom * bright) * (1 - hide)));
      glow.style.transform = 'translate(0,' + ((bp.glowShiftY + s * bp.glowPar) * vh) + 'px) scale(' + (1.25 * bp.glowMul) + ')';
      const driftY = -smoothstep(clamp(s / bp.driftSpan)) * TEXT_DRIFT_PX * bp.drift;
      const fade = smoothstep(clamp((s - bp.fadeStart) / bp.fadeSpan));
      textcol.style.transform = 'translateY(' + driftY + 'px)';
      textcol.style.opacity = String(1 - fade);
      driveBadge(driftY, fade);
    }

    function loop(el, frames, dur, opts) {
      if (!el.animate) return;
      const o = { duration: dur, iterations: Infinity, easing: 'ease-in-out' };
      if (opts) for (const k in opts) o[k] = opts[k];
      try { el.animate(frames, o); } catch (e) {}
    }

    // ---- Reduced motion: static faint hero (frame 0), no scroll animation, no entrance. ----
    if (reduce) {
      bg.style.opacity = '1';
      if (ready(imgs[0])) drawFrame(0); else imgs[0].addEventListener('load', function () { drawFrame(0); }, { once: true });
      apply(0);
      return;
    }

    window.__cagdasHeroFadesBadge = true;

    loop(glowA, [{ transform: 'scale(1)' }, { transform: 'scale(1.07)' }, { transform: 'scale(1)' }], 11000);
    loop(glowB, [{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], 14000);

    // ---- Entrance: once frame 0 is decoded, draw it, fade the bg in (~1300ms) and gently rise+settle. ----
    (function revealBg() {
      let shown = false;
      function reveal() {
        if (shown) return;
        shown = true;
        drawFrame(0);
        bg.style.transition = 'opacity 1300ms cubic-bezier(0.22,1,0.36,1)';
        void bg.offsetWidth;
        bg.style.opacity = '1';
        loop(living,
          [{ transform: 'translateY(22px) scale(1.03)' }, { transform: 'translateY(0) scale(1)' }],
          1500, { iterations: 1, fill: 'forwards', easing: 'cubic-bezier(0.22,1,0.36,1)' });
        bg.addEventListener('transitionend', function te(ev) {
          if (ev.propertyName !== 'opacity') return;
          bg.removeEventListener('transitionend', te);
          bg.style.transition = '';
        });
      }
      const f0 = imgs[0];
      if (f0.decode) { f0.decode().then(reveal).catch(function () {}); }
      if (ready(f0)) { setTimeout(reveal, 0); }
      else { f0.addEventListener('load', reveal, { once: true }); f0.addEventListener('error', reveal, { once: true }); }
      setTimeout(reveal, 1200);
    })();

    // ---- Scroll driver: lerp-smoothed rAF loop (≈ GSAP scrub). ----
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
    wake();
  }

  init();
})();
