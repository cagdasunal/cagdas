/*!
 * cagdas — ALTCHA form protection (glue) for cagd.as.
 * Served:  https://files.cagd.as/scripts/altcha.min.js   (GitHub Pages, CEL-style)
 * Engine:  https://files.cagd.as/scripts/altcha-engine.min.js   (vendored ALTCHA UMD)
 * Worker (challenge/verify, cross-origin): https://cagdas-altcha.cagdasunal.workers.dev
 * Footer tag (Contact page): <script src="https://files.cagd.as/scripts/altcha.min.js" defer></script>
 *
 * GENERATED from tools/altcha/templates/forms.js.tmpl (proven CEL glue logic);
 * only the WORKER/ENGINE constants + guard flags are cagdas-specific.
 * Build: python3 scripts/site_deploy.py build --site cagdas --src altcha
 */

(function () {
  "use strict";

  if (window.__cagdasAltchaForms_v1) return;
  window.__cagdasAltchaForms_v1 = true;

  const WORKER = "https://cagdas-altcha.cagdasunal.workers.dev";
  const CHALLENGE_URL = WORKER + "/challenge";
  const VERIFY_URL = WORKER + "/verify";
  const ALTCHA_LIB = "https://files.cagd.as/scripts/altcha-engine.min.js";
  // Only forms with a Turnstile sitekey — i.e. the Webflow forms whose server
  // requires a cf-turnstile-response token (Contact, Newsletter, …). This makes
  // the script safe to load SITE-WIDE: it never touches Webflow's site-search
  // form or any other .w-form that isn't Turnstile-protected. Both target forms
  // carry the same sitekey; the search form carries none.
  const FORM_SELECTOR = ".w-form form[data-turnstile-sitekey]";
  const TIMEOUT_MS = 8000;

  // Page 2-letter lang (Weglot) → ALTCHA i18n code. fr/es/pt need the regioned code.
  const LANG_MAP = {"en": "en", "de": "de", "fr": "fr-fr", "es": "es-es", "it": "it", "pt": "pt-pt", "ko": "ko", "ja": "ja", "ar": "ar"};

  // Official ALTCHA translations (github.com/altcha-org/altcha) for the 8 non-English
  // locales (en ships with the widget). Visible PoW-flow strings only.
  const I18N = {"de": {"ariaLinkLabel": "Altcha (offizielle Website)", "label": "Ich bin kein Roboter", "loading": "Lade...", "verifying": "Wird \u00fcberpr\u00fcft...", "verified": "\u00dcberpr\u00fcft", "error": "\u00dcberpr\u00fcfung fehlgeschlagen. Bitte versuchen Sie es sp\u00e4ter erneut.", "expired": "\u00dcberpr\u00fcfung abgelaufen. Bitte versuchen Sie es erneut.", "verificationRequired": "\u00dcberpr\u00fcfung erforderlich!", "waitAlert": "\u00dcberpr\u00fcfung l\u00e4uft... bitte warten.", "footer": "Gesch\u00fctzt durch <a href=\"https://altcha.org/\" tabindex=\"-1\" target=\"_blank\" aria-label=\"Altcha (offizielle Website)\">ALTCHA</a>"}, "fr-fr": {"ariaLinkLabel": "Altcha (site officiel)", "label": "Je ne suis pas un robot", "loading": "Chargement...", "verifying": "V\u00e9rification en cours...", "verified": "V\u00e9rifi\u00e9", "error": "\u00c9chec de la v\u00e9rification. Essayez \u00e0 nouveau plus tard.", "expired": "La v\u00e9rification a expir\u00e9. Essayez \u00e0 nouveau.", "verificationRequired": "V\u00e9rification requise !", "waitAlert": "V\u00e9rification en cours... veuillez patienter.", "footer": "Prot\u00e9g\u00e9 par <a href=\"https://altcha.org/\" tabindex=\"-1\" target=\"_blank\" aria-label=\"Altcha (site officiel)\">ALTCHA</a>"}, "es-es": {"ariaLinkLabel": "Altcha (sitio web oficial)", "label": "No soy un robot", "loading": "Cargando...", "verifying": "Verificando...", "verified": "Verificado", "error": "Fall\u00f3 la verificaci\u00f3n. Por favor intente nuevamente m\u00e1s tarde.", "expired": "Verificaci\u00f3n expirada. Por favor intente nuevamente.", "verificationRequired": "\u00a1Verificaci\u00f3n requerida!", "waitAlert": "Verificando... por favor espere.", "footer": "Protegido por <a href=\"https://altcha.org/\" tabindex=\"-1\" target=\"_blank\" aria-label=\"Altcha (sitio web oficial)\">ALTCHA</a>"}, "it": {"ariaLinkLabel": "Altcha (sito ufficiale)", "label": "Non sono un robot", "loading": "Caricamento...", "verifying": "Verifica in corso...", "verified": "Verificato", "error": "Verifica fallita. Riprova pi\u00f9 tardi.", "expired": "Verifica scaduta. Riprova.", "verificationRequired": "Verifica richiesta!", "waitAlert": "Verifica in corso... attendere.", "footer": "Protetto da <a href=\"https://altcha.org/\" tabindex=\"-1\" target=\"_blank\" aria-label=\"Altcha (sito ufficiale)\">ALTCHA</a>"}, "pt-pt": {"ariaLinkLabel": "Altcha (site oficial)", "label": "N\u00e3o sou um rob\u00f4", "loading": "A carregar...", "verifying": "A verificar...", "verified": "Verificado", "error": "A verifica\u00e7\u00e3o falhou. Por favor, tente novamente mais tarde.", "expired": "Verifica\u00e7\u00e3o expirada. Por favor, tente novamente.", "verificationRequired": "Verifica\u00e7\u00e3o necess\u00e1ria!", "waitAlert": "A verificar... por favor aguarde.", "footer": "Protegido por <a href=\"https://altcha.org/\" tabindex=\"-1\" target=\"_blank\" aria-label=\"Altcha (site oficial)\">ALTCHA</a>"}, "ko": {"ariaLinkLabel": "Altcha (\uacf5\uc2dd \uc6f9\uc0ac\uc774\ud2b8)", "label": "\uc800\ub294 \ub85c\ubd07\uc774 \uc544\ub2d9\ub2c8\ub2e4", "loading": "\ub85c\ub529 \uc911...", "verifying": "\ud655\uc778 \uc911...", "verified": "\ud655\uc778\ub428", "error": "\uc778\uc99d \uc2e4\ud328. \ub098\uc911\uc5d0 \ub2e4\uc2dc \uc2dc\ub3c4\ud574\uc8fc\uc138\uc694.", "expired": "\uc778\uc99d\uc774 \ub9cc\ub8cc\ub418\uc5c8\uc2b5\ub2c8\ub2e4. \ub2e4\uc2dc \uc2dc\ub3c4\ud574\uc8fc\uc138\uc694.", "verificationRequired": "\uc778\uc99d\uc774 \ud544\uc694\ud569\ub2c8\ub2e4!", "waitAlert": "\ud655\uc778 \uc911... \uc7a0\uc2dc\ub9cc \uae30\ub2e4\ub824\uc8fc\uc138\uc694.", "footer": "\ubcf4\ud638\ub428 <a href=\"https://altcha.org/\" tabindex=\"-1\" target=\"_blank\" aria-label=\"Altcha (\uacf5\uc2dd \uc6f9\uc0ac\uc774\ud2b8)\">ALTCHA</a>"}, "ja": {"ariaLinkLabel": "Altcha (\u516c\u5f0f\u30a6\u30a7\u30d6\u30b5\u30a4\u30c8)", "label": "\u79c1\u306f\u30ed\u30dc\u30c3\u30c8\u3067\u306f\u3042\u308a\u307e\u305b\u3093", "loading": "\u8aad\u307f\u8fbc\u307f\u4e2d...", "verifying": "\u78ba\u8a8d\u4e2d...", "verified": "\u78ba\u8a8d\u6e08\u307f", "error": "\u8a8d\u8a3c\u306b\u5931\u6557\u3057\u307e\u3057\u305f\u3002\u5f8c\u3067\u3082\u3046\u4e00\u5ea6\u8a66\u3057\u3066\u304f\u3060\u3055\u3044\u3002", "expired": "\u8a8d\u8a3c\u304c\u671f\u9650\u5207\u308c\u3067\u3059\u3002\u518d\u8a66\u884c\u3057\u3066\u304f\u3060\u3055\u3044\u3002", "verificationRequired": "\u8a8d\u8a3c\u304c\u5fc5\u8981\u3067\u3059\uff01", "waitAlert": "\u78ba\u8a8d\u4e2d...\u5c11\u3005\u304a\u5f85\u3061\u304f\u3060\u3055\u3044\u3002", "footer": "\u4fdd\u8b77\u3055\u308c\u3066\u3044\u307e\u3059 <a href=\"https://altcha.org/\" tabindex=\"-1\" target=\"_blank\" aria-label=\"Altcha (\u516c\u5f0f\u30a6\u30a7\u30d6\u30b5\u30a4\u30c8)\">ALTCHA</a>"}, "ar": {"ariaLinkLabel": "Altcha (\u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0631\u0633\u0645\u064a)", "label": "\u0623\u0646\u0627 \u0644\u0633\u062a \u0631\u0648\u0628\u0648\u062a\u0627\u064b", "loading": "\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0645\u064a\u0644...", "verifying": "\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0642\u0642...", "verified": "\u062a\u0645 \u0627\u0644\u062a\u062d\u0642\u0642", "error": "\u0641\u0634\u0644 \u0627\u0644\u062a\u062d\u0642\u0642. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649 \u0644\u0627\u062d\u0642\u0627\u064b.", "expired": "\u0627\u0646\u062a\u0647\u062a \u0635\u0644\u0627\u062d\u064a\u0629 \u0627\u0644\u062a\u062d\u0642\u0642. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.", "verificationRequired": "\u0645\u0637\u0644\u0648\u0628 \u0627\u0644\u062a\u062d\u0642\u0642!", "waitAlert": "\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0642\u0642... \u064a\u0631\u062c\u0649 \u0627\u0644\u0627\u0646\u062a\u0638\u0627\u0631.", "footer": "\u0645\u062d\u0645\u064a \u0628\u0648\u0627\u0633\u0637\u0629 <a href=\"https://altcha.org/\" tabindex=\"-1\" target=\"_blank\" aria-label=\"Altcha (\u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0631\u0633\u0645\u064a)\">ALTCHA</a>"}};

  function rawLang() {
    return (document.documentElement.lang || "en").slice(0, 2).toLowerCase();
  }
  function altchaLang() {
    return LANG_MAP[rawLang()] || "en";
  }
  function isRtl() {
    return rawLang() === "ar";
  }

  function loadAltcha() {
    if (window.customElements && customElements.get("altcha-widget")) return;
    if (document.querySelector("script[data-altcha-lib]")) return;
    const s = document.createElement("script");
    s.src = ALTCHA_LIB;
    s.defer = true;
    s.setAttribute("data-altcha-lib", "");
    (document.head || document.documentElement).appendChild(s);
  }

  function registerI18n() {
    if (!window.$altcha || !window.$altcha.i18n || window.__cagdasAltchaI18nDone) return;
    for (const code in I18N) {
      try { window.$altcha.i18n.set(code, I18N[code]); } catch (e) { /* no-op */ }
    }
    window.__cagdasAltchaI18nDone = true;
  }

  function widgetOf(form) { return form.querySelector("altcha-widget"); }
  function submitBtn(form) { return form.querySelector('[type="submit"]'); }
  function payloadOf(form) {
    const field = form.querySelector('input[name="altcha"]');
    if (field && field.value) return field.value;
    const w = widgetOf(form);
    if (w && w.value) return w.value;
    return null;
  }

  // Put the widget inside .form_field-altcha (use the form's own element if the
  // designer added one; otherwise create it before the submit button).
  function placeWidget(form, w) {
    let holder = form.querySelector(".form_field-altcha");
    if (!holder) {
      holder = document.createElement("div");
      holder.className = "form_field-altcha";
      const btn = submitBtn(form);
      if (btn && btn.parentNode) btn.parentNode.insertBefore(holder, btn);
      else form.appendChild(holder);
    }
    holder.appendChild(w);
  }

  function injectWidget(form, lang, rtl) {
    if (widgetOf(form)) return; // respect a manually-placed widget
    const w = document.createElement("altcha-widget");
    w.setAttribute("challenge", CHALLENGE_URL); // v3 attribute name (NOT the old "challengeurl")
    w.setAttribute("auto", "onload"); // solve the proof-of-work in the background on load
    w.setAttribute("name", "altcha"); // hidden field submitted with the form
    w.setAttribute("language", lang); // for a11y text / any adaptive challenge
    if (rtl) w.setAttribute("dir", "rtl");
    w.className = "altcha";
    w.style.display = "none"; // INVISIBLE captcha — no visible checkbox/widget
    placeWidget(form, w);
  }

  function waitForPayload(form) {
    return new Promise(function (resolve) {
      const have = payloadOf(form);
      if (have) return resolve(have);
      const w = widgetOf(form);
      let settled = false;
      const finish = function (v) {
        if (settled) return;
        settled = true;
        if (w) w.removeEventListener("statechange", onChange);
        resolve(v);
      };
      const onChange = function () {
        const p = payloadOf(form);
        if (p) finish(p);
      };
      if (w) w.addEventListener("statechange", onChange);
      setTimeout(function () { finish(payloadOf(form)); }, TIMEOUT_MS);
    });
  }

  function verifyPayload(payload) {
    return Promise.race([
      fetch(VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: payload }),
      })
        .then(function (r) { return r.json(); })
        .then(function (d) { return d && d.ok === true ? "ok" : "fail"; })
        .catch(function () { return "timeout"; }),
      new Promise(function (resolve) { setTimeout(function () { resolve("timeout"); }, TIMEOUT_MS); }),
    ]);
  }

  // ─── Webflow native Turnstile coexistence ──────────────────────────────────
  // The form carries a data-turnstile-sitekey and Webflow's server REQUIRES a valid
  // cf-turnstile-response token, but Webflow's own widget never renders on this Blocks
  // form (its bundle binds the render to a jQuery "ready" event that never fires under
  // jQuery 3.5.1). We render Turnstile ourselves with the form's OWN sitekey, capture
  // the token, and attach it. No sitekey on the form → these are all no-ops.

  function turnstileSitekey(form) {
    return form.getAttribute("data-turnstile-sitekey") || null;
  }

  // Render an invisible Turnstile (idempotent). Kept full-size + opacity:0 so the
  // challenge actually executes (it won't run inside a display:none container).
  function renderTurnstile(form) {
    if (form.__altchaTsRendered) return;
    const sitekey = turnstileSitekey(form);
    if (!sitekey) return;
    if (!window.turnstile || typeof window.turnstile.render !== "function") return;
    let holder = form.querySelector(".altcha-turnstile-holder");
    if (!holder) {
      holder = document.createElement("div");
      holder.className = "altcha-turnstile-holder";
      holder.style.cssText = "position:fixed;right:0;bottom:0;opacity:0;pointer-events:none;z-index:-1;";
      form.appendChild(holder);
    }
    try {
      form.__altchaTsWidgetId = window.turnstile.render(holder, {
        sitekey: sitekey,
        callback: function (token) { form.__altchaTsToken = token; enableSubmit(form, token); },
        "error-callback": function () { form.__altchaTsToken = null; },
        "expired-callback": function () { form.__altchaTsToken = null; },
      });
      form.__altchaTsRendered = true;
    } catch (e) { /* no-op — fail open */ }
  }

  function waitForTurnstileToken(form) {
    return new Promise(function (resolve) {
      if (form.__altchaTsToken) return resolve(form.__altchaTsToken);
      let n = 0;
      const t = setInterval(function () {
        n++;
        if (form.__altchaTsToken) { clearInterval(t); resolve(form.__altchaTsToken); }
        else if (n >= 80) { clearInterval(t); resolve(form.__altchaTsToken || null); } // ~8s cap
      }, 100);
    });
  }

  function attachTurnstileToken(form) {
    if (!turnstileSitekey(form)) return Promise.resolve(); // not Turnstile-protected
    renderTurnstile(form); // ensure the widget exists (idempotent)
    return waitForTurnstileToken(form).then(function (token) {
      if (!token) return; // FAIL-OPEN: submit without it (no worse than the broken default)
      let inp = form.querySelector('input[name="cf-turnstile-response"]');
      if (!inp) {
        inp = document.createElement("input");
        inp.type = "hidden";
        inp.name = "cf-turnstile-response";
        form.appendChild(inp);
      }
      inp.value = token;
    });
  }

  // Turnstile tokens are single-use; reset so any resubmit gets a fresh one.
  function refreshTurnstile(form) {
    form.__altchaTsToken = null;
    try {
      if (form.__altchaTsWidgetId != null && window.turnstile && typeof window.turnstile.reset === "function") {
        window.turnstile.reset(form.__altchaTsWidgetId);
      }
    } catch (e) { /* no-op */ }
  }

  // Webflow's forms init DISABLES the submit button + adds w-form-loading whenever a
  // Turnstile sitekey is present but its own (never-firing) render hasn't set a token —
  // so on this page the button is dead on load and users can't click it. We feed
  // Webflow's form-state object (jQuery .data) our token so its O() re-arm keeps the
  // button enabled, and clear the stuck loading state. Best-effort + guarded.
  function enableSubmit(form, token) {
    try {
      if (window.jQuery && typeof window.jQuery.data === "function") {
        const st = window.jQuery.data(form, ".w-form");
        if (st) st.turnstileToken = token || st.turnstileToken || true;
      }
    } catch (e) { /* no-op */ }
    const btn = submitBtn(form);
    if (btn) { btn.disabled = false; btn.classList.remove("w-form-loading"); }
  }

  function prepareTurnstile(form) {
    if (!turnstileSitekey(form)) return;
    form.setAttribute("data-wf-no-turnstile", ""); // stop Webflow's broken native flow
    enableSubmit(form); // undo Webflow's init button-disable so the user can submit
    const onFocus = function () { // pre-solve on first interaction so the token is ready by submit
      form.removeEventListener("focusin", onFocus);
      enableSubmit(form);
      renderTurnstile(form);
    };
    form.addEventListener("focusin", onFocus);
  }

  function gate(form) {
    form.addEventListener(
      "submit",
      function (e) {
        if (form.__altchaPassed) return; // cleared — let Webflow handle it
        e.preventDefault();
        e.stopImmediatePropagation();
        (async function () {
          const payload = await waitForPayload(form);
          let result = "timeout";
          if (payload) result = await verifyPayload(payload);
          // Explicit ALTCHA "fail" (forged/expired solution) blocks + re-arms the widget.
          // Everything else (ok / timeout / no-payload / network error) FAILS OPEN.
          if (!(payload === null || result === "ok" || result === "timeout")) {
            const w = widgetOf(form);
            try { if (w && typeof w.reset === "function") w.reset(); } catch (err) { /* no-op */ }
            return;
          }
          // Attach a fresh Webflow Turnstile token (no-op if the form isn't Turnstile-protected).
          try { await attachTurnstileToken(form); } catch (err) { /* fail open — never block submit */ }
          form.__altchaPassed = true;
          if (typeof form.requestSubmit === "function") form.requestSubmit(submitBtn(form));
          else form.submit();
          form.__altchaPassed = false; // re-arm: next submit re-verifies + refreshes token
          refreshTurnstile(form); // invalidate the single-use token just sent
        })();
      },
      true, // capture: run before webflow.js's submit handler
    );
  }

  function setup(form, lang, rtl) {
    if (form.__altchaReady) return;
    form.__altchaReady = true;
    injectWidget(form, lang, rtl);
    prepareTurnstile(form);
    gate(form);
  }

  function boot() {
    loadAltcha();
    const lang = altchaLang();
    const rtl = isRtl();
    let tries = 0;
    const timer = setInterval(function () {
      tries++;
      const ready = window.customElements && customElements.get("altcha-widget") && window.$altcha && window.$altcha.i18n;
      if (ready) {
        registerI18n(); // register translations BEFORE injecting widgets
        const forms = document.querySelectorAll(FORM_SELECTOR);
        if (forms.length) {
          for (let i = 0; i < forms.length; i++) setup(forms[i], lang, rtl);
          clearInterval(timer);
          return;
        }
      }
      if (tries > 200) clearInterval(timer); // ~20s cap
    }, 100);
  }

  boot();
})();
