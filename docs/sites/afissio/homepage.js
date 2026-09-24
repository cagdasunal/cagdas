/* ============================================================================
   AFISSIO HOMEPAGE — PRODUCTION BEHAVIOUR SCRIPT
   ROUND-TOKEN: R13-WEBFLOW-READY (2026-09-11 · WP5)

   This file runs UNCHANGED on a Webflow page. It ships as one hosted, minified file for this
   page, loaded with `defer` after jQuery and webflow.js (F14).

   The contract it keeps, in full:
   · every behaviour is an IIFE with its own `window.__afissio…` guard, so a double include is a
     no-op rather than two controllers;
   · no globals, no `DOMContentLoaded` — `defer` already runs the file after the DOM is parsed;
   · every behaviour no-ops when its elements are absent, so the file is safe on all nine pages;
   · runtime state is set inline, which is the only place a state the Webflow Designer never sees
     can live (§4f);
   · reduced motion returns BEFORE anything is touched, and nothing ever rests at opacity:0 in a
     stylesheet — the finished page is the CSS rest state and every fade only ADDS to it;
   · `beforeprint` reveals everything first.

   WHAT CHANGED IN R13, and why it had to:
   R12 shipped ONE 30 KB inline block, and two of its sections OWNED the native widgets — the
   About dropdown toggled `w--open` on the wrapper, wrote `display` on the list, and bound its own
   hover / leave / click / Escape / ArrowDown; the ≤991 menu wrote `display` on `.w-nav-menu` and
   toggled `aria-expanded`. On a Webflow page webflow.js does all of that too, so the result was
   two controllers racing on every hover and every tap. Both owning halves are DELETED. What
   replaced them only DECORATES: a MutationObserver watches the state webflow.js sets — `w--open`
   on the dropdown toggle and list, `w--open` on the menu button, `data-nav-menu-open` on the menu
   — and plays the drawn opening. This file never adds or removes `w--open`, never writes
   `display` on a `w-*` part, and never binds an open or a close of its own.

   Preview only: preview-webflow-shim.js loads BEFORE this file and emulates exactly those state
   changes, so the preview behaves like the published site. It is never deployed.
   ============================================================================ */

/* ============================================================================
   1 · THE FIELD'S RESPONSIVE TRIM. One column count for the WHOLE field, trimmed from the left
   of every row, never a named case — which is what keeps the flat left edge straight at every
   width. Rows shed below 992 (five) and 768 (four). R13: the named cases are `.doc-slot`, so the
   "never trim a case" test reads that class instead of the rule-less `is-slot` it used to read.
   ============================================================================ */
(function(){
if(window.__afissioFieldFitV1)return;window.__afissioFieldFitV1=1;
var grid=document.querySelector('.doc-field_grid');if(!grid)return;
var rows=[].slice.call(grid.querySelectorAll('.doc-row'));if(!rows.length)return;
var kids=rows.map(function(r){return [].slice.call(r.children)});
function fit(){
  var field=grid.parentNode?grid.parentNode.getBoundingClientRect().width:0;
  var probe=kids[0][kids[0].length-1],tw=probe?probe.getBoundingClientRect().width:0;
  if(!field||!tw)return;
  var gap=parseFloat(getComputedStyle(rows[0]).columnGap)||8;
  var hold=Math.max(6,Math.floor((field+gap)/(tw+gap)));
  var vw=window.innerWidth||1280,deep=vw<=767?4:(vw<=991?5:rows.length);
  rows.forEach(function(r,ri){
    r.style.display=ri<deep?'':'none';
    var k=kids[ri],keep=Math.min(k.length,hold),n=k.length;
    k.forEach(function(t){t.style.display=''});
    for(var i=0;i<k.length&&n>keep;i++){
      if(k[i].classList.contains('doc-slot'))continue;
      k[i].style.display='none';n--;
    }
  });
}
fit();
var ft;window.addEventListener('resize',function(){clearTimeout(ft);ft=setTimeout(fit,140)});
})();

/* ============================================================================
   2 · HERO ANIMATION — GATHER AND FILE. The metaphor is literal: each beat assembles one case.
     t=0     the outgoing case settles back into the field
     t=300   three unrelated filings around the field WARM — picked up for review
             (inline border/face set here; the tile's own 2200ms curve does the ease)
     t=1500  one at a time, a paper GHOST lifts off each warmed filing and travels to the
             incoming case tile, shrinking as it is filed into it (1150ms per flight,
             400ms apart); the target warms as the documents land
     t=4000  the case ignites (is-hot), its marker surfaces, then its name and leader line
     t=4400  the source filings cool back to rest
   then nothing moves until the next beat, one beat every 11s, three cases out at any time.

   Ghosts are decorative runtime elements this script creates and removes. No keyframes — only
   transitions on inline styles. Every fade is ≥350ms on one curve; nothing blinks, nothing rests
   at opacity:0 in CSS. The OPENING stays fast, by request: 63 filings fade up 13ms apart, once.
   Reduced motion returns and the CSS rest state is the finished one: the field open with the
   deck's three documents named.

   R13: the class names are the only change. Cases are `.doc-slot` (a chain an element really
   wears, so Webflow publishes its lit rules — see WP3.2); plain filings are `.doc-tile`; the
   whole field is both.
   ============================================================================ */
(function(){
if(window.__afissioFieldV1)return;window.__afissioFieldV1=1;
if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
function watch(el, fn){
  var r = el.getBoundingClientRect(), vh = window.innerHeight || 0;
  if(r.top < vh && r.bottom > 0){ fn(el); return }
  if(!('IntersectionObserver' in window)){ fn(el); return }
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ io.disconnect(); fn(el) } });
  }, { threshold: 0.12 });
  io.observe(el);
}
/* SEQ is the reading order expressed as positions in the case array (DOM order: cap table ·
   employment · equity grants · IP assignment · data · commercial · customer MSA ·
   capitalization · governance) — it jumps row and side every beat. */
var SEQ=[0,3,6,2,5,8,1,4,7], HELD=3, EVERY=11000;
function start(g){
  if(g.getAttribute('data-run'))return;g.setAttribute('data-run','1');
  var field=(g.parentNode&&(' '+g.parentNode.className+' ').indexOf(' doc-field ')>-1)?g.parentNode:g;
  field.style.position='relative';
  var tiles=[].slice.call(g.querySelectorAll('.doc-tile,.doc-slot'));
  var slots=[].slice.call(g.querySelectorAll('.doc-slot'));
  var plain=[].slice.call(g.querySelectorAll('.doc-tile'));
  if(slots.length<SEQ.length)return;
  function dim(s){var m=s.querySelector('.doc-tile_mark'),cp=s.querySelector('.doc-tile_cap');
    if(m)m.classList.add('is-dim');if(cp)cp.classList.add('is-dim');
    s.classList.remove('is-hot')}
  function lite(s){var m=s.querySelector('.doc-tile_mark'),cp=s.querySelector('.doc-tile_cap');
    s.style.borderColor='';s.style.backgroundColor='';
    s.classList.add('is-hot');
    setTimeout(function(){if(m)m.classList.remove('is-dim')},1200);
    setTimeout(function(){if(cp)cp.classList.remove('is-dim')},1900)}
  /* three plain filings from three different rows, none already in use */
  function pick3(){var c=plain.slice(),out=[],rows=[];
    for(var i=c.length-1;i>0;i--){var j=(Math.random()*(i+1))|0,tmp=c[i];c[i]=c[j];c[j]=tmp}
    for(var k=0;k<c.length&&out.length<3;k++){
      if(c[k].getAttribute('data-busy'))continue;
      if(!c[k].offsetParent)continue;
      if(rows.indexOf(c[k].parentNode)>-1)continue;
      out.push(c[k]);rows.push(c[k].parentNode)}
    return out}
  /* one document filed: a paper ghost lifts off the source, travels to the case, shrinks in */
  function fly(src,dst){
    var fr=field.getBoundingClientRect(),a=src.getBoundingClientRect(),b=dst.getBoundingClientRect();
    var gh=document.createElement('div');gh.setAttribute('aria-hidden','true');
    gh.style.position='absolute';gh.style.left=(a.left-fr.left)+'px';gh.style.top=(a.top-fr.top)+'px';
    gh.style.width=a.width+'px';gh.style.height=a.height+'px';
    gh.style.border='1px solid #93490A';gh.style.backgroundColor='#140A02';
    gh.style.opacity='0';gh.style.pointerEvents='none';gh.style.zIndex='2';gh.style.willChange='transform,opacity';
    var ln=document.createElement('div');
    ln.style.position='absolute';ln.style.left='0.5rem';ln.style.right='0.5rem';ln.style.top='0.75rem';ln.style.height='1px';ln.style.backgroundColor='#93490A';
    gh.appendChild(ln);field.appendChild(gh);
    var dx=(b.left-a.left),dy=(b.top-a.top);
    requestAnimationFrame(function(){requestAnimationFrame(function(){
      gh.style.transition='opacity 350ms cubic-bezier(0.33,0,0.2,1)';gh.style.opacity='0.9';
      setTimeout(function(){
        gh.style.transition='transform 1150ms cubic-bezier(0.45,0,0.15,1),opacity 1150ms cubic-bezier(0.7,0,0.9,0.6)';
        gh.style.transform='translate('+dx+'px,'+dy+'px) scale(0.45)';gh.style.opacity='0';
        setTimeout(function(){if(gh.parentNode)gh.parentNode.removeChild(gh)},1300);
      },380);
    })});
  }
  /* the opening: fast, once */
  tiles.forEach(function(t){t.style.opacity='0'});
  tiles.forEach(function(t,i){setTimeout(function(){t.style.opacity=''},60+i*13)});
  var settled=60+tiles.length*13+600;
  var p=HELD;
  function live(){return slots.filter(function(s){return !!s.offsetParent})}
  function beat(){
    var v=live();if(v.length<4)return;
    var sq=SEQ.filter(function(i){return i<v.length});
    dim(v[sq[(p-HELD)%sq.length]]);
    var next=v[sq[p%sq.length]];
    var srcs=pick3();
    srcs.forEach(function(s,i){s.setAttribute('data-busy','1');
      setTimeout(function(){s.style.borderColor='#4A2E14';s.style.backgroundColor='#120A03'},300+i*250)});
    srcs.forEach(function(s,i){setTimeout(function(){fly(s,next)},1500+i*400)});
    setTimeout(function(){next.style.borderColor='#7A4008';next.style.backgroundColor='#1C0D00'},2400);
    setTimeout(function(){lite(next)},4000);
    setTimeout(function(){srcs.forEach(function(s){s.style.borderColor='';s.style.backgroundColor='';s.removeAttribute('data-busy')})},4400);
    p++;
  }
  setTimeout(function(){beat();setInterval(beat,EVERY)},settled+1200);
}
[].slice.call(document.querySelectorAll('.doc-field_grid')).forEach(function(g){watch(g,start)});
})();

/* ============================================================================
   3 · THE ABOUT DROPDOWN — A DECORATOR, NOT A CONTROLLER.
   webflow.js owns opening and closing: `data-hover="true"` opens on hover, `data-delay="120"`
   forgives the seam, and on open it adds `w--open` to the TOGGLE and to the LIST — never to the
   wrapper (F7), which is why R12's wrapper-state hover bridge could never have worked and why
   WP4.3 replaced it with a toggle that physically reaches the panel's top edge.

   All this block does is watch for that state and play the drawn opening, exactly as before: a
   1px orange rule draws across the panel's top edge (420ms), the panel unrolls from that edge on
   a clip-path wipe (420ms), the two items rise 8px in sequence 70ms apart, and the caret turns.
   It writes NOTHING that webflow.js owns: no `w--open`, no `display`, no event binding.

   Because Webflow's base closes the panel with `display:none`, the class sheet no longer rests it
   at `opacity:0` (§4c-bis) — this block ARMS the closed panel inline instead, so JS-off and print
   get the finished panel and the wipe only ever adds to something that already renders.

   The 140ms close fade R12 ran is now Webflow's to own: with `w--open` removed the list is
   `display:none` in the same frame, and a decorator cannot hold a hidden element on screen.
   Restoring it is MANUAL DEPLOY STEP #6 — set the Dropdown's own close animation to a 140ms fade
   in the Designer. The preview shim reproduces today's behaviour so the two can be compared.
   ============================================================================ */
(function(){
if(window.__afissioDropdownDecorV1)return;window.__afissioDropdownDecorV1=1;
var dds=[].slice.call(document.querySelectorAll('.navbar_dropdown'));if(!dds.length)return;
var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var mqM=window.matchMedia('(max-width: 991px)');
function L(d){return d.querySelector('.navbar_dropdown-list')}
function T(d){return d.querySelector('.navbar_dropdown-toggle')}
function K(d){return d.querySelector('.navbar_dropdown-caret')}
function E(d){return d.querySelector('.navbar_dropdown-edge')}
function I(d){return [].slice.call(d.querySelectorAll('.navbar_dropdown-link'))}
function isOpen(d){
  var t=T(d),l=L(d);
  return !!((t&&t.classList.contains('w--open'))||(l&&l.classList.contains('w--open')));
}
function arm(d){                                     /* the closed, pre-wipe state, inline only */
  if(reduce||mqM.matches)return;
  var l=L(d),e=E(d);
  if(l){l.style.transition='none';l.style.opacity='0';l.style.clipPath='inset(0 0 100% 0)'}
  if(e)e.style.transform='scaleX(0)';
  I(d).forEach(function(a){a.style.transition='none';a.style.opacity='0';a.style.transform='translateY(8px)'});
}
function play(d){
  var l=L(d),k=K(d),e=E(d);
  if(k&&!mqM.matches)k.style.transform='rotate(225deg) translateY(-0.0625rem)';
  if(!l)return;
  if(reduce||mqM.matches){
    l.style.opacity='';l.style.clipPath='';
    I(d).forEach(function(a){a.style.transition='';a.style.opacity='';a.style.transform=''});
    return;
  }
  var its=I(d);
  l.style.transition='none';l.style.opacity='1';l.style.clipPath='inset(0 0 100% 0)';
  if(e){e.style.transition='none';e.style.transform='scaleX(0)'}
  its.forEach(function(a){a.style.transition='none';a.style.opacity='0';a.style.transform='translateY(8px)'});
  /* A FORCED REFLOW, NOT requestAnimationFrame. Measured in this project's own preview
     2026-09-11: the wipe above is set, the rAF that was supposed to release it never fires
     because rAF is PAUSED in a frame that is not being rendered - and the panel then sits OPEN
     and CLIPPED TO ZERO HEIGHT, which is content gated behind a callback that may never run.
     Reading a layout property flushes the start state synchronously, so the transition below
     always has something to transition FROM, in a background frame as much as a foreground one.
     Same lesson the settle learned about IntersectionObserver and rAF; same fix shape. */
  void l.offsetHeight;
  if(e){e.style.transition='transform 420ms cubic-bezier(0.22,1,0.36,1)';e.style.transform='scaleX(1)'}
  l.style.transition='clip-path 420ms cubic-bezier(0.22,1,0.36,1)';l.style.clipPath='inset(0 0 0 0)';
  its.forEach(function(a,i){var dl=(90+i*70)+'ms';
   a.style.transition='opacity 380ms cubic-bezier(0.22,1,0.36,1) '+dl+',transform 460ms cubic-bezier(0.22,1,0.36,1) '+dl+',color 420ms cubic-bezier(0.22,1,0.36,1)';
   a.style.opacity='1';a.style.transform='translateY(0)'});
}
function rest(d){
  var k=K(d);if(k)k.style.transform='';
  arm(d);
}
dds.forEach(function(d){
  var was=isOpen(d);
  if(!was)arm(d);else play(d);
  var sync=function(){var now=isOpen(d);if(now===was)return;was=now;now?play(d):rest(d)};
  var mo=new MutationObserver(sync);
  var t=T(d),l=L(d);
  if(t)mo.observe(t,{attributes:true,attributeFilter:['class']});
  if(l)mo.observe(l,{attributes:true,attributeFilter:['class','style']});
  var onBp=function(){was=isOpen(d);
    var ll=L(d),ee=E(d),kk=K(d);
    if(ll){ll.style.transition='';ll.style.opacity='';ll.style.clipPath=''}
    if(ee)ee.style.transform='';
    if(kk)kk.style.transform='';
    I(d).forEach(function(a){a.style.transition='';a.style.opacity='';a.style.transform=''});
    if(!was)arm(d);else play(d)};
  if(mqM.addEventListener)mqM.addEventListener('change',onBp);else if(mqM.addListener)mqM.addListener(onBp);
});
})();

/* ============================================================================
   4 · THE ≤991 FULL-SCREEN SHEET — A DECORATOR, NOT A CONTROLLER.
   webflow.js owns the open and the close: at the collapse width the menu button gets `w--open`,
   the menu gets the attribute `data-nav-menu-open`, and the menu is shown inside a generated
   `.w-nav-overlay` (F7). This block tolerates EITHER form as its open test, because which one
   lands first is not worth guessing (§7).

   The sheet's own cross-fade is Webflow's, at `data-duration="280"` on the Navbar — chosen so the
   CLOSE is exactly R12's 280ms fade rather than a pop, and so two engines never write the same
   inline `opacity`. The open is therefore 280ms rather than R12's 350ms: the one timing this
   round moves, by 70ms, underneath an item stagger whose last item lands at ~855ms. Everything
   Webflow cannot do stays here: the item stagger 45ms apart, the burger's three bars crossing,
   the body-scroll lock, and clearing Webflow's `.w-nav-button.w--open` grey ground (#c8c8c8),
   which cannot be beaten by any authorable chain because `w--open` has no style object (F7).

   It never writes `display` on the menu and never touches `w--open`.
   ============================================================================ */
(function(){
if(window.__afissioSheetDecorV1)return;window.__afissioSheetDecorV1=1;
var menu=document.querySelector('.navbar_menu'),btn=document.querySelector('.navbar_menu-button');
if(!menu||!btn)return;
var bars=[].slice.call(btn.querySelectorAll('.navbar_menu-bar'));
var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var mq=window.matchMedia('(max-width: 991px)');
function items(){
  var a=[].slice.call(menu.querySelectorAll('.navbar_link,.navbar_dropdown'));
  var bw=menu.querySelector('.navbar_button-wrapper');if(bw)a.push(bw);
  return a;
}
function isOpen(){
  return btn.classList.contains('w--open')||menu.hasAttribute('data-nav-menu-open');
}
function bx(x){if(bars.length<3)return;
  bars[0].style.transform=x?'translateY(8px) rotate(45deg)':'';
  bars[1].style.opacity=x?'0':'';
  bars[2].style.transform=x?'translateY(-8px) rotate(-45deg)':''}
function open(){
  btn.style.backgroundColor='transparent';                 /* neutralise w--open's #c8c8c8 */
  document.body.style.overflow='hidden';
  bx(true);
  if(reduce){items().forEach(function(el){el.style.transition='';el.style.opacity='';el.style.transform=''});return}
  var its=items();
  its.forEach(function(el){el.style.transition='none';el.style.opacity='0';el.style.transform='translateY(18px)'});
  void menu.offsetHeight;                /* flush the start state synchronously - see §3's note */
  its.forEach(function(el,i){var d=(80+i*45)+'ms';
    el.style.transition='opacity 550ms cubic-bezier(0.22,1,0.36,1) '+d+',transform 650ms cubic-bezier(0.22,1,0.36,1) '+d;
    el.style.opacity='1';el.style.transform='translateY(0)'});
}
function close(){
  btn.style.backgroundColor='';
  document.body.style.overflow='';
  bx(false);
  items().forEach(function(el){el.style.transition='';el.style.opacity='';el.style.transform=''});
}
var was=isOpen();
if(was)open();
function sync(){var now=isOpen();if(now===was)return;was=now;now?open():close()}
new MutationObserver(sync).observe(btn,{attributes:true,attributeFilter:['class']});
new MutationObserver(sync).observe(menu,{attributes:true,attributeFilter:['data-nav-menu-open','class']});
function onBp(){if(!mq.matches){was=false;close()}else{was=isOpen();was?open():close()}}
if(mq.addEventListener)mq.addEventListener('change',onBp);else if(mq.addListener)mq.addListener(onBp);
})();

/* ============================================================================
   5 · THE INTRO ILLUSTRATION — the mark, always present, with a slow LIGHT PASS across it.
   The GHOST and the INK are both unclipped at all times — the full apex is on the page from the
   first frame. What animates is a third copy of the same image, cloned here, sitting over the ink
   at a slightly higher opacity and MASKED to a soft vertical band ~55% of the mark's width. That
   band travels left → right → left on a cosine, 16s per direction, so the mark reads as slowly
   lit from one side and then the other. No clip-path, no line, no stroke — the logo has none.
   The pass layer is a runtime element this script creates. Reduced motion returns; the CSS rest
   state IS the finished mark.

   R13: the apex is an `<img>` now, not inline `<svg>` (F9 — inline SVG is skipped by the plan
   generator and becomes hand work; a file behind `<img>` is uploaded and bound). The clone,
   the mask and the drift are byte-identical in behaviour; only the node type changed.
   ============================================================================ */
(function(){
if(window.__afissioIntroPassV1)return;window.__afissioIntroPassV1=1;
if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var arts=[].slice.call(document.querySelectorAll('.intro_art'));
if(!arts.length)return;
var PERIOD=26000, DRIFT=12, BAND=60, OVER=12;
arts.forEach(function(art){
  var ink=art.querySelector('.intro_art-svg.is-ink');if(!ink)return;
  var pass=ink.cloneNode(true);
  pass.setAttribute('aria-hidden','true');pass.classList.remove('is-ink');
  pass.style.position='absolute';pass.style.top='0';pass.style.left='0';pass.style.width='100%';pass.style.height='auto';
  pass.style.opacity='0.42';pass.style.pointerEvents='none';pass.style.willChange='mask-image';
  ink.parentNode.appendChild(pass);
  art.__pass=pass;
});
function frame(now){
  var t=now||0;
  var p=(1-Math.cos((t/PERIOD)*Math.PI*2))/2;                 /* 0..1..0, eased at both ends */
  var c=-OVER+p*(100+2*OVER);                                   /* band centre, % of width */
  var m='linear-gradient(90deg, rgba(0,0,0,0) '+(c-BAND/2).toFixed(2)+'%, rgba(0,0,0,1) '+c.toFixed(2)+'%, rgba(0,0,0,0) '+(c+BAND/2).toFixed(2)+'%)';
  arts.forEach(function(art){
    var pass=art.__pass;
    if(pass){pass.style.webkitMaskImage=m;pass.style.maskImage=m}
    var s=art.parentNode;
    if(s){var r=s.getBoundingClientRect(),vh=window.innerHeight||1;
      var q=Math.max(0,Math.min(1,(vh-r.top)/(vh+r.height)))-0.5;
      art.style.transform='translateY(-50%) translate3d(0,'+(q*DRIFT).toFixed(2)+'px,0)'}
  });
  requestAnimationFrame(frame)}
requestAnimationFrame(frame);
})();

/* THE OFFER BOXES carry no motion (client 2026-09-09): three static treads, hover states only. */

/* ============================================================================
   6 · PROOF CARD HOVER — photo and logo come up to full colour while the pointer (or keyboard
   focus) is on the card, and drop back to greyscale on leave. Set inline at runtime because a
   descendant :hover rule cannot deploy (§4a / §4f).
   ============================================================================ */
(function(){
if(window.__afissioProofHoverV1)return;window.__afissioProofHoverV1=1;
var cards=[].slice.call(document.querySelectorAll('.proof_card'));
if(!cards.length)return;
cards.forEach(function(c){
  var ph=c.querySelector('.proof_photo'),lg=c.querySelector('.proof_logo');
  function lit(on){
    if(ph)ph.style.filter=on?'grayscale(0%) contrast(1) brightness(1)':'';
    if(lg){lg.style.filter=on?'grayscale(0%)':'';lg.style.opacity=on?'1':''}
  }
  c.addEventListener('mouseenter',function(){lit(true)});
  c.addEventListener('mouseleave',function(){lit(false)});
  c.addEventListener('focusin',function(){lit(true)});
  c.addEventListener('focusout',function(){lit(false)});
});
})();

/* ============================================================================
   7 · THE TESTIMONIAL SLIDER. Swiper is the native carousel (STRUCTURE.md §0a), so the markup is
   real swiper / swiper-wrapper / swiper-slide and only the dressing classes are ours. Two cards
   full and the third cut by the page edge, drag and swipe, a progress bar between two drawn
   arrows. No CSS depends on the script having run — the card carries min-height, not a computed
   height.

   R13: the arrows are found STRUCTURALLY — first and last `.proof_arrow` — because `is-prev` and
   `is-next` carried no declaration, so they would never have become style objects and the
   elements would have arrived in Webflow without them (F4), leaving both arrows dead. A class
   that exists only as a JS hook is banned; a `data-*` hook would be a manual step per element
   at deploy (F12). Structure is free.
   ============================================================================ */
(function(){
if(window.__afissioCarouselV1)return;window.__afissioCarouselV1=1;
function init(){
  var el=document.querySelector('.proof_slider');
  if(!el||!window.Swiper)return;
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sw=new Swiper(el,{
    slidesPerView:1.15,
    spaceBetween:20,
    grabCursor:true,
    autoHeight:false,
    speed:reduce?0:620,
    resistanceRatio:0.72,
    a11y:{enabled:true},
    keyboard:{enabled:true},
    breakpoints:{768:{slidesPerView:2.2,spaceBetween:24},992:{slidesPerView:2.5,spaceBetween:32}}
  });
  /* our own progress bar rather than Swiper's: the widget's pagination fill is its own element
     and cannot carry one of our classes, and its colour comes from a variable Swiper declares
     itself. The script sets the width inline, which is the sanctioned pattern for a state the
     Designer never sees. */
  /* equal-height cards: Swiper's sheet loads after ours and sets .swiper-slide{height:100%;display:block}, which
     blocks flex stretch; releasing both inline lets every slide stretch to the tallest and the card fill it (operator
     2026-09-24). The card's foot is margin-top:auto, so logos, quotes and attributions align. */
  sw.slides.forEach(function(s){s.style.height='auto';s.style.display='flex'});
  var fill=document.querySelector('.proof_progress-fill');
  function prog(){
    if(!fill)return;
    var n=sw.slides.length-(sw.params.slidesPerView||1);
    var v=n>0?(sw.activeIndex/n):1;
    fill.style.width=(Math.max(0,Math.min(1,v))*100)+'%';
  }
  sw.on('slideChange',prog);sw.on('resize',prog);prog();
  var arrows=[].slice.call(document.querySelectorAll('.proof_arrow'));
  var p=arrows[0],n=arrows[arrows.length-1];
  function bind(b,fn){if(!b)return;b.addEventListener('click',fn);
    b.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();fn()}})}
  if(p!==n){bind(p,function(){sw.slidePrev()});bind(n,function(){sw.slideNext()})}
}
if(window.Swiper)init();else window.addEventListener('load',init);
})();

/* ============================================================================
   8 · THE RULE SYSTEM DRIFTS. Every section divider carries the orange sweep, and each carries
   TWO segments half a span apart so there is always motion on every one rather than only on the
   ones whose single segment happens to be in view.
   ============================================================================ */
(function(){
if(window.__afissioRuleDriftV1)return;window.__afissioRuleDriftV1=1;
if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
/* 2026-09-24: the masthead rule and the Industries spine join the system; the spine is vertical. */
var H=[].slice.call(document.querySelectorAll('.rules_h-bottom,.footer_rule,.page-header_rule,.register_spine'));
if(!H.length)return;
function seg(p,v){var s=document.createElement('div');s.setAttribute('aria-hidden','true');
s.style.position='absolute';s.style.willChange='transform';s.style.opacity='0.85';
s.style.height=v?'16rem':'1px';s.style.width=v?'1px':'16rem';s.style.top='0';s.style.left='0';
s.style.background='linear-gradient('+(v?180:90)+'deg, transparent 0%, #FF6600 50%, transparent 100%)';
if(getComputedStyle(p).position==='static')p.style.position='relative';
p.style.overflow='hidden';p.appendChild(s);return s}
var hs=H.map(function(p){var v=(' '+p.className+' ').indexOf(' register_spine ')>-1;return{p:p,v:v,ss:[seg(p,v),seg(p,v)],ph:Math.random(),auto:!!(p.closest('.navbar_component')||p.closest('.section_hero'))}});
var cur=window.scrollY||0;
function frame(now){var tgt=window.scrollY||0;cur+=(tgt-cur)*0.05;var t=(now||0)*0.0105;
hs.forEach(function(o){var len=o.v?o.p.offsetHeight:o.p.offsetWidth,sl=256,span=len+sl;if(span<=sl)return;
var d=cur*0.1+(o.auto?t*1.5:t);
o.ss.forEach(function(s,i){var x=((d+(o.ph+i/o.ss.length)*span)%span+span)%span-sl;s.style.transform=(o.v?'translateY(':'translateX(')+x+'px)'})});
requestAnimationFrame(frame)}
requestAnimationFrame(frame);
})();

/* ============================================================================
   9 · STICKY BAR: hidden on scroll-down, revealed on scroll-up (frozen from v1).
   R13: it transforms `.navbar_shell`, the plain classed wrapper that now carries `position:fixed`
   — `position` cannot be authored on `.navbar_component`, which IS the Webflow Navbar (F6). The
   thresholds, the accumulator and the 1400ms/1600ms transitions are unchanged.
   ============================================================================ */
(function(){
if(window.__afissioStickyBarV1)return;window.__afissioStickyBarV1=1;
var bar=document.querySelector('.navbar_shell');if(!bar)return;
if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)bar.style.transition='none';
var last=window.scrollY||0,hidden=false,tick=false,acc=0,grounded=null;
function show(){if(!hidden)return;hidden=false;bar.style.transform='translateY(0)';bar.style.opacity='1'}
function hide(){if(hidden)return;hidden=true;bar.style.transform='translateY(-101%)';bar.style.opacity='0'}
/* R20 - THE GROUND ARRIVES ON SCROLL. The bar rests transparent so the hero's field runs unbroken
   from y=0 behind it; past 24px of scroll it takes the page's own surface token so the links never
   sit on moving content. Inline because a runtime-only combo is pruned from the published CSS
   (§4f); the 360ms transition is authored on `.navbar_shell` and deploys. Idempotent - it writes
   only on a change - and the rest state is the empty string, so removing this script leaves the
   bar transparent rather than stuck. */
function ground(y){var on=y>24;if(on===grounded)return;grounded=on;bar.style.backgroundColor=on?'#000000':''}
function upd(){tick=false;var y=window.scrollY||0,d=y-last;last=y;
ground(y);
if(Math.abs(d)<1)return;
if((d>0)!==(acc>0))acc=0;
acc+=d;
if(y<160){acc=0;show();return}
if(acc>120)hide();
else if(acc<-64)show()}
window.addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(upd)}},{passive:true});
ground(window.scrollY||0);   /* a reload part-way down the page must not open transparent */
})();

/* ============================================================================
   10 · INSIGHT CARD HOVER — the action line's underline drops away from the text and thickens
   while the pointer (or keyboard focus) is on the card. Set inline at runtime because a
   descendant :hover rule cannot deploy (§4a / §4f); the transition itself lives on
   `.insights_action`, so reduced motion is honoured by the browser and the rest state is the
   finished underline.
   ============================================================================ */
(function(){
if(window.__afissioInsightHoverV1)return;window.__afissioInsightHoverV1=1;
var cards=[].slice.call(document.querySelectorAll('.insights_card'));
if(!cards.length)return;
cards.forEach(function(c){
  var a=c.querySelector('.insights_action');if(!a)return;
  function lit(on){
    a.style.textUnderlineOffset=on?'0.8em':'';
    a.style.textDecorationThickness=on?'2px':'';
  }
  c.addEventListener('mouseenter',function(){lit(true)});
  c.addEventListener('mouseleave',function(){lit(false)});
  c.addEventListener('focusin',function(){lit(true)});
  c.addEventListener('focusout',function(){lit(false)});
});
})();

/* ============================================================================
   11 · THE SETTLE. The page arrives rather than assembles: as each section comes into view its
   blocks come up to full opacity over 1.6s, an eighth of a second apart, and NOTHING MOVES — no
   rise, no slide, no scale. Opacity is the only property that changes.

   Why it is built this way rather than as CSS:
   · nothing rests at opacity:0 in the stylesheet (§4c-bis). The script sets the start state
     inline, so a reader with JS off, a print, or a crawler gets the finished page — the fade can
     only ADD to something that already renders.
   · @keyframes do not survive the style pipeline, so the fade is a transition on an inline value,
     set and then cleared — the element ends with NO inline transition, which is what lets the
     hover transitions on .ways_box / .insights_card / .proof_card keep their own timing after.
   · reduced motion returns before anything is touched, and prefers-reduced-motion is honoured
     here rather than in a stylesheet the pipeline would drop whole.
   · it is driven by RECT MATH on scroll, not by IntersectionObserver. Measured 2026-09-09 in this
     project's own preview: the frame loads while it is not yet visible, an observer in a hidden
     frame reports nothing intersecting, and the whole page had already been revealed by the
     failsafe before the reader could scroll a pixel. A rect is valid whether or not the frame is
     on screen, so the reveal survives being loaded in the background.
   · if an element cannot be measured at all (a display:none ancestor returns a zero rect) it is
     revealed unconditionally rather than left hidden, and printing reveals everything first.
   The hero is deliberately NOT in the set: it carries the opening of the document field and must
   be whole the moment the page paints. The footer is out too (client 2026-09-09): it is the
   page's ground, and ground does not arrive.
   ============================================================================ */
(function(){
if(window.__afissioSettleV1)return;window.__afissioSettleV1=1;
if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var SEL=['#intro .intro_stack',
 '#friction .statement_label-col','#friction .statement_display-col','#friction .statement_body-col',
 '#anticipate .tagline_row','#anticipate .claim_lede-block',
 '#engage .ways_head','#engage .ways_box',
 '#method .method_head','#method .method_card',
 '#proof .proof_head','#proof .proof_slider','#proof .proof_controls',
 '#insights .insights_head','#insights .insights_card',
 '#contact .close_stack'].join(',');
var els=[].slice.call(document.querySelectorAll(SEL));
if(!els.length)return;
var EASE='cubic-bezier(0.33,0,0.2,1)',DUR=1600,STEP=130;
/* the stagger runs WITHIN a section, so every section settles the same way wherever the reader
   enters the page */
var hosts=[],groups=[];
els.forEach(function(el){
  var s=el.closest?el.closest('section,.footer_component,footer'):null;
  var i=hosts.indexOf(s);
  if(i<0){hosts.push(s);groups.push([el])}else{groups[i].push(el)}
});
groups.forEach(function(g){g.forEach(function(el,k){el.setAttribute('data-settle',k)})});
function clear(el){el.style.transition='';el.style.opacity=''}
function show(el){
  var k=parseInt(el.getAttribute('data-settle'),10)||0,d=k*STEP;
  el.style.transition='opacity '+DUR+'ms '+EASE+' '+d+'ms';
  el.style.opacity='1';
  setTimeout(function(){clear(el);el.removeAttribute('data-settle')},DUR+d+140);
}
els.forEach(function(el){el.style.opacity='0'});
var waiting=els.slice(),tick=false;
function pass(){
  tick=false;
  var vh=window.innerHeight||document.documentElement.clientHeight||0;
  waiting=waiting.filter(function(el){
    var r=el.getBoundingClientRect();
    if(!r.height&&!r.top&&!r.bottom){show(el);return false}      /* unmeasurable: never hide it */
    /* one-way: crossing the line reveals, and anything ALREADY past it (a jump, a restored
       scroll position, a fast fling that skipped a pass) reveals too — a block must never be
       left blank because the reader arrived from below or too quickly. */
    if(r.top<vh){show(el);return false}
    return true;
  });
  if(!waiting.length)detach();
}
/* rAF is the fast path for a smooth scroll, but it is PAUSED in a frame that is not on screen —
   measured 2026-09-09: with the reveal scheduled on rAF alone, a frame scrolled while hidden
   never ran a pass and the page stayed blank. The interval is the floor: timers fire in a
   background frame, so the reveal always catches up. */
function onScroll(){if(tick)return;tick=true;requestAnimationFrame(pass)}
var poll=setInterval(function(){tick=false;pass()},400);
function detach(){
  clearInterval(poll);
  window.removeEventListener('scroll',onScroll);
  window.removeEventListener('resize',onScroll);
  document.removeEventListener('visibilitychange',onScroll);
}
window.addEventListener('scroll',onScroll,{passive:true});
window.addEventListener('resize',onScroll);
document.addEventListener('visibilitychange',onScroll);
window.addEventListener('beforeprint',function(){detach();waiting.forEach(clear)});
pass();
})();
