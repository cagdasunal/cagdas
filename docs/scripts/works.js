/*!
 * works.js — mobile "View details" toggle for cagd.as portfolio items
 *
 * On phones (<= 767px: Webflow's "small" landscape + "tiny" portrait
 * breakpoints) the extra project-detail block (.work-bottom) is collapsed by
 * default so the work list scans fast. A per-item details button
 * (.button_details, sitting next to the "View the website" link) reveals THAT
 * one item's .work-bottom and removes itself + its "or" separator
 * (.button_or). Desktop (> 767px) is untouched — the details always show and
 * the script clears anything it set.
 *
 * BEHAVIOUR ONLY — no <style> is injected and no CSS rules are created. The
 * collapse/reveal is animated with inline styles the script owns (a height +
 * opacity tween — the one thing CSS can't measure on its own), exactly like
 * faq.js. The hidden state of .work-bottom is the Webflow `.hide` utility
 * class (added/removed per the spec — and because Webflow class membership is
 * global, hiding .work-bottom on mobile-only is impossible in Designer, which
 * is why this runs in JS). The two buttons are hidden via script-owned inline
 * styles instead of a class, so the page's own responsive styling on them is
 * never clobbered on reset.
 *
 * Per-item scoping (multiple identically-named elements on the page): each
 * .button_details is paired with the .work-bottom and .button_or inside its
 * OWN item — the nearest ancestor that contains a .work-bottom — so the
 * repeated elements never cross-trigger.
 *
 * Webflow markup it expects (classes assigned in Designer):
 *   <item wrapper>                     one repeating project (CMS item or div)
 *     ... title / image ...
 *       a.button  "View the website"   the existing project link  (kept)
 *       .button_or                     the "or" separator         (hidden on reveal)
 *       .button_details                the NEW reveal button       (hidden on reveal)
 *     .work-bottom                     the detail block            (collapsed on mobile)
 * Contract: .button_details and .work-bottom MUST share one item wrapper, and
 * .button_details MUST sit OUTSIDE .work-bottom (else revealing hides itself).
 * An item whose .button_details has no .work-bottom is skipped (nothing to
 * reveal), so a partial rollout is safe.
 *
 * Honors prefers-reduced-motion (instant, no tween). Idempotent guard
 * __cagdasWorks. Self-contained — zero dependencies, zero requests.
 *
 * Webflow usage: load in the footer / before </body>, or with defer:
 *   <script src="https://files.cagd.as/scripts/works.min.js" defer></script>
 *
 * SSOT:  sites/cagdas/scripts/src/works.js
 * Build: python3 scripts/site_deploy.py build --site cagdas --src works
 */
(function () {
  'use strict';

  if (window.__cagdasWorks) return; // guard against double-load
  window.__cagdasWorks = true;

  const MOBILE = '(max-width: 767px)'; // Webflow "small" (landscape) + "tiny" (portrait)
  const HIDE = 'hide';                 // existing Webflow utility class (display:none)
  const REVEAL_MS = 360;               // .work-bottom expand tween
  const FADE_MS = 200;                 // .button_details / .button_or fade-out

  const reduce =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const triggers = Array.prototype.slice.call(
    document.querySelectorAll('.button_details')
  );
  if (!triggers.length) return;

  // --- pair each trigger with its own item's detail block + "or" separators ---
  // Walk up to the nearest ancestor that contains a .work-bottom: for a
  // per-item wrapper (CMS item or duplicated div) that ancestor is the item,
  // so its .work-bottom / .button_or belong to this trigger and no other.
  function itemRootOf(trigger) {
    let node = trigger.parentElement;
    while (node && node !== document.body) {
      if (node.querySelector('.work-bottom')) return node;
      node = node.parentElement;
    }
    return null;
  }

  const pairs = [];
  triggers.forEach(function (trigger) {
    const root = itemRootOf(trigger);
    const wb = root ? root.querySelector('.work-bottom') : null;
    if (!wb) return; // no detail block in this item — nothing to toggle
    pairs.push({
      trigger: trigger,
      wb: wb,
      ors: root
        ? Array.prototype.slice.call(root.querySelectorAll('.button_or'))
        : [],
      revealed: false
    });
  });
  if (!pairs.length) return;

  function clearTween(el) {
    if (el && el._wdTimer) {
      window.clearTimeout(el._wdTimer);
      el._wdTimer = null;
    }
  }

  // Expand .work-bottom: remove .hide, then tween height 0 -> content + fade in.
  function showDetail(wb) {
    wb.classList.remove(HIDE);
    clearTween(wb);
    if (reduce) {
      wb.style.height = '';
      wb.style.overflow = '';
      wb.style.opacity = '';
      wb.style.transition = '';
      return;
    }
    wb.style.overflow = 'hidden';
    wb.style.opacity = '0';
    wb.style.height = '0px';
    wb.style.transition = 'none';
    void wb.offsetHeight; // commit the collapsed start frame before transitioning
    wb.style.transition =
      'height ' + REVEAL_MS + 'ms ease, opacity ' + REVEAL_MS + 'ms ease';
    wb.style.height = wb.scrollHeight + 'px';
    wb.style.opacity = '1';
    const settle = function () {
      clearTween(wb);
      wb.removeEventListener('transitionend', wb._wdDone);
      wb._wdDone = null;
      wb.style.height = 'auto'; // let it reflow naturally after the tween
      wb.style.overflow = '';
      wb.style.transition = '';
    };
    const done = function (e) {
      if (e.target !== wb || e.propertyName !== 'height') return; // ignore child bubbling
      settle();
    };
    wb._wdDone = done;
    wb.addEventListener('transitionend', done);
    wb._wdTimer = window.setTimeout(settle, REVEAL_MS + 120); // fallback if no transitionend
  }

  // Fade the reveal button + its "or" separator out, then drop them from layout.
  function hideButtons(els) {
    els.forEach(function (el) {
      clearTween(el);
      if (reduce) {
        el.style.display = 'none';
        return;
      }
      el.style.transition =
        'opacity ' + FADE_MS + 'ms ease, transform ' + FADE_MS + 'ms ease';
      el.style.opacity = '0';
      el.style.transform = 'scale(0.92)';
      const settle = function () {
        clearTween(el);
        el.removeEventListener('transitionend', el._wdDone);
        el._wdDone = null;
        el.style.display = 'none'; // reclaim the row space once faded
      };
      const done = function (e) {
        if (e.target !== el || e.propertyName !== 'opacity') return;
        settle();
      };
      el._wdDone = done;
      el.addEventListener('transitionend', done);
      el._wdTimer = window.setTimeout(settle, FADE_MS + 80);
    });
  }

  // Clear every inline style the script set on the buttons → hand control back
  // to the page's own CSS (e.g. a responsive .hide on .button_details).
  function restoreButtons(p) {
    [p.trigger].concat(p.ors).forEach(function (el) {
      clearTween(el);
      el.style.display = '';
      el.style.opacity = '';
      el.style.transform = '';
      el.style.transition = '';
    });
  }

  // Mobile default: collapse the detail block (.hide) and ensure the buttons
  // are visible. Instant — this is the resting state, not an interaction.
  function collapse(p) {
    clearTween(p.wb);
    p.wb.style.height = '';
    p.wb.style.overflow = '';
    p.wb.style.opacity = '';
    p.wb.style.transition = '';
    p.wb.classList.add(HIDE);
    restoreButtons(p);
  }

  // Desktop (or leaving mobile): details always shown, nothing the script set lingers.
  function reset(p) {
    clearTween(p.wb);
    p.wb.classList.remove(HIDE);
    p.wb.style.height = '';
    p.wb.style.overflow = '';
    p.wb.style.opacity = '';
    p.wb.style.transition = '';
    restoreButtons(p);
    p.revealed = false;
  }

  // Media query that gates the whole feature to phones — drives both the reveal
  // guard below and the collapse/reset state machine.
  const mql = window.matchMedia(MOBILE);

  // --- wire up the triggers (click + keyboard, since .button_details is a div) ---
  pairs.forEach(function (p) {
    const t = p.trigger;
    t.setAttribute('role', 'button');
    if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '0');
    t.setAttribute('aria-expanded', 'false');
    function reveal() {
      if (p.revealed || !mql.matches) return; // only toggles while on mobile (<=767px)
      p.revealed = true;
      t.setAttribute('aria-expanded', 'true');
      showDetail(p.wb);
      hideButtons([p.trigger].concat(p.ors));
    }
    t.addEventListener('click', function (e) {
      e.preventDefault();
      reveal();
    });
    t.addEventListener('keydown', function (e) {
      if (e.repeat) return;
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        reveal();
      }
    });
  });

  // --- breakpoint state: only active <= 767px; desktop stays pristine ---
  function apply() {
    pairs.forEach(function (p) {
      if (mql.matches) {
        if (!p.revealed) collapse(p); // keep an opened one open
      } else {
        reset(p);
      }
    });
  }
  apply();
  if (mql.addEventListener) mql.addEventListener('change', apply);
  else if (mql.addListener) mql.addListener(apply); // Safari < 14
})();
