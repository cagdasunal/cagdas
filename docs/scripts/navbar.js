/*!
 * navbar.js — full-screen mobile navigation for cagd.as
 *
 * Drives the custom tablet/mobile menu built in Webflow inside the `Nav / Top`
 * component (the `.navbar_component` Webflow Navbar). BEHAVIOUR ONLY — every
 * pixel of the CLOSED / base / responsive styling lives in Webflow classes
 * (`.nav_burger`, `.nav_burger-line`, `.nav_overlay`, `.nav_overlay-link`,
 * `.nav_overlay-cta`). This bundle injects NO <style> and contains NO CSS
 * rules. It toggles the menu open/closed and applies the OPEN-state visuals
 * INLINE — because Webflow strips runtime-only combo classes (`.x.is-open`)
 * from the published CSS, so open-state visuals cannot live in a class (the
 * same gotcha solved in faq.js). The base classes supply the easing via their
 * `transition:` declarations; this script just flips the inline target values.
 *
 * The trigger (`.nav_burger`) is the Navbar's existing "Menu Button"
 * (`.w-nav-button`) restyled as a two-line burger — NOT a new element. Webflow
 * binds its own navbar handler to that button (which would open the native,
 * hidden `.w-nav-menu`), so the click/keydown listeners below run in the
 * CAPTURE phase and call stopImmediatePropagation() to suppress it: this script
 * is the sole controller of the menu.
 *
 * Desktop is untouched: `.nav_burger` / `.nav_overlay` are `display:none` on
 * the main breakpoint and only appear at `@media (max-width:991px)`. The
 * existing horizontal `.navbar_menu` keeps working > 991px and is hidden
 * (`.w-nav-menu{display:none}`) ≤ 991px by Webflow's own navbar CSS, so the
 * two menus never coexist.
 *
 * Webflow CSS contract (set on the classes in Designer — the script depends on
 * these and does NOT create them):
 *   .nav_overlay         { opacity:0; visibility:hidden; transition:opacity/visibility; }  (≤991px)
 *   .nav_overlay-link    { opacity:0; transform:translateY(38px); transition:transform/opacity/color; }
 *   .nav_overlay-cta     { opacity:0; transform:translateY(38px); transition:transform/opacity/color; }
 *   .nav_burger-line     { transition:transform; }  (nth-child(odd) → translateY(-4px), nth-child(even) → translateY(4px))
 *
 * a11y: the burger is a role="button" (Enter/Space activate), the overlay is a
 * dialog (aria-modal, tabindex=-1, focused on open, focus returned to the burger
 * on close); Escape closes; resizing back to desktop closes + unlocks scroll.
 * Honors prefers-reduced-motion (instant, no stagger). Guard: __cagdasNavbar.
 *
 * SSOT: sites/cagdas/scripts/src/navbar.js
 * Build: python3 scripts/site_deploy.py build --site cagdas --src navbar
 * Design source: Claude Design "cagd.as Design System" → full-screen menu embed.
 */
(function () {
  'use strict';

  if (window.__cagdasNavbar) return; // guard against double-load
  window.__cagdasNavbar = true;

  const burger = document.querySelector('.nav_burger');
  const overlay = document.querySelector('.nav_overlay');
  if (!burger || !overlay) return;

  const links = Array.prototype.slice.call(
    overlay.querySelectorAll('.nav_overlay-link')
  );
  const cta = overlay.querySelector('.nav_overlay-cta');
  const reveals = cta ? links.concat([cta]) : links.slice();
  const burgerLines = burger.querySelectorAll('.nav_burger-line');
  const topLine = burgerLines[0] || null;
  const botLine = burgerLines[1] || null;

  const reduce =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reduced motion: kill every transition once so each toggle is instant. The
  // open/close logic below is identical — it just lands without animating.
  if (reduce) {
    overlay.style.transition = 'none';
    reveals.forEach((el) => { el.style.transition = 'none'; });
    if (topLine) topLine.style.transition = 'none';
    if (botLine) botLine.style.transition = 'none';
  }

  let isOpen = false;

  // Two parallel lines (translateY ±4) morph into an X (rotate ±45). Inline so
  // the open state survives Webflow's runtime-combo pruning.
  function paintLines(open) {
    if (topLine) topLine.style.transform = open ? 'rotate(45deg)' : 'translateY(-4px)';
    if (botLine) botLine.style.transform = open ? 'rotate(-45deg)' : 'translateY(4px)';
  }

  // Staggered reveal of the links then the CTA. Delays only on the way in.
  function paintReveals(open) {
    links.forEach((link, i) => {
      link.style.transitionDelay = open && !reduce ? (0.1 + i * 0.05).toFixed(2) + 's' : '0s';
      link.style.opacity = open ? '1' : '0';
      link.style.transform = open ? 'translateY(0)' : 'translateY(38px)';
    });
    if (cta) {
      cta.style.transitionDelay = open && !reduce ? '0.42s' : '0s';
      cta.style.opacity = open ? '1' : '0';
      cta.style.transform = open ? 'translateY(0)' : 'translateY(38px)';
    }
  }

  function setOpen(open) {
    isOpen = open;
    overlay.style.opacity = open ? '1' : '0';
    overlay.style.visibility = open ? 'visible' : 'hidden';
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : ''; // scroll lock
    paintLines(open);
    paintReveals(open);
    // Move focus into the dialog on open, back to the burger on close.
    if (open) {
      try { overlay.focus({ preventScroll: true }); } catch (e) { overlay.focus(); }
    } else if (overlay.contains(document.activeElement)) {
      try { burger.focus({ preventScroll: true }); } catch (e) { burger.focus(); }
    }
  }

  // Capture phase + stopImmediatePropagation: take the click before Webflow's
  // own navbar handler runs, so the native (hidden) menu never toggles.
  burger.addEventListener('click', (e) => {
    e.stopImmediatePropagation();
    e.preventDefault();
    setOpen(!isOpen);
  }, true);
  burger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      e.stopImmediatePropagation();
      setOpen(!isOpen);
    }
  }, true);

  // Tapping any link / the CTA closes the overlay; navigation then proceeds.
  reveals.forEach((el) => {
    el.addEventListener('click', () => { setOpen(false); });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) setOpen(false);
  });

  // If the viewport grows back to desktop while open, close + unlock scroll so
  // the desktop nav isn't left behind a locked body.
  window.addEventListener('resize', () => {
    if (isOpen && window.innerWidth > 991) setOpen(false);
  });

  // Explicit closed baseline — never rely on CSS alone for the runtime bits.
  setOpen(false);
})();
