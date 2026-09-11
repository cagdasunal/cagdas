/* ============================================================================
   PREVIEW ONLY — NEVER DEPLOYED.  preview-webflow-shim.js
   ROUND-TOKEN: R13-WEBFLOW-READY (2026-09-11 · WP5)

   On the published site, webflow.js owns the Navbar and the Dropdown. The design preview has
   Webflow's stylesheet (live/webflow-base.css) but not its JavaScript, so without this file the
   widgets would never open and the preview would show a page the site does not have.

   This file does ONE thing: it emulates exactly the state changes webflow.js makes (F7), so
   homepage.js — which only decorates, and must never own a widget — has the same states to watch
   in preview as on the site.

     · Dropdown open  → `w--open` on the TOGGLE and on the LIST (never on the wrapper).
                        Webflow's own base then shows the list:
                        `.w-dropdown-list.w--open{display:block}`.
     · At the collapse width, additionally → `w--nav-dropdown-open` on the wrapper,
                        `w--nav-dropdown-toggle-open` on the toggle and
                        `w--nav-dropdown-list-open` on the list (the last is what makes Webflow's
                        base set `position:static` on the panel inside the sheet).
     · Menu open      → `w--open` on the menu BUTTON, the attribute `data-nav-menu-open` on the
                        MENU (Webflow's `[data-nav-menu-open]` carries `display:block!important`
                        and the absolute positioning), and `w--nav-link-open` on the links.
     · Opening is on hover with `data-hover`, closing after `data-delay` ms — read off the markup,
                        not hard-coded.
     · The ARIA the widget emits in published HTML is set here at runtime rather than authored in
                        the markup (WP4.5): `role`/`tabindex`/`aria-haspopup`/`aria-expanded`/
                        `aria-controls` on the toggle and the menu button, `role="banner"` on the
                        Navbar, `role="navigation"` on the menu.
     · The sheet's cross-fade is Webflow's, not the decorator's: `data-duration` ms in both
                        directions, animate-then-hide on close — which is why homepage.js never
                        writes the menu's own opacity.

   It does NOT emulate the generated `.w-nav-overlay` wrapper. It does not need to: Webflow's
   `[data-nav-menu-open]` is `absolute; top:100%; left:0; right:0`, and inside the overlay (itself
   at `top:100%`) it is `top:0` — the same pixels either way, which is exactly why the class sheet
   authors no position on that part at all.

   FIRST STATEMENT RETURNS WHEN `window.Webflow` EXISTS, so if this file were ever deployed by
   mistake it would do nothing at all on a real Webflow page.
   ============================================================================ */
(function(){
if(window.Webflow)return;
if(window.__afissioWebflowShimV1)return;window.__afissioWebflowShimV1=1;

var nav=document.querySelector('.w-nav');if(!nav)return;
var COLLAPSE={all:99999,medium:991,small:767,tiny:479};
var cw=COLLAPSE[nav.getAttribute('data-collapse')||'medium']||991;
var mq=window.matchMedia('(max-width: '+cw+'px)');
var dur=parseInt(nav.getAttribute('data-duration'),10);if(isNaN(dur))dur=400;

/* ---------- the ARIA the published Navbar emits ---------- */
nav.setAttribute('role','banner');
var menu=nav.querySelector('.w-nav-menu');
var btn=nav.querySelector('.w-nav-button');
if(menu){menu.setAttribute('role','navigation');if(!menu.id)menu.id='w-nav-menu-0'}
if(btn&&menu){
  btn.setAttribute('role','button');btn.setAttribute('tabindex','0');
  btn.setAttribute('aria-haspopup','menu');btn.setAttribute('aria-expanded','false');
  btn.setAttribute('aria-controls',menu.id);
}

/* ---------- Dropdown ---------- */
var dds=[].slice.call(nav.querySelectorAll('.w-dropdown'));
var openDd=null,ct=null;
dds.forEach(function(d,i){
  var t=d.querySelector('.w-dropdown-toggle'),l=d.querySelector('.w-dropdown-list');
  if(!t||!l)return;
  if(!t.id)t.id='w-dropdown-toggle-'+i;
  if(!l.id)l.id='w-dropdown-list-'+i;
  t.setAttribute('role','button');t.setAttribute('tabindex','0');
  t.setAttribute('aria-haspopup','menu');t.setAttribute('aria-expanded','false');
  t.setAttribute('aria-controls',l.id);
  l.setAttribute('aria-labelledby',t.id);
});
function ddParts(d){return{t:d.querySelector('.w-dropdown-toggle'),l:d.querySelector('.w-dropdown-list')}}
function ddOpen(d){
  if(openDd===d)return;
  if(openDd&&openDd!==d)ddClose(openDd);
  var p=ddParts(d);if(!p.t||!p.l)return;
  openDd=d;
  p.t.classList.add('w--open');p.l.classList.add('w--open');
  p.t.setAttribute('aria-expanded','true');
  if(mq.matches){
    d.classList.add('w--nav-dropdown-open');
    p.t.classList.add('w--nav-dropdown-toggle-open');
    p.l.classList.add('w--nav-dropdown-list-open');
  }
}
function ddClose(d){
  if(!d)return;
  var p=ddParts(d);if(!p.t||!p.l)return;
  p.t.classList.remove('w--open');p.l.classList.remove('w--open');
  p.t.setAttribute('aria-expanded','false');
  d.classList.remove('w--nav-dropdown-open');
  p.t.classList.remove('w--nav-dropdown-toggle-open');
  p.l.classList.remove('w--nav-dropdown-list-open');
  if(openDd===d)openDd=null;
}
dds.forEach(function(d){
  var hover=d.getAttribute('data-hover')==='true';
  var delay=parseInt(d.getAttribute('data-delay'),10);if(isNaN(delay))delay=0;
  var p=ddParts(d);
  if(hover){
    d.addEventListener('mouseenter',function(){if(!mq.matches){clearTimeout(ct);ddOpen(d)}});
    d.addEventListener('mouseleave',function(){if(!mq.matches){clearTimeout(ct);ct=setTimeout(function(){ddClose(d)},delay)}});
  }
  if(p.t){
    p.t.addEventListener('click',function(){(openDd===d)?ddClose(d):ddOpen(d)});
    p.t.addEventListener('keydown',function(e){
      if(e.key==='Enter'||e.key===' '){e.preventDefault();(openDd===d)?ddClose(d):ddOpen(d)}
      if(e.key==='ArrowDown'){e.preventDefault();ddOpen(d);
        var f=d.querySelector('.w-dropdown-link');if(f)f.focus()}
    });
  }
  d.addEventListener('focusin',function(){if(!mq.matches)ddOpen(d)});
  d.addEventListener('focusout',function(e){if(!mq.matches&&!d.contains(e.relatedTarget))ddClose(d)});
});
document.addEventListener('keydown',function(e){
  if(e.key!=='Escape'||!openDd)return;
  var t=ddParts(openDd).t;ddClose(openDd);if(t)t.focus();
});

/* ---------- Navbar menu at the collapse width ---------- */
if(menu&&btn){
  var sheetOpen=false,hideT=null;
  var links=function(){return [].slice.call(menu.querySelectorAll('.w-nav-link'))};
  function sheetShow(){
    if(sheetOpen||!mq.matches)return;
    sheetOpen=true;clearTimeout(hideT);
    btn.classList.add('w--open');btn.setAttribute('aria-expanded','true');
    menu.setAttribute('data-nav-menu-open','');
    links().forEach(function(a){a.classList.add('w--nav-link-open')});
    menu.style.transition='none';menu.style.opacity='0';
    /* A FORCED REFLOW, NOT requestAnimationFrame. Measured 2026-09-11: with the release on rAF,
       a frame that is not being rendered never runs it and the sheet opens FULLY TRANSPARENT -
       rAF is paused in a background frame, timers and reflows are not. Reading a layout property
       commits the start state synchronously, so the transition below always has something to
       transition from. Same fix as homepage.js §3. */
    void menu.offsetHeight;
    menu.style.transition='opacity '+dur+'ms ease';menu.style.opacity='1';
  }
  function sheetHide(){
    if(!sheetOpen)return;
    sheetOpen=false;clearTimeout(hideT);
    btn.classList.remove('w--open');btn.setAttribute('aria-expanded','false');
    menu.style.transition='opacity '+dur+'ms ease';menu.style.opacity='0';
    hideT=setTimeout(function(){
      menu.removeAttribute('data-nav-menu-open');
      menu.style.transition='';menu.style.opacity='';
      links().forEach(function(a){a.classList.remove('w--nav-link-open')});
      dds.forEach(ddClose);
    },dur);
  }
  btn.addEventListener('click',function(){sheetOpen?sheetHide():sheetShow()});
  btn.addEventListener('keydown',function(e){
    if(e.key==='Enter'||e.key===' '){e.preventDefault();sheetOpen?sheetHide():sheetShow()}
  });
  menu.addEventListener('click',function(e){
    var t=e.target;
    while(t&&t!==menu){
      if(t.tagName==='A'&&!t.classList.contains('w-dropdown-toggle')){sheetHide();break}
      t=t.parentNode;
    }
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape')sheetHide()});
  var onBp=function(){
    if(!mq.matches){
      sheetOpen=false;clearTimeout(hideT);
      btn.classList.remove('w--open');btn.setAttribute('aria-expanded','false');
      menu.removeAttribute('data-nav-menu-open');
      menu.style.transition='';menu.style.opacity='';
      links().forEach(function(a){a.classList.remove('w--nav-link-open')});
    }
    dds.forEach(ddClose);
  };
  if(mq.addEventListener)mq.addEventListener('change',onBp);else if(mq.addListener)mq.addListener(onBp);
}
})();
