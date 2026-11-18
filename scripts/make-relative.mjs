import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Astro emits root-absolute URLs (/catalog/, /_astro/app.js). A downloadable
 * bundle opened from file:// or a subfolder needs paths relative to each file.
 * This runs after `astro build` and rewrites only root-absolute references,
 * leaving protocol-absolute canonical/OG URLs untouched.
 */

const dist = path.resolve('dist');

async function* walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

function prefixFor(file) {
  const relativeDir = path.relative(dist, path.dirname(file));
  const depth = relativeDir.split(path.sep).filter(Boolean).length;
  return depth === 0 ? './' : '../'.repeat(depth);
}

function rewriteHtml(source, prefix) {
  return source
    .replace(/(href|src|action|poster|data-src)="\//g, `$1="${prefix}`)
    .replace(/"\/_astro\//g, `"${prefix}_astro/`)
    .replace(/'\/_astro\//g, `'${prefix}_astro/`);
}

function rewriteCss(source, prefix) {
  return source.replace(/url\(\//g, `url(${prefix}`).replace(/"\/_astro\//g, `"${prefix}_astro/`);
}

function rewriteJs(source, prefix) {
  return source
    .replace(/(["'(])\/(_astro\/|fonts\/|images\/|products\/)/g, `$1${prefix}$2`)
    .replace(/import\("\/_astro\//g, `import("${prefix}_astro/`);
}

let rewritten = 0;

for await (const file of walk(dist)) {
  const extension = path.extname(file);
  let transform;
  if (extension === '.html') transform = rewriteHtml;
  else if (extension === '.css') transform = rewriteCss;
  else if (extension === '.js') transform = rewriteJs;
  else continue;

  const original = await readFile(file, 'utf8');
  const updated = transform(original, prefixFor(file));
  if (updated !== original) {
    await writeFile(file, updated, 'utf8');
    rewritten += 1;
  }
}

console.log(`[make-relative] rewrote ${rewritten} file(s) for file:// compatibility`);
