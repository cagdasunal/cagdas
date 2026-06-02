// sites/cagdas/scripts/src/hello.js
// Minimal IIFE so the multi-site build pipeline has a source to minify.
// Replace or delete once real cagdas page scripts exist.
(function () {
  'use strict';
  if (typeof window === 'undefined') return;
  window.__CAGDAS_HELLO__ = '1';
  console.log('[cagdas] hello.js loaded; build pipeline verified.');
}());
