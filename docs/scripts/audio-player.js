/*!
 * audio-player.js — "hear how I say Çağdaş" play button for cagd.as
 *
 * Drops an animated voice-play icon into every .audio-wrapper on the page.
 *   Idle  : a soft, breathing blue glow behind a gently contracting play arrow.
 *   Click : the arrow scales + rotates out (blur) while a 5-bar equalizer rises
 *           center-out and waves for the length of the clip.
 *   End   : it morphs back — bars drop, arrow + glow return. (Clicking again
 *           while playing is ignored, matching the design.)
 * Icon-only — the accessible name lives on the button's aria-label. No deps;
 * it injects its own scoped CSS + HTML.
 *
 * Design source: Claude Design "cagd.as Design System"
 *   → ui_kits/website/voice-play.html  (accent #146EF5, layered morph).
 *
 * Webflow usage:
 *   1. Add an empty div with class  audio-wrapper
 *   2. Load this bundle (footer / before </body>, or with defer):
 *        <script src="https://files.cagd.as/scripts/audio-player.min.js" defer></script>
 * Optional per-instance attributes on the .audio-wrapper:
 *   data-audio-src="https://files.cagd.as/audio/your-clip.m4a"
 *   data-label="Play and hear how I say Çağdaş"   (sets the aria-label)
 *
 * SSOT: sites/cagdas/scripts/src/audio-player.js
 * Build: python3 scripts/site_deploy.py build --site cagdas --src audio-player
 */
(function () {
  'use strict';

  if (window.__cagdasAudioPlayer) return; // guard against double-load
  window.__cagdasAudioPlayer = true;

  const DEFAULT_AUDIO = 'https://files.cagd.as/audio/cagdas-name.m4a';
  const DEFAULT_ARIA = 'Play and hear how I say Çağdaş';
  const STYLE_ID = 'cagdas-audio-player-styles';

  // Component CSS, scoped under .audio-wrapper so nothing leaks into the page.
  // Faithfully ported from ui_kits/website/voice-play.html (accent #146EF5 =
  // rgb(20,110,245)). Reduced-motion override uses matching specificity placed
  // last instead of !important.
  const CSS = `
.audio-wrapper .voice-play{display:inline-flex;align-items:center;line-height:0}
.audio-wrapper .vp-btn{background:transparent;border:0;padding:0;margin:0;display:inline-flex;cursor:pointer;line-height:0;-webkit-tap-highlight-color:transparent}
.audio-wrapper .vp-btn:focus-visible{outline:2px solid #146EF5;outline-offset:5px;border-radius:6px}
.audio-wrapper .voice-icon{position:relative;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;flex:none}

/* soft glow halo (idle) — draws the eye without hard outlines */
.audio-wrapper .vp-glow{position:absolute;top:50%;left:50%;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(20,110,245,0.75) 0%,rgba(20,110,245,0.32) 42%,rgba(20,110,245,0) 72%);filter:blur(2.5px);opacity:.5;transform:scale(0.7);transition:opacity .5s cubic-bezier(.4,0,.2,1);animation:vpGlow 3.4s ease-in-out infinite}
@keyframes vpGlow{0%,100%{opacity:.5;transform:scale(0.65)}50%{opacity:.95;transform:scale(1.2)}}

/* play arrow — outer wrapper does the enter/exit morph, inner svg breathes */
.audio-wrapper .vp-play{position:absolute;inset:0;margin:auto;display:inline-flex;align-items:center;justify-content:center;transform-origin:center;opacity:1;transform:scale(1) rotate(0deg);filter:blur(0px);transition:opacity .4s cubic-bezier(.4,0,.2,1),transform .55s cubic-bezier(.5,0,.18,1),filter .4s ease}
.audio-wrapper .vp-play svg{display:block;transform-origin:center;animation:vpBreathe 3.4s ease-in-out infinite}
@keyframes vpBreathe{0%,100%{transform:scale(1.05);filter:drop-shadow(0 0 3px rgba(20,110,245,0.4))}50%{transform:scale(0.72);filter:drop-shadow(0 0 1px rgba(20,110,245,0.15))}}

/* equalizer */
.audio-wrapper .vp-eq{position:absolute;inset:0;display:inline-flex;align-items:center;justify-content:center;gap:2.5px;opacity:0;transform:scale(0.78);transition:opacity .4s cubic-bezier(.4,0,.2,1),transform .5s cubic-bezier(.34,1.45,.6,1)}
.audio-wrapper .vp-bar{display:inline-flex;align-items:center;justify-content:center;opacity:0;transform:translateY(8px) scaleY(0.45);transform-origin:center;transition:opacity .35s ease,transform .5s cubic-bezier(.34,1.5,.6,1)}
.audio-wrapper .vp-bar i{display:block;width:2px;background:#146EF5;border-radius:3px;transform-origin:center}
.audio-wrapper .vp-bar:nth-child(1) i{height:6px}
.audio-wrapper .vp-bar:nth-child(2) i{height:13px}
.audio-wrapper .vp-bar:nth-child(3) i{height:20px}
.audio-wrapper .vp-bar:nth-child(4) i{height:13px}
.audio-wrapper .vp-bar:nth-child(5) i{height:6px}
@keyframes vpBar{0%,100%{transform:scaleY(0.4)}50%{transform:scaleY(1)}}

/* ENTER (playing): arrow spins/scales out, bars rise center-out, glow fades */
.audio-wrapper .voice-play.is-playing .vp-play{opacity:0;transform:scale(0.28) rotate(-22deg);filter:blur(2px)}
.audio-wrapper .voice-play.is-playing .vp-glow{animation:none;opacity:0}
.audio-wrapper .voice-play.is-playing .vp-eq{opacity:1;transform:scale(1)}
.audio-wrapper .voice-play.is-playing .vp-bar{opacity:1;transform:translateY(0) scaleY(1)}
.audio-wrapper .voice-play.is-playing .vp-bar:nth-child(3){transition-delay:.05s}
.audio-wrapper .voice-play.is-playing .vp-bar:nth-child(2),.audio-wrapper .voice-play.is-playing .vp-bar:nth-child(4){transition-delay:.11s}
.audio-wrapper .voice-play.is-playing .vp-bar:nth-child(1),.audio-wrapper .voice-play.is-playing .vp-bar:nth-child(5){transition-delay:.17s}
.audio-wrapper .voice-play.is-playing .vp-bar i{animation:vpBar 1s ease-in-out infinite}
.audio-wrapper .voice-play.is-playing .vp-bar:nth-child(1) i{animation-duration:.95s;animation-delay:.30s}
.audio-wrapper .voice-play.is-playing .vp-bar:nth-child(2) i{animation-duration:.80s;animation-delay:.24s}
.audio-wrapper .voice-play.is-playing .vp-bar:nth-child(3) i{animation-duration:1.1s;animation-delay:.18s}
.audio-wrapper .voice-play.is-playing .vp-bar:nth-child(4) i{animation-duration:.86s;animation-delay:.26s}
.audio-wrapper .voice-play.is-playing .vp-bar:nth-child(5) i{animation-duration:1s;animation-delay:.32s}

/* reduced motion — kill the loops (placed last, matching specificity, no !important) */
@media (prefers-reduced-motion:reduce){
.audio-wrapper .vp-glow,.audio-wrapper .vp-play svg{animation:none}
.audio-wrapper .voice-play.is-playing .vp-bar i{animation:none}
.audio-wrapper .vp-glow{opacity:.4}
}`;

  // Provided "ICON PLAY" artwork (viewBox 0 0 800 800), stroked for weight.
  const PLAY_PATH = 'm186.4 758.4c-22.9 0-45.7-6.1-66.3-18.4-38.7-23-61.8-63.3-61.8-107.8v-232.2c0-13.8 11.2-25 25-25s25 11.2 25 25v232.2c0 26.7 14 50.9 37.3 64.8 24.4 14.5 53.9 15.1 78.9 1.5l106.8-58.1c12.1-6.6 27.3-2.1 33.9 10s2.1 27.3-10 33.9l-106.8 58.1c-19.5 10.7-40.7 16-62 16zm263.7-129c-8.9 0-17.5-4.7-22-13.1-6.6-12.1-2.1-27.3 10-33.9l213.5-116.1c25-13.6 40-38.4 40-66.3s-15-52.7-40-66.3l-427-232.2c-25-13.6-54.5-13-78.9 1.5-23.4 13.9-37.3 38.1-37.3 64.8v98.9c0 13.8-11.2 25-25 25s-25-11.2-25-25v-98.9c0-44.5 23.1-84.8 61.8-107.8 39.7-23.6 87.7-24.5 128.4-2.5l427.1 232.2c41.4 22.5 66.1 63.7 66.1 110.2s-24.7 87.7-66.1 110.2l-213.7 116.2c-3.8 2.1-7.9 3.1-11.9 3.1z';

  const ICON_HTML =
    '<span class="voice-icon" aria-hidden="true">' +
      '<span class="vp-glow"></span>' +
      '<span class="vp-play">' +
        '<svg viewBox="0 0 800 800" width="20" height="20" fill="#146EF5" stroke="#146EF5" stroke-width="34" stroke-linejoin="round"><path d="' + PLAY_PATH + '"></path></svg>' +
      '</span>' +
      '<span class="vp-eq">' +
        '<span class="vp-bar"><i></i></span><span class="vp-bar"><i></i></span><span class="vp-bar"><i></i></span><span class="vp-bar"><i></i></span><span class="vp-bar"><i></i></span>' +
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
    const aria = wrapper.getAttribute('data-label') ||
                 wrapper.getAttribute('data-aria-label') || DEFAULT_ARIA;

    // Reuse an author-provided .voice-play if present; otherwise build it.
    let root = wrapper.querySelector('.voice-play');
    let btn;
    if (root && root.querySelector('.vp-btn')) {
      btn = root.querySelector('.vp-btn');
    } else {
      root = document.createElement('div');
      root.className = 'voice-play';
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'vp-btn';
      btn.setAttribute('aria-label', aria);
      btn.innerHTML = ICON_HTML;
      root.appendChild(btn);
      wrapper.appendChild(root);
    }

    // Eager audio (preload auto) so the first real click plays instantly.
    const audio = new Audio(src);
    audio.preload = 'auto';

    function stop() {
      root.classList.remove('is-playing');
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
      if (root.classList.contains('is-playing')) return; // ignore while playing
      if (current && current !== audio) {
        try { current.pause(); } catch (e) {}
      }
      current = audio;
      root.classList.add('is-playing');
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
