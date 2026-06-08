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
  const LABEL_TRACK = 128;   // svg height = max label advance + 2
  const LABEL_FROM = "M0.34 -5.75Q0.34 -7.47 1.09 -8.82Q1.84 -10.17 3.19 -10.93Q4.53 -11.69 6.25 -11.69Q7.74 -11.69 8.97 -11.12Q10.20 -10.56 11.00 -9.52Q11.80 -8.48 12.02 -7.12H9.59Q9.38 -7.87 8.89 -8.43Q8.41 -8.99 7.73 -9.30Q7.05 -9.61 6.27 -9.61Q5.22 -9.61 4.42 -9.13Q3.62 -8.65 3.17 -7.77Q2.72 -6.88 2.72 -5.75Q2.72 -4.62 3.17 -3.74Q3.62 -2.87 4.42 -2.38Q5.23 -1.89 6.27 -1.89Q7.11 -1.89 7.80 -2.19Q8.49 -2.49 8.95 -3.04Q9.41 -3.59 9.58 -4.32H12.02Q11.80 -2.99 11.01 -1.97Q10.23 -0.95 8.99 -0.38Q7.76 0.19 6.25 0.19Q4.53 0.19 3.19 -0.57Q1.84 -1.33 1.09 -2.68Q0.34 -4.03 0.34 -5.75ZM11.66 -4.30Q11.66 -5.57 12.26 -6.60Q12.85 -7.63 13.87 -8.21Q14.88 -8.79 16.13 -8.79Q17.54 -8.79 18.60 -8.16Q19.66 -7.54 20.18 -6.39Q20.71 -5.25 20.56 -3.77H12.53V-5.22H18.74L18.36 -5.05Q18.34 -5.62 18.06 -6.09Q17.77 -6.55 17.29 -6.80Q16.80 -7.05 16.20 -7.05Q15.55 -7.05 15.02 -6.76Q14.48 -6.46 14.18 -5.93Q13.87 -5.39 13.87 -4.73V-3.91Q13.87 -3.24 14.16 -2.71Q14.46 -2.17 14.99 -1.88Q15.52 -1.58 16.18 -1.58Q16.68 -1.59 17.11 -1.75Q17.54 -1.92 17.84 -2.21Q18.14 -2.50 18.27 -2.87H20.50Q20.30 -1.97 19.69 -1.27Q19.08 -0.57 18.16 -0.18Q17.23 0.21 16.14 0.20Q14.87 0.21 13.85 -0.36Q12.83 -0.94 12.25 -1.96Q11.66 -2.98 11.66 -4.30ZM19.05 -8.61H21.09V-6.72L20.68 -6.57Q20.83 -7.25 21.20 -7.75Q21.58 -8.26 22.12 -8.52Q22.67 -8.79 23.34 -8.79Q23.34 -8.79 23.34 -8.79Q23.34 -8.79 23.34 -8.79V-6.80Q23.34 -6.80 23.34 -6.80Q23.34 -6.80 23.34 -6.80Q22.65 -6.80 22.16 -6.55Q21.67 -6.30 21.41 -5.80Q21.16 -5.30 21.16 -4.60V0.00H19.05ZM27.09 -10.73H29.19V0.00H27.09ZM25.57 -8.61H30.70V-6.80H25.57ZM31.41 -8.61H33.55V0.00H31.41ZM31.38 -11.70H33.63V-9.52H31.38ZM40.28 -11.78Q40.27 -11.78 40.27 -11.78Q40.27 -11.78 40.28 -11.78V-9.83Q40.28 -9.83 40.28 -9.83Q40.28 -9.83 40.28 -9.83Q40.27 -9.83 40.27 -9.83Q40.27 -9.83 40.28 -9.83Q39.77 -9.82 39.41 -9.61Q39.05 -9.39 38.85 -9.00Q38.66 -8.62 38.66 -8.12V0.00H36.52V-8.13Q36.52 -9.18 37.00 -10.00Q37.48 -10.83 38.34 -11.30Q39.20 -11.77 40.28 -11.78ZM35.15 -8.61H40.23V-6.80H35.15ZM40.99 -8.61H43.13V0.00H40.99ZM40.96 -11.70H43.20V-9.52H40.96ZM44.81 -4.30Q44.81 -5.57 45.41 -6.60Q46.00 -7.63 47.02 -8.21Q48.03 -8.79 49.28 -8.79Q50.69 -8.79 51.75 -8.16Q52.81 -7.54 53.33 -6.39Q53.86 -5.25 53.71 -3.77H45.68V-5.22H51.89L51.51 -5.05Q51.49 -5.62 51.21 -6.09Q50.92 -6.55 50.44 -6.80Q49.95 -7.05 49.34 -7.05Q48.70 -7.05 48.16 -6.76Q47.63 -6.46 47.32 -5.93Q47.02 -5.39 47.02 -4.73V-3.91Q47.02 -3.24 47.31 -2.71Q47.61 -2.17 48.14 -1.88Q48.67 -1.58 49.33 -1.58Q49.83 -1.59 50.26 -1.75Q50.69 -1.92 50.99 -2.21Q51.29 -2.50 51.41 -2.87H53.65Q53.45 -1.97 52.84 -1.27Q52.23 -0.57 51.31 -0.18Q50.38 0.21 49.29 0.20Q48.02 0.21 47.00 -0.36Q45.98 -0.94 45.39 -1.96Q44.81 -2.98 44.81 -4.30ZM51.84 -4.33Q51.85 -5.62 52.38 -6.65Q52.91 -7.67 53.85 -8.24Q54.79 -8.80 55.98 -8.80Q56.77 -8.80 57.47 -8.49Q58.18 -8.18 58.65 -7.64Q59.12 -7.09 59.23 -6.44H58.71V-11.89H60.85V0.00H58.73L58.73 -2.08L59.24 -2.12Q59.06 -1.47 58.55 -0.95Q58.04 -0.43 57.34 -0.13Q56.64 0.16 55.92 0.16Q54.73 0.16 53.81 -0.41Q52.88 -0.99 52.36 -2.01Q51.84 -3.03 51.84 -4.33ZM58.79 -4.34Q58.79 -5.07 58.47 -5.65Q58.15 -6.23 57.59 -6.56Q57.03 -6.88 56.37 -6.88Q55.69 -6.88 55.16 -6.57Q54.64 -6.25 54.35 -5.67Q54.06 -5.09 54.06 -4.34Q54.06 -3.59 54.35 -3.01Q54.64 -2.43 55.16 -2.11Q55.69 -1.78 56.37 -1.78Q57.02 -1.78 57.58 -2.11Q58.13 -2.45 58.46 -3.02Q58.78 -3.60 58.79 -4.34ZM64.99 -11.50H69.33Q70.48 -11.50 71.38 -11.02Q72.27 -10.55 72.77 -9.69Q73.27 -8.83 73.27 -7.73Q73.27 -6.62 72.77 -5.76Q72.27 -4.90 71.38 -4.41Q70.48 -3.93 69.34 -3.93H66.43V-5.91H69.04Q69.59 -5.91 70.01 -6.14Q70.43 -6.37 70.66 -6.77Q70.90 -7.17 70.90 -7.70Q70.90 -8.22 70.67 -8.63Q70.44 -9.04 70.01 -9.26Q69.58 -9.48 69.03 -9.48H67.24V0.00H64.99ZM74.22 -4.34Q74.23 -5.62 74.77 -6.64Q75.31 -7.66 76.24 -8.23Q77.18 -8.80 78.37 -8.80Q79.13 -8.80 79.84 -8.50Q80.54 -8.21 81.02 -7.68Q81.49 -7.16 81.61 -6.51L81.07 -6.53V-8.61H83.21V0.00H81.09L81.09 -1.80L81.67 -2.11Q81.47 -1.45 80.95 -0.93Q80.42 -0.41 79.72 -0.12Q79.02 0.16 78.31 0.16Q77.13 0.16 76.20 -0.42Q75.27 -1.01 74.75 -2.03Q74.22 -3.05 74.22 -4.34ZM81.16 -4.34Q81.16 -5.07 80.84 -5.65Q80.52 -6.23 79.95 -6.56Q79.39 -6.89 78.72 -6.89Q78.06 -6.89 77.54 -6.57Q77.02 -6.26 76.73 -5.67Q76.44 -5.09 76.44 -4.34Q76.44 -3.58 76.73 -3.00Q77.02 -2.42 77.54 -2.09Q78.06 -1.77 78.72 -1.77Q79.39 -1.77 79.95 -2.10Q80.51 -2.43 80.83 -3.01Q81.16 -3.59 81.16 -4.34ZM82.48 -8.61H84.52V-6.72L84.10 -6.57Q84.25 -7.25 84.62 -7.75Q85.00 -8.26 85.55 -8.52Q86.09 -8.79 86.76 -8.79Q86.76 -8.79 86.76 -8.79Q86.76 -8.79 86.76 -8.79V-6.80Q86.76 -6.80 86.76 -6.80Q86.76 -6.80 86.76 -6.80Q86.07 -6.80 85.58 -6.55Q85.09 -6.30 84.84 -5.80Q84.58 -5.30 84.58 -4.60V0.00H82.48ZM90.51 -10.73H92.61V0.00H90.51ZM88.99 -8.61H94.12V-6.80H88.99ZM96.84 0.00H94.70V-8.61H96.79V-6.70L96.37 -6.50Q96.49 -7.17 96.92 -7.70Q97.34 -8.23 97.97 -8.51Q98.59 -8.80 99.31 -8.80Q100.23 -8.80 100.92 -8.40Q101.62 -8.00 101.99 -7.26Q102.37 -6.52 102.37 -5.55V0.00H100.23V-5.08Q100.23 -5.62 100.04 -6.03Q99.84 -6.44 99.47 -6.65Q99.11 -6.87 98.62 -6.87Q98.12 -6.87 97.72 -6.61Q97.31 -6.34 97.08 -5.89Q96.84 -5.43 96.84 -4.86ZM103.12 -4.30Q103.12 -5.57 103.71 -6.60Q104.30 -7.63 105.32 -8.21Q106.34 -8.79 107.59 -8.79Q108.99 -8.79 110.05 -8.16Q111.11 -7.54 111.64 -6.39Q112.16 -5.25 112.02 -3.77H103.98V-5.22H110.20L109.81 -5.05Q109.80 -5.62 109.51 -6.09Q109.23 -6.55 108.74 -6.80Q108.26 -7.05 107.65 -7.05Q107.00 -7.05 106.47 -6.76Q105.94 -6.46 105.63 -5.93Q105.32 -5.39 105.32 -4.73V-3.91Q105.32 -3.24 105.62 -2.71Q105.91 -2.17 106.45 -1.88Q106.98 -1.58 107.63 -1.58Q108.13 -1.59 108.56 -1.75Q108.99 -1.92 109.29 -2.21Q109.59 -2.50 109.72 -2.87H111.95Q111.75 -1.97 111.14 -1.27Q110.53 -0.57 109.61 -0.18Q108.69 0.21 107.59 0.20Q106.32 0.21 105.30 -0.36Q104.28 -0.94 103.70 -1.96Q103.12 -2.98 103.12 -4.30ZM110.51 -8.61H112.55V-6.72L112.13 -6.57Q112.28 -7.25 112.66 -7.75Q113.03 -8.26 113.58 -8.52Q114.12 -8.79 114.79 -8.79Q114.79 -8.79 114.79 -8.79Q114.79 -8.79 114.79 -8.79V-6.80Q114.79 -6.80 114.79 -6.80Q114.79 -6.80 114.79 -6.80Q114.10 -6.80 113.61 -6.55Q113.12 -6.30 112.87 -5.80Q112.61 -5.30 112.61 -4.60V0.00H110.51Z";   // "Certified Partner"
  const LABEL_TO = "M6.23 -0.62 4.75 -0.66 8.42 -11.50H10.71L6.60 0.00H4.16L0.05 -11.50H2.52ZM10.93 -4.30Q10.93 -5.57 11.52 -6.60Q12.12 -7.63 13.13 -8.21Q14.15 -8.79 15.40 -8.79Q16.80 -8.79 17.86 -8.16Q18.92 -7.54 19.45 -6.39Q19.98 -5.25 19.83 -3.77H11.80V-5.22H18.01L17.63 -5.05Q17.61 -5.62 17.32 -6.09Q17.04 -6.55 16.55 -6.80Q16.07 -7.05 15.46 -7.05Q14.81 -7.05 14.28 -6.76Q13.75 -6.46 13.44 -5.93Q13.13 -5.39 13.13 -4.73V-3.91Q13.13 -3.24 13.43 -2.71Q13.73 -2.17 14.26 -1.88Q14.79 -1.58 15.45 -1.58Q15.95 -1.59 16.38 -1.75Q16.80 -1.92 17.11 -2.21Q17.41 -2.50 17.53 -2.87H19.77Q19.56 -1.97 18.95 -1.27Q18.34 -0.57 17.42 -0.18Q16.50 0.21 15.41 0.20Q14.13 0.21 13.11 -0.36Q12.09 -0.94 11.51 -1.96Q10.93 -2.98 10.93 -4.30ZM17.59 -8.61H19.62V-6.72L19.21 -6.57Q19.36 -7.25 19.73 -7.75Q20.11 -8.26 20.66 -8.52Q21.20 -8.79 21.87 -8.79Q21.87 -8.79 21.87 -8.79Q21.87 -8.79 21.87 -8.79V-6.80Q21.87 -6.80 21.87 -6.80Q21.87 -6.80 21.87 -6.80Q21.18 -6.80 20.69 -6.55Q20.20 -6.30 19.94 -5.80Q19.69 -5.30 19.69 -4.60V0.00H17.59ZM24.72 -8.61H26.86V0.00H24.72ZM24.69 -11.70H26.93V-9.52H24.69ZM33.66 -11.94Q33.66 -11.94 33.66 -11.94Q33.66 -11.94 33.66 -11.94V-10.04Q33.66 -10.04 33.66 -10.04Q33.66 -10.04 33.66 -10.04Q33.12 -10.03 32.74 -9.82Q32.36 -9.60 32.16 -9.20Q31.95 -8.79 31.95 -8.24V0.00H29.82V-8.33Q29.82 -9.38 30.30 -10.19Q30.77 -11.01 31.64 -11.46Q32.50 -11.92 33.66 -11.94ZM28.45 -8.61H33.61V-6.80H28.45ZM35.98 3.50H34.43V1.66H35.67Q35.92 1.66 36.12 1.58Q36.31 1.50 36.45 1.35Q36.58 1.20 36.68 0.95Q36.70 0.90 36.72 0.87Q36.73 0.84 36.75 0.78L37.02 0.02L33.69 -8.61H36.08L38.83 -0.66H37.48L39.98 -8.61H42.27L38.72 1.47Q38.48 2.15 38.11 2.60Q37.73 3.05 37.20 3.27Q36.67 3.50 35.98 3.50ZM45.57 -4.30Q45.57 -5.60 46.15 -6.63Q46.73 -7.66 47.76 -8.23Q48.79 -8.80 50.09 -8.80Q51.41 -8.80 52.44 -8.23Q53.48 -7.66 54.05 -6.63Q54.63 -5.61 54.64 -4.30Q54.63 -3.00 54.06 -1.98Q53.48 -0.96 52.44 -0.39Q51.41 0.19 50.09 0.19Q48.79 0.19 47.76 -0.39Q46.73 -0.96 46.15 -1.98Q45.57 -3.00 45.57 -4.30ZM52.42 -4.30Q52.42 -5.05 52.13 -5.62Q51.84 -6.20 51.31 -6.52Q50.78 -6.84 50.09 -6.84Q49.41 -6.84 48.89 -6.52Q48.36 -6.20 48.07 -5.62Q47.78 -5.05 47.79 -4.30Q47.79 -3.55 48.08 -2.98Q48.37 -2.41 48.89 -2.09Q49.41 -1.77 50.09 -1.77Q50.78 -1.77 51.31 -2.09Q51.84 -2.41 52.13 -2.98Q52.42 -3.55 52.42 -4.30ZM56.00 0.00H53.86V-8.61H55.95V-6.70L55.52 -6.50Q55.65 -7.17 56.07 -7.70Q56.50 -8.23 57.13 -8.51Q57.75 -8.80 58.47 -8.80Q59.38 -8.80 60.08 -8.40Q60.77 -8.00 61.15 -7.26Q61.52 -6.52 61.52 -5.55V0.00H59.39V-5.08Q59.39 -5.62 59.19 -6.03Q58.99 -6.44 58.63 -6.65Q58.27 -6.87 57.77 -6.87Q57.27 -6.87 56.87 -6.61Q56.47 -6.34 56.23 -5.89Q56.00 -5.43 56.00 -4.86ZM65.82 -11.50H68.26L71.11 -1.09L69.73 -1.09L72.76 -11.50H74.79L78.16 -1.03L76.59 -1.05L79.40 -11.50H81.63L78.34 0.00H76.23L72.71 -10.50H74.56L71.33 0.00H69.20ZM81.35 -4.30Q81.35 -5.57 81.95 -6.60Q82.54 -7.63 83.56 -8.21Q84.57 -8.79 85.82 -8.79Q87.23 -8.79 88.29 -8.16Q89.34 -7.54 89.87 -6.39Q90.40 -5.25 90.25 -3.77H82.22V-5.22H88.43L88.05 -5.05Q88.03 -5.62 87.75 -6.09Q87.46 -6.55 86.98 -6.80Q86.49 -7.05 85.88 -7.05Q85.23 -7.05 84.70 -6.76Q84.17 -6.46 83.86 -5.93Q83.56 -5.39 83.56 -4.73V-3.91Q83.56 -3.24 83.85 -2.71Q84.15 -2.17 84.68 -1.88Q85.21 -1.58 85.87 -1.58Q86.37 -1.59 86.80 -1.75Q87.23 -1.92 87.53 -2.21Q87.83 -2.50 87.95 -2.87H90.19Q89.98 -1.97 89.38 -1.27Q88.77 -0.57 87.84 -0.18Q86.92 0.21 85.83 0.20Q84.56 0.21 83.54 -0.36Q82.52 -0.94 81.93 -1.96Q81.35 -2.98 81.35 -4.30ZM89.98 -2.12 90.48 -2.08 90.49 0.00H88.37V-11.89H90.51V-6.44H89.99Q90.10 -7.09 90.57 -7.64Q91.05 -8.18 91.75 -8.49Q92.45 -8.80 93.23 -8.80Q94.43 -8.80 95.37 -8.24Q96.32 -7.67 96.85 -6.65Q97.37 -5.62 97.37 -4.33Q97.37 -3.03 96.86 -2.01Q96.35 -0.99 95.42 -0.41Q94.48 0.16 93.30 0.16Q92.58 0.16 91.88 -0.13Q91.18 -0.43 90.67 -0.95Q90.16 -1.47 89.98 -2.12ZM95.16 -4.34Q95.16 -5.09 94.87 -5.67Q94.59 -6.25 94.06 -6.57Q93.53 -6.88 92.86 -6.88Q92.19 -6.88 91.63 -6.56Q91.08 -6.23 90.75 -5.65Q90.43 -5.07 90.44 -4.34Q90.44 -3.60 90.76 -3.02Q91.09 -2.45 91.64 -2.11Q92.20 -1.78 92.86 -1.78Q93.53 -1.78 94.06 -2.11Q94.59 -2.43 94.87 -3.01Q95.16 -3.59 95.16 -4.34ZM101.75 -11.78Q101.74 -11.78 101.74 -11.78Q101.74 -11.78 101.75 -11.78V-9.83Q101.75 -9.83 101.75 -9.83Q101.75 -9.83 101.75 -9.83Q101.74 -9.83 101.74 -9.83Q101.74 -9.83 101.75 -9.83Q101.23 -9.82 100.88 -9.61Q100.52 -9.39 100.32 -9.00Q100.12 -8.62 100.12 -8.12V0.00H97.99V-8.13Q97.99 -9.18 98.47 -10.00Q98.95 -10.83 99.81 -11.30Q100.66 -11.77 101.75 -11.78ZM96.62 -8.61H101.70V-6.80H96.62ZM104.52 0.00H102.39V-11.90H104.52ZM102.39 -11.90H104.52V-10.19H102.39ZM102.39 -1.72H104.52V0.00H102.39ZM106.29 -4.30Q106.29 -5.60 106.87 -6.63Q107.45 -7.66 108.48 -8.23Q109.51 -8.80 110.81 -8.80Q112.12 -8.80 113.16 -8.23Q114.20 -7.66 114.77 -6.63Q115.35 -5.61 115.36 -4.30Q115.35 -3.00 114.78 -1.98Q114.20 -0.96 113.16 -0.39Q112.12 0.19 110.81 0.19Q109.51 0.19 108.48 -0.39Q107.45 -0.96 106.87 -1.98Q106.29 -3.00 106.29 -4.30ZM113.14 -4.30Q113.14 -5.05 112.85 -5.62Q112.56 -6.20 112.03 -6.52Q111.50 -6.84 110.81 -6.84Q110.13 -6.84 109.61 -6.52Q109.08 -6.20 108.79 -5.62Q108.50 -5.05 108.51 -4.30Q108.51 -3.55 108.80 -2.98Q109.09 -2.41 109.61 -2.09Q110.13 -1.77 110.81 -1.77Q111.50 -1.77 112.03 -2.09Q112.56 -2.41 112.85 -2.98Q113.14 -3.55 113.14 -4.30ZM114.03 -8.61H116.41L118.56 -0.74L117.20 -0.73L119.52 -8.61H121.59L123.97 -0.73H122.52L124.67 -8.61H126.82L124.24 0.00H122.20L119.66 -7.62H121.02L118.68 0.00H116.60Z";       // "Verify on Webflow"

  // --- seal path data (verbatim from Badge.html) --------------------------
  const CB_SEAL = "M1736 3129 c6 -10 -37 -40 -48 -33 -4 3 -6 -1 -3 -8 3 -7 -15 -33 -40 -57 -25 -24 -45 -47 -45 -52 0 -5 -7 -9 -15 -9 -8 0 -15 -5 -15 -11 0 -6 -7 -9 -15 -5 -8 3 -14 0 -12 -7 1 -7 -4 -11 -11 -9 -8 1 -11 -2 -8 -6 3 -5 -2 -19 -12 -30 -16 -19 -30 -20 -195 -21 -98 0 -182 -3 -188 -6 -5 -4 -9 -82 -9 -181 0 -168 -8 -223 -31 -209 -5 4 -9 1 -9 -5 0 -6 -4 -8 -10 -5 -6 4 -7 -1 -3 -11 5 -14 3 -16 -11 -11 -10 4 -15 3 -11 -3 8 -12 -96 -121 -107 -113 -5 2 -7 -1 -6 -9 2 -7 -5 -12 -14 -12 -11 1 -14 -4 -10 -14 4 -11 1 -14 -11 -9 -11 4 -14 2 -10 -8 3 -8 -2 -17 -10 -21 -27 -10 7 -104 38 -104 6 0 20 -9 30 -20 10 -11 15 -20 10 -20 -4 0 -2 -7 5 -15 7 -8 16 -13 20 -10 8 5 61 -51 54 -58 -6 -6 64 -67 76 -67 6 0 10 -74 10 -189 l0 -188 31 -7 c17 -3 105 -6 195 -6 94 0 164 -4 164 -9 0 -15 51 -72 60 -66 4 3 13 -2 20 -10 7 -8 9 -15 5 -15 -4 0 -2 -7 5 -15 7 -8 16 -12 21 -9 5 3 13 -5 18 -18 10 -26 75 -90 106 -105 22 -11 85 9 85 26 0 13 50 71 58 68 4 -1 8 3 10 8 7 20 35 44 45 38 6 -3 7 -1 3 5 -4 7 -1 12 9 12 9 0 14 3 11 8 -7 11 16 36 47 49 15 7 27 17 27 23 0 6 64 10 180 10 136 0 182 3 185 13 3 6 6 93 7 192 2 129 6 180 15 180 12 0 28 13 28 23 0 11 58 72 63 67 10 -10 31 17 25 32 -4 11 -2 14 5 9 6 -3 16 3 22 14 6 11 15 18 21 15 5 -4 9 1 9 9 0 9 3 15 8 14 4 -1 21 12 39 30 17 17 26 32 20 32 -8 0 -7 4 1 12 18 18 15 36 -8 43 -11 3 -20 12 -20 19 0 7 -12 22 -26 32 -15 10 -30 24 -35 29 -42 50 -67 73 -81 78 -10 4 -18 13 -18 22 0 8 -6 15 -13 15 -7 0 -21 15 -32 33 -17 28 -20 56 -23 208 l-4 177 -64 7 c-35 4 -109 3 -164 -1 -86 -6 -107 -4 -140 11 -22 10 -40 23 -40 30 0 7 -12 21 -26 31 -15 10 -32 25 -38 32 -39 46 -66 71 -85 82 -13 6 -20 14 -17 17 12 13 -37 47 -69 48 -19 1 -32 -2 -29 -6z";
  const CB_CHECK = "M1940 2430 c0 -5 -6 -9 -12 -7 -7 1 -12 -6 -12 -15 1 -10 -2 -18 -7 -18 -18 0 -160 -150 -153 -162 4 -7 3 -8 -4 -4 -7 4 -12 3 -12 -3 0 -6 -12 -14 -26 -17 -19 -5 -22 -9 -12 -15 7 -5 8 -9 2 -9 -5 0 -23 14 -39 30 -16 17 -25 30 -20 30 5 0 0 6 -10 14 -11 8 -23 12 -26 10 -4 -2 -6 4 -5 13 2 25 -30 27 -53 4 -12 -12 -25 -21 -31 -21 -5 0 -10 -5 -10 -11 0 -5 -4 -8 -8 -5 -4 2 -8 -5 -7 -17 0 -14 31 -54 83 -107 45 -47 90 -93 99 -102 18 -20 33 -23 33 -8 0 6 6 10 14 10 18 0 35 21 39 51 2 13 10 24 18 25 33 2 38 5 44 24 3 11 12 20 18 20 14 0 65 53 83 87 7 13 8 26 3 32 -6 8 -5 8 3 1 7 -5 15 -10 19 -10 15 0 89 77 89 92 0 26 -11 48 -21 42 -5 -3 -9 0 -9 6 0 14 -40 49 -57 50 -7 0 -13 -4 -13 -10z";
  const CB_W = "M1080 0L735.385 673.684H411.695L555.915 394.481H549.444C430.463 548.934 252.941 650.61 -0.000976562 673.684V398.344C-0.000976562 398.344 161.812 388.787 256.938 288.776H-0.000976562V0.0053214H288.77V237.515L295.252 237.489L413.254 0.0053214H631.644V236.009L638.125 235.999L760.555 0H1080Z";
  const G = "translate(0,450) scale(0.1,-0.1)";
  const SVGNS = 'http://www.w3.org/2000/svg';

  // --- scoped CSS (badge only; namespaced; nothing leaks to the page) -----
  const CSS = [
    ".webflow_badge{--wfb-hover:#8f8f8f;min-height:100vh;display:flex;align-items:center;justify-content:center}",
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
