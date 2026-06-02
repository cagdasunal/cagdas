/*!
 * audio-player.js — voice-clip play button for cagd.as
 *
 * Drops a small "play" button into every .voice-wrapper on the page. Clicking it
 * plays a short audio clip and runs a 4-bar equalizer animation for the exact
 * duration of the clip; the animation stops the moment the clip ends (or when the
 * button is clicked again). No dependencies — it injects its own CSS + HTML.
 *
 * Webflow usage:
 *   1. Add an empty div with class  voice-wrapper
 *   2. Load this bundle in the page footer (Before </body>) OR with defer:
 *        <script src="https://files.cagd.as/scripts/audio-player.min.js" defer></script>
 *
 * Optional per-instance overrides (attributes on the .voice-wrapper element):
 *   data-audio-src="https://files.cagd.as/audio/your-clip.m4a"
 *   data-label="Hear how I say Çağdaş"
 *
 * Colors / sizes match the approved preview: accent #4452fb, 28x16 visual,
 * 3px bars, 16px tall, scaleY(.3 -> 1) pulse. Honors prefers-reduced-motion.
 *
 * SSOT: sites/cagdas/scripts/src/audio-player.js (monorepo).
 * Build:  python3 scripts/site_deploy.py build --site cagdas --src audio-player
 */
(function () {
  'use strict';

  if (window.__cagdasAudioPlayer) return; // guard against double-load
  window.__cagdasAudioPlayer = true;

  const DEFAULT_AUDIO = 'https://files.cagd.as/audio/cagdas-name.m4a';
  const DEFAULT_LABEL = 'Hear how I say Çağdaş';
  const STYLE_ID = 'voice-player-styles';

  // All component CSS, scoped under .voice-wrapper so it can't leak into the page.
  const CSS = [
    '.voice-wrapper .voice-trigger{display:inline-flex;align-items:center;gap:.5rem;background:none;border:0;padding:0;margin:0;font:inherit;font-size:.875rem;letter-spacing:.01em;color:#8a8a8a;cursor:pointer;-webkit-tap-highlight-color:transparent}',
    '.voice-wrapper .voice-trigger:hover{color:#cfcfcf}',
    '.voice-wrapper .voice-trigger:focus-visible{outline:2px solid #4452fb;outline-offset:4px;border-radius:4px}',
    '.voice-wrapper .voice-visual{display:inline-flex;align-items:center;width:28px;height:16px;color:#4452fb}',
    '.voice-wrapper .voice-icon{display:inline-flex;align-items:center;line-height:0}',
    '.voice-wrapper .voice-icon svg{width:13px;height:13px;display:block}',
    '.voice-wrapper .voice-bars{display:none;align-items:center;gap:5px;height:16px}',
    '.voice-wrapper .voice-line{width:3px;height:100%;border-radius:3px;background:#4452fb;transform-origin:center;transform:scaleY(.3)}',
    '.voice-wrapper .voice-trigger.is-playing .voice-icon{display:none}',
    '.voice-wrapper .voice-trigger.is-playing .voice-bars{display:inline-flex}',
    '.voice-wrapper .voice-trigger.is-playing .voice-line{animation:voice-pulse 1.4s ease-in-out infinite}',
    '.voice-wrapper .voice-trigger.is-playing .voice-line:nth-child(1){animation-duration:1.5s;animation-delay:0s}',
    '.voice-wrapper .voice-trigger.is-playing .voice-line:nth-child(2){animation-duration:1.7s;animation-delay:.2s}',
    '.voice-wrapper .voice-trigger.is-playing .voice-line:nth-child(3){animation-duration:1.3s;animation-delay:.1s}',
    '.voice-wrapper .voice-trigger.is-playing .voice-line:nth-child(4){animation-duration:1.6s;animation-delay:.3s}',
    '@keyframes voice-pulse{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}',
    '@media (prefers-reduced-motion:reduce){.voice-wrapper .voice-trigger.is-playing .voice-line{animation:none;transform:scaleY(.65)}}'
  ].join('');

  // Provided "ICON PLAY" artwork (viewBox 0 0 800 800), recolored to currentColor.
  const PLAY_PATH = 'm186.4 758.4c-22.9 0-45.7-6.1-66.3-18.4-38.7-23-61.8-63.3-61.8-107.8v-232.2c0-13.8 11.2-25 25-25s25 11.2 25 25v232.2c0 26.7 14 50.9 37.3 64.8 24.4 14.5 53.9 15.1 78.9 1.5l106.8-58.1c12.1-6.6 27.3-2.1 33.9 10s2.1 27.3-10 33.9l-106.8 58.1c-19.5 10.7-40.7 16-62 16zm263.7-129c-8.9 0-17.5-4.7-22-13.1-6.6-12.1-2.1-27.3 10-33.9l213.5-116.1c25-13.6 40-38.4 40-66.3s-15-52.7-40-66.3l-427-232.2c-25-13.6-54.5-13-78.9 1.5-23.4 13.9-37.3 38.1-37.3 64.8v98.9c0 13.8-11.2 25-25 25s-25-11.2-25-25v-98.9c0-44.5 23.1-84.8 61.8-107.8 39.7-23.6 87.7-24.5 128.4-2.5l427.1 232.2c41.4 22.5 66.1 63.7 66.1 110.2s-24.7 87.7-66.1 110.2l-213.7 116.2c-3.8 2.1-7.9 3.1-11.9 3.1z';

  const VISUAL_HTML =
    '<span class="voice-visual" aria-hidden="true">' +
      '<span class="voice-icon">' +
        '<svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg"><path d="' + PLAY_PATH + '" fill="currentColor"></path></svg>' +
      '</span>' +
      '<span class="voice-bars">' +
        '<span class="voice-line"></span><span class="voice-line"></span><span class="voice-line"></span><span class="voice-line"></span>' +
      '</span>' +
    '</span>';

  // Only one clip plays at a time across all instances on the page.
  let current = null;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    (document.head || document.documentElement).appendChild(style);
  }

  function setup(wrapper) {
    if (wrapper.getAttribute('data-vp-init') === '1') return;
    wrapper.setAttribute('data-vp-init', '1');

    const src = wrapper.getAttribute('data-audio-src') || DEFAULT_AUDIO;
    const label = wrapper.getAttribute('data-label') || DEFAULT_LABEL;

    // Reuse an author-provided trigger if one exists; otherwise build it.
    let trigger = wrapper.querySelector('.voice-trigger');
    if (!trigger) {
      trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'voice-trigger';
      trigger.innerHTML = VISUAL_HTML;
      const labelSpan = document.createElement('span');
      labelSpan.className = 'voice-label';
      labelSpan.textContent = label; // textContent — never inject label as HTML
      trigger.appendChild(labelSpan);
      wrapper.appendChild(trigger);
    } else if (!trigger.getAttribute('type')) {
      trigger.setAttribute('type', 'button');
    }

    let audio = null; // created lazily on first play

    function resetUI() {
      trigger.classList.remove('is-playing');
      trigger.setAttribute('aria-pressed', 'false');
      if (current === audio) current = null;
    }

    function ensureAudio() {
      if (audio) return audio;
      audio = new Audio(src);
      audio.preload = 'none';
      audio.addEventListener('ended', resetUI);
      audio.addEventListener('pause', resetUI);
      audio.addEventListener('error', function () {
        resetUI();
        if (window.console && console.warn) {
          console.warn('[audio-player] could not load ' + src);
        }
      });
      return audio;
    }

    function start() {
      const a = ensureAudio();
      if (current && current !== a) {
        try { current.pause(); } catch (e) {}
      }
      current = a;
      trigger.classList.add('is-playing');
      trigger.setAttribute('aria-pressed', 'true');
      try { a.currentTime = 0; } catch (e) {}
      const p = a.play();
      if (p && typeof p.catch === 'function') {
        p.catch(function () { resetUI(); });
      }
    }

    trigger.setAttribute('aria-pressed', 'false');
    trigger.addEventListener('click', function () {
      if (trigger.classList.contains('is-playing')) {
        if (audio) { try { audio.pause(); } catch (e) {} }
        resetUI();
      } else {
        start();
      }
    });
  }

  function init() {
    injectStyles();
    const wrappers = document.querySelectorAll('.voice-wrapper');
    for (let i = 0; i < wrappers.length; i++) setup(wrappers[i]);
  }

  // Loaded with `defer` or in the footer, so the DOM is already parsed.
  init();
})();
