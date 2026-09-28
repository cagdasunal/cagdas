/* ============================================================================
   AFISSIO — THE SHARED INTERIOR BEHAVIOUR SCRIPT
   ROUND-TOKEN: R30-BUTTON-PURPOSE (2026-09-22) - section 5 only: the accordion trigger is a Div
   Block with role="button" + tabindex="0" now, so this file owns Enter as well as Space. No other
   pass, selector, timing or failsafe changed. Previous token: R19-INSIGHTS (2026-09-18), below.
   ROUND-TOKEN: R19-INSIGHTS (2026-09-18)

   WAS pages/our-approach.js. Solutions' brief §3 and Insights' brief §3 both forbid a second and a
   third copy of a shared pass, so every behaviour an interior page can share lives here and every
   interior page links this ONE file. Our Approach's own file is deleted rather than left as a stale
   second copy; a page keeps a file of its own only for code no other page could use, and after
   this move no such code exists.

   ALL SIX PASSES BELOW ARE UNCHANGED from the R16/R17 file except for two mechanical edits, both
   named so the next reader does not have to diff:
     · the window guards are __afissioInterior… instead of __afissioApproach… (the two renamed
       passes are the settle and the field; the lattice, the accordion's sibling passes and the
       quote ember kept theirs, which were never page-named);
     · §2 takes querySelectorAll instead of querySelector, so a page carrying TWO headers — which
       is what an options page under review is — paints both fields instead of leaving the second
       a dead black box. With one canvas the behaviour is identical, which is what Our Approach
       must and does still get.
   Nothing else moved: same selectors, same timings, same easing, same failsafes, same reduced-motion
   returns, same beforeprint reveals. Our Approach behaves exactly as before.

   WHICH PASS SERVES WHICH PAGE. Every one is keyed to the ELEMENTS it serves and no-ops without
   them, so this file is safe on any interior page:
     1 settle          every interior page (class-keyed, never id-keyed)
     2 hero wave field every interior page header (.hero-wave — the canvas is CREATED, R27)
     3 compute lattice a statement band that asks for it (.compute-field, same) — Our Approach
     4 step focus      a numbered sequence (.step-plate) — Our Approach
     5 accordion       an FAQ list (.faq_row) — Our Approach
     6 quote ember     a testimonial panel (.quote_glyph) — Our Approach

   PREVIOUS HEADER, kept because everything it says is still true of the passes below:
   AFISSIO — OUR APPROACH · PRODUCTION BEHAVIOUR SCRIPT
   ROUND-TOKEN: R16-OUR-APPROACH (2026-09-17)

   FIVE behaviours are this page's own (R17 + its 2026-09-17 revisions): the settle list, the
   HERO WAVE FIELD behind the left-aligned page header, the COMPUTING LATTICE behind #judgment, and the
   per-step TILE ARRIVAL in #steps (section 4), plus the #questions ACCORDION (section 5). Everything else it needs is in
   pages/homepage.js, which is LINKED and never copied: the dropdown and sheet decorators, the
   hide-on-scroll bar and the rule sweeps. Its field behaviours and its own intro light pass find
   no elements here and no-op: this page rebuilds neither the document field nor `intro_art` - the
   header's watermark is `page-header_art`, and section 2 below drives it with its OWN guard, so
   the two passes can never both claim the same element. Its own settle is keyed
   to the homepage's eight ids
   (#intro #friction #anticipate #engage #method #proof #insights #contact) and this page uses
   none of them, so nothing is settled twice and the homepage's behaviour is untouched.

   #steps CARRIES NO ANIMATION, deliberately (BUILD-BRIEF §5 allows one and permits none):
   the settle below already stages the six steps in DOM order 130ms apart, so 1 → 6 arrives in
   order, once; a second engine narrating the same sequence is noise, and the lit marker is STATE,
   which must rest finished. See pages/our-approach/PHASE0.md §5.

   The contract, same as homepage.js: one IIFE with its own window.__afissio… guard · no globals ·
   no DOMContentLoaded (defer already runs after parse) · every behaviour no-ops when its elements
   are absent · runtime state inline only · reduced motion returns BEFORE anything is touched ·
   nothing rests at opacity:0 in any stylesheet, so a reader with JS off, a print or a crawler
   gets the finished page and the fade can only ADD to it · beforeprint reveals everything.
   ============================================================================ */

/* ============================================================================
   1 · THE SETTLE. Each section's blocks come up to full opacity over 1.6s, 130ms apart, and
   NOTHING MOVES — opacity is the only property that changes. Identical timing, easing, stagger
   and failsafes to homepage.js §11; only the selector list is this page's.

   R17: the sequence's host is `sequence_aside` now, not `sequence_head` - the sticky head, its
   description and its CTA settle as ONE block, and the six steps stagger past it afterwards.
   R35: #voice settles as ONE block too - `quote_panel`, the bracketed panel that replaced the
   centred `quote_stack` (portrait, mark, words and foot arrive together, as a panel should).

   The list is keyed on CLASSES, not ids: at review both option blocks of every section had to
   settle and only the A block carried an id, and after Phase D it stays that way so the next
   interior page inherits the list by wearing the families, not by adding its ids here. The page
   header is excluded — as the homepage's hero is —
   so the H1 and the lead are whole the moment the page paints; the footer is excluded because it
   is the page's ground, and ground does not arrive.

   Driven by RECT MATH on scroll, not IntersectionObserver, and with an interval floor: rAF is
   PAUSED and an observer reports nothing in a frame that is not being rendered, and both
   failures leave content blank. A rect is valid either way, and timers fire either way. And if the
   frame is hidden outright, the settle reveals the whole page at once rather than staging it into
   a transition that cannot advance.
   ============================================================================ */
(function(){
if(window.__afissioInteriorSettleV1)return;window.__afissioInteriorSettleV1=1;
if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
/* R20 adds '.article_foot' - pages/insights-article.html's option 4B, the closing foot. #body is
   DELIBERATELY ABSENT from this list and must stay absent: reading text never animates in, and a
   reader who lands on an article from a LinkedIn post must not watch it arrive. Neither page's
   header is in the list either, for the same reason the homepage's hero is not.
   R19 adds four selectors, all for pages/insights.html: '.band_grid' (the statement band's
   split composition), '.brief_row' and '.brief_card' (the two brief-item designs, so the three
   CMS items stage in DOM order 130ms apart — which is how the series tells itself, and the whole
   reason #briefs needs no animation of its own), and '.latest_foot'. None of the four matches an
   element on pages/our-approach.html, so its settle is byte-for-byte the same list it ran before. */
var SEL=['.sequence_aside','.sequence_step',
 '.band_stack','.band_grid',
 '.quote_panel',
 '.faq_head','.faq_row',
 '.brief_row','.brief_card',
 /* R22-SOLUTIONS: pages/solutions.html's four families. None of the six matches an element on any
    of the five pages built before it, so every one of those pages settles exactly as it did. */
 '.continuum_stop','.spectrum_head','.spectrum_slot','.spectrum_row','.service_row','.service_card',
 /* R23-AREAS: pages/areas-of-review.html. The schedule's nine cells are listed as their three ROW
    classes, in DOM order, so #domains arrives ROW BY ROW - the three domain names, then the three
    paragraphs, then the three scope lists, which is the schedule filling in. 9 x 130ms + 1600ms =
    2.77s, inside the brief's 4s ceiling, told once, nothing looping. `.schedule_entry` does the
    same for 2B (Legal -> Financial -> Technical) and `.close_foot` matches the ruled close. None
    of the five matches an element on any of the six pages built before this one, so all six
    settle exactly as they did. */
 '.schedule_head','.schedule_body','.schedule_scope','.schedule_entry','.close_foot',
 /* R24-INDUSTRIES: pages/industries.html. '.register_head' is the section head of BOTH options,
    and '.register_row' is 2A's six register entries, so the six arrive in the deck's order 130ms
    apart — 6 x 130 + 1600 = 2.38s, which is why #industries needs no animation of its own.
    2B needed nothing added at all: its six panes are '.service_card', already in this list since
    R22. Neither new selector matches an element on any of the seven pages built before this one,
    so all seven settle exactly as they did. */
 '.register_head','.register_row',
 /* R25-LAW: pages/afissio-law.html. '.passage_head' is the section head of BOTH #role options and
    '.passage_lead'/'.passage_sub' (2A) and '.passage_first'/'.passage_second' (2B) are their
    prose blocks, which stage in reading order. '.divide_pair' (3A) and '.divide_open' (3B) are
    THE HOSTS, NOT THE TWO PANELS, AND THAT IS A DESIGN DECISION: settled separately the two
    firms would arrive 130ms apart, which is a boundary narrating itself as a transition from one
    to the other — the exact reading BUILD-BRIEF §5 forbids on that section. Settled as one block
    they arrive in the same frame, and the attorney slot and the column divider ride with them.
    '.divide_note' follows as the next block, which is its reading order. Neither #office option
    is listed: office_* is worn by pages/contact.html, and adding it here would change a built
    page's behaviour. None of the eight matches an element on any of the eight pages built before
    this one, so all eight settle exactly as they did. */
 '.passage_head','.passage_lead','.passage_sub','.passage_first','.passage_second',
 /* 2026-09-27: the separation is a comparison table now, and the table is the HOST, so both firms and the
    attorney-client row still arrive in the same frame. */
 '.divide_table',
 /* 2026-09-26 Afissio Law, rebuilt as an introduction: the services head and its five rows in reading order
    (the list filling in), the four handover steps in order, the separation head, and the office close.
    '.divide_pair' above stays the HOST, so both firms still arrive in the same frame. */
 '.practice_head','.practice_item','.procedure_step','.divide_head','.close_split',
 /* R26-CLOSE (half A): pages/about.html. '.people_entry' (3A) and '.people_leaf' (3B) are the two
    people themselves, so they stage in the deck's order 130ms apart — two colleagues arriving one
    after the other is reading order, not a boundary narrating itself, which is why About lists the
    ITEMS where Afissio Law deliberately listed the HOSTS. '.network_shelf' is 4B's ruled close;
    4A needs nothing, because the panel's inner '.band_grid' has been in this list since R19, and
    #why needs nothing either — '.passage_*' (R25) and '.band_grid' cover both its options. None of
    the three matches an element on any of the nine pages built before this one, so all nine settle
    exactly as they did. Half B adds nothing at all: a policy page and a 404 are the two surfaces on
    this site where motion has nothing to say, and their reading columns must never be staged. */
 '.people_entry','.people_leaf','.network_shelf',
 '.latest_foot','.article_foot',
 '.close_stack',
 /* 2026-09-24: About #why wears the homepage lede. homepage.js settles it only under #intro, and
    the homepage does not load this file, so '.intro_lede' matches About alone. */
 '.intro_lede'].join(',');
var els=[].slice.call(document.querySelectorAll(SEL));
if(!els.length)return;
var EASE='cubic-bezier(0.33,0,0.2,1)',DUR=1600,STEP=130;
/* the stagger runs WITHIN a section, so every section settles the same way wherever the reader
   enters the page — and in #steps that is what tells 1 → 6, in order, once. */
var hosts=[],groups=[];
els.forEach(function(el){
  var s=el.closest?el.closest('section'):null;
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
  /* A FRAME THAT IS NOT BEING RENDERED CANNOT ANIMATE. rAF is paused there and a transition never
     advances, so a staged block would sit at opacity 0 for as long as the frame stays hidden -
     which is content gated behind something that may never run. Nobody is looking, so there is no
     polish to lose: reveal everything, clear the inline state, and stop. Same lesson this project
     learned twice about rAF and IntersectionObserver; the homepage's own settle predates it. */
  if(document.visibilityState==='hidden'){
    waiting.forEach(function(el){clear(el);el.removeAttribute('data-settle')});
    waiting=[];detach();return;
  }
  var vh=window.innerHeight||document.documentElement.clientHeight||0;
  waiting=waiting.filter(function(el){
    var r=el.getBoundingClientRect();
    if(!r.height&&!r.top&&!r.bottom){show(el);return false}      /* unmeasurable: never hide it */
    if(r.top<vh){show(el);return false}                          /* one-way, and already-past reveals too */
    return true;
  });
  if(!waiting.length)detach();
}
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

/* ============================================================================
   2 · THE HERO WAVE FIELD (R19, four client notes 2026-09-17, plus a reference screenshot:
   "a dark hero with orange gradients as in the logo ... sort of wave animation, very smooth,
   very elegant, not distracting ... but of course I want a much darker version").

   WHAT IT PAINTS, back to front, on one rAF clock and nothing else:

     1 · GROUND   #000000, every frame. The page's own surface token, not a tinted near-black.

     0 · EVERY GRADIENT IN THIS FIELD IS SOFT-STOPPED (client note 2026-09-17: "i want the
                  gradient animation move like bubble, much smoother softer. now the gradient
                  starts too hard"). Three-stop gradients were leaving a steep core and a kink at
                  the middle stop. Every one of them - the four blooms, the sweep, the left veil
                  and the ground - is built from 9 to 13 stops on a smooth curve: a raised
                  cosine to the 2.1 across THIRTEEN stops for the blooms, which gives a narrower
                  bright core and a longer shoulder - darker and smoother at once, which is the
                  pair the client keeps asking for - eleven stops for the left veil, nine for the
                  sweep and the ground. No gradient in the hero has a kink in its slope anywhere.
     2 · BLOOMS   three radial gradients whose centres are INSIDE the lower-right quadrant, in the brand's TWO oranges and no third
                  colour - #FF6600 at 0.25 top right, #B34B00 at 0.17 low right, #FF6600
                  at 0.14 off the right edge, #B34B00 at 0.10 off the bottom right - taken down
                  again 2026-09-17 on "the gradient is too bright right now... make it darker,
                  smoother", from a pass that peaked at #A24100 - each on a TWO-HARMONIC path per axis and breathing its radius on a third
                  period again, so a bloom wanders a soft open line instead of retracing an
                  ellipse - it rises, sways past and comes back around, like a bubble. Taken down a
                  second step 2026-09-17 on the client's note ("make the hero animation
                  darker"): peak mixed value is about #220E00, down from #341500, and the field
                  is black by the lower third. Measured, not estimated.
     3 · (the rotating sweep was deleted at R27 - a full-screen linear gradient laid over the
                  blooms flattened the moving field into a wash, which is why it read as still.)

                  THE WAVES ARE GONE (client note 2026-09-17: "instead of waves move the
                  gradient smoothly that might be better"). Three sine silhouettes filled with
                  black used to roll over the glow; even unstroked, a filled shape has a
                  boundary, and a boundary is the thing the client kept objecting to - first as
                  crest lines, then as the shape itself. There is now no path, no fill and no
                  edge in the whole field: every pixel is a gradient sample, and the motion is
                  the gradient moving.

   Periods run 28-70s and every travel is a fraction of the section's own box, so the motion is
   legible when you look for it and never pulls the eye off the type. Slower than the waves were
   on purpose: a gradient carries motion at a scale a silhouette cannot, so it needs less speed.

   HOW IT SHIPS (§0, §4c-bis): a <canvas>, so it is custom code in the site's script bundle;
   @keyframes would not survive the style pipeline and a prefers-reduced-motion block is dropped
   by it, so REDUCED MOTION IS HONOURED HERE - one still frame, painted once, no loop. The canvas
   carries no information: with no script the hero is the black ground and the full type stack,
   which is all a reader, a crawler or a print needs. Nothing rests at opacity 0.
   ============================================================================ */
(function(){
if(window.__afissioInteriorWaveV1)return;window.__afissioInteriorWaveV1=1;
/* R19: EVERY header on the page gets a field, not just the first. An options page carries two
   headers under review and querySelector painted only one, which left the second a dead black
   box — and a reviewer cannot judge a composition whose ground is missing. The whole pass is
   wrapped in __field(cv) and called once per canvas; every value in it was already local, so with
   one canvas this is the same code doing the same thing. */
/* R27-WEBFLOW-ELEMENTS: THE CANVAS IS CREATED HERE, NOT AUTHORED IN THE MARKUP. Webflow has no
   canvas element and the deployer has no mapping for the tag, so a <canvas> written into a page is
   SKIPPED and the field never exists on the built site - which is why this pass used to bind to
   markup that could not be deployed. The host .hero-wave IS a Div Block and does deploy; the canvas
   is built inside it here and carries INLINE the six properties the deleted .hero-wave_canvas rule
   used to set (CLAUDE.md 4f: a class only ever worn at runtime has no published CSS to attach to).
   Nothing else in this pass changed: host is still cv.parentNode, which is still .hero-wave, so
   size() measures the same box and paints the same field. The querySelector('canvas') guard means a
   page that still carries an authored canvas reuses it rather than getting a second one. */
function __mount(hostEl){
  var cv=hostEl.querySelector('canvas');
  if(cv)return cv;
  cv=document.createElement('canvas');
  cv.style.position='absolute';cv.style.top='0';cv.style.left='0';
  cv.style.width='100%';cv.style.height='100%';cv.style.display='block';
  hostEl.appendChild(cv);
  return cv;
}
var __hosts=[].slice.call(document.querySelectorAll('.hero-wave'));
if(!__hosts.length)return;
__hosts.forEach(function(hostEl){__field(__mount(hostEl))});
/* PERF-V2 (operator 2026-09-28: "it cuts, it lags, it does not continue smoothly ... apply it for all
   pages"). The field's look is unchanged - same three blooms, radii, travel, periods, peaks, colours,
   same apex, same three veils. What changed is how it is drawn, and each change answers one symptom:
     · LAG. Every frame used to repaint SEVEN full-viewport fills (3 radial blooms, 3 veil gradients,
       the mark) into a 130vh store at 1.25x - ~4MP of gradient work a frame at 1920 - and rebuilt
       39 colour-stop strings to do it. Now the field is TWO canvases: the blooms, which are the only
       thing that moves, draw into a store at HALF the CSS size (capped 960px wide - a soft field has
       no detail to lose, and the browser's upscale is itself a blur); the apex and the three veils,
       which never move, draw ONCE into a full-resolution overlay and are only redrawn on resize.
       Stops are built once. Per frame: 3 fills on ~1/6 of the pixels.
     · CUTS. The loop read getBoundingClientRect() twice a frame - a forced style/layout flush right
       after the rule-drift loop had written its transforms. Size now comes from a ResizeObserver and
       on-screen from an IntersectionObserver: zero layout reads per frame.
     · DOES NOT CONTINUE. The clock was now - t0, and the watchdog reset t0 whenever frames were more
       than 900ms apart, so a busy moment made the field JUMP to another phase. The clock is now an
       accumulator advanced by each frame's delta, capped at 50ms: a stall slows it for an instant,
       it can never skip, and pausing off screen resumes exactly where it stopped. */
function __field(cv){
var host=cv.parentNode;
var ctx=cv.getContext('2d');if(!ctx)return;
var ov=document.createElement('canvas');ov.setAttribute('aria-hidden','true');
ov.style.position='absolute';ov.style.top='0';ov.style.left='0';ov.style.width='100%';ov.style.height='100%';ov.style.display='block';ov.style.pointerEvents='none';
host.appendChild(ov);
var octx=ov.getContext('2d');if(!octx)return;
var centered=!!(host.classList&&host.classList.contains('is-centered'));
var W=1,H=1,LS=0.5;
function narrow(){return W<820?(820-Math.max(360,W))/460:0}
var BLOOMS=[
  {x:0.74,y:0.58,r:0.44,a:0.22,c:'255,102,0',dx:0.18,dy:0.14,s:0.000368,rw:0.26,rs:0.000254},
  {x:0.92,y:0.70,r:0.34,a:0.13,c:'179,75,0',dx:0.15,dy:0.13,s:0.000489,rw:0.30,rs:0.000339},
  {x:0.80,y:0.64,r:0.22,a:0.30,c:'255,163,71',dx:0.13,dy:0.10,s:0.000585,rw:0.34,rs:0.000436}
];
BLOOMS.forEach(function(bl){bl.st=[];for(var si=0;si<=12;si++){var su=si/12,sv=Math.pow((1+Math.cos(Math.PI*su))/2,2.1)*bl.a;bl.st.push([su,'rgba('+bl.c+','+sv.toFixed(4)+')'])}});
var mark=new Image(),markOK=false;
mark.onload=function(){markOK=true;overlay()};
mark.src='../brand/logo/afissio-apex-orange.svg';
function overlay(){
  var i;octx.clearRect(0,0,W,H);
  if(markOK){
    var mr=(mark.naturalWidth&&mark.naturalHeight)?(mark.naturalHeight/mark.naturalWidth):(192/230);
    var mw=Math.min(W*0.64,1152),mh=mw*mr;
    octx.globalAlpha=0.06;octx.drawImage(mark,centered?W/2-mw/2:W*1.09-mw,H*0.869-mh,mw,mh);octx.globalAlpha=1;
  }
  if(!centered){
    var hg=octx.createLinearGradient(0,0,W,0),nv=narrow(),vSolid=0.17-0.13*nv,vClear=0.56-0.26*nv;
    for(var k=0;k<=10;k++){var uk=k/10,vk=uk<vSolid?1:Math.pow((1+Math.cos(Math.PI*((uk-vSolid)/(vClear-vSolid))))/2,1.15);if(uk>vClear)vk=0;hg.addColorStop(uk,'rgba(0,0,0,'+vk.toFixed(4)+')')}
    octx.fillStyle=hg;octx.fillRect(0,0,W,H);
  }
  var vg=octx.createLinearGradient(0,0,0,H*0.66);
  for(i=0;i<=8;i++){var um=i/8;vg.addColorStop(um,'rgba(0,0,0,'+(Math.pow(1-um,1.8)*0.9).toFixed(4)+')')}
  octx.fillStyle=vg;octx.fillRect(0,0,W,Math.ceil(H*0.66)+1);
  var tg=octx.createLinearGradient(0,H*0.74,0,H);
  for(i=0;i<=8;i++){var un=i/8;tg.addColorStop(un,'rgba(0,0,0,'+Math.pow(un,1.9).toFixed(4)+')')}
  octx.fillStyle=tg;octx.fillRect(0,Math.floor(H*0.74),W,Math.ceil(H*0.26)+1);
}
function size(w,h){
  W=Math.max(1,Math.round(w));H=Math.max(1,Math.round(h));
  var ls=Math.min(LS,960/W);
  cv.width=Math.max(1,Math.round(W*ls));cv.height=Math.max(1,Math.round(H*ls));ctx.setTransform(cv.width/W,0,0,cv.height/H,0,0);
  var dpr=Math.min(1.25,window.devicePixelRatio||1);
  ov.width=Math.max(1,Math.round(W*dpr));ov.height=Math.max(1,Math.round(H*dpr));octx.setTransform(dpr,0,0,dpr,0,0);
  overlay();
}
function paint(t){
  var d=Math.max(W,H),nb=centered?0:narrow(),i;
  ctx.globalCompositeOperation='source-over';ctx.fillStyle='#000000';ctx.fillRect(0,0,W,H);
  ctx.globalCompositeOperation='lighter';
  for(i=0;i<BLOOMS.length;i++){
    var bl=BLOOMS[i],p1=t*bl.s,p2=t*bl.s*1.7,p3=t*bl.s*0.6;
    var bxf=centered?bl.x-0.32:bl.x-0.16*nb;
    var cx=(bxf+(Math.sin(p1)*0.78+Math.sin(p2)*0.34)*bl.dx)*W;
    var cy=(bl.y+(Math.cos(p1*0.78)*0.78+Math.sin(p3)*0.34)*bl.dy)*H;
    var rr=bl.r*d*(1+Math.sin(t*bl.rs)*bl.rw*0.72+Math.sin(t*bl.rs*1.9)*bl.rw*0.28);
    var g=ctx.createRadialGradient(cx,cy,0,cx,cy,rr);
    for(var k=0;k<13;k++)g.addColorStop(bl.st[k][0],bl.st[k][1]);
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  }
  ctx.globalCompositeOperation='source-over';
}
var r0=host.getBoundingClientRect(),T=0;
size(r0.width,r0.height);paint(0);
var RM=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
function resized(w,h){if(!(w>1&&h>1))return;if(Math.round(w)===W&&Math.round(h)===H)return;size(w,h);try{paint(T)}catch(e){}}
/* SELF-HEAL, without a layout read per frame: a host measured at 0 on a cold load is re-measured
   (clientWidth/Height, one cheap read) on load, in the watchdog, and in any frame while still 1x1. */
function heal(){var w=host.clientWidth,h=host.clientHeight;if(!(w>1&&h>1)){var r=host.getBoundingClientRect();w=r.width;h=r.height}resized(w,h)}
window.addEventListener('load',heal);setTimeout(heal,0);setTimeout(heal,300);
if(window.ResizeObserver){new ResizeObserver(function(es){var cr=es[es.length-1].contentRect;if(cr.width>1&&cr.height>1)resized(cr.width,cr.height);else heal()}).observe(host)}
else window.addEventListener('resize',function(){var r=host.getBoundingClientRect();resized(r.width,r.height)});
if(RM)return;
var raf=0,lastNow=0,lastFrame=0,onscreen=true;
function running(){return onscreen&&document.visibilityState!=='hidden'}
function frame(now){
  raf=0;lastFrame=performance.now();
  if(W<=1||H<=1)heal();
  if(lastNow){var dt=now-lastNow;if(dt>0)T+=Math.min(dt,50)}
  lastNow=now;
  try{paint(T)}catch(e){if(!window.__afissioWaveErr){window.__afissioWaveErr=1;console.error('hero field paint failed',e)}}
  if(running())raf=requestAnimationFrame(frame);else lastNow=0;
}
function start(){if(!raf&&running()){lastNow=0;raf=requestAnimationFrame(frame)}}
if(window.IntersectionObserver){new IntersectionObserver(function(es){onscreen=es[es.length-1].isIntersecting;if(onscreen)start()},{rootMargin:'80px 0px'}).observe(host)}
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')start()});
window.addEventListener('beforeprint',function(){if(raf)cancelAnimationFrame(raf);raf=0});
/* the watchdog heals a loop that died, and paints where rAF is paused in a frame that is not being
   rendered - but it never touches the clock beyond one capped step, so it cannot cause a jump. */
setInterval(function(){
  if(document.visibilityState==='hidden')return;
  heal();
  if(!running())return;
  var n=performance.now();if(n-lastFrame<1200)return;
  if(raf){cancelAnimationFrame(raf);raf=0}
  T+=50;try{paint(T)}catch(e){}
  lastFrame=n;start();
},1000);
start();
}
})();

/* ============================================================================
   3 · #judgment — THE COMPUTING LATTICE (client note 2026-09-17: "align center everything and in
   the bg of the section create computing dots etc darker orange on black... the center of the
   section will have no icons and animation but top bottom left right have dark orange computing
   animation with dots which represents AI and technology. be creative").

   WHAT IT PAINTS: a 20px lattice of 2px squares in #B34B00. Each dot's brightness is the
   INTERFERENCE of three travelling wavefronts - three sources, each on its own slow orbit, each
   emitting a sine in distance and time. Where their crests meet, a dot is bright; where they
   cancel, it drops to the floor. The result is bands of computation crossing the lattice and
   meeting, which is what a process looks like, rather than dots blinking at random - random is
   noise, interference is structure.

     v(dot) = sum over 3 sources of (1 + sin(dist * K - t * W)) / 2, normalised
     v(dot) = smoothstep(smoothstep(v))     <- R29c: pushes the mean out to 0 and 1
     alpha  = (FLOOR + v * (PEAK - FLOOR)) * hole(dot)

   THE CENTRE IS EMPTY. hole() is 0 inside 0.36 of the section's half-diagonal and rises on a
   smoothstep to 1 by 0.72, measured on an ELLIPTICAL metric so it matches a wide section rather
   than punching a circle in it. The type sits on plain black; the computation happens top,
   bottom, left and right of it - exactly the brief.

   DARK AND SOFT, both asked for - but RECOGNISABLE, which the client asked for twice (R29c, then
   R32 2026-09-17: "a little brighter, it is very difficult to recognize it now"). Peak dot alpha
   is 0.62 and the crest rides from #B34B00 up to #FF6600, which lands a bright dot at about
   #9E3F00 against a black ground; the floor stays 0.045, so the gaps still nearly leave and the
   bands are what gained. 2px dots on a 20px pitch cover 1% of the area - so the field reads as
   texture, never as a surface. No glow, no blur, no second hue: both oranges are hue 24-25
   degrees, so the crest is this one hue lifted in lightness, not a new colour.

   HOW IT SHIPS (§4c-bis): a <canvas>, so custom code in the site's script bundle. REDUCED MOTION
   PAINTS ONE STILL FRAME and stops. Nothing paints while #judgment is off screen or the tab is
   hidden, and the backing store is re-checked every frame so a section measured at 0 before
   layout settles heals itself. Nothing rests at opacity 0; no content is gated.
   ============================================================================ */
(function(){
if(window.__afissioComputeFieldV1)return;window.__afissioComputeFieldV1=1;
/* R27-WEBFLOW-ELEMENTS: same as section 2 - the lattice's canvas is created here and styled
   inline, because <canvas> has no Webflow element and .compute-field_canvas could never deploy.
   .compute-field is the classed Div Block host and is unchanged. */
/* 2026-09-24: EVERY host gets its own lattice (Industries' six register plates), one closure each. */
[].slice.call(document.querySelectorAll('.compute-field')).forEach(function(__lhost){(function(){
var cv=__lhost.querySelector('canvas');
if(!cv){
  cv=document.createElement('canvas');
  cv.style.position='absolute';cv.style.top='0';cv.style.left='0';
  cv.style.width='100%';cv.style.height='100%';cv.style.display='block';
  __lhost.appendChild(cv);
}
var ctx=cv.getContext('2d');if(!ctx)return;
var host=cv.parentNode,W=1,H=1;
function size(){
  var r=host.getBoundingClientRect();
  var dpr=Math.min(1.25,window.devicePixelRatio||1);
  W=Math.max(1,Math.round(r.width));H=Math.max(1,Math.round(r.height));
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
/* R38 - THE LATTICE SCALES WITH ITS BOX (client note 2026-09-17: "the animations must be
   responsive too"). PITCH, DOT and the spatial frequency k were absolute pixel values, so the
   field was a different design at every width: at 1920 a dense 96-column texture, at 390 a coarse
   19-column grid whose interference bands were twice the width of the box - which is why no
   structure was visible on a phone. All three are now derived from the box's diagonal each frame:
     PITCH = clamp(13, d/64, 22)        so the column count stays ~55-70 at every width
     DOT   = 2 above a 16px pitch, else 1.5
     k     = the authored rad/px * (1180 / d)   so a band is the same FRACTION of the box
   The hole, the sources' orbits and the temporal rates are already fractions and are untouched. */
var PITCH=20,DOT=2,KSCALE=1,FLOOR=0.045,PEAK=0.62,HOLE_IN=0.34,HOLE_OUT=0.74;
function scale(){
  var d=Math.sqrt(W*W+H*H);
  PITCH=Math.max(13,Math.min(22,Math.round(d/64)));
  DOT=PITCH>=16?2:1.5;
  KSCALE=1180/d;
}
/* the clear zone follows the TYPE, not the box: the stack is left-aligned on the container rail
   (R29b), so the hole is centred at 32% of the width rather than 50% - the computation is then
   heaviest to the right of the copy, where there is nothing to read. */
var HOLE_CX=0.32,HOLE_CY=0.50;
/* a host wearing `compute-field is-centered` carries a CENTRED stack (Solutions #data-room), so the clear
   zone sits on the centre line instead (operator 2026-09-24). */
if(__lhost.classList&&__lhost.classList.contains('is-centered'))HOLE_CX=0.5;
/* `compute-field is-plate` (Industries register wells): a small centred clear zone that holds the drawing. */
if(__lhost.classList&&__lhost.classList.contains('is-plate')){HOLE_CX=0.5;HOLE_IN=0.14;HOLE_OUT=0.46;FLOOR=0.1;PEAK=0.95}
/* ALPHA IS QUANTISED INTO 14 BUCKETS and each bucket is filled in one pass. Building a
   fillStyle string per dot meant ~2900 string allocations a frame, which is the whole cost of a
   lattice this size; 14 strings a frame is not. Invisible at 1/255 steps. */
var BUCKETS=14,bins=[];
/* three sources, each on its own orbit: cx,cy are fractions of the box, o is the orbit radius,
   s the orbit rate, k the spatial frequency (radians per px) and w the temporal rate */
/* R29c (client note 2026-09-17: "it is difficult to understand the computing animation. i like
   the style. don't change it. but the user needs to feel it is animated"). The style is
   untouched - same lattice, same pitch, same dot, same one colour. Three changes to the SIGNAL:
     · k is roughly halved, so the interference bands are about twice as wide. Fine speckle
       reads as static texture however fast it moves; a broad band sweeping across the lattice
       is legible at a glance.
     · w is 2.6x, so those bands actually travel - a crest now crosses the section in a few
       seconds instead of drifting.
     · and the CONTRAST is the real fix. Averaging three sources pins v near 0.5 almost
       everywhere, which is why the field looked like a still grid: the dots were all the same
       brightness. Two smoothsteps on v push the mean out toward 0 and 1, so a band is genuinely
       bright and the gaps genuinely drop out - and FLOOR comes down from 0.10 to 0.045 so the
       dark dots nearly leave. Same palette, four times the modulation depth. */
var SRC=[
  {x:0.14,y:0.22,o:0.16,s:0.000082,k:0.0135,w:0.00306},
  {x:0.88,y:0.34,o:0.13,s:0.000061,k:0.0102,w:-0.00244},
  {x:0.50,y:0.94,o:0.19,s:0.000104,k:0.0168,w:0.00369}
];
function paint(t){
  var bx=host.getBoundingClientRect(),dp=Math.min(1.25,window.devicePixelRatio||1);
  if(cv.width!==Math.round(bx.width*dp)||cv.height!==Math.round(bx.height*dp))size();
  ctx.clearRect(0,0,W,H);
  var i,sx=[],sy=[];
  for(i=0;i<SRC.length;i++){
    var s=SRC[i];
    sx.push((s.x+Math.cos(t*s.s)*s.o)*W);
    sy.push((s.y+Math.sin(t*s.s*1.31)*s.o*0.7)*H);
  }
  scale();
  var hx=W*HOLE_CX,hy=H*HOLE_CY;
  var off=(PITCH-DOT)/2,b;
  for(b=0;b<BUCKETS;b++)bins[b]=bins[b]||[],bins[b].length=0;
  for(var y=off;y<H;y+=PITCH){
    for(var x=off;x<W;x+=PITCH){
      /* the elliptical hole, on a smoothstep so the lattice fades in rather than starting */
      var ex=(x-hx)/Math.max(1,hx>W-hx?hx:W-hx),ey=(y-hy)/Math.max(1,hy>H-hy?hy:H-hy);
      var rr=Math.sqrt(ex*ex+ey*ey);
      var u=(rr-HOLE_IN)/(HOLE_OUT-HOLE_IN);
      u=u<0?0:u>1?1:u;
      var hole=u*u*(3-2*u);
      if(hole<=0.006)continue;
      var v=0;
      for(i=0;i<SRC.length;i++){
        var dx=x-sx[i],dy=y-sy[i],dist=Math.sqrt(dx*dx+dy*dy);
        v+=(1+Math.sin(dist*SRC[i].k*KSCALE-t*SRC[i].w))/2;
      }
      v/=SRC.length;
      v=v*v*(3-2*v);v=v*v*(3-2*v);          /* two smoothsteps: the mean is pushed to the extremes */
      var a=(FLOOR+v*(PEAK-FLOOR))*hole;
      b=(a/PEAK*BUCKETS)|0; if(b<0)b=0; if(b>=BUCKETS)b=BUCKETS-1;
      bins[b].push(x,y);
    }
  }
  for(b=0;b<BUCKETS;b++){
    var bin=bins[b];if(!bin.length)continue;
    /* R32 (client note 2026-09-17: "the animation in this section can be a little brighter, it is
       very difficult to recognize it now"). PEAK 0.42 -> 0.62 AND the crest climbs the brand's own
       two oranges: a dim dot stays #B34B00 and a crest dot rides up to #FF6600, so the bright
       bands gain lightness AND saturation while the gaps stay where they were. Both oranges sit at
       hue 24-25 degrees, so this is one hue ramped, not a second colour (same reasoning as the
       hero field's R29b - scaling one hex toward black is what drains a colour). A crest dot now
       measures about #9E3F00 against black, up from #48 1E 00; the floor is untouched at 0.045,
       so the modulation depth the client asked for at R29c is preserved, not flattened. */
    var bu=(b+0.5)/BUCKETS;
    ctx.fillStyle='rgba('+Math.round(179+76*bu)+','+Math.round(75+27*bu)+',0,'+(bu*PEAK).toFixed(3)+')';
    for(i=0;i<bin.length;i+=2)ctx.fillRect(bin[i],bin[i+1],DOT,DOT);
  }
}
size();
paint(0);
if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  window.addEventListener('resize',function(){size();paint(0)});return;
}
var raf=0,t0=0,tOff=0;
function frame(now){
  if(!t0)t0=now-tOff;
  if(document.visibilityState==='hidden'){tOff=now-t0;t0=0;raf=0;return}
  var r=host.getBoundingClientRect(),vh=window.innerHeight||0;
  if(r.bottom>-60&&r.top<vh+60){
    try{paint(now-t0)}catch(e){if(!window.__afissioLatticeErr){window.__afissioLatticeErr=1;console.error('compute lattice paint failed',e)}}
  }
  raf=requestAnimationFrame(frame);
}
function start(){if(!raf){t0=0;raf=requestAnimationFrame(frame)}}
window.addEventListener('resize',function(){size();paint(t0?(performance.now()-t0):0)});
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')start()});
window.addEventListener('beforeprint',function(){if(raf)cancelAnimationFrame(raf);raf=0});
/* THE WATCHDOG. Same reasoning as section 2: rAF is paused in a frame that is not being rendered
   and a visibilitychange does not always arrive, so if no frame has landed for a second while
   #judgment is on screen, the lattice is restarted AND painted directly. It can never freeze. */
var lastF=0;
(function(){var f=frame;frame=function(n){lastF=n;return f(n)}})();
setInterval(function(){
  if(document.visibilityState!=='visible')return;
  var n=performance.now();
  if(raf&&(n-lastF)<900)return;
  var r=host.getBoundingClientRect();
  if(r.bottom<-60||r.top>(window.innerHeight||0)+60)return;
  raf=0;start();
  if(!t0)t0=n-tOff;
  paint(n-t0);
},900);
start();
})()});
})();

/* ============================================================================
   3b · THE NETWORK FIELD — v3 (operator 2026-09-27: "so cluttered ... less lines, less dots, but
   more obvious, more stylish, more advanced ... the user must really feel it moving"). v2 meshed the
   whole band (~90 nodes, ~200 always-on hairlines, a wave through all of them every 2.4s), so no
   single thing in it could be seen. v3 is ONE OBJECT beside the type: a constellation of 22 nodes
   round one hub, built in 3D and turning in depth.
     · NODES: min-separation samples in an ellipsoid (deterministic). Depth is drawn — near nodes are
       5px, full orange, and resolve into hairline plates; far ones are 2px and dim.
     · EDGES, fixed in 3D so the structure turns as one: a spanning tree (no island) plus short
       second-neighbour links, ~30 hairlines; five dotted SPOKES join the hub to its inner nodes.
     · MOTION: one revolution per 32s, plus scroll (the page turns it, eased) and the pointer (it
       tilts toward the cursor). THE CALL: every 1.5s the hub sends a signal down a spoke and on for
       1–3 hops, a bright square head lighting each hairline; each node it reaches rings (a square
       outline expanding and fading), the last one — the expert engaged — rings larger.
     · Behind the type everything falls to ~15%, measured from the text itself.
   Same vocabulary: square dots, 1px hairlines, one hue ramped #B34B00 -> #FF6600. No glow, no blur.
   HOW IT SHIPS: a canvas created here, styled inline. Reduced motion paints one still frame.
   Nothing paints off screen or in a hidden tab; a watchdog restarts a paused loop.
   ============================================================================ */
(function(){
if(window.__afissioNetworkFieldV3)return;window.__afissioNetworkFieldV3=1;
var RM=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
[].slice.call(document.querySelectorAll('.network-field')).forEach(function(host){(function(){
var sec=host.parentNode||host,stack=(host.parentNode&&host.parentNode.classList.contains('network_media'))?null:sec.querySelector('.band_stack');
var cv=document.createElement('canvas');cv.setAttribute('aria-hidden','true');
cv.style.position='absolute';cv.style.top='0';cv.style.left='0';cv.style.width='100%';cv.style.height='100%';cv.style.display='block';
host.appendChild(cv);
var ctx=cv.getContext('2d');if(!ctx)return;
var TAU=Math.PI*2,W=1,H=1,CX=0,CY=0,R=1,TXT=null,FLOOR=0.14,P=[],E=[],ADJ=[],SP=[],CALLS=[],nextCall=300,spTurn=0,seed=1,
    HUB={x:0,y:0,z:0,sx:0,sy:0,d:0.5,m:1},angS=0,angSt=0,px=0,pxT=0,py=0,pyT=0,lastT=0;
function rnd(i){var x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function sm(e0,e1,x){var t=(x-e0)/(e1-e0);t=t<0?0:t>1?1:t;return t*t*(3-2*t)}
function col(u,al){return 'rgba('+Math.round(179+76*u)+','+Math.round(75+27*u)+',0,'+(al<0?0:al>1?1:al).toFixed(3)+')'}
function d3(p,q){var dx=p.x-q.x,dy=p.y-q.y,dz=p.z-q.z;return Math.sqrt(dx*dx+dy*dy+dz*dz)}
function nd(i){return i<0?HUB:P[i]}
function ease(x){return x<0.5?2*x*x:1-Math.pow(-2*x+2,2)/2}
(function(){var s=0;while(P.length<22&&s<9000){s++;var x=rnd(s)*2-1,y=rnd(s+5e3)*2-1,z=rnd(s+1e4)*2-1,r2=x*x+y*y+z*z;
  if(r2>1||r2<0.14)continue;var c={x:x,y:y*0.8,z:z},ok=true;for(var k=0;k<P.length;k++){if(d3(P[k],c)<0.44){ok=false;break}}
  if(ok){c.ph=rnd(s+2e4)*TAU;c.sx=0;c.sy=0;c.d=0;c.m=1;c.f=0;P.push(c)}}
  var n=P.length,i,k,key={};if(n<2)return;
  function add(p,q){var kk=p<q?p+'_'+q:q+'_'+p;if(p===q||key[kk])return;key[kk]=1;E.push([p,q])}
  var inT=[],best=[],from=[];for(i=0;i<n;i++){inT.push(false);best.push(Infinity);from.push(-1)}best[0]=0;
  for(var it=0;it<n;it++){var m=-1;for(i=0;i<n;i++)if(!inT[i]&&(m<0||best[i]<best[m]))m=i;inT[m]=true;if(from[m]>=0)add(m,from[m]);
    for(i=0;i<n;i++)if(!inT[i]){var dd=d3(P[i],P[m]);if(dd<best[i]){best[i]=dd;from[i]=m}}}
  for(i=0;i<n;i++){var ds=[];for(k=0;k<n;k++)if(k!==i)ds.push([d3(P[i],P[k]),k]);ds.sort(function(p,q){return p[0]-q[0]});
    if(ds[1]&&ds[1][0]<0.72)add(i,ds[1][1])}
  for(i=0;i<n;i++)ADJ.push([]);E.forEach(function(e){ADJ[e[0]].push(e[1]);ADJ[e[1]].push(e[0])});
  SP=P.map(function(p,ix){return [p.x*p.x+p.y*p.y+p.z*p.z,ix]}).sort(function(p,q){return p[0]-q[0]}).slice(0,5).map(function(p){return p[1]});
})();
if(!P.length)return;
function layout(){
  var r=host.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);
  W=Math.max(1,Math.round(r.width));H=Math.max(1,Math.round(r.height));
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  TXT=null;
  if(stack){var l=1e9,t=1e9,rr=-1e9,bb=-1e9,c=0;
    [].slice.call(stack.querySelectorAll('h2,p,img')).forEach(function(el){var q;
      if(el.tagName==='IMG')q=el.getBoundingClientRect();else{var rg=document.createRange();rg.selectNodeContents(el);q=rg.getBoundingClientRect()}
      if(!q||(!q.width&&!q.height))return;c++;l=Math.min(l,q.left);t=Math.min(t,q.top);rr=Math.max(rr,q.right);bb=Math.max(bb,q.bottom)});
    if(c)TXT={l:l-r.left-24,t:t-r.top-24,r:rr-r.left+24,b:bb-r.top+24}}
  var free=TXT?W-TXT.r:0;
  /* 2026-09-28 (operator: "much bigger and responsive"): the network fills its half — radius from the free
     width and the band height, no px cap. Below the stack (≤991, the band grows a field area under the text) it
     centres in that area; only if there is neither room is it a dim field behind the text. */
  var below=TXT?H-TXT.b:0;
  if(TXT&&free>W*0.28){CX=TXT.r+free*0.5;CY=H*0.5;R=Math.min(free*0.46,H*0.5);FLOOR=0.14}
  else if(TXT&&below>H*0.3){CX=W*0.5;CY=TXT.b+below*0.5;R=Math.min(W*0.44,below*0.5);FLOOR=0.14}
  else if(!stack){CX=W*0.5;CY=H*0.5;R=Math.min(W,H)*0.46;FLOOR=1}
  else{CX=W*0.8;CY=H*0.5;R=Math.min(W*0.44,H*0.34);FLOOR=0.2}
}
function mask(x,y){if(!TXT)return 1;var dx=Math.max(TXT.l-x,0,x-TXT.r),dy=Math.max(TXT.t-y,0,y-TXT.b);return FLOOR+(1-FLOOR)*sm(0,90,Math.sqrt(dx*dx+dy*dy))}
function project(t){
  var a=t*TAU/32000+angS+px,b=-0.36+0.1*Math.sin(t/7000)+py,ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b),D=4.2,w=0.03;
  for(var i=0;i<P.length;i++){var p=P[i];
    var x=p.x+Math.sin(t*0.0006+p.ph)*w,y=p.y+Math.cos(t*0.0005+p.ph*1.3)*w,z=p.z+Math.sin(t*0.0004+p.ph*0.7)*w;
    var x1=x*ca+z*sa,z1=-x*sa+z*ca,y2=y*cb-z1*sb,z2=y*sb+z1*cb,s=D/(D+z2);
    p.sx=CX+x1*s*R;p.sy=CY+y2*s*R;p.d=Math.max(0,Math.min(1,(z2+1)/2));p.m=mask(p.sx,p.sy);p.f=0}
  HUB.sx=CX;HUB.sy=CY;HUB.m=mask(CX,CY);
}
function newCall(t){if(!SP.length)return;var path=[-1,SP[(spTurn++*2)%SP.length]],hops=1+Math.floor(rnd(seed++*3.1)*3),cur=path[1];
  for(var h=0;h<hops;h++){var nb=ADJ[cur].filter(function(k){return path.indexOf(k)<0});if(!nb.length)break;cur=nb[Math.floor(rnd(seed++*7.7)*nb.length)];path.push(cur)}
  var segs=[],tt=0;for(var j=0;j<path.length-1;j++){var du=440+560*d3(nd(path[j]),nd(path[j+1]));segs.push({a:path[j],b:path[j+1],s:tt,e:tt+du,last:j===path.length-2});tt+=du+80}
  CALLS.push({t0:t,segs:segs,end:tt+1800});
}
function line(x0,y0,x1,y1){ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke()}
function ring(x,y,p,s0,s1,m){var s=s0+(s1-s0)*(1-Math.pow(1-p,3)),al=Math.pow(1-p,1.6)*0.85*m;if(al<=0.005)return;
  ctx.lineWidth=1;ctx.strokeStyle=col(1,al);ctx.strokeRect(Math.round(x)-s/2+0.5,Math.round(y)-s/2+0.5,s,s)}
function paint(t){
  var bx=host.getBoundingClientRect();if(Math.round(bx.width)!==W||Math.round(bx.height)!==H)layout();
  var dt=lastT?Math.min(100,Math.max(0,t-lastT)):16,k=1-Math.exp(-dt/260);lastT=t;
  angS+=(angSt-angS)*k;px+=(pxT-px)*k;py+=(pyT-py)*k;
  project(t);ctx.clearRect(0,0,W,H);
  for(var i=CALLS.length-1;i>=0;i--)if(t-CALLS[i].t0>CALLS[i].end)CALLS.splice(i,1);
  if(!RM&&t>=nextCall){newCall(t);nextCall=t+1500}
  CALLS.forEach(function(c){var el=t-c.t0;c.segs.forEach(function(s){var g=el-s.e,dur=s.last?1600:1000;if(g>=0&&g<dur){var f=1-g/dur;if(f>P[s.b].f)P[s.b].f=f}})});
  ctx.lineWidth=1;
  E.slice().sort(function(p,q){return (P[q[0]].d+P[q[1]].d)-(P[p[0]].d+P[p[1]].d)}).forEach(function(e){var A=P[e[0]],B=P[e[1]],dA=(A.d+B.d)/2,
      mm=(A.m+B.m+2*mask((A.sx+B.sx)/2,(A.sy+B.sy)/2))/4;
    ctx.strokeStyle=col(0.3+0.5*(1-dA),(0.68-0.48*dA)*mm);line(A.sx,A.sy,B.sx,B.sy)});
  ctx.setLineDash([2,4]);
  SP.forEach(function(ix){var B=P[ix];ctx.strokeStyle=col(0.6,(0.6-0.35*B.d)*(HUB.m+B.m)/2);line(HUB.sx,HUB.sy,B.sx,B.sy)});
  ctx.setLineDash([]);
  var heads=[];
  CALLS.forEach(function(c){var el=t-c.t0;c.segs.forEach(function(s){if(el<s.s)return;var A=nd(s.a),B=nd(s.b),mm=(A.m+B.m)/2;
    if(el>=s.e){var fd=1-(el-s.e)/1500;if(fd<=0)return;ctx.lineWidth=1.25;ctx.strokeStyle=col(0.85,0.8*fd*mm);line(A.sx,A.sy,B.sx,B.sy);return}
    var p=ease((el-s.s)/(s.e-s.s)),q=Math.max(0,p-0.22),hx=A.sx+(B.sx-A.sx)*p,hy=A.sy+(B.sy-A.sy)*p;
    ctx.lineWidth=1.25;ctx.strokeStyle=col(0.8,0.55*mm);line(A.sx,A.sy,hx,hy);
    ctx.lineWidth=1.75;ctx.strokeStyle=col(1,mm);line(A.sx+(B.sx-A.sx)*q,A.sy+(B.sy-A.sy)*q,hx,hy);
    heads.push([hx,hy,mm])})});
  P.map(function(p,ix){return ix}).sort(function(p,q){return P[q].d-P[p].d}).forEach(function(ix){var p=P[ix],nr=1-p.d,f=p.f,
      sz=Math.round(2+4*nr+2*f),x=Math.round(p.sx),y=Math.round(p.sy),pa=sm(0.4,0.12,p.d);
    ctx.fillStyle=col(Math.max(0.35+0.65*nr,f),Math.max(0.4+0.6*nr,f)*p.m);ctx.fillRect(x-Math.floor(sz/2),y-Math.floor(sz/2),sz,sz);
    if(pa>0.01){ctx.lineWidth=1;ctx.strokeStyle=col(0.7,0.75*pa*p.m);ctx.strokeRect(x-5.5,y-5.5,11,11)}});
  var hx0=Math.round(HUB.sx),hy0=Math.round(HUB.sy);
  ctx.lineWidth=1;ctx.strokeStyle=col(1,0.9*HUB.m);ctx.strokeRect(hx0-8.5,hy0-8.5,17,17);ctx.fillStyle=col(1,HUB.m);ctx.fillRect(hx0-3,hy0-3,6,6);
  CALLS.forEach(function(c){var el=t-c.t0;if(el<1000)ring(HUB.sx,HUB.sy,el/1000,17,46,HUB.m);
    c.segs.forEach(function(s){var g=el-s.e,dur=s.last?1600:1000;if(g>=0&&g<dur){var B=P[s.b];ring(B.sx,B.sy,g/dur,6,s.last?44:26,B.m)}})});
  heads.forEach(function(h){ctx.fillStyle=col(1,h[2]);ctx.fillRect(Math.round(h[0])-2,Math.round(h[1])-2,4,4)});
}
function onScroll(){var r=sec.getBoundingClientRect();angSt=-(r.top+r.height/2-(window.innerHeight||0)/2)*0.0013}
layout();onScroll();angS=angSt;
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){layout();if(RM)paint(0)});
setTimeout(function(){layout();if(RM)paint(0)},1500);
if(RM){paint(0);window.addEventListener('resize',function(){layout();paint(0)});return}
window.addEventListener('scroll',onScroll,{passive:true});
sec.addEventListener('pointermove',function(ev){var r=sec.getBoundingClientRect();pxT=((ev.clientX-r.left)/Math.max(1,r.width)-0.5)*0.6;pyT=((ev.clientY-r.top)/Math.max(1,r.height)-0.5)*0.35});
sec.addEventListener('pointerleave',function(){pxT=0;pyT=0});
var raf=0,t0=0,tOff=0,lastF=0;
function frame(now){
  lastF=now;if(!t0)t0=now-tOff;
  if(document.visibilityState==='hidden'){tOff=now-t0;t0=0;raf=0;return}
  var r=host.getBoundingClientRect(),vh=window.innerHeight||0;
  if(r.bottom>-60&&r.top<vh+60){try{paint(now-t0)}catch(err){if(!window.__afissioNetErr){window.__afissioNetErr=1;console.error('network field paint failed',err)}}}
  raf=requestAnimationFrame(frame);
}
function start(){if(!raf){t0=0;raf=requestAnimationFrame(frame)}}
window.addEventListener('resize',function(){layout();onScroll()});
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')start()});
window.addEventListener('beforeprint',function(){if(raf)cancelAnimationFrame(raf);raf=0});
setInterval(function(){
  if(document.visibilityState!=='visible')return;var n=performance.now();
  if(raf&&(n-lastF)<900)return;var r=host.getBoundingClientRect();
  if(r.bottom<-60||r.top>(window.innerHeight||0)+60)return;
  raf=0;start();if(!t0)t0=n-tOff;onScroll();paint(n-t0);
},900);
start();
})()});
})();

/* ============================================================================
   4 · #steps — ONE CURRENT STEP, AND ONLY ITS EDGE (client note 2026-09-17: "while scrolling up
   and down, only the current icon must change the color. not the bg color maybe only the
   borders. make it smoother").

   The previous build warmed every step it had passed and warmed its FACE as well as its edge,
   which turned six markers into a progress bar - a cumulative trail, not a current position.
   This is a single travelling focus instead:

     nearest  = the one plate whose centre is closest to the reading line
     w(nearest) = exp(-((plateCentre - readLine) / sigma)^2)   readLine = 52% of the viewport
     w(everyone else) = 0                                      sigma    = 7.5% of the viewport

   ONE BORDER CHANGES, EVER. A gaussian across all six left each neighbour at about 0.14, which
   is faint but still three borders visibly in motion at the same time; the nearest plate is now
   found first and is the only one that is ever warm. The tight sigma is what keeps the handover
   soft: by the midpoint between two plates the winner is already down to ~0.08, so the swap is
   a small step rather than a jump, and the inline 520ms transition covers it.

   w is a function of POSITION, so it runs backwards through the identical values on the way up.
   There is no state to reverse and nothing latches.

   w drives exactly two properties, both on the current plate:
     · the EDGE     #242424 -> #FF6600
     · the NUMERAL  #8E8E8E -> #FF6600
   The FACE IS NEVER TOUCHED (the client asked for borders, not backgrounds) and neither is the
   stem, which is structure. One lit hairline in a section of six is the section's only emphasis.

   HOW IT SHIPS (§4c-bis, §4f): inline from the scroll handler with a 16ms timestamp throttle -
   not a rAF, because rAF is paused in a frame that is not being rendered and a handler that only
   schedules one paints nothing there. A 520ms linear transition is written inline once at init so
   the colour glides between scroll samples. Reduced motion returns before anything is touched and
   the stylesheet's rest state stands: six finished plates, six grey numerals, the rail whole.
   Nothing rests at opacity 0 and no content is gated behind scrolling.
   ============================================================================ */
(function(){
if(window.__afissioInteriorFocusV1)return;window.__afissioInteriorFocusV1=1;
var plates=[].slice.call(document.querySelectorAll('.step-plate'));
if(!plates.length)return;
if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var LIT=[255,102,0];
function rgb(s){var m=/(-?[\d.]+)[,\s]+(-?[\d.]+)[,\s]+(-?[\d.]+)/.exec(s||'');return m?[+m[1],+m[2],+m[3]]:null}
function mixc(a,b,t){return 'rgb('+Math.round(a[0]+(b[0]-a[0])*t)+','+Math.round(a[1]+(b[1]-a[1])*t)+','+Math.round(a[2]+(b[2]-a[2])*t)+')'}
/* the cold values are the SHEET's, read once - so #242424 and #8E8E8E stay defined in one place */
var parts=plates.map(function(pl){
  var num=pl.querySelector('.step-plate_num');
  return {pl:pl,num:num,
    edge:rgb(getComputedStyle(pl).borderTopColor),
    numCold:num?rgb(getComputedStyle(num).color):null};
});
parts.forEach(function(p){
  p.pl.style.transition='border-color 520ms linear';
  if(p.num)p.num.style.transition='color 520ms linear';
});
function release(p){
  p.pl.style.transition='';p.pl.style.borderColor='';
  if(p.num){p.num.style.transition='';p.num.style.color=''}
}
/* THE PLATE CENTRES ARE CACHED IN DOCUMENT COORDINATES and re-measured only on resize. Reading
   six getBoundingClientRects inside a scroll handler forces a synchronous layout on every
   sample, which is the other half of the stutter; with the centres cached the whole pass is
   arithmetic on window.scrollY. */
function measure(){
  parts.forEach(function(p){
    var r=p.pl.getBoundingClientRect();
    p.mid=(r.height||r.top||r.bottom)?r.top+r.height/2+(window.scrollY||0):null;
  });
}
function paint(){
  var vh=window.innerHeight||document.documentElement.clientHeight||1;
  /* R38: a PX FLOOR under sigma. 7.5% of the viewport is 81px on a 1080 desktop and 29px on a
     844x390 landscape phone, where the plates are ~110px apart - the gaussian then collapsed to
     nothing between two plates and the section read as having no lit step at all for most of the
     scroll. 56px is the smallest sigma that keeps the current step legible at any height, and on
     a desktop the vh term still wins, so nothing changes there. */
  var line=vh*0.52,sigma=Math.max(vh*0.075,56),sy=window.scrollY||0;
  /* WINNER TAKES ALL (client note 2026-09-17: "i only want to see one color change. now during
     the transition i see 3 item border colors changing"). The gaussian alone left each
     neighbour at about 0.14 - faint, but three borders were visibly in motion at once. So the
     nearest plate to the reading line is found FIRST and it is the only one that is ever warm;
     every other plate is written its cold value exactly. And sigma is tightened from 0.16 to
     0.075 of the viewport so the winner's weight is already down to ~0.08 by the time the
     handover happens at the midpoint between two plates - the swap is therefore a small step,
     not a jump, and the 520ms transition covers it. One border changes, ever. */
  var best=-1,bestD=1e9,i;
  for(i=0;i<parts.length;i++){
    var pm=parts[i].mid;
    if(pm===null||pm===undefined)continue;
    var dd=Math.abs((pm-sy)-line);
    if(dd<bestD){bestD=dd;best=i}
  }
  parts.forEach(function(p,k){
    if(p.mid===null||p.mid===undefined){release(p);return}    /* unmeasurable: never hold it */
    var w=0;
    if(k===best){var d=((p.mid-sy)-line)/sigma;w=Math.exp(-d*d)}
    if(p.edge)p.pl.style.borderColor=mixc(p.edge,LIT,w);
    if(p.num&&p.numCold)p.num.style.color=mixc(p.numCold,LIT,w);
  });
}
var lastPaint=0,lastMeasure=0;
function onScroll(){
  var n=(window.performance&&performance.now)?performance.now():Date.now();
  if(n-lastPaint<16)return;
  lastPaint=n;
  if(n-lastMeasure>500){lastMeasure=n;measure()}
  paint();
}
window.addEventListener('scroll',onScroll,{passive:true});
window.addEventListener('load',function(){measure();paint()});
if(document.fonts&&document.fonts.ready&&document.fonts.ready.then)document.fonts.ready.then(function(){measure();paint()});
window.addEventListener('resize',function(){measure();paint()});
window.addEventListener('beforeprint',function(){parts.forEach(release)});
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible'){measure();paint()}});
measure();paint();
})();

/* ============================================================================
   5 · #questions — THE ACCORDION (client note 2026-09-17: "align center, create accordion for
   the faqs").

   PROGRESSIVE ENHANCEMENT, not a reveal. All six panels are AUTHORED OPEN in the markup; this
   script collapses five of them on load and leaves the first open. That order matters: a
   collapsed-by-default accordion gates copy behind a script, and this project has been bitten
   three times by content that never arrived in a frame that was not being rendered. With JS off,
   printing, or in a crawler, #questions is six questions and six answers.

   HOW IT SHIPS: no keyframes and no runtime combo (sections 4c-bis, 4f) - the panel height and
   the mark rotation are written inline here, while the TRANSITIONS live in client-first.css on
   faq_panel and faq_mark-bar, which do deploy.

   R27-WEBFLOW-ELEMENTS: THE TRIGGER IS NOT A <button>. The old row was
   <h3 class="faq_q-wrap"><button><span class="faq_q"><span class="faq_mark"><span class="faq_mark-bar">
   - and the deployer builds NONE of that: a Heading cannot hold a Button, a Button holds no
   children at all, and every inline tag is transparent, so the question lost its class and BOTH
   drawn bars of the plus mark vanished outright. R27 rebuilt it as a Link Block,
   <a href="#" class="faq_trigger" role="button">, holding an <h3 class="faq_q"> and two classed <div>s.

   R30-BUTTON-PURPOSE (2026-09-22): THE TRIGGER IS A DIV BLOCK NOW -
   <div class="faq_trigger" role="button" tabindex="0">. The operator ruled how a button is built, BY
   PURPOSE: a control that NAVIGATES is the native Button (a link); a control that only TOGGLES
   something on the page - menu, accordion, tab, dialog - is a Div Block with role="button" and
   tabindex="0", its script handling Enter and Space; a SUBMIT is the Form Button inside w-form
   (reference/WEBFLOW-ELEMENTS.md section 1). An accordion toggle is not a link, so the href is gone
   and with it the preventDefault that held it. A <div> is focusable with tabindex but activates on
   NEITHER key, so this pass owns both now: the ONE keydown listener is EXTENDED with Enter rather
   than joined by a second listener, and preventDefault is kept for Space ALONE, where it is what
   stops the page scrolling under the reader. Nothing else moved - same class, same aria-expanded and
   aria-controls (section 4h), same setOpen, same one-open-at-a-time, the same :focus-visible ring
   authored in the sheet, and the same mouse behaviour: click fires on a div exactly as on a link.

   ONE OPEN AT A TIME: six answers this short are a set to scan, not a document to read in
   parallel, and a single open row keeps all six questions on one screen.
   ============================================================================ */
(function(){
if(window.__afissioInteriorFaqV1)return;window.__afissioInteriorFaqV1=1;
var rows=[].slice.call(document.querySelectorAll(".faq_row"));
if(!rows.length)return;
var REDUCED=!!(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches);
var items=[];
rows.forEach(function(row){
  var btn=row.querySelector(".faq_trigger"),panel=row.querySelector(".faq_panel"),
      vert=row.querySelector(".faq_mark-bar.is-vert");
  if(!btn||!panel)return;
  items.push({row:row,btn:btn,panel:panel,vert:vert,open:false});
});
if(!items.length)return;
function setOpen(it,open,animate){
  it.open=open;
  it.btn.setAttribute("aria-expanded",open?"true":"false");
  if(it.vert)it.vert.style.transform=open?"rotate(0deg)":"";
  /* THE OPEN ROW CARRIES A SURFACE (client note 2026-09-17). Inline, because a combo that only
     exists at runtime is pruned from the published CSS (section 4f); the transition that makes it
     arrive is on .faq_row in the sheet, which does deploy. the open surface sits one step off the ground,
     under the five-rung near-black ladder's own #0E0E0E, so the divider stays the loudest edge. */
  /* R26: the open row's EDGE takes its own surface colour and its corners take 6px, so the open
     state reads as one soft block and a closed row shows no edge at all (its border is the
     page's #000000 from the sheet). Inline, because a runtime-only combo is pruned from the
     published CSS (§4f); both transitions are authored on .faq_row and deploy. */
  it.row.style.backgroundColor=open?"#0B0B0B":"";
  it.row.style.borderBottomColor=open?"#0B0B0B":"";
  it.row.style.borderRadius=open?"6px":"";
  if(!animate||REDUCED){
    it.panel.style.transition="none";
    it.panel.style.height=open?"auto":"0px";
    /* re-arm the sheet transition on the NEXT frame, never in this one - same frame means the
       collapse we just did animates instead of being instant. */
    requestAnimationFrame(function(){it.panel.style.transition=""});
    return;
  }
  var h=it.panel.scrollHeight;
  if(open){
    /* AN UNMEASURABLE PANEL OPENS OUTRIGHT: a frame that is not being rendered reports 0, and a
       height of 0 under overflow:hidden is an answer nobody can read. */
    if(!h){it.panel.style.height="auto";return}
    it.panel.style.height="0px";
    void it.panel.offsetHeight;
    it.panel.style.height=h+"px";
    var done=function(e){
      if(e.propertyName!=="height")return;
      it.panel.removeEventListener("transitionend",done);
      if(it.open)it.panel.style.height="auto";      /* so it reflows on resize and on text zoom */
    };
    it.panel.addEventListener("transitionend",done);
  }else{
    it.panel.style.height=h+"px";
    void it.panel.offsetHeight;
    it.panel.style.height="0px";
  }
}
items.forEach(function(it,i){setOpen(it,i===0,false)});
function toggle(it){
  var next=!it.open;
  items.forEach(function(other){if(other!==it&&other.open)setOpen(other,false,true)});
  setOpen(it,next,true);
}
items.forEach(function(it){
  /* the mouse, unchanged: click fires on a div exactly as it fired on the link - and with no href
     left to hold, the preventDefault R27 needed here is gone (R30) */
  it.btn.addEventListener("click",function(){toggle(it)});
  /* R30: a <div role="button"> activates on NEITHER key natively, so this one listener carries both.
     Enter needs no preventDefault - a div has no default action to cancel and raises no click of its
     own, so there is no second toggle behind it; Space keeps its preventDefault, which is the thing
     that stops the page scrolling. */
  it.btn.addEventListener("keydown",function(e){
    if(e.key==="Enter"||e.keyCode===13){toggle(it);return}
    if(e.key===" "||e.key==="Spacebar"||e.keyCode===32){e.preventDefault();toggle(it)}
  });
});
window.addEventListener("beforeprint",function(){items.forEach(function(it){setOpen(it,true,false)})});
})();

/* ============================================================================
   6 · #voice — THE MARK IS AN EMBER (client note 2026-09-17: "animate the icon", on the display
   quote glyph the client kept at R36: "i like the quote icon etc").

   Two moving marks were rejected here before it: the raked bars that breathed to 1.14 on a 5.2s
   loop (R26) and the hairline with a segment travelling it (R32). Both moved a SHAPE. This moves
   only WARMTH, which is the motion vocabulary the hero field set for the page: the glyph's colour
   rides a 5.6s cosine from the stylesheet's #FF6600 up to #FFA347 - the hero's own ember tint, a
   lighter step of the same 24-27 degree hue, not a second colour - and back, and the glyph lifts
   3px with it. Nothing scales, nothing rotates, nothing travels.

   ADDITIVE, and it stops when nobody is looking: rest is the stylesheet's apex orange at rest
   position, the loop only ever lifts and lightens from there, and the rAF is skipped whenever
   #voice is off screen or the tab is hidden. With no script, reduced motion on, printing or in a
   crawler the mark is the finished glyph the stylesheet sets. Ships as custom code in the site's
   script bundle - @keyframes do not survive the style pipeline and prefers-reduced-motion is
   dropped by it (§4c-bis).
   ============================================================================ */
(function(){
if(window.__afissioQuoteMarkV2)return;window.__afissioQuoteMarkV2=1;
var glyph=document.querySelector('.quote_glyph');if(!glyph)return;
var host=glyph.closest?glyph.closest('.quote_panel')||glyph:glyph;
if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var PERIOD=5600,LIFT=3,A=[255,102,0],B=[255,163,71];
function rest(){glyph.style.color='';glyph.style.transform=''}
var raf=0,t0=0;
function frame(now){
  if(!t0)t0=now;
  if(document.visibilityState==='hidden'){rest();raf=0;return}
  var r=host.getBoundingClientRect(),vh=window.innerHeight||0;
  if(r.bottom<-40||r.top>vh+40){raf=requestAnimationFrame(frame);return}
  var e=(1-Math.cos(((now-t0)/PERIOD)*Math.PI*2))/2;   /* 0 -> 1 -> 0, zero velocity at both ends */
  glyph.style.color='rgb('+Math.round(A[0]+(B[0]-A[0])*e)+','+Math.round(A[1]+(B[1]-A[1])*e)+','+Math.round(A[2]+(B[2]-A[2])*e)+')';
  glyph.style.transform='translateY('+(-LIFT*e).toFixed(2)+'px)';
  raf=requestAnimationFrame(frame);
}
function start(){if(!raf){t0=0;raf=requestAnimationFrame(frame)}}
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')start()});
window.addEventListener('beforeprint',function(){if(raf)cancelAnimationFrame(raf);raf=0;rest()});
start();
})();

/* ============================================================================
   7 · THE CONTENTS (2026-09-24; reading bar 2026-09-26, operator: "open and collapse ... super effective").
   The body is a CMS Rich Text element, so its <h2>s carry no id: this pass reads them, gives each an id
   and clones the ONE .toc_link template per heading. From 1280 the list is the sticky left rail; it
   scrolls inside itself on short screens and keeps the heading being read in view.
   BELOW 1280 the box becomes a READING BAR: sticky under the navbar (following it as it hides and
   returns), showing the section being read and n / N, with a 2px orange progress rule on its foot.
   The head is the toggle (role=button, Enter/Space); the list opens as an overlay capped to the screen
   and closes on a pick, Escape, or a tap outside. Picking jumps with the bar's height allowed for.
   STATE, NEVER CONTENT: with no script the list stands open in the flow. All state is INLINE (§4f).
   Reduced motion: no height animation, instant jumps. Nothing rests at opacity 0.
   ============================================================================ */
(function(){
if(window.__afissioContentsV1)return;window.__afissioContentsV1=1;
var list=document.querySelector('.toc_list');if(!list)return;
var nav=list.closest?list.closest('.toc_component'):null;
var body=document.querySelector('.article_column')||document.querySelector('.article_richtext');
var heads=[].slice.call(document.querySelectorAll('.article_richtext h2'));
if(!heads.length){if(nav)nav.style.display='none';return}
var tpl=list.querySelector('.toc_link');if(!tpl)return;
var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function q(c){return nav?nav.querySelector(c):null}
var rail=nav&&nav.closest?nav.closest('.article-layout_rail'):null;
var head=q('.toc_head'),state=q('.toc_state'),curEl=q('.toc_current'),countEl=q('.toc_count'),caret=q('.toc_caret'),prog=q('.toc_progress');
var shell=document.querySelector('.navbar_shell');
var mq=window.matchMedia?window.matchMedia('(max-width:1279px)'):null;
var canBar=!!(rail&&head&&state&&caret);
var compact=false,open=false,closeT=0;
var used={};
function slug(t){
  var s=(t||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'section',k=s,n=2;
  while(used[k]||document.getElementById(k)){k=s+'-'+(n++)}
  used[k]=1;return k;
}
var links=[],frag=document.createDocumentFragment();
heads.forEach(function(h){
  if(!h.id)h.id=slug(h.textContent);
  var a=tpl.cloneNode(true),txt=a.querySelector('.toc_text');
  a.setAttribute('href','#'+h.id);a.removeAttribute('aria-current');a.style.color='';
  if(txt)txt.textContent=h.textContent;
  a.addEventListener('click',function(e){e.preventDefault();go(h)});
  links.push(a);frag.appendChild(a);
});
while(list.firstChild)list.removeChild(list.firstChild);
list.appendChild(frag);
var N=heads.length;
function pageY(){return window.pageYOffset||0}
function navH(){return shell?shell.offsetHeight:0}
function navBottom(){if(!shell)return 0;var b=shell.getBoundingClientRect().bottom;return b>0?b:0}
function margins(){
  var m=compact?(navH()+(nav?nav.offsetHeight:0)+16)+'px':'7rem';
  heads.forEach(function(h){h.style.scrollMarginTop=m});
}
function go(h){
  var top=h.getBoundingClientRect().top,y;
  if(compact){
    /* scrolling down hides the navbar, so the bar rides at the top; scrolling up brings the navbar back. */
    var off=nav.offsetHeight+16+(top<0?navH():0);
    y=top+pageY()-off;setOpen(false);
  }else y=top+pageY()-112;
  window.scrollTo({top:Math.max(0,y),behavior:reduce?'auto':'smooth'});
  if(history.replaceState)history.replaceState(null,'','#'+h.id);
}
/* ---- open / close (compact only) ---- */
var EASE='cubic-bezier(0.16,1,0.3,1)',DUR=380;
function capH(){return Math.max(180,(window.innerHeight||600)-nav.getBoundingClientRect().bottom-16)}
function centreActive(){
  var a=links[cur>=0?cur:0];if(!a)return;
  list.scrollTop=Math.max(0,a.offsetTop-list.clientHeight/2+a.offsetHeight/2);
}
function setOpen(v){
  if(!compact||v===open)return;open=v;clearTimeout(closeT);
  head.setAttribute('aria-expanded',v?'true':'false');
  caret.style.transform=v?'rotate(-135deg)':'';caret.style.marginTop=v?'0.25rem':'';
  nav.style.borderColor=v?'#454545':'';
  var max=capH();list.style.maxHeight=max+'px';
  if(v){
    list.style.transition='none';list.style.visibility='visible';list.style.height='0px';
    var h=Math.min(list.scrollHeight+2,max);centreActive();
    void list.offsetHeight;
    list.style.transition=reduce?'none':'height '+DUR+'ms '+EASE;list.style.height=h+'px';
  }else{
    list.style.transition='none';list.style.height=list.offsetHeight+'px';void list.offsetHeight;
    list.style.transition=reduce?'none':'height '+(DUR-80)+'ms '+EASE;list.style.height='0px';
    closeT=setTimeout(function(){if(!open)list.style.visibility='hidden'},reduce?0:DUR-80);
  }
}
function toggle(){setOpen(!open)}
if(canBar){
  head.addEventListener('click',function(){if(compact)toggle()});
  head.addEventListener('keydown',function(e){
    if(!compact)return;
    if(e.key==='Enter'||e.key===' '||e.key==='Spacebar'){e.preventDefault();toggle()}
    else if(e.key==='ArrowDown'&&!open){e.preventDefault();setOpen(true);var a=links[cur>=0?cur:0];if(a)a.focus()}
  });
  document.addEventListener('keydown',function(e){if(open&&(e.key==='Escape'||e.key==='Esc')){setOpen(false);head.focus()}});
  document.addEventListener('click',function(e){if(open&&nav&&!nav.contains(e.target))setOpen(false)});
}
var LIST_KEYS=['position','top','left','right','zIndex','boxSizing','backgroundColor','border','overflowY','overscrollBehavior','height','maxHeight','visibility','transition'];
function enter(){
  compact=true;open=false;
  rail.style.position='sticky';rail.style.zIndex='20';
  head.setAttribute('role','button');head.setAttribute('tabindex','0');head.setAttribute('aria-expanded','false');
  head.setAttribute('aria-label','Contents - show all '+N+' sections');head.style.cursor='pointer';
  state.style.display='flex';caret.style.display='block';if(prog)prog.style.display='block';
  var s=list.style;s.position='absolute';s.top='100%';s.left='-1px';s.right='-1px';s.zIndex='1';s.boxSizing='border-box';
  s.backgroundColor='#080808';s.border='1px solid #454545';s.overflowY='auto';s.overscrollBehavior='contain';
  s.height='0px';s.visibility='hidden';s.transition='none';
  margins();frame();
}
function leave(){
  compact=false;open=false;clearTimeout(closeT);
  rail.style.position='';rail.style.zIndex='';rail.style.top='';
  ['role','tabindex','aria-expanded','aria-label'].forEach(function(k){head.removeAttribute(k)});head.style.cursor='';
  state.style.display='';caret.style.display='';caret.style.transform='';caret.style.marginTop='';nav.style.borderColor='';
  if(prog){prog.style.display='';prog.style.transform=''}
  LIST_KEYS.forEach(function(k){list.style[k]=''});
  margins();frame();
}
function mode(){if(!canBar){margins();return}var want=mq?mq.matches:false;if(want&&!compact)enter();else if(!want&&compact)leave();else margins()}
/* ---- the heading being read ---- */
var cur=-2;
function paint(i){
  if(i===cur)return;cur=i;
  links.forEach(function(a,k){
    var on=k===i;
    a.style.color=on?'#EDEDED':'';
    if(on)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');
  });
  var shown=i>=0?i:(body.getBoundingClientRect().top<0?N-1:0);
  if(curEl)curEl.textContent=heads[shown].textContent;
  if(countEl)countEl.textContent=(shown+1)+' / '+N;
  /* desktop: keep the active row inside the rail's own scroll */
  if(!compact&&i>=0&&list.scrollHeight>list.clientHeight+1){
    var a=links[i],t=a.offsetTop,bt=t+a.offsetHeight;
    if(t<list.scrollTop)list.scrollTop=t-8;else if(bt>list.scrollTop+list.clientHeight)list.scrollTop=bt-list.clientHeight+8;
  }
}
function frame(){
  var line=(window.innerHeight||0)*0.3,i=-1;
  if(compact){rail.style.top=navBottom()+'px';line=Math.max(line,nav.getBoundingClientRect().bottom+24)}
  for(var k=0;k<N;k++){if(heads[k].getBoundingClientRect().top-line<=0)i=k;else break}
  var r=body.getBoundingClientRect();
  if(r.bottom<line)i=-1;
  paint(i);
  if(compact&&prog){
    var start=nav.getBoundingClientRect().bottom,span=r.height-((window.innerHeight||0)-start);
    var p=span>0?(start-r.top)/span:1;p=p<0?0:p>1?1:p;
    prog.style.transform='scaleX('+p.toFixed(4)+')';
  }
}
/* the navbar hides and returns over ~1.4s, so the bar follows it frame by frame for a moment after each scroll. */
var until=0,running=false;
function loop(){frame();if(Date.now()<until)requestAnimationFrame(loop);else running=false}
function kick(){until=Date.now()+1700;if(!running){running=true;requestAnimationFrame(loop)}frame()}
window.addEventListener('scroll',kick,{passive:true});
window.addEventListener('resize',function(){mode();if(open)list.style.maxHeight=capH()+'px';kick()});
if(mq){if(mq.addEventListener)mq.addEventListener('change',mode);else if(mq.addListener)mq.addListener(mode)}
window.addEventListener('beforeprint',function(){if(compact)leave()});
window.addEventListener('afterprint',mode);
mode();frame();
})();

/* ============================================================================
   8 · IN-PAGE LINKS (operator 2026-09-24: Solutions' "Learn More" - "when clicked go to next section").
   A link whose href is "#id" for an element on this page scrolls to it smoothly, stopping 0px under the
   top: every section opens on its own padding, so the fixed bar never covers content. Reduced motion
   jumps instantly. No-op for any hash with no target; the contents rail (section 7) keeps its own.
   ============================================================================ */
(function(){
if(window.__afissioHashLinksV1)return;window.__afissioHashLinksV1=1;
var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.addEventListener('click',function(e){
  var a=e.target&&e.target.closest?e.target.closest('a[href^="#"]'):null;
  if(!a||a.classList.contains('toc_link'))return;
  var id=a.getAttribute('href').slice(1);if(!id)return;
  var el=document.getElementById(id);if(!el)return;
  e.preventDefault();
  var y=el.getBoundingClientRect().top+(window.pageYOffset||0);
  window.scrollTo({top:Math.max(0,y),behavior:reduce?'auto':'smooth'});
  if(history.replaceState)history.replaceState(null,'','#'+id);
});
})();

/* ============================================================================
   9 · #process - THE HANDOVER, DRAWN (2026-09-27; one line since the operator's "merge them ... use gradient").
   It ADDS to a line that is already whole: CSS rests every .procedure_fill at full length, so with no script, or
   with reduced motion, the line simply stands. When the list first comes up the screen its fills are primed to
   zero and drawn on ONE clock from the first node to the arrow, and a token rides the leading edge; its colour
   follows the line - light through the grey, blending to orange across the gradient span, orange to the end.
   Each node pings (an outline that opens and fades) as the line reaches it. Afterwards, while the section is on
   screen, the token runs again every few seconds over the finished line; a pointer on a step pings its node.
   Geometry is read from the rendered parts at the start of every run, so the same code draws the horizontal line
   and the vertical one (<=991). State is inline (§4f); the token is created and removed here.
   Failsafes, as §1: rect polling with an interval floor, and a hidden frame, a resize mid-run or a stalled clock
   completes the line at once; print always gets it whole. Nothing rests at opacity 0.
   ============================================================================ */
(function(){
if(window.__afissioHandoverV2)return;window.__afissioHandoverV2=1;
var list=document.querySelector('.procedure_list');if(!list)return;
if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var steps=[].slice.call(list.querySelectorAll('.procedure_step'));
var rails=[].slice.call(list.querySelectorAll('.procedure_rail'));
var nodes=[].slice.call(list.querySelectorAll('.procedure_node'));
var arrows=[].slice.call(list.querySelectorAll('.procedure_arrow'));
if(!rails.length)return;
function fillOf(el){return el.querySelector('.procedure_fill')}
var fills=rails.map(fillOf).filter(Boolean);
var state='idle',running=false,runId=0,raf=0,nextLoop=0,toks=[];
var LOOP=6500,DIM='#262626';
function rect(el){var r=el.getBoundingClientRect(),o=list.getBoundingClientRect();return{x:r.left-o.left,y:r.top-o.top,w:r.width,h:r.height}}
function model(){
  var r0=rect(rails[0]),H=r0.w>=r0.h;
  function s(b){return H?b.x:b.y}function l(b){return H?b.w:b.h}
  var o=s(r0),segs=[],blend=null,accent=null;
  rails.forEach(function(el){var b=rect(el),f=fillOf(el);if(!f)return;var g={el:f,s:s(b)-o,l:Math.max(1,l(b)),ax:H?'X':'Y'};segs.push(g);
    if(!blend&&f.classList.contains('is-blend'))blend=g;if(!accent&&f.classList.contains('is-accent'))accent=g});
  var lb=rect(rails[rails.length-1]),L=s(lb)+l(lb)-o;
  var ns=nodes.map(function(n){var b=rect(n);return{el:n,acc:n.classList.contains('is-accent'),d:(H?b.x+b.w/2:b.y+b.h/2)-o}});
  function p(d){return H?{x:o+d,y:r0.y+r0.h/2}:{x:r0.x+r0.w/2,y:o+d}}
  return{segs:segs,L:L,blend:blend,accent:accent,nodes:ns,p:p};
}
function mix(t){var a=[237,237,237],b=[255,102,0];return 'rgb('+a.map(function(v,i){return Math.round(v+(b[i]-v)*t)}).join(',')+')'}
function tone(M,d){
  if(M.blend){var t=(d-M.blend.s)/M.blend.l;return t<0?0:t>1?1:t}
  if(M.accent)return d>=M.accent.s?1:0;return 0;
}
function token(){
  var t=document.createElement('div');t.setAttribute('aria-hidden','true');
  var s=t.style;s.position='absolute';s.left='0';s.top='0';s.zIndex='2';s.width='5px';s.height='5px';s.marginLeft='-2.5px';s.marginTop='-2.5px';
  s.pointerEvents='none';s.transition='opacity 420ms linear';
  list.appendChild(t);toks.push(t);return t;
}
function put(t,q){t.style.transform='translate('+q.x.toFixed(1)+'px,'+q.y.toFixed(1)+'px)'}
function retire(t){if(!t||t.__gone)return;t.__gone=1;t.style.opacity='0';setTimeout(function(){if(t.parentNode)t.parentNode.removeChild(t)},460)}
function clearToks(){toks.forEach(function(t){if(t.parentNode)t.parentNode.removeChild(t)});toks=[]}
function ping(n,acc){
  if(!n)return;var s=n.style,c=acc?'255,102,0':'237,237,237';
  clearTimeout(n.__ping);
  s.transition='none';s.outline='1px solid rgba('+c+',0.9)';s.outlineOffset='0px';
  void n.offsetWidth;
  s.transition='outline-offset 1100ms cubic-bezier(0.16,1,0.3,1),outline-color 1100ms cubic-bezier(0.33,0,0.2,1)';
  s.outlineOffset='0.75rem';s.outlineColor='rgba('+c+',0)';
  n.__ping=setTimeout(function(){s.transition='';s.outline='';s.outlineOffset='';s.outlineColor=''},1180);
}
function prime(){
  var M=model();
  M.segs.forEach(function(g){g.el.style.transform='scale'+g.ax+'(0)'});
  arrows.forEach(function(a){a.style.transition='border-color 600ms cubic-bezier(0.33,0,0.2,1)';a.style.borderColor=DIM});
}
function finish(){
  runId++;running=false;cancelAnimationFrame(raf);clearToks();
  fills.forEach(function(f){f.style.transform=''});
  arrows.forEach(function(a){a.style.transition='';a.style.borderColor=''});
  state='drawn';nextLoop=Date.now()+LOOP;
}
function ease(p){return 0.5-0.5*Math.cos(Math.PI*p)}
function run(draw){
  if(running)return;
  var M=model();if(!(M.L>0)){finish();return}
  running=true;var id=++runId;
  var T=draw?Math.max(2200,Math.min(3800,M.L*2.6)):Math.max(2000,Math.min(3400,M.L*2.3));
  var t0=0,a=token(),pinged=[],lit=false;
  put(a,M.p(0));a.style.backgroundColor=mix(0);
  var guard=setTimeout(function(){if(running&&id===runId)finish()},T+1600);
  function frame(now){
    if(id!==runId)return;
    if(!t0)t0=now;
    var p=Math.min(1,(now-t0)/T),d=ease(p)*M.L;
    if(draw)M.segs.forEach(function(g){var f=(d-g.s)/g.l;f=f<0?0:f>1?1:f;g.el.style.transform='scale'+g.ax+'('+f.toFixed(4)+')'});
    put(a,M.p(d));a.style.backgroundColor=mix(tone(M,d));
    M.nodes.forEach(function(n,k){if(!pinged[k]&&d>=n.d-1){pinged[k]=1;ping(n.el,n.acc)}});
    if(draw&&!lit&&d>=M.L-6){lit=true;arrows.forEach(function(x){x.style.borderColor=''})}
    if(p<1){raf=requestAnimationFrame(frame);return}
    clearTimeout(guard);retire(a);
    running=false;state='drawn';nextLoop=Date.now()+LOOP;
    if(draw){fills.forEach(function(f){f.style.transform=''});arrows.forEach(function(x){x.style.transition='';x.style.borderColor=''})}
  }
  raf=requestAnimationFrame(frame);
}
function vh(){return window.innerHeight||document.documentElement.clientHeight||0}
function tick(){
  if(document.visibilityState==='hidden'){if(state!=='drawn'||running)finish();return}
  if(running)return;
  var r=list.getBoundingClientRect(),h=vh();
  if(state==='primed'){if(r.top<h*0.72&&r.bottom>h*0.12)run(true);return}
  if(state==='drawn'&&Date.now()>=nextLoop&&r.top<h*0.8&&r.bottom>h*0.2)run(false);
}
var r0=list.getBoundingClientRect();
if(document.visibilityState==='hidden'||r0.bottom<=0){state='drawn';nextLoop=Date.now()+2500}
else{prime();state='primed'}
var pend=false;
window.addEventListener('scroll',function(){if(pend)return;pend=true;requestAnimationFrame(function(){pend=false;tick()})},{passive:true});
window.addEventListener('resize',function(){if(running)finish()});
document.addEventListener('visibilitychange',tick);
window.addEventListener('beforeprint',finish);
setInterval(tick,400);
steps.forEach(function(s){var n=s.querySelector('.procedure_node');if(n)s.addEventListener('mouseenter',function(){if(!running)ping(n,n.classList.contains('is-accent'))})});
tick();
})();
