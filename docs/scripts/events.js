/*!
 * events.js — cagd.as behavioral-analytics bundle → window.dataLayer → GTM → GA4.
 *
 * Purpose-built for cagd.as (a solo Webflow-designer portfolio + lead-gen site). Forked
 * from tools/analytics-kit/events-bundle.template.js but intentionally DIVERGED: the
 * client wanted self-explanatory event names (read it, understand it — no guessing), so
 * this bundle uses CLEAR CUSTOM names instead of the kit's GA4-recommended umbrella names
 * (e.g. contact_form_submit / call_booked instead of generate_lead). The kit keeps the
 * generic names; this is the cagdas instance. Taxonomy approved by the owner 2026-06-15.
 *
 * Build:   python3 scripts/site_deploy.py build --site cagdas --src events
 * Served:  https://files.cagd.as/scripts/events.min.js   (Webflow Footer, defer)
 * GTM:     GTM-KCKHRLL5 reads these events → GA4 G-5P0F9JSWL7. INERT until GTM is live.
 *
 * Detection is structure-driven (page template id, CSS class, destination slug/protocol),
 * never translated text — though cagd.as is single-language. Each event carries
 * page_id + page_type + page_locale.
 *
 * EVENTS (every one is self-describing):
 *   visit_start          — first page of a visit + where they came from (traffic_source, referrer_host)
 *   page_engaged         — genuinely engaged: 15s active read OR 50% scroll (engaged_seconds, engaged_via)
 *   scroll_depth         — scroll milestone reached (percent_scrolled 25/50/75/90)
 *   cta_click            — clicked a CTA button (cta_label, cta_destination, cta_location)
 *   menu_click           — clicked a header/footer/mobile menu link (menu_item, menu_location)
 *   portfolio_visit      — clicked into a portfolio project's live site (portfolio_name)
 *   outbound_click       — clicked any other external link (link_domain — hostname only)
 *   faq_open             — opened an FAQ item (faq_question)
 *   contact_form_start   — began filling the contact form
 *   contact_form_submit  — submitted the contact form           [CONVERSION]
 *   contact_form_error   — contact form submit failed (validation / Turnstile)
 *   call_booked          — completed a Cal.com discovery booking [CONVERSION] (booking_surface, booking_event_type)
 *   cookie_consent       — accepted/rejected/changed cookie consent (consent_action + per-category)
 *
 * (currency_picker_open / currency_select / web_design_toggle live in rates.min.js — that
 *  bundle owns the /rates currency wheel + pricing toggle and pushes those events itself.)
 *
 * Code standards: const/let only (never var); no DOM-ready gate (`defer` guarantees parsed
 * DOM); enforced on *events*.js by hooks/pre-edit-guard.py.
 */
(function () {
  'use strict';
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (window.__siteEvents) return;
  window.__siteEvents = true;

  /* ======================================================================
   * SITE_CONFIG — cagd.as specifics
   * ====================================================================== */
  const SITE_CONFIG = {
    ownHost: 'cagd.as',

    // data-wf-page template id → friendly page_type (live cagd.as 2026-06-15).
    pageTypes: {
      '69db63dc2e8675a7ac61073a': 'home',
      '69db63dc2e8675a7ac61073e': 'services',
      '69db63dc2e8675a7ac610740': 'process',
      '69db63dc2e8675a7ac610744': 'contact',
      '69db63dc2e8675a7ac610745': 'call',
      '69db63dc2e8675a7ac61074d': 'rates',
      '69f7ad91b73e7513c531fd4b': 'agencies',
      '6a21920083d0f4b525ca6892': 'doc'
    },

    // CTA buttons are Webflow `.button` (incl. `.button.is-small` in the navbar) and the
    // mobile-overlay CTA. A click on any of these → cta_click (whatever its destination).
    ctaSelector: 'a.button, .button a, a.nav_overlay-cta, .nav_overlay-cta a',

    // The contact page's destination slug — used to label a cta_click that points there,
    // and (with formNames) to recognise the lead form.
    contactPath: '/contact',
    bookingPath: '/call',

    // Portfolio project cards on the home page; a click on a card's external link →
    // portfolio_visit, labelled with the project name read from the card.
    portfolioCardSelector: '.work_item',
    portfolioNameSelector: 'h1, h2, h3, h4, a',

    // Contact form: id/name that marks the lead form (Webflow injects .w-form-done on
    // AJAX success, .w-form-fail on failure).
    contactFormMatch: /contact/i,

    // Cal.com booking widget (see /call). Subscribes to Cal's JS event API on the default
    // namespace (popup CTAs) AND each named namespace (inline embeds) → call_booked.
    calcom: {
      enabled: true,
      onPageTypes: ['call'],
      namespaces: ['call']
    },

    // Cookie banner broadcast event (sites/cagdas/gdpr/gdpr.config.json → eventName) + the
    // OPT-IN categories the banner actually offers (cagd.as has analytics only). Used to label
    // consent_action accept_all/reject_all/custom correctly for THIS site's category set.
    consentEventName: 'cagdas:consent',
    consentCategories: ['analytics']
  };

  /* ======================================================================
   * Helpers
   * ====================================================================== */
  const PAGE_TYPES = SITE_CONFIG.pageTypes || {};

  function barePath(pathname) {
    const parts = (pathname || '').split('/').filter(Boolean);
    return ('/' + parts.join('/')) || '/';
  }
  function lastSeg(url) {
    const ps = (url.pathname || '').split('/').filter(Boolean);
    return ps.length ? ps[ps.length - 1] : '';
  }
  function urlOf(a) { try { return new URL(a.href, location.href); } catch (_) { return null; } }
  function clean(s) { return (s || '').replace(/\s+/g, ' ').trim(); }
  function linkText(a) { return clean(a.textContent).slice(0, 80); }

  // Acquisition source for visit_start: utm_source wins; else classify the referrer host.
  function trafficSource(referrerHost, utmSource) {
    if (utmSource) return utmSource;
    if (!referrerHost) return 'direct';
    if (/(^|\.)google\./.test(referrerHost)) return 'google_organic';
    if (SITE_CONFIG.ownHost && referrerHost.indexOf(SITE_CONFIG.ownHost) !== -1) return 'internal';
    return 'referral';
  }

  // Protocol/contact CTAs (email/phone/whatsapp/maps/contact/booking) → a clear cta_label.
  function protocolCta(raw, url) {
    if (/^mailto:/i.test(raw)) return 'Email';
    if (/^tel:/i.test(raw)) return 'Phone';
    const host = (url && url.hostname || '').toLowerCase();
    if (host.indexOf('whatsapp.com') !== -1 || host === 'wa.me' || host.endsWith('.wa.me')) return 'WhatsApp';
    return null;
  }

  // Where a CTA sits: footer / mobile menu / navbar / hero / body (geometry fallback).
  // Footer + mobile-overlay are checked BEFORE the generic navbar selector: the site
  // footer is itself a Webflow Navbar (.w-nav) and the mobile menu is its .w-nav-overlay,
  // so a navbar-first check would shadow a footer or mobile-menu CTA as 'navbar' (same
  // root cause as the menuLocation footer fix below).
  function ctaLocation(a) {
    if (a.closest('footer, .footer, [class*="footer_"]')) return 'footer';
    if (a.closest('.w-nav-overlay, [class*="mobile-menu"], [class*="menu_overlay"], [class*="nav_overlay"]')) return 'mobile';
    if (a.closest('nav, .navbar, [class*="navbar"], .w-nav')) return 'navbar';
    let top;
    try { const r = a.getBoundingClientRect(); top = r.top + (window.pageYOffset || document.documentElement.scrollTop || 0); }
    catch (_) { return 'body'; }
    const vh = window.innerHeight || 800;
    if (top < vh) return 'hero';
    return 'body';
  }
  // Where a menu link sits: header / footer / mobile.
  // Footer is checked FIRST: the site footer is a Webflow Navbar component
  // (footer.footer_component wraps a .w-nav), so the navbar selector below would
  // otherwise shadow every footer link as 'header'. A footer link is never inside
  // the header's nav/overlay, so footer-first stays correct for header + mobile links.
  function menuLocation(a) {
    if (a.closest('footer, .footer, [class*="footer_"]')) return 'footer';
    if (a.closest('.w-nav-overlay, [class*="mobile-menu"], [class*="menu_overlay"], [class*="nav_overlay"]')) return 'mobile';
    if (a.closest('nav, .navbar, [class*="navbar"], .w-nav')) return 'header';
    return null;
  }
  function isCtaButton(a) {
    try { return !!(a.matches(SITE_CONFIG.ctaSelector) || a.closest(SITE_CONFIG.ctaSelector)); }
    catch (_) { return false; }
  }
  // The card's short brand name (e.g. "Humblebee") — the first SHORT heading/link text,
  // skipping the long description paragraph, the "view the website"/"read the details" CTAs,
  // and the metadata labels (Agency/Client/Role/Year). Falls back to the client domain.
  function portfolioName(card, a) {
    const SKIP = /^(view the website|read the details|or|agency|client|role|year)$/i;
    try {
      const els = card.querySelectorAll(SITE_CONFIG.portfolioNameSelector);
      for (let i = 0; i < els.length; i++) {
        const t = clean(els[i].textContent);
        if (t && t.length <= 40 && !SKIP.test(t)) return t;
      }
    } catch (_) {}
    const u = urlOf(a);                                   // fallback: the client domain
    return u ? u.hostname.replace(/^www\./, '') : 'unknown';
  }

  // ---- page identity (once) ----
  const PAGE_ID = (document.documentElement.getAttribute('data-wf-page') || '');
  const PT = PAGE_TYPES[PAGE_ID] || 'other';
  const LOC = ((document.documentElement.getAttribute('lang') || 'en').toLowerCase().split('-')[0]) || 'en';

  window.dataLayer = window.dataLayer || [];
  function push(name, params) {
    const o = { event: name, page_id: PAGE_ID, page_type: PT, page_locale: LOC };
    if (params) for (const k in params) if (Object.prototype.hasOwnProperty.call(params, k)) o[k] = params[k];
    window.dataLayer.push(o);
  }

  /* ======================================================================
   * visit_start — acquisition source on the landing hit (once)
   * ====================================================================== */
  (function () {
    let rh = ''; try { const r = document.referrer; if (r) rh = new URL(r).hostname; } catch (_) {}
    let us = ''; try { us = new URLSearchParams(location.search).get('utm_source') || ''; } catch (_) {}
    push('visit_start', { traffic_source: trafficSource(rh, us), referrer_host: rh });
  })();

  /* ======================================================================
   * One delegated capture-phase click listener (specific → generic)
   * ====================================================================== */
  document.addEventListener('click', function (e) {
    const t = e.target;
    if (!t || !t.closest) return;

    // FAQ accordion (rates) — fire faq_open on OPEN only (skip closes), with the question text.
    // events.js runs in capture phase BEFORE faq.js toggles, so .faq_item.is-open reflects the
    // PRE-click state: absent → this click is opening the item.
    const faqTrigger = t.closest('.faq_trigger, .faq_question');
    if (faqTrigger) {
      const item = faqTrigger.closest('.faq_item');
      if (!item || !item.classList.contains('is-open')) {
        const qEl = (item && item.querySelector('.faq_question')) || faqTrigger;
        const q = clean(qEl.textContent).slice(0, 120);
        if (q) push('faq_open', { faq_question: q });
      }
      return;
    }

    const a = t.closest('a[href]');
    if (!a) return;
    const raw = a.getAttribute('href') || '';
    const au = urlOf(a);

    // Portfolio project → its live site (home work cards). Any external link inside a card.
    const card = a.closest(SITE_CONFIG.portfolioCardSelector);
    if (card && au && au.hostname && au.hostname !== location.hostname) {
      push('portfolio_visit', { portfolio_name: portfolioName(card, a) });
      return;
    }

    // CTA buttons (Webflow .button / mobile-overlay CTA) OR protocol CTAs (mailto/tel/whatsapp).
    // A CTA button counts regardless of destination, EXCEPT a bare "#" placeholder — e.g. the
    // /rates "Include web design" toggle (rates.js already tracks that as web_design_toggle).
    // A real in-page target like "#portfolio" still counts.
    const proto = protocolCta(raw, au);
    if (proto || (isCtaButton(a) && raw && raw !== '#')) {
      // Protocol CTAs (mailto/tel/whatsapp): the href is PII (an address/number) — NEVER send it.
      // Use the scheme label as the destination. Other CTAs send the bare destination path.
      const dest = proto ? proto : (au ? barePath(au.pathname) + (au.hash || '') : raw);
      push('cta_click', { cta_label: proto || linkText(a) || '(none)', cta_destination: dest, cta_location: ctaLocation(a) });
      return;
    }

    // Header / footer / mobile menu links.
    const ml = menuLocation(a);
    if (ml && raw && raw.charAt(0) !== '#') {
      push('menu_click', { menu_item: linkText(a) || '(none)', menu_location: ml });
      return;
    }

    // Any other external link → outbound_click (link_domain only — no PII).
    if (raw && raw.charAt(0) !== '#' && au && au.hostname && au.hostname !== location.hostname) {
      push('outbound_click', { link_domain: au.hostname });
    }
  }, true);

  /* ======================================================================
   * Contact form — start / submit / error  (Webflow AJAX form)
   * ====================================================================== */
  function isContactForm(form) {
    const id = (form.getAttribute('id') || form.getAttribute('data-name') || form.getAttribute('name') || '');
    return SITE_CONFIG.contactFormMatch.test(id);
  }
  function visible(el) { return !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length)); }

  const wraps = document.querySelectorAll('.w-form');
  for (let i = 0; i < wraps.length; i++) {
    const wrap = wraps[i];
    const form = wrap.querySelector('form');
    if (!form || !isContactForm(form)) continue;

    // start (once): first focus/input inside the form.
    let startFired = false;
    function onFirst() {
      if (startFired) return;
      startFired = true;
      form.removeEventListener('focusin', onFirst, true);
      form.removeEventListener('input', onFirst, true);
      push('contact_form_start', {});
    }
    form.addEventListener('focusin', onFirst, true);
    form.addEventListener('input', onFirst, true);

    // submit / error need a MutationObserver — guard for ancient engines (parity with rates.js).
    if (typeof MutationObserver !== 'function') continue;
    // submit (once): fire ONLY on the hidden→visible TRANSITION of .w-form-done (a genuine submit
    // after load), never on the initial state — so a classic redirect-back or a designer-visible
    // success block can't log a phantom conversion. Mirrors the .w-form-fail change-detection.
    // Observe the whole .w-form wrap subtree (not just a node present at init), re-querying
    // .w-form-done each mutation, so a lazily-injected or re-rendered success block is still
    // caught. Fire ONLY on the hidden→visible TRANSITION (doneShown seeds from the init state).
    let submitFired = false;
    const doneInit = wrap.querySelector('.w-form-done');
    let doneShown = !!(doneInit && visible(doneInit));
    const obsDone = new MutationObserver(function () {
      if (submitFired) return;
      const dn = wrap.querySelector('.w-form-done');
      const now = !!(dn && visible(dn));
      if (now && !doneShown) { submitFired = true; push('contact_form_submit', {}); obsDone.disconnect(); }
      doneShown = now;
    });
    obsDone.observe(wrap, { attributes: true, attributeFilter: ['style', 'class'], childList: true, subtree: true });
    // error: Webflow reveals .w-form-fail on validation/submit failure (can repeat).
    const fail = wrap.querySelector('.w-form-fail');
    if (fail) {
      let errShown = visible(fail);
      const obsFail = new MutationObserver(function () {
        const now = visible(fail);
        if (now && !errShown) push('contact_form_error', {});
        errShown = now;
      });
      obsFail.observe(fail, { attributes: true, attributeFilter: ['style', 'class'] });
    }
  }

  /* ======================================================================
   * call_booked — Cal.com booking completion (Cal JS event API)
   * Cal's embed.js consumes the cross-origin iframe postMessages and re-dispatches them as
   * same-window CustomEvents. Subscribe via Cal("on",...) — queued by Cal's loader stub —
   * on the DEFAULT namespace (popup CTAs) AND each named namespace (inline embed). Listen
   * for the current bookingSuccessfulV2 + legacy bookingSuccessful; de-dupe so one booking
   * fires once.
   * ====================================================================== */
  (function () {
    const cc = SITE_CONFIG.calcom || {};
    if (!cc.enabled || (cc.onPageTypes || []).indexOf(PT) === -1) return;
    const ACTIONS = ['bookingSuccessfulV2', 'bookingSuccessful'];
    const seen = {};   // de-dupe by booking uid: collapses the V2+legacy double-dispatch for ONE
                       // booking, but still lets a genuine SECOND booking in the same session count.
    let lastAnon = 0;  // no-uid fallback: a time-window (not a constant key) so the ~simultaneous
                       // V2+legacy pair collapses, but a real 2nd booking >1.5s later still counts.
    function onBooking(e) {
      const d = (e && e.detail) || {};
      const data = d.data || {};
      const uid = data.uid || data.bookingUid || '';
      if (uid) {
        if (seen[uid]) return;        // same booking re-dispatched (V2+legacy) — count once
        seen[uid] = true;
      } else {
        const now = Date.now();
        if (now - lastAnon < 1500) return;   // collapse the double-dispatch when no uid is present
        lastAnon = now;
      }
      const et = data.eventType;
      push('call_booked', {
        booking_surface: d.namespace ? d.namespace : 'default',
        booking_event_type: (et && (et.slug || et.title)) || ''
      });
    }
    function sub(api) {
      if (typeof api !== 'function') return;
      for (let i = 0; i < ACTIONS.length; i++) { try { api({ action: ACTIONS[i], callback: onBooking }); } catch (_) {} }
    }
    let tries = 0;
    const calTimer = window.setInterval(function () {
      tries++;
      if (typeof window.Cal === 'function') {
        sub(window.Cal);                                 // default namespace (popup CTAs)
        const ns = window.Cal.ns || {};
        const names = cc.namespaces || [];
        for (let i = 0; i < names.length; i++) sub(ns[names[i]]);  // named namespaces (inline embeds)
        window.clearInterval(calTimer);
      } else if (tries >= 40) { window.clearInterval(calTimer); }  // ~10s @ 250ms
    }, 250);
  })();

  /* ======================================================================
   * cookie_consent — the banner's accept/reject/change choice
   * ====================================================================== */
  (function () {
    const evName = SITE_CONFIG.consentEventName;
    if (!evName) return;
    // The banner broadcasts on the consent DECISION but ALSO on every page load (and twice on
    // first-accept), so dedupe: emit cookie_consent only when the consent STATE actually changes
    // vs the last emission (persisted across loads). action is computed over the site's real
    // opt-in categories so an analytics-only "Accept all" reads accept_all, not custom.
    const OPTIN = SITE_CONFIG.consentCategories || [];
    const SIG_KEY = 'cagdas_consent_sig';
    let sigMem = null;   // in-memory fallback when localStorage is blocked (private mode): bounds the
                         // over-count to once-per-load instead of unbounded per-pageview.
    function sigOf(d) { return OPTIN.map(function (k) { return k + (d[k] ? '1' : '0'); }).join(''); }
    function lastSig() { try { return window.localStorage.getItem(SIG_KEY); } catch (_) { return null; } }
    function saveSig(s) { sigMem = s; try { window.localStorage.setItem(SIG_KEY, s); } catch (_) {} }
    window.addEventListener(evName, function (e) {
      const d = (e && e.detail) || {};
      const sig = sigOf(d);
      if (sig === lastSig() || sig === sigMem) return;   // unchanged (page-load re-assert / double-fire) — skip
      saveSig(sig);
      const granted = OPTIN.filter(function (k) { return d[k]; }).length;
      const action = granted === 0 ? 'reject_all' : granted === OPTIN.length ? 'accept_all' : 'custom';
      push('cookie_consent', {
        consent_action: action,
        consent_analytics: d.analytics ? 'granted' : 'denied',
        // marketing/functional are forward-compatible placeholders: the banner is analytics-only
        // today, so these stay 'denied' until/unless those categories are added to the banner.
        consent_marketing: d.marketing ? 'granted' : 'denied',
        consent_functional: d.functional ? 'granted' : 'denied'
      });
    });
  })();

  /* ======================================================================
   * page_engaged + scroll_depth + active read-time ticker
   * ====================================================================== */
  // Active read-time: counts only while the tab is visible, so a background tab doesn't
  // inflate engagement. Feeds page_engaged's dwell path.
  let readMs = 0, lastTick = 0, counting = false;
  function tickStart() { if (!counting && document.visibilityState === 'visible') { counting = true; lastTick = Date.now(); } }
  function tickStop() { if (counting) { readMs += Date.now() - lastTick; counting = false; } }
  function activeMs() { if (counting) { readMs += Date.now() - lastTick; lastTick = Date.now(); } return readMs; }
  tickStart();
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') tickStart(); else tickStop(); });

  // page_engaged: once, on whichever comes first — 15s ACTIVE time OR 50% scroll.
  let engagedFired = false, engagedTimer = 0;
  function fireEngaged(via) {
    if (engagedFired) return;
    engagedFired = true;
    if (engagedTimer) { window.clearInterval(engagedTimer); engagedTimer = 0; }
    // floor at 1s: a scroll_50 within <500ms of load is real engagement, not a 0-second dwell.
    push('page_engaged', { engaged_via: via, engaged_seconds: Math.max(1, Math.round(activeMs() / 1000)) });
  }
  engagedTimer = window.setInterval(function () { if (activeMs() >= 15000) fireEngaged('dwell_15s'); }, 3000);

  // scroll_depth: 25/50/75/90 once each (short-page guarded); also drives page_engaged's scroll path.
  const THRESH = [25, 50, 75, 90];
  const hit = {};
  let ticking = false;
  function measureScroll() {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= window.innerHeight * 0.2) return;
    const pct = (window.pageYOffset / max) * 100;
    for (let k = 0; k < THRESH.length; k++) { if (pct >= THRESH[k] && !hit[THRESH[k]]) { hit[THRESH[k]] = true; push('scroll_depth', { percent_scrolled: String(THRESH[k]) }); } }
    if (!engagedFired && pct >= 50) fireEngaged('scroll_50');
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    // rAF coalesces the layout reads, but it is PAUSED in a hidden/backgrounded tab — relying on it
    // alone latches `ticking` true forever and kills all later scroll tracking. When the tab isn't
    // visible (rAF won't fire), measure synchronously so the guard always resets.
    if (document.visibilityState === 'visible' && typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(measureScroll);
    } else {
      measureScroll();
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
})();
