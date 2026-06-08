/*!
 * badge.js — "Webflow Certified Partner" badge for cagd.as
 *
 * Injects a vertical corner badge into every .webflow_badge on the page:
 *   - "Certified Partner" set vertically (reads bottom-to-top), as TRUE SVG
 *     <path> outlines vectorized from WF Visual Sans 600 — NOT live <text>.
 *     No @font-face, no font download, no document.fonts. The <g> is rotated
 *     -90deg at author time so the lockup is authored natively vertical.
 *   - A living Webflow-blue (#146EF5) seal whose inner glyph morphs between a
 *     filled checkmark and the Webflow "W" on a slow loop.
 *   - On hover: the label crossfades to "Verify on Webflow" (also outlines)
 *     and the seal resolves to the "W". This script renders NO link — wire the
 *     URL on the Webflow element itself (e.g. make .webflow_badge a Link Block).
 *   - Respects prefers-reduced-motion (renders the check statically, no loop).
 *
 * Self-contained — ZERO runtime dependencies and ZERO web requests. Every
 *   glyph (labels + seal) is baked path data; it injects its own scoped <style>
 *   and HTML and does its own shape-morph (a small ring aligner + lerp). The
 *   two labels are vectorized outlines, so they render pixel-identically with
 *   no font to load. Injecting the badge's own CSS from JS is an intentional,
 *   scoped exception to the "never inject <style> from JS" rule. NO page/site
 *   CSS is included. (Outlines are fixed text — regenerate to change wording.)
 *
 * Design source: Claude Design "cagd.as Design System" -> project/Badge.html
 *   Labels vectorized via fonttools (WFVisualSansVF @ wght=600) + opentype.js.
 *
 * Webflow usage:
 *   1. Add an element with class  webflow_badge  where the badge should sit
 *      (e.g. a fixed/absolute corner wrapper, or a Link Block if it links out).
 *      The badge renders at 68x190 and centers inside it. The link is set on
 *      the Webflow element — this script does not add one.
 *   2. Load this bundle in the footer / before </body>, or with defer:
 *        <script src="https://files.cagd.as/scripts/badge.min.js" defer></script>
 *
 * SSOT: sites/cagdas/scripts/src/badge.js
 * Build: python3 scripts/site_deploy.py build --site cagdas --src badge
 */
(function () {
  'use strict';

  if (window.__cagdasWebflowBadge) return; // guard against double-load
  window.__cagdasWebflowBadge = true;

  const TARGET = '.webflow_badge';
  const STYLE_ID = 'cagdas-webflow-badge-styles';
  const RING = 140;        // sample points per seal glyph (morph smoothness)
  const CYCLE = 9200;      // ms for one check -> W -> check loop

  // --- label outlines: WF Visual Sans 600, baseline y=0, x grows right.
  //     Dropped into a -90deg group so the lockup reads bottom-to-top. ------
  const LABEL_TRACK = 134;   // svg height = max label advance + 2
  const LABEL_FROM = "M6.25 0.19Q4.53 0.19 3.19-0.57Q1.84-1.33 1.09-2.68Q0.34-4.03 0.34-5.75Q0.34-7.47 1.09-8.82Q1.84-10.17 3.19-10.93Q4.53-11.69 6.25-11.69Q7.74-11.69 8.97-11.12Q10.20-10.56 11-9.52Q11.80-8.48 12.02-7.12L9.59-7.12Q9.38-7.87 8.89-8.43Q8.41-8.99 7.73-9.30Q7.05-9.61 6.27-9.61Q5.22-9.61 4.42-9.13Q3.62-8.65 3.17-7.77Q2.72-6.88 2.72-5.75Q2.72-4.62 3.17-3.74Q3.62-2.87 4.42-2.38Q5.23-1.89 6.27-1.89Q7.11-1.89 7.80-2.19Q8.49-2.49 8.95-3.04Q9.41-3.59 9.58-4.32L12.02-4.32Q11.80-2.99 11.01-1.97Q10.23-0.95 8.99-0.38Q7.76 0.19 6.25 0.19M17.01 0.20Q15.73 0.21 14.71-0.36Q13.70-0.94 13.11-1.96Q12.53-2.98 12.53-4.30Q12.53-5.57 13.13-6.60Q13.72-7.63 14.73-8.21Q15.75-8.79 17-8.79Q18.41-8.79 19.46-8.16Q20.52-7.54 21.05-6.39Q21.58-5.25 21.43-3.77L13.40-3.77L13.40-5.22L19.61-5.22L19.23-5.05Q19.21-5.62 18.93-6.09Q18.64-6.55 18.16-6.80Q17.67-7.05 17.06-7.05Q16.41-7.05 15.88-6.76Q15.35-6.46 15.04-5.93Q14.73-5.39 14.73-4.73L14.73-3.91Q14.73-3.24 15.03-2.71Q15.33-2.17 15.86-1.87Q16.39-1.58 17.05-1.58Q17.55-1.59 17.98-1.75Q18.41-1.92 18.71-2.21Q19.01-2.50 19.13-2.87L21.37-2.87Q21.16-1.97 20.55-1.27Q19.95-0.57 19.02-0.18Q18.10 0.21 17.01 0.20M22.32 0L22.32-8.61L24.36-8.61L24.36-6.72L23.95-6.57Q24.09-7.25 24.47-7.75Q24.84-8.26 25.39-8.52Q25.94-8.79 26.60-8.79Q26.60-8.79 26.60-8.79Q26.60-8.79 26.60-8.79L26.60-6.80Q26.60-6.80 26.60-6.80Q26.60-6.80 26.60-6.80Q25.91-6.80 25.43-6.55Q24.94-6.30 24.68-5.80Q24.42-5.30 24.42-4.60L24.42 0L22.32 0M28.63 0L28.63-10.73L30.73-10.73L30.73 0L28.63 0M27.12-6.80L27.12-8.61L32.24-8.61L32.24-6.80L27.12-6.80M32.92 0L32.92-8.61L35.06-8.61L35.06 0L32.92 0M32.89-9.52L32.89-11.70L35.13-11.70L35.13-9.52L32.89-9.52M37.16-8.33Q37.16-9.37 37.63-10.19Q38.11-11.01 38.97-11.46Q39.84-11.92 40.99-11.94Q40.99-11.94 40.99-11.94Q40.99-11.94 40.99-11.94L40.99-10.04Q40.99-10.04 40.99-10.04Q40.99-10.04 40.99-10.04Q40.45-10.03 40.07-9.82Q39.70-9.60 39.49-9.20Q39.29-8.79 39.29-8.24L39.29 0L37.16 0L37.16-8.33M35.78-6.80L35.78-8.61L40.95-8.61L40.95-6.80L35.78-6.80M41.68 0L41.68-8.61L43.82-8.61L43.82 0L41.68 0M41.65-9.52L41.65-11.70L43.89-11.70L43.89-9.52L41.65-9.52M49.21 0.20Q47.94 0.21 46.92-0.36Q45.90-0.94 45.32-1.96Q44.73-2.98 44.73-4.30Q44.73-5.57 45.33-6.60Q45.92-7.63 46.94-8.21Q47.95-8.79 49.20-8.79Q50.61-8.79 51.67-8.16Q52.73-7.54 53.25-6.39Q53.78-5.25 53.63-3.77L45.60-3.77L45.60-5.22L51.81-5.22L51.43-5.05Q51.41-5.62 51.13-6.09Q50.84-6.55 50.36-6.80Q49.88-7.05 49.27-7.05Q48.62-7.05 48.09-6.76Q47.55-6.46 47.25-5.93Q46.94-5.39 46.94-4.73L46.94-3.91Q46.94-3.24 47.23-2.71Q47.53-2.17 48.06-1.87Q48.59-1.58 49.25-1.58Q49.75-1.59 50.18-1.75Q50.61-1.92 50.91-2.21Q51.21-2.50 51.34-2.87L53.57-2.87Q53.37-1.97 52.76-1.27Q52.15-0.57 51.23-0.18Q50.30 0.21 49.21 0.20M58.20 0.16Q57.02 0.16 56.09-0.41Q55.16-0.99 54.64-2.01Q54.13-3.03 54.13-4.33Q54.13-5.62 54.66-6.65Q55.20-7.67 56.13-8.24Q57.07-8.80 58.27-8.80Q59.05-8.80 59.75-8.49Q60.46-8.18 60.93-7.64Q61.40-7.09 61.51-6.44L60.99-6.44L60.99-11.89L63.13-11.89L63.13 0L61.01 0L61.02-2.08L61.52-2.12Q61.34-1.47 60.83-0.95Q60.32-0.43 59.62-0.13Q58.92 0.16 58.20 0.16M58.65-1.78Q59.30-1.78 59.86-2.11Q60.41-2.45 60.74-3.02Q61.06-3.60 61.07-4.34Q61.07-5.07 60.75-5.65Q60.43-6.23 59.87-6.56Q59.31-6.88 58.65-6.87Q57.97-6.88 57.45-6.57Q56.92-6.25 56.63-5.67Q56.34-5.09 56.34-4.34Q56.34-3.59 56.63-3.01Q56.92-2.43 57.45-2.11Q57.97-1.78 58.65-1.78M67.68 0L67.68-11.50L72.02-11.50Q73.16-11.50 74.06-11.02Q74.96-10.55 75.46-9.69Q75.95-8.83 75.95-7.73Q75.95-6.62 75.46-5.76Q74.96-4.90 74.07-4.41Q73.17-3.93 72.02-3.93L69.12-3.93L69.12-5.91L71.73-5.91Q72.27-5.91 72.70-6.14Q73.12-6.37 73.35-6.77Q73.59-7.17 73.59-7.70Q73.59-8.22 73.36-8.63Q73.13-9.04 72.70-9.26Q72.27-9.48 71.72-9.48L69.93-9.48L69.93 0L67.68 0M80.30 0.16Q79.13 0.16 78.20-0.42Q77.27-1.01 76.75-2.03Q76.22-3.05 76.22-4.34Q76.23-5.62 76.77-6.64Q77.30-7.66 78.24-8.23Q79.18-8.80 80.37-8.80Q81.13-8.80 81.84-8.50Q82.54-8.21 83.02-7.68Q83.49-7.16 83.61-6.51L83.07-6.53L83.07-8.61L85.21-8.61L85.21 0L83.09 0L83.09-1.80L83.67-2.11Q83.47-1.45 82.95-0.93Q82.42-0.41 81.72-0.12Q81.02 0.16 80.30 0.16M80.72-1.77Q81.39-1.77 81.95-2.10Q82.51-2.43 82.83-3.01Q83.16-3.59 83.16-4.34Q83.16-5.07 82.84-5.65Q82.52-6.23 81.95-6.56Q81.39-6.89 80.72-6.89Q80.05-6.89 79.54-6.57Q79.02-6.26 78.73-5.67Q78.44-5.09 78.44-4.34Q78.44-3.58 78.73-3Q79.02-2.42 79.54-2.09Q80.05-1.77 80.72-1.77M86.50 0L86.50-8.61L88.54-8.61L88.54-6.72L88.13-6.57Q88.27-7.25 88.65-7.75Q89.02-8.26 89.57-8.52Q90.12-8.79 90.78-8.79Q90.78-8.79 90.78-8.79Q90.78-8.79 90.78-8.79L90.78-6.80Q90.78-6.80 90.78-6.80Q90.78-6.80 90.78-6.80Q90.09-6.80 89.61-6.55Q89.12-6.30 88.86-5.80Q88.60-5.30 88.60-4.60L88.60 0L86.50 0M92.81 0L92.81-10.73L94.91-10.73L94.91 0L92.81 0M91.30-6.80L91.30-8.61L96.42-8.61L96.42-6.80L91.30-6.80M99.20-4.86L99.20 0L97.06 0L97.06-8.61L99.15-8.61L99.15-6.70L98.73-6.50Q98.85-7.17 99.28-7.70Q99.70-8.23 100.33-8.51Q100.95-8.80 101.67-8.80Q102.59-8.80 103.28-8.40Q103.98-8 104.35-7.26Q104.73-6.52 104.73-5.55L104.73 0L102.59 0L102.59-5.08Q102.59-5.62 102.39-6.03Q102.20-6.44 101.83-6.65Q101.47-6.87 100.98-6.87Q100.48-6.87 100.07-6.61Q99.67-6.34 99.44-5.89Q99.20-5.43 99.20-4.86M109.99 0.20Q108.72 0.21 107.70-0.36Q106.68-0.94 106.10-1.96Q105.52-2.98 105.52-4.30Q105.52-5.57 106.11-6.60Q106.70-7.63 107.72-8.21Q108.73-8.79 109.98-8.79Q111.39-8.79 112.45-8.16Q113.51-7.54 114.04-6.39Q114.56-5.25 114.41-3.77L106.38-3.77L106.38-5.22L112.59-5.22L112.21-5.05Q112.20-5.62 111.91-6.09Q111.63-6.55 111.14-6.80Q110.66-7.05 110.05-7.05Q109.40-7.05 108.87-6.76Q108.34-6.46 108.03-5.93Q107.72-5.39 107.72-4.73L107.72-3.91Q107.72-3.24 108.02-2.71Q108.31-2.17 108.84-1.87Q109.38-1.58 110.03-1.58Q110.53-1.59 110.96-1.75Q111.39-1.92 111.69-2.21Q111.99-2.50 112.12-2.87L114.35-2.87Q114.15-1.97 113.54-1.27Q112.93-0.57 112.01-0.18Q111.09 0.21 109.99 0.20M115.30 0L115.30-8.61L117.34-8.61L117.34-6.72L116.93-6.57Q117.08-7.25 117.45-7.75Q117.83-8.26 118.38-8.52Q118.92-8.79 119.59-8.79Q119.59-8.79 119.59-8.79Q119.59-8.79 119.59-8.79L119.59-6.80Q119.59-6.80 119.59-6.80Q119.59-6.80 119.59-6.80Q118.90-6.80 118.41-6.55Q117.92-6.30 117.66-5.80Q117.41-5.30 117.41-4.60L117.41 0";   // "Certified Partner"
  const LABEL_TO = "M2.52-11.50L6.23-0.62L4.75-0.66L8.42-11.50L10.71-11.50L6.60 0L4.16 0L0.05-11.50L2.52-11.50M14.10 0.20Q12.83 0.21 11.81-0.36Q10.79-0.94 10.21-1.96Q9.63-2.98 9.63-4.30Q9.63-5.57 10.22-6.60Q10.81-7.63 11.83-8.21Q12.84-8.79 14.09-8.79Q15.50-8.79 16.56-8.16Q17.62-7.54 18.14-6.39Q18.67-5.25 18.52-3.77L10.49-3.77L10.49-5.22L16.70-5.22L16.32-5.05Q16.30-5.62 16.02-6.09Q15.73-6.55 15.25-6.80Q14.77-7.05 14.16-7.05Q13.51-7.05 12.98-6.76Q12.45-6.46 12.14-5.93Q11.83-5.39 11.83-4.73L11.83-3.91Q11.83-3.24 12.13-2.71Q12.42-2.17 12.95-1.87Q13.48-1.58 14.14-1.58Q14.64-1.59 15.07-1.75Q15.50-1.92 15.80-2.21Q16.10-2.50 16.23-2.87L18.46-2.87Q18.26-1.97 17.65-1.27Q17.04-0.57 16.12-0.18Q15.20 0.21 14.10 0.20M19.41 0L19.41-8.61L21.45-8.61L21.45-6.72L21.04-6.57Q21.19-7.25 21.56-7.75Q21.94-8.26 22.48-8.52Q23.03-8.79 23.70-8.79Q23.70-8.79 23.70-8.79Q23.70-8.79 23.70-8.79L23.70-6.80Q23.70-6.80 23.70-6.80Q23.70-6.80 23.70-6.80Q23.01-6.80 22.52-6.55Q22.03-6.30 21.77-5.80Q21.52-5.30 21.52-4.60L21.52 0L19.41 0M24.48 0L24.48-8.61L26.62-8.61L26.62 0L24.48 0M24.45-9.52L24.45-11.70L26.69-11.70L26.69-9.52L24.45-9.52M28.71-8.33Q28.71-9.37 29.19-10.19Q29.66-11.01 30.53-11.46Q31.39-11.92 32.55-11.94Q32.55-11.94 32.55-11.94Q32.55-11.94 32.55-11.94L32.55-10.04Q32.55-10.04 32.55-10.04Q32.55-10.04 32.55-10.04Q32.01-10.03 31.63-9.82Q31.25-9.60 31.05-9.20Q30.84-8.79 30.84-8.24L30.84 0L28.71 0L28.71-8.33M27.34-6.80L27.34-8.61L32.50-8.61L32.50-6.80L27.34-6.80M37.87 1.47Q37.63 2.15 37.25 2.60Q36.88 3.05 36.35 3.27Q35.82 3.50 35.13 3.50L33.58 3.50L33.58 1.66L34.82 1.66Q35.07 1.66 35.27 1.58Q35.46 1.50 35.59 1.35Q35.73 1.20 35.83 0.95Q35.85 0.90 35.86 0.87Q35.88 0.84 35.90 0.78L36.16 0.02L32.84-8.61L35.23-8.61L37.98-0.66L36.63-0.66L39.13-8.61L41.42-8.61L37.87 1.47M49.52 0.19Q48.22 0.19 47.19-0.39Q46.16-0.96 45.58-1.98Q45-3 45-4.30Q45-5.60 45.58-6.63Q46.16-7.66 47.19-8.23Q48.22-8.80 49.52-8.80Q50.84-8.80 51.87-8.23Q52.91-7.66 53.48-6.63Q54.06-5.61 54.07-4.30Q54.06-3 53.49-1.98Q52.91-0.96 51.88-0.39Q50.84 0.19 49.52 0.19M49.52-1.77Q50.21-1.77 50.74-2.09Q51.27-2.41 51.56-2.98Q51.85-3.55 51.85-4.30Q51.85-5.05 51.56-5.62Q51.27-6.20 50.74-6.52Q50.21-6.84 49.52-6.84Q48.84-6.84 48.32-6.52Q47.79-6.20 47.50-5.62Q47.21-5.05 47.22-4.30Q47.22-3.55 47.51-2.98Q47.80-2.41 48.32-2.09Q48.84-1.77 49.52-1.77M57.10-4.86L57.10 0L54.96 0L54.96-8.61L57.05-8.61L57.05-6.70L56.63-6.50Q56.75-7.17 57.18-7.70Q57.60-8.23 58.23-8.51Q58.85-8.80 59.57-8.80Q60.48-8.80 61.18-8.40Q61.88-8 62.25-7.26Q62.63-6.52 62.63-5.55L62.63 0L60.49 0L60.49-5.08Q60.49-5.62 60.29-6.03Q60.09-6.44 59.73-6.65Q59.37-6.87 58.88-6.87Q58.38-6.87 57.97-6.61Q57.57-6.34 57.34-5.89Q57.10-5.43 57.10-4.86M69.77 0L66.39-11.50L68.83-11.50L71.68-1.09L70.30-1.09L73.33-11.50L75.36-11.50L78.73-1.03L77.16-1.05L79.97-11.50L82.20-11.50L78.91 0L76.80 0L73.28-10.50L75.13-10.50L71.90 0L69.77 0M86.02 0.20Q84.74 0.21 83.72-0.36Q82.70-0.94 82.12-1.96Q81.54-2.98 81.54-4.30Q81.54-5.57 82.13-6.60Q82.73-7.63 83.74-8.21Q84.76-8.79 86.01-8.79Q87.41-8.79 88.47-8.16Q89.53-7.54 90.06-6.39Q90.59-5.25 90.44-3.77L82.41-3.77L82.41-5.22L88.62-5.22L88.23-5.05Q88.22-5.62 87.93-6.09Q87.65-6.55 87.16-6.80Q86.68-7.05 86.07-7.05Q85.42-7.05 84.89-6.76Q84.36-6.46 84.05-5.93Q83.74-5.39 83.74-4.73L83.74-3.91Q83.74-3.24 84.04-2.71Q84.34-2.17 84.87-1.87Q85.40-1.58 86.05-1.58Q86.55-1.59 86.98-1.75Q87.41-1.92 87.71-2.21Q88.02-2.50 88.14-2.87L90.38-2.87Q90.17-1.97 89.56-1.27Q88.95-0.57 88.03-0.18Q87.11 0.21 86.02 0.20M96.30 0.16Q95.58 0.16 94.88-0.13Q94.18-0.43 93.67-0.95Q93.16-1.47 92.98-2.12L93.48-2.08L93.49 0L91.37 0L91.37-11.89L93.51-11.89L93.51-6.44L92.99-6.44Q93.10-7.09 93.57-7.64Q94.05-8.18 94.75-8.49Q95.45-8.80 96.23-8.80Q97.43-8.80 98.38-8.24Q99.32-7.67 99.85-6.65Q100.38-5.62 100.38-4.33Q100.38-3.03 99.86-2.01Q99.35-0.99 98.42-0.41Q97.48 0.16 96.30 0.16M95.86-1.78Q96.53-1.78 97.06-2.11Q97.59-2.43 97.87-3.01Q98.16-3.59 98.16-4.34Q98.16-5.09 97.87-5.67Q97.59-6.25 97.06-6.57Q96.53-6.88 95.86-6.87Q95.19-6.88 94.63-6.56Q94.08-6.23 93.75-5.65Q93.43-5.07 93.44-4.34Q93.44-3.60 93.76-3.02Q94.09-2.45 94.64-2.11Q95.20-1.78 95.86-1.78M101.93-8.33Q101.93-9.37 102.41-10.19Q102.88-11.01 103.75-11.46Q104.61-11.92 105.77-11.94Q105.77-11.94 105.77-11.94Q105.77-11.94 105.77-11.94L105.77-10.04Q105.77-10.04 105.77-10.04Q105.77-10.04 105.77-10.04Q105.23-10.03 104.85-9.82Q104.47-9.60 104.27-9.20Q104.06-8.79 104.06-8.24L104.06 0L101.93 0L101.93-8.33M100.55-6.80L100.55-8.61L105.72-8.61L105.72-6.80L100.55-6.80M108.54-11.90L108.54 0L106.41 0L106.41-11.90L108.54-11.90M106.41-10.19L106.41-11.90L108.54-11.90L108.54-10.19L106.41-10.19M106.41 0L106.41-1.72L108.54-1.72L108.54 0L106.41 0M113.96 0.19Q112.66 0.19 111.63-0.39Q110.60-0.96 110.02-1.98Q109.44-3 109.44-4.30Q109.44-5.60 110.02-6.63Q110.60-7.66 111.63-8.23Q112.66-8.80 113.96-8.80Q115.27-8.80 116.31-8.23Q117.34-7.66 117.92-6.63Q118.50-5.61 118.51-4.30Q118.50-3 117.93-1.98Q117.35-0.96 116.31-0.39Q115.27 0.19 113.96 0.19M113.96-1.77Q114.65-1.77 115.18-2.09Q115.71-2.41 116-2.98Q116.29-3.55 116.29-4.30Q116.29-5.05 116-5.62Q115.71-6.20 115.18-6.52Q114.65-6.84 113.96-6.84Q113.28-6.84 112.75-6.52Q112.23-6.20 111.94-5.62Q111.65-5.05 111.66-4.30Q111.66-3.55 111.95-2.98Q112.24-2.41 112.76-2.09Q113.28-1.77 113.96-1.77M121 0L118.43-8.61L120.80-8.61L122.96-0.74L121.60-0.73L123.91-8.61L125.99-8.61L128.37-0.73L126.92-0.73L129.07-8.61L131.22-8.61L128.64 0L126.59 0L124.06-7.62L125.42-7.62L123.08 0";       // "Verify on Webflow"

  // --- seal path data (verbatim from Badge.html) --------------------------
  const CB_SEAL = "M1736 3129 c6 -10 -37 -40 -48 -33 -4 3 -6 -1 -3 -8 3 -7 -15 -33 -40 -57 -25 -24 -45 -47 -45 -52 0 -5 -7 -9 -15 -9 -8 0 -15 -5 -15 -11 0 -6 -7 -9 -15 -5 -8 3 -14 0 -12 -7 1 -7 -4 -11 -11 -9 -8 1 -11 -2 -8 -6 3 -5 -2 -19 -12 -30 -16 -19 -30 -20 -195 -21 -98 0 -182 -3 -188 -6 -5 -4 -9 -82 -9 -181 0 -168 -8 -223 -31 -209 -5 4 -9 1 -9 -5 0 -6 -4 -8 -10 -5 -6 4 -7 -1 -3 -11 5 -14 3 -16 -11 -11 -10 4 -15 3 -11 -3 8 -12 -96 -121 -107 -113 -5 2 -7 -1 -6 -9 2 -7 -5 -12 -14 -12 -11 1 -14 -4 -10 -14 4 -11 1 -14 -11 -9 -11 4 -14 2 -10 -8 3 -8 -2 -17 -10 -21 -27 -10 7 -104 38 -104 6 0 20 -9 30 -20 10 -11 15 -20 10 -20 -4 0 -2 -7 5 -15 7 -8 16 -13 20 -10 8 5 61 -51 54 -58 -6 -6 64 -67 76 -67 6 0 10 -74 10 -189 l0 -188 31 -7 c17 -3 105 -6 195 -6 94 0 164 -4 164 -9 0 -15 51 -72 60 -66 4 3 13 -2 20 -10 7 -8 9 -15 5 -15 -4 0 -2 -7 5 -15 7 -8 16 -12 21 -9 5 3 13 -5 18 -18 10 -26 75 -90 106 -105 22 -11 85 9 85 26 0 13 50 71 58 68 4 -1 8 3 10 8 7 20 35 44 45 38 6 -3 7 -1 3 5 -4 7 -1 12 9 12 9 0 14 3 11 8 -7 11 16 36 47 49 15 7 27 17 27 23 0 6 64 10 180 10 136 0 182 3 185 13 3 6 6 93 7 192 2 129 6 180 15 180 12 0 28 13 28 23 0 11 58 72 63 67 10 -10 31 17 25 32 -4 11 -2 14 5 9 6 -3 16 3 22 14 6 11 15 18 21 15 5 -4 9 1 9 9 0 9 3 15 8 14 4 -1 21 12 39 30 17 17 26 32 20 32 -8 0 -7 4 1 12 18 18 15 36 -8 43 -11 3 -20 12 -20 19 0 7 -12 22 -26 32 -15 10 -30 24 -35 29 -42 50 -67 73 -81 78 -10 4 -18 13 -18 22 0 8 -6 15 -13 15 -7 0 -21 15 -32 33 -17 28 -20 56 -23 208 l-4 177 -64 7 c-35 4 -109 3 -164 -1 -86 -6 -107 -4 -140 11 -22 10 -40 23 -40 30 0 7 -12 21 -26 31 -15 10 -32 25 -38 32 -39 46 -66 71 -85 82 -13 6 -20 14 -17 17 12 13 -37 47 -69 48 -19 1 -32 -2 -29 -6z";
  const CB_CHECK = "M1940 2430 c0 -5 -6 -9 -12 -7 -7 1 -12 -6 -12 -15 1 -10 -2 -18 -7 -18 -18 0 -160 -150 -153 -162 4 -7 3 -8 -4 -4 -7 4 -12 3 -12 -3 0 -6 -12 -14 -26 -17 -19 -5 -22 -9 -12 -15 7 -5 8 -9 2 -9 -5 0 -23 14 -39 30 -16 17 -25 30 -20 30 5 0 0 6 -10 14 -11 8 -23 12 -26 10 -4 -2 -6 4 -5 13 2 25 -30 27 -53 4 -12 -12 -25 -21 -31 -21 -5 0 -10 -5 -10 -11 0 -5 -4 -8 -8 -5 -4 2 -8 -5 -7 -17 0 -14 31 -54 83 -107 45 -47 90 -93 99 -102 18 -20 33 -23 33 -8 0 6 6 10 14 10 18 0 35 21 39 51 2 13 10 24 18 25 33 2 38 5 44 24 3 11 12 20 18 20 14 0 65 53 83 87 7 13 8 26 3 32 -6 8 -5 8 3 1 7 -5 15 -10 19 -10 15 0 89 77 89 92 0 26 -11 48 -21 42 -5 -3 -9 0 -9 6 0 14 -40 49 -57 50 -7 0 -13 -4 -13 -10z";
  const CB_W = "M1080 0L735.385 673.684H411.695L555.915 394.481H549.444C430.463 548.934 252.941 650.61 -0.000976562 673.684V398.344C-0.000976562 398.344 161.812 388.787 256.938 288.776H-0.000976562V0.0053214H288.77V237.515L295.252 237.489L413.254 0.0053214H631.644V236.009L638.125 235.999L760.555 0H1080Z";
  const G = "translate(0,450) scale(0.1,-0.1)";
  const SVGNS = 'http://www.w3.org/2000/svg';

  // --- scoped CSS (badge only; namespaced; nothing leaks to the page) -----
  const CSS = [
    ".webflow_badge{--wfb-hover:#8f8f8f}",
    ".webflow_badge .wfb-corner{display:flex;align-items:center;justify-content:center;width:68px;height:190px;margin:0 auto}",
    ".webflow_badge .wfb-vlockup{display:flex;flex-direction:column;align-items:center;gap:9px}",
    ".webflow_badge .wfb-vsvg{display:block;overflow:visible}",
    ".webflow_badge .wfb-vword{transform-box:fill-box;transition:opacity .4s ease,transform .55s cubic-bezier(.22,.9,.24,1)}",
    ".webflow_badge .wfb-vword.wfb-from{fill:#fff;opacity:1;transform:translateX(0)}",
    ".webflow_badge .wfb-vword.wfb-to{fill:var(--wfb-hover);opacity:0;transform:translateX(-7px)}",
    ".webflow_badge .wfb-corner:hover .wfb-vword.wfb-from{opacity:0;transform:translateX(7px)}",
    ".webflow_badge .wfb-corner:hover .wfb-vword.wfb-to{opacity:1;transform:translateX(0)}",
    ".webflow_badge .wfb-seal{position:relative;flex:none;display:inline-block;width:30px;height:30px}",
    ".webflow_badge .wfb-seal-bg{position:absolute;inset:0;width:100%;height:100%;display:block}",
    ".webflow_badge .wfb-glyphs{position:absolute;inset:0;display:grid;place-items:center}",
    ".webflow_badge .wfb-tween{display:block}"
  ].join("\n");

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    (document.head || document.documentElement).appendChild(style);
  }

  // --- vertical label SVG: two baked outlines (from + to), crossfaded.
  //     Group rotated -90deg here (authored vertical), not on the container.
  function labelSVG() {
    return '<svg class="wfb-vsvg" width="20" height="' + LABEL_TRACK + '" viewBox="0 0 20 ' + LABEL_TRACK + '" aria-hidden="true">' +
      '<g transform="translate(14.5,' + LABEL_TRACK + ') rotate(-90)">' +
        '<path class="wfb-vword wfb-from" d="' + LABEL_FROM + '"></path>' +
        '<path class="wfb-vword wfb-to" d="' + LABEL_TO + '"></path>' +
      '</g>' +
    '</svg>';
  }

  function sealHTML() {
    const bg = '<svg class="wfb-seal-bg" viewBox="86.7 136.5 181.2 180.5" xmlns="' + SVGNS + '">' +
      '<g transform="' + G + '"><path d="' + CB_SEAL + '" fill="#146EF5"/></g></svg>';
    const inner = '<div class="wfb-glyphs"><svg class="wfb-tween" width="16.2" height="16.2" viewBox="0 0 100 100" xmlns="' + SVGNS + '"><path fill="#fff"></path></svg></div>';
    return '<span class="wfb-seal">' + bg + inner + '</span>';
  }

  // --- sample a glyph path into RING evenly-spaced points in a 100x100 box -
  function sampleRing(d, flipY) {
    const svg = document.createElementNS(SVGNS, 'svg');
    svg.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:10px;height:10px;';
    const p = document.createElementNS(SVGNS, 'path');
    p.setAttribute('d', d);
    svg.appendChild(p);
    document.body.appendChild(svg);
    const bb = p.getBBox(), total = p.getTotalLength();
    const scale = 80 / Math.max(bb.width, bb.height);
    const ox = (100 - bb.width * scale) / 2, oy = (100 - bb.height * scale) / 2;
    const pts = [];
    for (let i = 0; i < RING; i++) {
      const pt = p.getPointAtLength(total * i / RING);
      const x = (pt.x - bb.x) * scale + ox;
      let y = (pt.y - bb.y) * scale + oy;
      if (flipY) y = 100 - y;
      pts.push([x, y]);
    }
    document.body.removeChild(svg);
    return pts;
  }

  // --- align `to` ring against `from` (best rotation + winding), so the
  //     point-by-point lerp morphs cleanly (replaces flubber for this case).
  function makeMorph(from, to) {
    const N = from.length;
    const rev = to.slice().reverse();
    const seqs = [to, rev];
    let best = null;
    for (let s = 0; s < seqs.length; s++) {
      const seq = seqs[s];
      for (let k = 0; k < N; k++) {
        let d = 0;
        for (let i = 0; i < N; i++) {
          const q = seq[(i + k) % N];
          const dx = from[i][0] - q[0], dy = from[i][1] - q[1];
          d += dx * dx + dy * dy;
          if (best && d > best.d) break; // prune
        }
        if (!best || d < best.d) best = { d: d, seq: seq, k: k };
      }
    }
    const aligned = new Array(N);
    for (let j = 0; j < N; j++) aligned[j] = best.seq[(j + best.k) % N];
    return function (t) {
      let out = '';
      for (let m = 0; m < N; m++) {
        const f = from[m], a = aligned[m];
        out += (m ? 'L' : 'M') + (f[0] + (a[0] - f[0]) * t).toFixed(2) + ' ' + (f[1] + (a[1] - f[1]) * t).toFixed(2);
      }
      return out + 'Z';
    };
  }

  // --- drive one seal's check<->W morph (auto loop + ease-to-W on hover) --
  function runSeal(pathEl, isHover) {
    const morph = makeMorph(sampleRing(CB_CHECK, true), sampleRing(CB_W, false));
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      pathEl.setAttribute('d', morph(0)); // static check
      return;
    }
    const ease = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
    const start = performance.now();
    let cur = 0;
    (function frame(now) {
      const p = ((now - start) % CYCLE) / CYCLE;
      let k;
      if (p < 0.26) k = 0;
      else if (p < 0.48) k = ease((p - 0.26) / 0.22);
      else if (p < 0.74) k = 1;
      else if (p < 0.96) k = 1 - ease((p - 0.74) / 0.22);
      else k = 0;
      const goal = isHover() ? 1 : k;
      cur += (goal - cur) * 0.10;
      pathEl.setAttribute('d', morph(cur));
      requestAnimationFrame(frame);
    })(performance.now());
  }

  function setup(host) {
    if (host.getAttribute('data-wfb-init') === '1') return;
    host.setAttribute('data-wfb-init', '1');

    // No link here — the badge is just the visual. Wrap .webflow_badge in a
    // Webflow link (or add the URL to it) to make it clickable.
    host.innerHTML =
      '<span class="wfb-corner">' +
        '<span class="wfb-vlockup">' + labelSVG() + sealHTML() + '</span>' +
      '</span>';

    const corner = host.querySelector('.wfb-corner');
    let hover = false;
    corner.addEventListener('pointerenter', function () { hover = true; });
    corner.addEventListener('pointerleave', function () { hover = false; });

    const seal = host.querySelector('.wfb-tween path');
    if (seal) runSeal(seal, function () { return hover; });
  }

  function init() {
    injectStyles();
    const hosts = document.querySelectorAll(TARGET);
    for (let i = 0; i < hosts.length; i++) setup(hosts[i]);
  }

  // Loaded with `defer` or in the footer, so the DOM is already parsed.
  init();
})();
