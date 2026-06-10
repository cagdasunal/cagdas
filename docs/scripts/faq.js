/*!
 * faq.js — single-open CMS FAQ accordion for cagd.as
 *
 * Drives the FAQ accordion built in Webflow (the `faq_component` Collection
 * List). BEHAVIOUR ONLY — every pixel of styling lives in Webflow classes.
 * This bundle injects NO <style> and contains NO CSS rules; it toggles the
 * `is-open` state class and animates the panel height (the one thing CSS
 * cannot measure on its own).
 *
 * REQUIRED Webflow CSS contract (set on the classes in Designer — the script
 * depends on these and does NOT create them):
 *   .faq_panel  { overflow: hidden; height: 0; transition: height <dur> <ease>; }
 *   .faq_marker-v.is-open { transform: scaleY(0); }   (+ transition on .faq_marker-v)
 *   .faq_answer { opacity: 0; transform: translateY(-4px); transition: opacity/transform; }
 *   .faq_answer.is-open { opacity: 1; transform: translateY(0); }
 * If .faq_panel lacks `transition: height`, the open/close simply snaps (still
 * functional). The 450ms settle fallback below assumes that height transition
 * is < 450ms (the deployed value is 300ms).
 *
 * Markup it expects (classes assigned in Webflow Designer):
 *   .faq_item            one CMS Collection Item (the row, hairline top border)
 *     .faq_trigger       clickable header  (role="button", tabindex="0")
 *       .faq_question    question text     (CMS-bound to the Question field)
 *       .faq_marker      the +/- marker
 *         .faq_marker-v  the vertical bar  (collapses to a "-" when open)
 *     .faq_panel         collapsible wrapper (height is animated here)
 *       .faq_answer      answer rich text  (CMS-bound to the Answer field)
 *
 * Single-open accordion: opening one row closes the others. The first row is
 * opened on load with no animation. Respects prefers-reduced-motion (the open
 * is instant). Self-contained — zero dependencies, zero network requests.
 * Guard: __cagdasFaq.
 *
 * Design source: Claude Design "cagd.as Design System" -> project/FAQ.html.
 */
(function () {
  if (window.__cagdasFaq) return;
  window.__cagdasFaq = true;

  const OPEN = "is-open";
  const reduce =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const items = Array.prototype.slice.call(
    document.querySelectorAll(".faq_item")
  );
  if (!items.length) return;

  const panelOf = (item) => item.querySelector(".faq_panel");
  const triggerOf = (item) => item.querySelector(".faq_trigger");
  const isOpen = (item) => item.classList.contains(OPEN);

  // Row-hover dims the question (brand --color--base--hover), but ONLY while the
  // row is closed — an open row never shows the hover state. Driven here, not in
  // CSS, because it depends on the runtime open state + targets a descendant.
  const HOVER = "#8f8f8f";
  function refreshHover(item) {
    const q = item.querySelector(".faq_question");
    if (q) q.style.color = item._faqHover && !isOpen(item) ? HOVER : "";
  }

  function setState(item, open) {
    const trigger = triggerOf(item);
    const panel = panelOf(item);
    const marker = item.querySelector(".faq_marker-v");
    const answer = item.querySelector(".faq_answer");
    item.classList.toggle(OPEN, open);
    // Collapse the vertical bar inline (+ -> -). Webflow prunes the runtime-only
    // `.faq_marker-v.is-open` combo from the published CSS, so the state cannot
    // live in a class; the published `transition: transform` still animates it.
    if (marker) {
      marker.classList.toggle(OPEN, open);
      marker.style.transform = open ? "scaleY(0)" : "";
    }
    if (answer) answer.classList.toggle(OPEN, open);
    if (trigger) trigger.setAttribute("aria-expanded", open ? "true" : "false");
    if (panel) panel.setAttribute("aria-hidden", open ? "false" : "true");
    refreshHover(item);
  }

  // Drop any pending settle (transitionend listener + fallback timer) so a
  // rapid re-toggle of the same row can't fire a stale settle mid-animation.
  function clearPending(panel) {
    if (panel._faqTimer) {
      window.clearTimeout(panel._faqTimer);
      panel._faqTimer = null;
    }
    if (panel._faqDone) {
      panel.removeEventListener("transitionend", panel._faqDone);
      panel._faqDone = null;
    }
  }

  function close(item) {
    const panel = panelOf(item);
    if (!panel) return;
    clearPending(panel);
    panel._faqAnimating = false;
    if (reduce) {
      setState(item, false);
      panel.style.height = "0px";
      return;
    }
    panel.style.height = panel.scrollHeight + "px";
    panel.getBoundingClientRect(); // force reflow so the next change animates
    setState(item, false);
    panel.style.height = "0px";
  }

  function open(item) {
    const panel = panelOf(item);
    if (!panel) return;
    clearPending(panel);
    setState(item, true);
    if (reduce) {
      panel.style.height = "auto";
      panel._faqAnimating = false;
      return;
    }
    panel._faqAnimating = true;
    panel.style.height = panel.scrollHeight + "px";
    const settle = () => {
      clearPending(panel);
      panel._faqAnimating = false;
      if (isOpen(item)) panel.style.height = "auto";
    };
    const done = (e) => {
      if (e.propertyName !== "height") return;
      settle();
    };
    panel._faqDone = done;
    panel.addEventListener("transitionend", done);
    // Fallback if transitionend never fires (no height transition / zero delta).
    panel._faqTimer = window.setTimeout(settle, 450);
  }

  function toggle(item) {
    if (isOpen(item)) {
      close(item);
      return;
    }
    items.forEach((other) => {
      if (other !== item && isOpen(other)) close(other);
    });
    open(item);
  }

  items.forEach((item) => {
    const trigger = triggerOf(item);
    if (!trigger) return;
    // The whole row is the click target; a click on a link inside an answer is
    // ignored so in-answer links keep working. Keyboard activation stays on the
    // trigger (the role="button"/tabindex element).
    item.addEventListener("click", (e) => {
      if (e.target && e.target.closest && e.target.closest("a")) return;
      toggle(item);
    });
    item.addEventListener("mouseenter", () => {
      item._faqHover = true;
      refreshHover(item);
    });
    item.addEventListener("mouseleave", () => {
      item._faqHover = false;
      refreshHover(item);
    });
    trigger.addEventListener("keydown", (e) => {
      if (e.repeat) return; // ignore key-held auto-repeat
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        toggle(item);
      }
    });
  });

  // Keep a settled-open panel's pinned height correct across viewport reflows.
  // Skip panels mid-animation — re-pinning to auto there would cancel the tween.
  let raf;
  window.addEventListener("resize", () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      items.forEach((item) => {
        const panel = panelOf(item);
        if (panel && isOpen(item) && !panel._faqAnimating) {
          panel.style.height = "auto";
        }
      });
    });
  });

  // Initialize every row explicitly (ARIA + collapsed height), then open the
  // first with no animation — never rely on CSS/static attrs alone for state.
  items.forEach((item) => {
    setState(item, false);
    const panel = panelOf(item);
    if (panel) panel.style.height = "0px";
  });
  setState(items[0], true);
  const firstPanel = panelOf(items[0]);
  if (firstPanel) {
    firstPanel._faqAnimating = false;
    firstPanel.style.height = "auto";
  }
})();
