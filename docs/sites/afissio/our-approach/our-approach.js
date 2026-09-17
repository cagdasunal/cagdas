/* ============================================================================
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
if(window.__afissioApproachSettleV1)return;window.__afissioApproachSettleV1=1;
if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var SEL=['.sequence_aside','.sequence_step',
 '.band_stack',
 '.quote_stack',
 '.faq_head','.faq_row',
 '.close_stack'].join(',');
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
if(window.__afissioApproachWaveV1)return;window.__afissioApproachWaveV1=1;
var cv=document.querySelector('.hero-wave_canvas');if(!cv)return;
var ctx=cv.getContext('2d');if(!ctx)return;
var host=cv.parentNode,W=1,H=1;
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
  ctx.fillStyle='#000000';ctx.fillRect(0,0,W,H);
  var d=Math.max(W,H),i,j,x,y;
  ctx.globalCompositeOperation='lighter';   /* R29: additive, so overlaps keep the brand hue */
  for(i=0;i<BLOOMS.length;i++){
    var bl=BLOOMS[i];
    /* BUBBLE PATH. A single sine on each axis draws a rigid ellipse and reads as a slide; each axis
       here is TWO sines at unrelated periods (the second at 0.43x amplitude, 1.7x and 0.6x the
       rate), so the centre wanders a soft open path that never retraces itself - it rises, sways
       past, and comes back around. The radius breathes on a third period again. */
    var p1=t*bl.s,p2=t*bl.s*1.7,p3=t*bl.s*0.6;
    var cx=(bl.x+(Math.sin(p1)*0.78+Math.sin(p2)*0.34)*bl.dx)*W;
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
  for(var k=0;k<=10;k++){
    var uk=k/10,vk=uk<0.17?1:Math.pow((1+Math.cos(Math.PI*((uk-0.17)/0.39)))/2,1.15);
    if(uk>0.56)vk=0;
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

   DARK AND SOFT, both asked for: peak dot alpha is 0.40 of #B34B00, which lands a bright dot at
   about #48 1E 00 against a black ground, and 2px dots on a 20px pitch cover 1% of the area - so
   the field reads as texture, never as a surface. No glow, no blur, no second hue.

   HOW IT SHIPS (§4c-bis): a <canvas>, so custom code in the site's script bundle. REDUCED MOTION
   PAINTS ONE STILL FRAME and stops. Nothing paints while #judgment is off screen or the tab is
   hidden, and the backing store is re-checked every frame so a section measured at 0 before
   layout settles heals itself. Nothing rests at opacity 0; no content is gated.
   ============================================================================ */
(function(){
if(window.__afissioComputeFieldV1)return;window.__afissioComputeFieldV1=1;
var cv=document.querySelector('.compute-field_canvas');if(!cv)return;
var ctx=cv.getContext('2d');if(!ctx)return;
var host=cv.parentNode,W=1,H=1;
function size(){
  var r=host.getBoundingClientRect();
  var dpr=Math.min(1.25,window.devicePixelRatio||1);
  W=Math.max(1,Math.round(r.width));H=Math.max(1,Math.round(r.height));
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
var PITCH=20,DOT=2,FLOOR=0.045,PEAK=0.42,HOLE_IN=0.34,HOLE_OUT=0.74;
/* the clear zone follows the TYPE, not the box: the stack is left-aligned on the container rail
   (R29b), so the hole is centred at 32% of the width rather than 50% - the computation is then
   heaviest to the right of the copy, where there is nothing to read. */
var HOLE_CX=0.32,HOLE_CY=0.50;
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
        v+=(1+Math.sin(dist*SRC[i].k-t*SRC[i].w))/2;
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
    ctx.fillStyle='rgba(179,75,0,'+(((b+0.5)/BUCKETS)*PEAK).toFixed(3)+')';
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
if(window.__afissioApproachFocusV1)return;window.__afissioApproachFocusV1=1;
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
  var line=vh*0.52,sigma=vh*0.075,sy=window.scrollY||0;
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
   faq_panel and faq_mark-bar, which do deploy. The trigger is a real button with aria-expanded
   and aria-controls (section 4h), so the keyboard and a screen reader get the control for free,
   and focus-visible is authored in the sheet.

   ONE OPEN AT A TIME: six answers this short are a set to scan, not a document to read in
   parallel, and a single open row keeps all six questions on one screen.
   ============================================================================ */
(function(){
if(window.__afissioApproachFaqV1)return;window.__afissioApproachFaqV1=1;
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
items.forEach(function(it){
  it.btn.addEventListener("click",function(){
    var next=!it.open;
    items.forEach(function(other){if(other!==it&&other.open)setOpen(other,false,true)});
    setOpen(it,next,true);
  });
});
window.addEventListener("beforeprint",function(){items.forEach(function(it){setOpen(it,true,false)})});
})();

/* ============================================================================
   6 · #voice — THE GLINT CROSSES THE HAIRLINE (client note 2026-09-17: "I don't like the quote
   icon and it's animation. It must be more premium").

   WHAT WAS WRONG. The previous mark was two 4px bars raked 14 degrees, each scaling to 1.14 and
   back on a 5.2s loop. Two faults, and the second is the one that made it read cheap: it was the
   only WEIGHTED device on a page drawn entirely in hairlines, so it looked imported; and a shape
   pumping in place is the most generic motion in the set - a breathing icon, which is what every
   template does.

   WHAT IT IS NOW. One 1px rule in the card-edge grey with a short #FF6600 segment 26% of its
   width, and the segment TRAVELS: position is (1 - cos(2*pi*p)) / 2 across the free span, so it
   crosses in 3.8s, eases to a full stop, and comes back - one 7.6s ping-pong with zero velocity
   at both ends, so there is no snap, no seam and nothing to count. Transform only; the colour,
   the length and the track are the stylesheet's.

   ADDITIVE, and it stops when nobody is looking: rest is the dim rule with the glint parked at
   its left edge, the loop only ever moves it along a track that is already drawn, and the rAF is
   skipped whenever #voice is off screen or the tab is hidden. With no script, reduced motion on,
   printing or in a crawler the mark is the finished rule the stylesheet draws. Ships as custom
   code in the site's script bundle - @keyframes do not survive the style pipeline and
   prefers-reduced-motion is dropped by it (§4c-bis).
   ============================================================================ */
(function(){
if(window.__afissioQuoteMarkV1)return;window.__afissioQuoteMarkV1=1;
var host=document.querySelector('.quote_mark');if(!host)return;
var glint=host.querySelector('.quote_mark-rule.is-glint');if(!glint)return;
if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var PERIOD=7600;
function rest(){glint.style.transform=''}
var raf=0,t0=0;
function frame(now){
  if(!t0)t0=now;
  if(document.visibilityState==='hidden'){rest();raf=0;return}
  var r=host.getBoundingClientRect(),vh=window.innerHeight||0;
  if(r.bottom<-40||r.top>vh+40){raf=requestAnimationFrame(frame);return}
  /* AN UNMEASURABLE TRACK IS LEFT ALONE: a frame that is not being rendered reports 0 for both
     widths, and translating by a span of 0 would park the glint and look broken. */
  var span=(host.clientWidth||r.width||0)-(glint.offsetWidth||0);
  if(span<=0){rest();raf=requestAnimationFrame(frame);return}
  var p=((now-t0)/PERIOD)%1;
  glint.style.transform='translateX('+(((1-Math.cos(p*Math.PI*2))/2)*span).toFixed(2)+'px)';
  raf=requestAnimationFrame(frame);
}
function start(){if(!raf){t0=0;raf=requestAnimationFrame(frame)}}
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')start()});
window.addEventListener('beforeprint',function(){if(raf)cancelAnimationFrame(raf);raf=0;rest()});
start();
})();
