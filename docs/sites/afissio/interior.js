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
 '.divide_pair','.divide_open','.divide_note',
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
/* 2026-09-24 (404): when the header is the LAST section before the footer, nothing follows it for the
   field's 30vh tail to dissolve across, so the layer is extended inline to run on under the footer
   (runtime geometry, §4f) — the field then fades out behind the footer instead of stopping at it. */
function __reach(hostEl){var sec=hostEl.closest&&hostEl.closest('section');if(!sec)return;var mn=sec.parentElement;
  if(!mn||mn.tagName!=='MAIN'||mn.lastElementChild!==sec)return;var f=mn.nextElementSibling;
  while(f&&f.tagName!=='FOOTER'&&f.tagName!=='SECTION')f=f.nextElementSibling;if(!f||f.tagName!=='FOOTER')return;
  hostEl.style.bottom=(-Math.round(f.getBoundingClientRect().height))+'px';}
__hosts.forEach(__reach);window.addEventListener('resize',function(){__hosts.forEach(__reach)});
__hosts.forEach(function(hostEl){__field(__mount(hostEl))});
function __field(cv){
var ctx=cv.getContext('2d');if(!ctx)return;
var host=cv.parentNode,W=1,H=1;
/* AOR-V2 (2026-09-24): THE CENTRED MODE. A host wearing `hero-wave is-centered` seats the warmth and
   the apex on the page's centre line, MIDWAY between the header's content and the next section's
   content, so the mark is the hinge between the two. Measured from the live boxes every frame, so the
   seat follows the type at every width. The default mode below is untouched. */
var centered=!!(host.classList&&host.classList.contains('is-centered'));
/* THE CENTRED MODE IS THE DEFAULT FIELD, CENTRED - never a second design (operator 2026-09-24: "the
   same animation, coloring and sizing as other pages", then "move the logo animation to the top, the
   hero section"). Same three BLOOMS at the same heights, radii, travel, periods, peaks and colours;
   the same apex at 64% of the width capped at 1152px, 0.06 alpha, its foot just below the seam; the
   same top veil and the same tail. Only x moves: the bloom group and the mark are centred on the page,
   and the left veil is dropped, because a centred stack has no left column to protect. */
function paintCentered(t){
  var d=Math.max(W,H),i;
  ctx.fillStyle='#000000';ctx.fillRect(0,0,W,H);
  ctx.globalCompositeOperation='lighter';
  for(i=0;i<BLOOMS.length;i++){
    var bl=BLOOMS[i],p1=t*bl.s,p2=t*bl.s*1.7,p3=t*bl.s*0.6;
    var cx=(bl.x-0.32+(Math.sin(p1)*0.78+Math.sin(p2)*0.34)*bl.dx)*W;
    var cy=(bl.y+(Math.cos(p1*0.78)*0.78+Math.sin(p3)*0.34)*bl.dy)*H;
    var rr=bl.r*d*(1+Math.sin(t*bl.rs)*bl.rw*0.72+Math.sin(t*bl.rs*1.9)*bl.rw*0.28);
    var g=ctx.createRadialGradient(cx,cy,0,cx,cy,rr);
    soft(g,bl.c,bl.a);
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  }
  ctx.globalCompositeOperation='source-over';
  if(markOK){
    var mr=(mark.naturalWidth&&mark.naturalHeight)?(mark.naturalHeight/mark.naturalWidth):(192/230);
    var mw=Math.min(W*0.64,1152),mh=mw*mr;
    ctx.globalAlpha=0.06;
    ctx.drawImage(mark,W/2-mw/2,H*0.869-mh,mw,mh);
    ctx.globalAlpha=1;
  }
  var vg=ctx.createLinearGradient(0,0,0,H*0.66);
  for(i=0;i<=8;i++){var u=i/8;vg.addColorStop(u,'rgba(0,0,0,'+(Math.pow(1-u,1.8)*0.9).toFixed(4)+')')}
  ctx.fillStyle=vg;ctx.fillRect(0,0,W,Math.ceil(H*0.66)+1);
  var tg=ctx.createLinearGradient(0,H*0.74,0,H);
  for(i=0;i<=8;i++){var n=i/8;tg.addColorStop(n,'rgba(0,0,0,'+Math.pow(n,1.9).toFixed(4)+')')}
  ctx.fillStyle=tg;ctx.fillRect(0,Math.floor(H*0.74),W,Math.ceil(H*0.26)+1);
}
/* THE APEX, PAINTED INTO THE FIELD (R30). It used to be an <img> in .hero-mark-layer, which was
   the section box with overflow:hidden - so it was still cut dead straight at 100vh even after
   the canvas itself was extended past the seam. Drawn here it is inside the same 130vh layer as
   the gradient and the same bottom veil dissolves it, so nothing in the hero is clipped at the
   seam. Geometry matches what the stylesheet had: 64% of the width capped at 1152px, bled 9%
   off the right, seated so its foot lands just below the section seam. */
var mark=new Image(),markOK=false;
mark.onload=function(){markOK=true};
mark.src='../brand/logo/afissio-apex-orange.svg';
function size(){
  var r=host.getBoundingClientRect();
  /* DPR IS CAPPED AT 1.25, NOT 2. At 2 the backing store was 1848x1080 - 2.0 MEGAPIXELS
     rewritten every frame with seven full-screen gradient fills, and on a 1680 display it would
     be 7.1MP. That is what made scrolling stutter. The field is a soft gradient with no detail
     in it, so a 1.25x store is visually identical and costs 2.6x less per frame. */
  var dpr=Math.min(1.25,window.devicePixelRatio||1);
  W=Math.max(1,Math.round(r.width));H=Math.max(1,Math.round(r.height));
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
/* x,y,r as fractions of the section; a is peak alpha; s is rad/ms - 0.00005 is a ~125s period */
/* R23 (client note 2026-09-17: "the left side of the hero must be black. the gradient is too big
   and it is very difficult to understand that the gradient is animated and moving"):
     · every bloom moved to the RIGHT HALF and its radius roughly halved (0.95 -> 0.46 of the
       long edge). A gradient the size of the viewport has no visible edge to travel, so its
       motion is invisible however fast it runs - the fix for "I cannot tell it is moving" is a
       SMALLER gradient, not a faster one.
     · travel and speed roughly doubled on top of that: 0.10-0.16 of the box per swing, periods
       now 28-70s, so a bloom crosses a visible fraction of the hero while you look at it.
     · and the whole field is masked to black on the left (see the horizontal veil in paint),
       which is also the side the type is aligned to. */
/* R26 (client note 2026-09-17: "start the gradient from bottom right, make it darker, smoother,
   better animation. i can't see it is moving"). Three changes, and the third is the one that
   makes the motion legible:
     · ORIGIN. The four blooms now sit at and around the BOTTOM-RIGHT CORNER - one anchored just
       outside it, two climbing the right edge, one running in along the bottom - so the warmth
       rises out of that corner and the top of the hero is near black. The old top-right anchor
       is gone, and the vertical veil below is flipped to darken the TOP for the same reason.
     · DARKER. Peaks 0.20 / 0.15 / 0.11 / 0.09, down again from 0.25 / 0.17 / 0.14 / 0.10.
     · VISIBLE. A bloom whose centre sits off-canvas cannot show you that it is translating - you
       only ever see one flank of it - which is why the last two passes read as still. So the
       RADIUS is what moves now: rw is 0.42-0.55 (was 0.20-0.26), i.e. each bloom swells and
       shrinks by up to half its size on an 18-34s period. A corner glow breathing in and out is
       unmistakable at a glance, and it stays soft because a radius change moves no edge. */
/* R27 (5th client note on this field: "THE HERO GRADIENT IS SOOOO BRIGHT AND NOT ANIMATED
   PROPERLY"). Both complaints had one cause and it was a bug in my geometry, not a taste call.

   WHY IT LOOKED STILL. Every bloom's CENTRE sat outside the canvas - x 1.04, y 1.06 and so on,
   anchored off the bottom-right corner. You therefore only ever saw one flank of each, and
   translating or breathing an off-screen centre changes the falloff's steepness but never moves
   a bright point across the screen. Four of them overlapping averaged what little was left into
   a constant. No amount of extra speed could have fixed that.

   THE FIX. THREE blooms (fewer, so they average less), every CENTRE INSIDE the lower-right
   quadrant, and travel large enough to see: +/-0.17 of the width and +/-0.15 of the height on
   16-26s periods. The warm core now physically slides around the bottom right, which is what
   reads as movement.

   The rotating sweep is DELETED. A full-screen linear gradient laid over the blooms is exactly
   what flattens a moving field into a wash, and it was adding brightness for nothing.

   AND DARKER, hard: peaks 0.12 / 0.09 / 0.065, down from 0.20 / 0.15 / 0.11 - which were
   themselves down from 0.62 / 0.42 / 0.34. MEASURED, both halves of the note: the brightest
   pixel in the hero is about #230D00 against the #481B00 that drew this feedback, and the field
   changes 4-10 red levels at five different sample points over six seconds - a 15-30% relative
   change on a peak of 35, which is what "animated properly" has to mean on a field this dark.

   The origin is still the bottom right (R26), the left is still black, the top is still the
   dark end.

   R28: the canvas layer is 130vh now - 30vh of it BELOW the section seam - because the section
   stopped clipping at 100vh. The bloom centres moved up its box (y 0.56-0.74, was 0.72-0.94) so
   the warm core still sits in the hero own lower right, the falloff carries across the seam into
   #steps, and a bottom veil dissolves the tail to #000000 before the layer ends. Periods also cut
   ~40%, to 11-18s, on "the user needs to feel it is animated". */
/* R29 — THE HUE WAS THE BUG, NOT THE BRIGHTNESS (client note 2026-09-17: "the gradient of the
   top hero must be better, darker orange. it looks the color is way different because of the
   effects you applied").

   WHY THE COLOUR DRIFTED. The blooms were composited SOURCE-OVER, one on top of the next. That
   operator does not add light, it INTERPOLATES TOWARD the new colour: painting #B34B00 at 0.09
   over an area that already carried #FF6600 pulls the red down by 9% while adding only its own
   9% back, so every overlap lost red and kept green - and three overlapping blooms plus two
   black veils averaged the brand's 24-degree orange into a grey-brown wash. That is the "colour
   is way different": not a taste failure, the wrong blend mode.

   THE FIX IS 'lighter' (additive). Channels SUM, so the hue ratio is preserved exactly - both
   brand oranges sit at hue 24-25 degrees, and 255:102 stays 255:102 however many blooms overlap.
   Overlaps now read as MORE orange rather than as mud.

   AND A REAL DARK ORANGE, not near-black. Additive compositing means peaks can carry weight
   without the field going bright: 0.26 / 0.17 / 0.11 sums to a #7A3000-class ember at the core
   of the bottom-right corner, which is a dark orange you can name, where the previous pass
   measured #230D00 - a colour with no hue left in it. The top and the left are still veiled to
   #000000, so the section is exactly as dark where the type is. */
/* R29b — IT READ RED BECAUSE THE GREEN CHANNEL WAS STARVED (client note: "it looks like red
   now, which i did not like").

   #FF6600 is 255:102 red:green. Scaled down toward black - which is all a low-alpha wash of it
   can be - you get 60:24, 90:36, 124:51. Those are all the SAME hue arithmetically, and every
   one of them reads as dark red-brown to the eye, because at low luminance the small green
   component is simply not enough for the eye to call it orange. Chasing "darker" by scaling the
   brand hex toward black can only ever produce red-brown; the hue has to be carried, not scaled.

   SO THE CORE CARRIES A LIGHTER TINT OF THE SAME HUE FAMILY. The ember at the bottom right is
   #FFA347 - the brand orange lifted in lightness along its own hue (24 -> 27 degrees, a tint of
   #FF6600, not a new colour) - at a small radius, and #FF6600 does the mid-field around it while
   #B34B00 carries the far tail. Warmth now goes black -> deep orange -> amber as it approaches
   the corner, which is a hue RAMP, and a ramp is what reads as orange instead of as flat red.

   Peaks: 0.30 ember / 0.22 mid / 0.13 tail, additive, summing well clear of the red channel's
   ceiling - red clipping at 255 while green sat at 102 was the other half of why the last pass
   went red. The ember's radius is 0.22 of the long edge, so this is a small bright heart in a
   dark field, not a brighter field. */
/* R38 - RESPONSIVE GEOMETRY (client note 2026-09-17: "make the page extremely responsive ...
   also the animations must be responsive too"). Every number in this field was already a FRACTION
   of the section box, so radius, travel and the mark scale by construction. Two things were not,
   and both broke on a narrow box:
     · THE LEFT VEIL was tuned for a 3:2 desktop hero - opaque to 17% of the width and clear by
       56%. On a 390px phone that is 218px of forced black out of 390, and the ember lived in the
       remaining sliver, so the field read as a flat black box with a smudge in the corner. The
       veil is now a function of the box: on a narrow hero it holds to 4% and clears by 30%,
       because there is no left column to protect - the type is full width and sits above it.
     · THE BLOOM CENTRES sat at x 0.74-0.92, which is correct when 0.56 of the width is veiled and
       wrong when 0.30 is. narrow() pulls them in toward 0.60-0.78 on the same curve, so the ember
       stays inside the visible field at every width instead of hiding off the right edge.
   Measured at 1920 / 1440 / 1280 / 1024 / 991 / 768 / 479 / 390 and at 844x390 landscape. */
function narrow(){return W<820?(820-Math.max(360,W))/460:0}   /* 0 at >=820px, 1 at <=360px */
var BLOOMS=[
  {x:0.74,y:0.58,r:0.44,a:0.22,c:'255,102,0',dx:0.18,dy:0.14,s:0.000368,rw:0.26,rs:0.000254},
  {x:0.92,y:0.70,r:0.34,a:0.13,c:'179,75,0',dx:0.15,dy:0.13,s:0.000489,rw:0.30,rs:0.000339},
  {x:0.80,y:0.64,r:0.22,a:0.30,c:'255,163,71',dx:0.13,dy:0.10,s:0.000585,rw:0.34,rs:0.000436}
];
/* SOFT STOPS. A three-stop radial (peak, a third, zero) has a visibly steep core. These thirteen
   stops follow a raised cosine to the 2.1: flat-topped at the centre, no kink anywhere, and it
   reaches zero with zero slope - a soft ball of light rather than a disc with a halo. */
function soft(g,c,a){
  for(var si=0;si<=12;si++){
    var su=si/12,sv=Math.pow((1+Math.cos(Math.PI*su))/2,2.1)*a;
    g.addColorStop(su,'rgba('+c+','+sv.toFixed(4)+')');
  }
}
function paint(t){
  /* THE BACKING STORE IS RE-CHECKED EVERY FRAME. size() used to run once at init and then only
     on resize, so a section measured at 0 before layout settled left a 2x2 bitmap smeared over
     the hero with no path back - measured on a cold preload, 1 load in 2. Two integer compares
     a frame buy a field that cannot come up dead. */
  var bx=host.getBoundingClientRect(),dp=Math.min(1.25,window.devicePixelRatio||1);
  if(cv.width!==Math.round(bx.width*dp)||cv.height!==Math.round(bx.height*dp))size();
  if(centered){paintCentered(t);return}
  ctx.fillStyle='#000000';ctx.fillRect(0,0,W,H);
  var d=Math.max(W,H),i,j,x,y;
  ctx.globalCompositeOperation='lighter';   /* R29: additive, so overlaps keep the brand hue */
  for(i=0;i<BLOOMS.length;i++){
    var bl=BLOOMS[i];
    /* BUBBLE PATH. A single sine on each axis draws a rigid ellipse and reads as a slide; each axis
       here is TWO sines at unrelated periods (the second at 0.43x amplitude, 1.7x and 0.6x the
       rate), so the centre wanders a soft open path that never retraces itself - it rises, sways
       past, and comes back around. The radius breathes on a third period again. */
    var p1=t*bl.s,p2=t*bl.s*1.7,p3=t*bl.s*0.6,nb=narrow();
    var bxf=bl.x-0.16*nb;                                  /* R38: pulled in on a narrow box */
    var cx=(bxf+(Math.sin(p1)*0.78+Math.sin(p2)*0.34)*bl.dx)*W;
    var cy=(bl.y+(Math.cos(p1*0.78)*0.78+Math.sin(p3)*0.34)*bl.dy)*H;
    var rr=bl.r*d*(1+Math.sin(t*bl.rs)*bl.rw*0.72+Math.sin(t*bl.rs*1.9)*bl.rw*0.28);
    var g=ctx.createRadialGradient(cx,cy,0,cx,cy,rr);
    soft(g,bl.c,bl.a);
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  }
  ctx.globalCompositeOperation='source-over';   /* the mark and both veils must darken normally */
  /* the rotating sweep - painted last, over the blooms, so the warmth has a direction that
     travels rather than four fixed centres that merely wobble */
  /* the mark rides with the field - painted over the blooms, under every veil */
  if(markOK){
    var mr=(mark.naturalWidth&&mark.naturalHeight)?(mark.naturalHeight/mark.naturalWidth):(192/230);
    var mw=Math.min(W*0.64,1152),mh=mw*mr;
    ctx.globalAlpha=0.06;
    ctx.drawImage(mark,W*1.09-mw,H*0.869-mh,mw,mh);
    ctx.globalAlpha=1;
  }
  /* THE LEFT IS BLACK. A horizontal veil to opaque black over the left 30% and a fade out by
     62%, so the warmth lives entirely on the right and the left-aligned stack sits on the page's
     own surface token with nothing behind it. This is a gradient too - no edge anywhere. */
  var hg=ctx.createLinearGradient(0,0,W,0);
  var nv=narrow(),vSolid=0.17-0.13*nv,vClear=0.56-0.26*nv;   /* R38: box-aware veil */
  for(var k=0;k<=10;k++){
    var uk=k/10,vk=uk<vSolid?1:Math.pow((1+Math.cos(Math.PI*((uk-vSolid)/(vClear-vSolid))))/2,1.15);
    if(uk>vClear)vk=0;
    hg.addColorStop(uk,'rgba(0,0,0,'+vk.toFixed(4)+')');
  }
  ctx.fillStyle=hg;ctx.fillRect(0,0,W,H);
  /* AND THE TOP IS THE DARK END. With the wave silhouettes gone the field measured almost flat top to bottom
     (#0F0700 .. #260F00), and the bottom read warmer than the upper left - which loses the depth
     the waves were carrying and leaves the section seam floating. One vertical fade to black over
     the upper 66% keeps the weight at the bottom right, where the light now comes from. Still a
     gradient: no edge, nothing filled to a path. */
  var vg=ctx.createLinearGradient(0,0,0,H*0.66);
  for(var m=0;m<=8;m++){
    var um=m/8,vm=Math.pow(1-um,1.8)*0.9;
    vg.addColorStop(um,'rgba(0,0,0,'+vm.toFixed(4)+')');
  }
  ctx.fillStyle=vg;ctx.fillRect(0,0,W,Math.ceil(H*0.66)+1);
  /* THE TAIL DISSOLVES. The layer runs 30vh past the section seam, so its own bottom edge is
     inside #steps - a field that simply stopped there would just move the hard line further down
     the page. The last 26% fades to black on a 1.9 power, which lands it at exactly #000000 well
     before the layer ends. */
  var tg=ctx.createLinearGradient(0,H*0.74,0,H);
  for(var n=0;n<=8;n++){
    var un=n/8,vn=Math.pow(un,1.9);
    tg.addColorStop(un,"rgba(0,0,0,"+vn.toFixed(4)+")");
  }
  ctx.fillStyle=tg;ctx.fillRect(0,Math.floor(H*0.74),W,Math.ceil(H*0.26)+1);
}
size();
/* ONE FRAME, SYNCHRONOUSLY, BEFORE ANY rAF IS ASKED FOR: rAF is PAUSED in a frame that is not
   being rendered, so a canvas that waits for its first callback stays transparent there - and a
   transparent canvas is a hero with no field at all. Paint the still frame first, always. */
paint(0);
if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  paint(0);window.addEventListener('resize',function(){size();paint(0)});return;
}
var raf=0,t0=0,tOff=0,last=0;
function frame(now){
  if(!t0){t0=now-tOff}
  last=now;
  /* A FRAME THAT IS NOT BEING RENDERED CANNOT ANIMATE - the lesson this project has learned
     four times. Stop, and leave the last painted frame on the canvas. */
  if(document.visibilityState==='hidden'){tOff=now-t0;t0=0;raf=0;return}
  /* AND NOTHING IS PAINTED WHILE THE HERO IS OFF SCREEN. The loop keeps running so the clock
     never jumps when you scroll back up, but the seven gradient fills are skipped entirely -
     which is most of the page, and all of the scrolling the client was describing. */
  var hr=host.getBoundingClientRect(),vh=window.innerHeight||0;
  if(hr.bottom>-40&&hr.top<vh+40){
    /* A THROW INSIDE A rAF CALLBACK ENDS THE LOOP. One undefined name in this function stopped
       the hero field dead on frame 1 (2026-09-17), and nothing restarted it. Guarded, and logged
       once instead of sixty times a second, so a future mistake degrades to a still field
       instead of to no field. */
    try{paint(now-t0)}catch(e){if(!window.__afissioWaveErr){window.__afissioWaveErr=1;console.error('hero field paint failed',e)}}
  }
  raf=requestAnimationFrame(frame);
}
function start(){if(!raf){t0=0;raf=requestAnimationFrame(frame)}}
/* the watchdog: if no frame has landed for a second while the page is visible, the loop is dead
   and the field has silently frozen. Restart it. Costs one timer and removes the only failure
   mode a reader would ever describe as "it stopped playing". */
setInterval(function(){
  if(document.visibilityState!=='visible')return;
  var n=performance.now();
  if(raf&&(n-last)<900)return;                 /* the loop is healthy - leave it alone */
  var wr=host.getBoundingClientRect();
  if(wr.bottom<-40||wr.top>(window.innerHeight||0)+40)return;   /* off screen: nothing to heal */
  raf=0;start();                               /* try rAF again */
  size();                                      /* and heal a bad first measurement */
  if(!t0)t0=n-tOff;
  paint(n-t0);                                 /* and paint regardless, so it can never freeze */
},900);
window.addEventListener('resize',function(){size();paint(t0?(performance.now()-t0):0)});
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')start()});
window.addEventListener('beforeprint',function(){if(raf)cancelAnimationFrame(raf);raf=0});
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
/* `compute-field is-full` (Afissio Law #separation, 2026-09-24): no clear zone — the lattice IS the plate's drawing. */
if(__lhost.classList&&__lhost.classList.contains('is-full')){HOLE_IN=-1;HOLE_OUT=-0.5;FLOOR=0.06;PEAK=0.85}
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
   3b · THE NETWORK FIELD — v2 (operator 2026-09-24: "very weak ... the dots are not connected ... in
   the network everyone is connected"). The idea is now the drawing: ONE CONNECTED GRAPH.
     · NODES on a jittered grid across the whole band; five of them are HUBS (a 4px square inside a
       square hairline plate — the site's plate device at node scale).
     · EDGES: a minimum spanning tree over every node (so the graph is provably connected — there is
       no island) plus each node's two nearest neighbours (so it reads as a mesh, not a tree). Every
       edge is always drawn.
     · THE WAVE: every ~2.4s a hub fires. The signal runs out along the edges at a constant speed
       (shortest-path arrival times, computed once per wave), lighting each hairline as it travels
       and flashing each node as it arrives, until it has reached EVERY node — one call reaching the
       whole network, which is the section's sentence. Waves from different hubs overlap.
     · The nodes breathe a few px about their anchors, so the mesh is never a still diagram.
   Same vocabulary as the #judgment lattice: square dots, 1px hairlines, one hue ramped
   #B34B00 -> #FF6600, the elliptical clear zone behind the type. No glow, no blur, no second hue.
   HOW IT SHIPS: a canvas created here, styled inline. Reduced motion paints the graph still. Nothing
   paints off screen or in a hidden tab; a watchdog restarts a paused loop. Nothing rests at opacity 0.
   ============================================================================ */
(function(){
if(window.__afissioNetworkFieldV2)return;window.__afissioNetworkFieldV2=1;
[].slice.call(document.querySelectorAll('.network-field')).forEach(function(host){(function(){
var cv=document.createElement('canvas');
cv.style.position='absolute';cv.style.top='0';cv.style.left='0';cv.style.width='100%';cv.style.height='100%';cv.style.display='block';
host.appendChild(cv);
var ctx=cv.getContext('2d');if(!ctx)return;
var W=1,H=1,N=[],E=[],ADJ=[],HUBS=[],WAVES=[],SPEED=0.42,HOLE_IN=0.22,HOLE_OUT=0.6,HCX=0.3,HCY=0.5,nextFire=0,hubTurn=0;
function rnd(i){var x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function hole(x,y){var hx=W*HCX,hy=H*HCY;
  var ex=(x-hx)/Math.max(1,Math.max(hx,W-hx)),ey=(y-hy)/Math.max(1,Math.max(hy,H-hy));
  var u=(Math.sqrt(ex*ex+ey*ey)-HOLE_IN)/(HOLE_OUT-HOLE_IN);u=u<0?0:u>1?1:u;return u*u*(3-2*u)}
function col(u,al){return 'rgba('+Math.round(179+76*u)+','+Math.round(75+27*u)+',0,'+(al<0?0:al>1?1:al).toFixed(3)+')'}
function build(){
  var r=host.getBoundingClientRect(),dpr=Math.min(1.5,window.devicePixelRatio||1);
  W=Math.max(1,Math.round(r.width));H=Math.max(1,Math.round(r.height));
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  var d=Math.sqrt(W*W+H*H),cell=Math.max(70,Math.min(130,d/15)),i,k,seed=0;
  N=[];E=[];WAVES=[];
  for(var gy=cell*0.5;gy<H;gy+=cell)for(var gx=cell*0.5;gx<W;gx+=cell){seed++;
    var x=gx+(rnd(seed)-0.5)*cell*0.8,y=gy+(rnd(seed+400)-0.5)*cell*0.8,h=hole(x,y);
    if(h<0.08&&rnd(seed+900)>0.25)continue;
    N.push({ax:x,ay:y,p:rnd(seed+77)*6.283,s:0.00035+rnd(seed+55)*0.00035,x:x,y:y,h:h,flash:0,hub:false});}
  var n=N.length;if(n<2)return;
  var key={};function add(a,b){if(a===b)return;var kk=a<b?a+'_'+b:b+'_'+a;if(key[kk])return;key[kk]=1;E.push([a,b])}
  /* Prim: the spanning tree that guarantees one connected network */
  var inT=[],best=[],from=[];for(i=0;i<n;i++){inT.push(false);best.push(Infinity);from.push(-1)}best[0]=0;
  for(var it=0;it<n;it++){var m=-1;for(i=0;i<n;i++)if(!inT[i]&&(m<0||best[i]<best[m]))m=i;inT[m]=true;if(from[m]>=0)add(m,from[m]);
    for(i=0;i<n;i++)if(!inT[i]){var dx=N[i].ax-N[m].ax,dy=N[i].ay-N[m].ay,dd=dx*dx+dy*dy;if(dd<best[i]){best[i]=dd;from[i]=m}}}
  /* plus two nearest neighbours each: a mesh, not a tree */
  for(i=0;i<n;i++){var ds=[];for(k=0;k<n;k++)if(k!==i){var ddx=N[i].ax-N[k].ax,ddy=N[i].ay-N[k].ay;ds.push([ddx*ddx+ddy*ddy,k])}
    ds.sort(function(p,q){return p[0]-q[0]});add(i,ds[0][1]);if(ds[1])add(i,ds[1][1]);}
  ADJ=[];for(i=0;i<n;i++)ADJ.push([]);
  E.forEach(function(e,ix){var a=N[e[0]],b=N[e[1]],len=Math.sqrt((a.ax-b.ax)*(a.ax-b.ax)+(a.ay-b.ay)*(a.ay-b.ay));e[2]=len;ADJ[e[0]].push([e[1],len]);ADJ[e[1]].push([e[0],len])});
  /* hubs: the five best-connected nodes outside the clear zone, spread apart */
  var order=N.map(function(q,ix){return ix}).filter(function(ix){return N[ix].h>0.6}).sort(function(p,q){return ADJ[q].length-ADJ[p].length});
  HUBS=[];order.forEach(function(ix){if(HUBS.length>=5)return;for(var z=0;z<HUBS.length;z++){var hb=N[HUBS[z]];if(Math.abs(hb.ax-N[ix].ax)+Math.abs(hb.ay-N[ix].ay)<cell*3)return}HUBS.push(ix)});
  HUBS.forEach(function(ix){N[ix].hub=true});
  nextFire=0;
}
function fire(t){
  if(!HUBS.length)return;var src=HUBS[hubTurn++%HUBS.length],n=N.length,dist=[],done=[],i;
  for(i=0;i<n;i++){dist.push(Infinity);done.push(false)}dist[src]=0;
  for(var it=0;it<n;it++){var m=-1;for(i=0;i<n;i++)if(!done[i]&&(m<0||dist[i]<dist[m]))m=i;if(m<0||dist[m]===Infinity)break;done[m]=true;
    ADJ[m].forEach(function(p){if(dist[m]+p[1]<dist[p[0]])dist[p[0]]=dist[m]+p[1]})}
  var max=0;for(i=0;i<n;i++)if(dist[i]<Infinity&&dist[i]>max)max=dist[i];
  WAVES.push({t0:t,d:dist,end:max/SPEED+1400});
}
function paint(t){
  var bx=host.getBoundingClientRect(),dp=Math.min(1.5,window.devicePixelRatio||1);
  if(cv.width!==Math.round(bx.width*dp)||cv.height!==Math.round(bx.height*dp))build();
  ctx.clearRect(0,0,W,H);if(!N.length)return;
  var i,w,e,a,b;
  for(i=0;i<N.length;i++){a=N[i];a.x=a.ax+Math.cos(t*a.s+a.p)*6;a.y=a.ay+Math.sin(t*a.s*1.3+a.p)*5;a.h=hole(a.x,a.y);a.flash=0}
  for(w=WAVES.length-1;w>=0;w--)if(t-WAVES[w].t0>WAVES[w].end)WAVES.splice(w,1);
  if(t>=nextFire){fire(t);nextFire=t+2400}
  /* node flash from every live wave */
  WAVES.forEach(function(wv){var el=t-wv.t0;for(var q=0;q<N.length;q++){var at=wv.d[q]/SPEED,g=el-at;if(g>=0&&g<1000){var f=1-g/1000;if(f>N[q].flash)N[q].flash=f}}});
  /* edges: every edge, always; then the travelling light on top */
  ctx.lineWidth=1;
  for(i=0;i<E.length;i++){e=E[i];a=N[e[0]];b=N[e[1]];var hh=Math.min(a.h,b.h)*0.85+0.15*Math.max(a.h,b.h);
    ctx.strokeStyle=col(0,0.26*hh);ctx.beginPath();ctx.moveTo(a.x+0.5,a.y+0.5);ctx.lineTo(b.x+0.5,b.y+0.5);ctx.stroke();}
  ctx.lineWidth=1.5;
  WAVES.forEach(function(wv){var el=t-wv.t0;
    for(var q=0;q<E.length;q++){var ed=E[q],ia=ed[0],ib=ed[1];var ta=wv.d[ia]/SPEED,tb=wv.d[ib]/SPEED;if(tb<ta){var sw=ia;ia=ib;ib=sw;sw=ta;ta=tb;tb=sw}
      if(el<ta||tb===Infinity)continue;var A=N[ia],Bn=N[ib],span=Math.max(1,tb-ta);
      var head=Math.min(1,(el-ta)/span),fade=el>tb?1-(el-tb)/900:1;if(fade<=0)continue;
      var tail=Math.max(0,head-0.55);
      var x0=A.x+(Bn.x-A.x)*tail,y0=A.y+(Bn.y-A.y)*tail,x1=A.x+(Bn.x-A.x)*head,y1=A.y+(Bn.y-A.y)*head;
      var hh2=Math.max(0.12,Math.min(A.h,Bn.h));
      ctx.strokeStyle=col(0.55,0.35*fade*hh2);ctx.beginPath();ctx.moveTo(A.x+0.5,A.y+0.5);ctx.lineTo(x1+0.5,y1+0.5);ctx.stroke();
      if(head<1){ctx.strokeStyle=col(1,0.95*hh2);ctx.beginPath();ctx.moveTo(x0+0.5,y0+0.5);ctx.lineTo(x1+0.5,y1+0.5);ctx.stroke();
        ctx.fillStyle=col(1,hh2);ctx.fillRect(x1-1,y1-1,3,3);}
    }});
  /* nodes */
  for(i=0;i<N.length;i++){a=N[i];var hv=Math.max(a.h,0.1),f=a.flash;
    if(a.hub){ctx.strokeStyle=col(0.3+0.7*f,(0.45+0.5*f)*hv);ctx.lineWidth=1;ctx.strokeRect(Math.round(a.x)-6.5,Math.round(a.y)-6.5,14,14);
      ctx.fillStyle=col(0.7+0.3*f,(0.85)*hv);ctx.fillRect(Math.round(a.x)-1.5,Math.round(a.y)-1.5,4,4);}
    else{var sz=f>0.05?3:2;ctx.fillStyle=col(0.2+0.8*f,(0.5+0.5*f)*a.h);ctx.fillRect(Math.round(a.x)-(sz-2)/2,Math.round(a.y)-(sz-2)/2,sz,sz);}}
}
build();
if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  nextFire=Infinity;paint(0);window.addEventListener('resize',function(){build();nextFire=Infinity;paint(0)});return;
}
var raf=0,t0=0,tOff=0,lastF=0;
function frame(now){
  lastF=now;if(!t0)t0=now-tOff;
  if(document.visibilityState==='hidden'){tOff=now-t0;t0=0;raf=0;return}
  var r=host.getBoundingClientRect(),vh=window.innerHeight||0;
  if(r.bottom>-60&&r.top<vh+60){try{paint(now-t0)}catch(err){if(!window.__afissioNetErr){window.__afissioNetErr=1;console.error('network field paint failed',err)}}}
  raf=requestAnimationFrame(frame);
}
function start(){if(!raf){t0=0;raf=requestAnimationFrame(frame)}}
window.addEventListener('resize',function(){build()});
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')start()});
window.addEventListener('beforeprint',function(){if(raf)cancelAnimationFrame(raf);raf=0});
setInterval(function(){
  if(document.visibilityState!=='visible')return;var n=performance.now();
  if(raf&&(n-lastF)<900)return;var r=host.getBoundingClientRect();
  if(r.bottom<-60||r.top>(window.innerHeight||0)+60)return;
  raf=0;start();if(!t0)t0=n-tOff;paint(n-t0);
},900);
start();
})()});
})();

/* ============================================================================
   3c · THE DRAFTING FIELD (Afissio Law #separation, 2026-09-24). The partner of the Afissio plate's
   lattice: where Afissio's square COMPUTES (review, analysis), Afissio Law's square DRAFTS — ruled
   lines written one after another, a caret at the tip of the line being set, a 4px clause marker in
   the margin at each heading, the finished lines settling to the dim orange. When the sheet is full
   it holds, fades, and a new sheet begins. The document tile's own vocabulary (ruled lines, the
   short closing line of a paragraph) at plate scale, in the same one hue ramp #B34B00 -> #FF6600.
   HOW IT SHIPS: a canvas created here, styled inline. Reduced motion paints one finished sheet.
   Nothing paints off screen or in a hidden tab; a watchdog restarts a paused loop.
   ============================================================================ */
(function(){
if(window.__afissioDraftFieldV1)return;window.__afissioDraftFieldV1=1;
[].slice.call(document.querySelectorAll('.draft-field')).forEach(function(host){(function(){
var cv=document.createElement('canvas');
cv.style.position='absolute';cv.style.top='0';cv.style.left='0';cv.style.width='100%';cv.style.height='100%';cv.style.display='block';
host.appendChild(cv);
var ctx=cv.getContext('2d');if(!ctx)return;
var W=1,H=1,L=[],T=0,MX=0,seed=7,cyc=0,HOLD=1900,FADE=1200,SPEED=0.9;
function rnd(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646}
function col(u,al){return 'rgba('+Math.round(179+76*u)+','+Math.round(75+27*u)+',0,'+(al<0?0:al>1?1:al).toFixed(3)+')'}
function size(){var r=host.getBoundingClientRect(),dpr=Math.min(1.5,window.devicePixelRatio||1);
  W=Math.max(1,Math.round(r.width));H=Math.max(1,Math.round(r.height));
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
function layout(){
  L=[];MX=Math.round(W*0.14);var w=W-2*MX,pitch=Math.max(8,Math.min(16,Math.round(H/30))),y=Math.round(H*0.14),bottom=H*0.86,t=300;
  while(y<bottom){
    L.push({x:MX,y:y,len:w*(0.24+rnd()*0.2),head:true});y+=Math.round(pitch*1.7);
    var n=2+((rnd()*4)|0);
    for(var i=0;i<n&&y<bottom;i++){L.push({x:MX,y:y,len:w*(i<n-1?0.88+rnd()*0.12:0.3+rnd()*0.45),head:false});y+=pitch}
    y+=Math.round(pitch*1.2);
  }
  for(var k=0;k<L.length;k++){var ln=L[k];t+=ln.head?320:80;ln.t0=t;ln.dur=ln.len/SPEED;t+=ln.dur}
  T=t;
}
function paint(tc){
  var bx=host.getBoundingClientRect(),dp=Math.min(1.5,window.devicePixelRatio||1);
  if(cv.width!==Math.round(bx.width*dp)||cv.height!==Math.round(bx.height*dp)){size();layout()}
  ctx.clearRect(0,0,W,H);
  var fade=tc>T+HOLD?Math.max(0,1-(tc-T-HOLD)/FADE):1;if(fade<=0)return;
  for(var k=0;k<L.length;k++){var ln=L[k];if(tc<ln.t0)break;
    var p=Math.min(1,(tc-ln.t0)/ln.dur),th=ln.head?2:1,yy=Math.round(ln.y);
    if(ln.head){ctx.fillStyle=col(1,0.95*fade);ctx.fillRect(Math.round(MX*0.5)-2,yy-1,4,4)}
    if(p<1){
      var x1=ln.x+ln.len*p;
      ctx.fillStyle=col(1,0.95*fade);ctx.fillRect(ln.x,yy,ln.len*p,th);
      ctx.fillRect(Math.round(x1)+2,yy-5,2,11);
    }else{
      var since=tc-(ln.t0+ln.dur),g=since<800?1-since/800:0;
      ctx.fillStyle=ln.head?col(0.45+0.55*g,(0.7+0.25*g)*fade):col(0.1+0.8*g,(0.36+0.5*g)*fade);
      ctx.fillRect(ln.x,yy,ln.len,th);
    }
  }
}
size();layout();
if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  paint(T);window.addEventListener('resize',function(){size();layout();paint(T)});return;
}
var raf=0,t0=0,tOff=0,lastF=0;
function frame(now){
  lastF=now;if(!t0)t0=now-tOff;
  if(document.visibilityState==='hidden'){tOff=now-t0;t0=0;raf=0;return}
  var r=host.getBoundingClientRect(),vh=window.innerHeight||0,tc=now-t0-cyc;
  if(tc>T+HOLD+FADE){cyc=now-t0;layout();tc=0}
  if(r.bottom>-60&&r.top<vh+60){try{paint(tc)}catch(err){if(!window.__afissioDraftErr){window.__afissioDraftErr=1;console.error('drafting field paint failed',err)}}}
  raf=requestAnimationFrame(frame);
}
function start(){if(!raf){t0=0;raf=requestAnimationFrame(frame)}}
window.addEventListener('resize',function(){size();layout()});
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')start()});
window.addEventListener('beforeprint',function(){if(raf)cancelAnimationFrame(raf);raf=0});
setInterval(function(){
  if(document.visibilityState!=='visible')return;var n=performance.now();
  if(raf&&(n-lastF)<900)return;var r=host.getBoundingClientRect();
  if(r.bottom<-60||r.top>(window.innerHeight||0)+60)return;
  raf=0;start();if(!t0)t0=n-tOff;paint(n-t0-cyc);
},900);
start();
})()});
})();

/* ============================================================================
   3d · THE PORTRAIT EDGE (About #people, operator 2026-09-24: "animate the border with orange
   lines"). Two orange light-runs travel the portrait's hairline, starting at the two corner
   brackets and chasing each other round, each a short bright head with a fading tail — the rule
   sweeps' light, bent round a plate. It draws ON the 1px edge only, never over the face. Both
   portraits share one clock, so the two people stay identical.
   HOW IT SHIPS: a canvas created here inside the plate, styled inline. Reduced motion: nothing is
   added (the brackets and the hairline stand). Nothing paints off screen or in a hidden tab.
   ============================================================================ */
(function(){
if(window.__afissioPortraitEdgeV1)return;window.__afissioPortraitEdgeV1=1;
if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var plates=[].slice.call(document.querySelectorAll('.initial_plate.is-portrait'));if(!plates.length)return;
var PERIOD=18000,PEAK=0.42,items=[];
plates.forEach(function(pl){
  var cv=document.createElement('canvas');cv.setAttribute('aria-hidden','true');
  cv.style.position='absolute';cv.style.left='-2px';cv.style.top='-2px';cv.style.width='calc(100% + 4px)';cv.style.height='calc(100% + 4px)';
  cv.style.pointerEvents='none';cv.style.zIndex='2';cv.style.display='block';
  pl.appendChild(cv);items.push({pl:pl,cv:cv,ctx:cv.getContext('2d'),w:0,h:0});
});
function fit(it){var r=it.pl.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1),W=Math.round(r.width)+4,H=Math.round(r.height)+4;
  if(it.cv.width!==Math.round(W*dpr)||it.cv.height!==Math.round(H*dpr)){it.cv.width=Math.round(W*dpr);it.cv.height=Math.round(H*dpr);it.ctx.setTransform(dpr,0,0,dpr,0,0)}it.w=W;it.h=H}
function pt(it,d){var w=it.w-4,h=it.h-4,L=2*(w+h);d=((d%L)+L)%L;var o=2.5;
  if(d<w)return [o+d,o];d-=w;if(d<h)return [o+w,o+d];d-=h;if(d<w)return [o+w-d,o+h];d-=w;return [o,o+h-d]}
function draw(it,t){var ctx=it.ctx;if(!ctx)return;fit(it);ctx.clearRect(0,0,it.w,it.h);
  var w=it.w-4,h=it.h-4,L=2*(w+h),len=L*0.2,N=48,u=(t%PERIOD)/PERIOD;ctx.lineWidth=1.5;ctx.lineCap='butt';
  for(var r=0;r<2;r++){var head=u*L+r*L/2;
    for(var k=0;k<N;k++){var d0=head-len+k*len/N,d1=d0+len/N+0.6,a=Math.pow((k+1)/N,1.7);
      var p0=pt(it,d0),p1=pt(it,d1);ctx.strokeStyle='rgba(255,102,0,'+(a*PEAK).toFixed(3)+')';
      ctx.beginPath();ctx.moveTo(p0[0],p0[1]);ctx.lineTo(p1[0],p1[1]);ctx.stroke();}}}
var raf=0,lastF=0;
function frame(now){lastF=now;if(document.visibilityState==='hidden'){raf=0;return}
  var vh=window.innerHeight||0;items.forEach(function(it){var r=it.pl.getBoundingClientRect();if(r.bottom>-40&&r.top<vh+40){try{draw(it,now)}catch(e){}}});
  raf=requestAnimationFrame(frame)}
function start(){if(!raf)raf=requestAnimationFrame(frame)}
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')start()});
window.addEventListener('beforeprint',function(){if(raf)cancelAnimationFrame(raf);raf=0;items.forEach(function(it){it.ctx&&it.ctx.clearRect(0,0,it.w,it.h)})});
setInterval(function(){if(document.visibilityState!=='visible')return;var n=performance.now();if(raf&&(n-lastF)<900)return;raf=0;start();items.forEach(function(it){draw(it,n)})},900);
start();
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
   7 · THE CONTENTS RAIL (2026-09-24, operator: "put a table of contents area to the left").
   The body is a CMS Rich Text element, so its <h2>s carry no id and a contents list cannot be
   authored per article. The Designer holds ONE .toc_link as the template; this pass reads the
   body's <h2>s, gives each an id, and clones the template once per heading, so every article gets
   its own list with no field to fill. In this preview the static list already matches the
   specimen and the rebuild produces the same five rows.
   STATE, NEVER CONTENT: the list renders without the script; the pass adds the anchors and marks
   the heading being read, colour only, set INLINE (CLAUDE.md §4f — a runtime-only combo is pruned
   by Webflow). Reduced motion: the jump is instant. Nothing rests at opacity 0. No-op on any page
   without .toc_list.
   ============================================================================ */
(function(){
if(window.__afissioContentsV1)return;window.__afissioContentsV1=1;
var list=document.querySelector('.toc_list');if(!list)return;
var nav=list.closest?list.closest('.toc_component'):null;
var body=document.querySelector('.article_richtext');
var heads=body?[].slice.call(body.querySelectorAll('h2')):[];
if(!heads.length){if(nav)nav.style.display='none';return}
var tpl=list.querySelector('.toc_link');if(!tpl)return;
var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var used={};
function slug(t){
  var s=(t||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'section',k=s,n=2;
  while(used[k]||document.getElementById(k)){k=s+'-'+(n++)}
  used[k]=1;return k;
}
var links=[],frag=document.createDocumentFragment();
heads.forEach(function(h,i){
  if(!h.id)h.id=slug(h.textContent);
  h.style.scrollMarginTop='7rem';
  var a=tpl.cloneNode(true),txt=a.querySelector('.toc_text');
  a.setAttribute('href','#'+h.id);a.removeAttribute('aria-current');
  if(txt)txt.textContent=h.textContent;
  a.addEventListener('click',function(e){
    e.preventDefault();
    var y=h.getBoundingClientRect().top+(window.pageYOffset||0)-112;
    window.scrollTo({top:Math.max(0,y),behavior:reduce?'auto':'smooth'});
    if(history.replaceState)history.replaceState(null,'','#'+h.id);
  });
  links.push(a);frag.appendChild(a);
});
while(list.firstChild)list.removeChild(list.firstChild);
list.appendChild(frag);
var cur=-2,tick=false;
function paint(i){
  if(i===cur)return;cur=i;
  links.forEach(function(a,k){
    var on=k===i;
    a.style.color=on?'#EDEDED':'';
    if(on)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');
  });
}
function pass(){
  tick=false;
  var line=(window.innerHeight||0)*0.3,i=-1;
  for(var k=0;k<heads.length;k++){if(heads[k].getBoundingClientRect().top-line<=0)i=k;else break}
  if(body.getBoundingClientRect().bottom<line)i=-1;
  paint(i);
}
function onScroll(){if(tick)return;tick=true;requestAnimationFrame(pass)}
window.addEventListener('scroll',onScroll,{passive:true});
window.addEventListener('resize',onScroll);
pass();
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
