/*!
 * audio-player.js — "Play and hear how I say Çağdaş" button for cagd.as
 *
 * Drops a text + icon play button into every .audio-wrapper on the page.
 *   Idle  : a soft breathing blue glow behind a play arrow, beside a grey label.
 *   Hover : whole row is clickable; icon grows slowly (scale 1.16), the breathe
 *           stops, the arrow + text ease to grey (#8f8f8f), the glow fades.
 *   Click : the arrow spins away while the label dissolves left→right and a
 *           full-width waveform wipes in from the icon's position, waving for the
 *           length of the clip; it all reverses (right→left) when the clip ends.
 *           Clicking again while playing is ignored (per the design).
 * No deps — it injects its own scoped CSS + HTML and builds the waveform in JS.
 *
 * Design source: Claude Design "cagd.as Design System"
 *   → ui_kits/website/voice-play.html (accent #146EF5, clip-path wipe).
 *
 * Webflow usage:
 *   1. Add an empty div with class  audio-wrapper
 *   2. Load this bundle (footer / before </body>, or with defer):
 *        <script src="https://files.cagd.as/scripts/audio-player.min.js" defer></script>
 * Optional per-instance attributes on the .audio-wrapper:
 *   data-audio-src="https://files.cagd.as/audio/your-clip.m4a"
 *   data-label="Play and hear how I say Çağdaş"   (visible text + aria-label)
 *
 * SSOT: sites/cagdas/scripts/src/audio-player.js
 * Build: python3 scripts/site_deploy.py build --site cagdas --src audio-player
 */
(function () {
  'use strict';

  if (window.__cagdasAudioPlayer) return; // guard against double-load
  window.__cagdasAudioPlayer = true;

  const DEFAULT_AUDIO = 'https://files.cagd.as/audio/cagdas-name.m4a';
  const DEFAULT_LABEL = 'Play and hear how I say Çağdaş';
  const STYLE_ID = 'cagdas-audio-player-styles';
  const WAVE_BARS = 34;

  // Component CSS, scoped under .audio-wrapper so nothing leaks into the page.
  // Ported from ui_kits/website/voice-play.html (accent #146EF5 = rgb(20,110,245);
  // label inherits the page font). Reduced-motion override uses matching specificity
  // placed last instead of !important.
  const CSS = `
.audio-wrapper .voice-play{position:relative;display:inline-flex;align-items:center;background:transparent;border:0;padding:0;margin:0;cursor:pointer;color:#595959;font-family:inherit;font-size:.9rem;font-weight:300;line-height:1;transition:color .45s cubic-bezier(.4,0,.2,1);-webkit-tap-highlight-color:transparent}
.audio-wrapper .voice-play:hover{color:#8f8f8f}
.audio-wrapper .voice-play:focus-visible{outline:2px solid #146EF5;outline-offset:4px;border-radius:6px}
.audio-wrapper .vp-content{display:inline-flex;align-items:center;gap:.7rem}
.audio-wrapper .voice-icon{position:relative;width:20px;height:20px;flex:none;display:inline-flex;align-items:center;justify-content:center;transform-origin:center;transition:transform .7s cubic-bezier(.22,1,.36,1),opacity .45s ease}
.audio-wrapper .voice-play:hover .voice-icon{transform:scale(1.16)}
.audio-wrapper .voice-play.is-playing .voice-icon{opacity:0;transform:scale(0.3) rotate(-20deg);transition:transform .45s cubic-bezier(.5,0,.18,1),opacity .35s ease}
.audio-wrapper .vp-glow{position:absolute;top:50%;left:50%;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(20,110,245,0.75) 0%,rgba(20,110,245,0.32) 42%,rgba(20,110,245,0) 72%);filter:blur(2.5px);opacity:.5;transform:scale(0.7);transition:opacity .5s cubic-bezier(.4,0,.2,1);animation:vpGlow 3.4s ease-in-out infinite}
@keyframes vpGlow{0%,100%{opacity:.5;transform:scale(0.65)}50%{opacity:.95;transform:scale(1.2)}}
.audio-wrapper .voice-play:hover .vp-glow,.audio-wrapper .voice-play.is-playing .vp-glow{animation:none;opacity:0}
.audio-wrapper .vp-play{position:absolute;inset:0;margin:auto;transform-origin:center;display:inline-flex;align-items:center;justify-content:center}
.audio-wrapper .vp-play svg{display:block;transform-origin:center;fill:#146EF5;stroke:#146EF5;animation:vpBreathe 3.4s ease-in-out infinite;transition:transform .7s cubic-bezier(.22,1,.36,1),fill .45s ease,stroke .45s ease}
@keyframes vpBreathe{0%,100%{transform:scale(1.05);filter:drop-shadow(0 0 3px rgba(20,110,245,0.4))}50%{transform:scale(0.72);filter:drop-shadow(0 0 1px rgba(20,110,245,0.15))}}
.audio-wrapper .voice-play:hover .vp-play svg{animation:none;transform:scale(1);fill:#8f8f8f;stroke:#8f8f8f}
.audio-wrapper .vp-label{display:block;white-space:nowrap;user-select:none;clip-path:inset(-25% 0% -25% 0%);transition:clip-path .6s cubic-bezier(.5,0,.18,1)}
.audio-wrapper .voice-play.is-playing .vp-label{clip-path:inset(-25% 0% -25% 100%)}
.audio-wrapper .vp-wave{position:absolute;inset:0;pointer-events:none;display:flex;align-items:center;justify-content:space-between;clip-path:inset(-25% 100% -25% 0%);transition:clip-path .6s cubic-bezier(.5,0,.18,1)}
.audio-wrapper .voice-play.is-playing .vp-wave{clip-path:inset(-25% 0% -25% 0%)}
.audio-wrapper .vp-wave i{width:2px;background:#146EF5;border-radius:2px;transform-origin:center;transform:scaleY(0.18)}
.audio-wrapper .voice-play.is-playing .vp-wave i{animation:vpWave 1.1s ease-in-out infinite}
@keyframes vpWave{0%,100%{transform:scaleY(0.18)}50%{transform:scaleY(1)}}
@media (prefers-reduced-motion:reduce){
.audio-wrapper .vp-play svg,.audio-wrapper .vp-glow{animation:none}
.audio-wrapper .voice-play.is-playing .vp-wave i{animation:none}
.audio-wrapper .vp-glow{opacity:.4}
}`;

  // Provided "ICON PLAY" artwork (viewBox 0 0 800 800); fill/stroke come from CSS
  // so they can transition to grey on hover.
  const PLAY_PATH = 'm186.4 758.4c-22.9 0-45.7-6.1-66.3-18.4-38.7-23-61.8-63.3-61.8-107.8v-232.2c0-13.8 11.2-25 25-25s25 11.2 25 25v232.2c0 26.7 14 50.9 37.3 64.8 24.4 14.5 53.9 15.1 78.9 1.5l106.8-58.1c12.1-6.6 27.3-2.1 33.9 10s2.1 27.3-10 33.9l-106.8 58.1c-19.5 10.7-40.7 16-62 16zm263.7-129c-8.9 0-17.5-4.7-22-13.1-6.6-12.1-2.1-27.3 10-33.9l213.5-116.1c25-13.6 40-38.4 40-66.3s-15-52.7-40-66.3l-427-232.2c-25-13.6-54.5-13-78.9 1.5-23.4 13.9-37.3 38.1-37.3 64.8v98.9c0 13.8-11.2 25-25 25s-25-11.2-25-25v-98.9c0-44.5 23.1-84.8 61.8-107.8 39.7-23.6 87.7-24.5 128.4-2.5l427.1 232.2c41.4 22.5 66.1 63.7 66.1 110.2s-24.7 87.7-66.1 110.2l-213.7 116.2c-3.8 2.1-7.9 3.1-11.9 3.1z';

  const CONTENT_HTML =
    '<span class="vp-content">' +
      '<span class="voice-icon" aria-hidden="true">' +
        '<span class="vp-glow"></span>' +
        '<span class="vp-play">' +
          '<svg viewBox="0 0 800 800" width="20" height="20" stroke-width="34" stroke-linejoin="round"><path d="' + PLAY_PATH + '"></path></svg>' +
        '</span>' +
      '</span>' +
      '<span class="vp-label"></span>' +
    '</span>' +
    '<span class="vp-wave" aria-hidden="true"></span>';

  // Build the full-width waveform: bars taller toward the middle (organic envelope),
  // staggered negative delays so the wave travels left→right. Heights stay within the
  // text line. Computed (dynamic) inline styles — allowed per rules/webflow-javascript.md §1.
  function buildWave(wave) {
    const N = WAVE_BARS;
    for (let i = 0; i < N; i++) {
      const bar = document.createElement('i');
      const env = 0.45 + 0.55 * Math.sin((i / (N - 1)) * Math.PI);
      const jitter = 0.55 + 0.45 * Math.abs(Math.sin(i * 1.7));
      const h = Math.round(7 + 9 * env * jitter); // 7–16px
      bar.style.height = h + 'px';
      bar.style.animationDelay = (-(i * 0.05)).toFixed(3) + 's';
      bar.style.animationDuration = (0.9 + (i % 5) * 0.06).toFixed(2) + 's';
      wave.appendChild(bar);
    }
  }

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

    // Reuse an author-provided .voice-play if present; otherwise build it.
    let btn = wrapper.querySelector('.voice-play');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'voice-play';
      btn.innerHTML = CONTENT_HTML;
      btn.querySelector('.vp-label').textContent = label; // textContent — never inject as HTML
      buildWave(btn.querySelector('.vp-wave'));
      wrapper.appendChild(btn);
    } else if (!btn.getAttribute('type')) {
      btn.setAttribute('type', 'button');
    }
    btn.setAttribute('aria-label', label);

    // Eager audio (preload auto) so the first real click plays instantly.
    const audio = new Audio(src);
    audio.preload = 'auto';

    function stop() {
      btn.classList.remove('is-playing');
      if (current === audio) current = null;
    }
    audio.addEventListener('ended', stop);
    audio.addEventListener('pause', stop); // covers cross-instance interruption
    audio.addEventListener('error', function () {
      stop();
      if (window.console && console.warn) {
        console.warn('[audio-player] could not load ' + src);
      }
    });

    btn.addEventListener('click', function () {
      if (btn.classList.contains('is-playing')) return; // ignore while playing
      if (current && current !== audio) {
        try { current.pause(); } catch (e) {}
      }
      current = audio;
      btn.classList.add('is-playing');
      try { audio.currentTime = 0; } catch (e) {}
      const p = audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(stop);
      }
    });
  }

  function init() {
    injectStyles();
    const wrappers = document.querySelectorAll('.audio-wrapper');
    for (let i = 0; i < wrappers.length; i++) setup(wrappers[i]);
  }

  // Loaded with `defer` or in the footer, so the DOM is already parsed.
  init();
})();
