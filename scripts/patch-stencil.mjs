// patch-stencil.mjs
//
// Patches @stencil/core/internal/client/index.js to remove the HMR
// query-string suffix from the dynamic import template literal.
//
// Without the patch, esbuild resolves the template literal as a glob
// and emits a [WARNING] about an unmatched glob pattern.
//
// The HMR branch is dead code in production (BUILD.hotModuleReplacement = false),
// so removing the conditional suffix is safe.

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const filePath = resolve(
  'node_modules/@stencil/core/internal/client/index.js'
);

const original =
  '`./${bundleId}.entry.js${BUILD5.hotModuleReplacement && hmrVersionId ? "?s-hmr=" + hmrVersionId : ""}`';
const patched = '`${bundleId}.entry.js`';

let source = readFileSync(filePath, 'utf8');

if (source.includes(patched)) {
  console.log('patch-stencil: already applied, skipping.');
  process.exit(0);
}

if (!source.includes(original)) {
  // The file changed in a new Stencil version — skip silently rather than corrupt it.
  console.warn(
    'patch-stencil: target string not found (Stencil may have been updated). Skipping.'
  );
  process.exit(0);
}

source = source.replace(original, patched);
writeFileSync(filePath, source, 'utf8');
console.log('patch-stencil: patched @stencil/core/internal/client/index.js ✓');
