/*!
 * available-widget.js — live "available now" status + local time for cagd.as
 *
 * Keeps an availability indicator alive on every page it loads on:
 *   - .icon_available : a status dot that breathes (opacity) with an expanding
 *                       ring pulse (::before). Its box — size, green fill,
 *                       border-radius, position:relative — is set on the element
 *                       in Webflow; this only adds the breathe + ring animation.
 *   - .time_colon     : the ":" between hour and minutes breathes in sync.
 *   - .time_hour / .time_minutes / .time_period : filled with Çağdaş's current
 *                       local wall-clock (Europe/Istanbul), 12-hour, AM/PM. Hour
 *                       has no leading zero, minutes are 2-digit, period is
 *                       upper-cased. Updated on each minute boundary (the timer
 *                       re-aligns every tick + refreshes on tab re-focus) and only
 *                       when the text actually changes; element lookups are cached.
 *                       Every matching element is updated, so the widget may appear
 *                       more than once (e.g. desktop + mobile).
 *
 * Self-contained — ZERO dependencies and ZERO web requests. It injects its own
 *   scoped <style> (keyframes namespaced so they can't collide with page or
 *   other-bundle @keyframes) — an intentional, scoped exception to the "never
 *   inject <style> from JS" rule, matching badge.js / audio-player.js. No
 *   page/site CSS is touched.
 *
 * Webflow usage — give your status markup these classes, then load the bundle:
 *     .icon_available   (the dot; set its size / colour / position:relative in
 *                        Webflow so the ring anchors to it)
 *     .time_hour  .time_colon  .time_minutes  .time_period   (the clock text)
 *   Load in the footer / before </body>, or with defer:
 *     <script src="https://files.cagd.as/scripts/available-widget.min.js" defer></script>
 *
 * SSOT: sites/cagdas/scripts/src/available-widget.js
 * Build: python3 scripts/site_deploy.py build --site cagdas --src available-widget
 */
(function () {
  'use strict';

  if (window.__cagdasAvailableWidget) return; // guard against double-load
  window.__cagdasAvailableWidget = true;

  const TIME_ZONE = 'Europe/Istanbul';
  const STYLE_ID = 'cagdas-available-widget-styles';

  // Scoped status animations (look is verbatim from the design; keyframe names
  // namespaced — caw* — so they never collide with page/other-bundle keyframes).
  const CSS = [
    '.icon_available{animation:cawBreathe 3s cubic-bezier(0.4,0,0.6,1) infinite}',
    ".icon_available::before{content:'';position:absolute;inset:-4px;border-radius:50%;background:#22c55e;animation:cawRing 3s cubic-bezier(0.4,0,0.6,1) infinite}",
    '.time_colon{animation:cawBreathe 3s cubic-bezier(0.4,0,0.6,1) infinite}',
    '@keyframes cawBreathe{0%,100%{opacity:0.4}50%{opacity:1}}',
    '@keyframes cawRing{0%,100%{opacity:0;transform:scale(1.6)}40%,60%{opacity:0.3;transform:scale(1)}}'
  ].join('\n');

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    (document.head || document.documentElement).appendChild(style);
  }

  // Istanbul wall-clock, 12-hour, split into parts so each lands in its own span.
  // Built once — the formatter is reused on every tick.
  const FMT = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: TIME_ZONE
  });

  function partValue(parts, type) {
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].type === type) return parts[i].value;
    }
    return '';
  }

  // Bind a selector to its live nodes once + remember the last value written, so a
  // tick whose text is unchanged touches the DOM zero times (no needless recalc).
  function bindField(selector) {
    return { nodes: document.querySelectorAll(selector), last: null };
  }

  function writeField(field, value) {
    if (field.last === value) return;
    field.last = value;
    for (let i = 0; i < field.nodes.length; i++) field.nodes[i].textContent = value;
  }

  function init() {
    injectStyles();

    const hour = bindField('.time_hour');
    const minute = bindField('.time_minutes');
    const period = bindField('.time_period');

    function update() {
      const parts = FMT.formatToParts(new Date());
      writeField(hour, partValue(parts, 'hour'));
      writeField(minute, partValue(parts, 'minute'));
      writeField(period, partValue(parts, 'dayPeriod').toUpperCase());
    }

    // The clock shows only hours + minutes, so wake exactly on the minute boundary
    // (~60 updates/day, not ~86,400). setTimeout re-aligns to the next :00 each tick
    // (drift-free); a backgrounded tab throttles timers, so also refresh the instant
    // the tab becomes visible again.
    function tick() {
      update();
      const now = new Date();
      const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
      setTimeout(tick, msToNextMinute + 50); // +50ms to land safely past :00
    }

    tick();
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) update();
    });
  }

  // Loaded with `defer` or in the footer, so the DOM is already parsed.
  init();
})();
