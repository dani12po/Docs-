// Audit: nav→file and internal-link→route consistency for all locales.
// Reads the REAL nav.ts (ID_NAV + EN_NAV) so it can't drift from the source.
// Usage: node scripts/audit-i18n.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT = path.join(ROOT, 'content');

const navSrc = fs.readFileSync(path.join(ROOT, 'src/lib/nav.ts'), 'utf8');
const idBlock = navSrc.slice(navSrc.indexOf('const ID_NAV'), navSrc.indexOf('const EN_NAV'));
const enBlock = navSrc.slice(navSrc.indexOf('const EN_NAV'), navSrc.indexOf('export const LOCALES'));
const paths = (block) => [...block.matchAll(/path:\s*'([^']+)'/g)].map((m) => m[1].replace(/^\/docs\/(id|en)\//, ''));

const NAVS = { id: paths(idBlock), en: paths(enBlock) };

let problems = 0;
const note = (msg) => { problems++; console.log('  ✗ ' + msg); };

function walkMd(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkMd(full));
    else if (e.name.endsWith('.mdx')) out.push(full);
  }
  return out;
}

// 1) nav→file existence + file→nav orphans per locale
console.log('\n[1] Nav ↔ content file consistency');
for (const locale of ['id', 'en']) {
  const navPaths = NAVS[locale];
  for (const p of navPaths) {
    const file = path.join(CONTENT, locale, p + '.mdx');
    if (!fs.existsSync(file)) note(`[${locale}] nav path '${p}' has NO file`);
  }
  const files = walkMd(path.join(CONTENT, locale)).map((f) =>
    path.relative(path.join(CONTENT, locale), f).replace(/\\/g, '/').replace(/\.mdx$/, ''));
  for (const f of files) {
    if (!navPaths.includes(f)) note(`[${locale}] content file '${f}' is NOT in nav (orphan)`);
  }
  console.log(`  · [${locale}] ${navPaths.length} nav paths, ${files.length} files`);
}

// 2) internal links in MDX → valid route
console.log('\n[2] Internal links → valid routes');
const validRoutes = new Set();
for (const locale of ['id', 'en']) for (const p of NAVS[locale]) validRoutes.add(`/docs/${locale}/${p}`);
let linkCount = 0;
for (const locale of ['id', 'en']) {
  for (const f of walkMd(path.join(CONTENT, locale))) {
    const { content } = matter(fs.readFileSync(f, 'utf8'));
    const re = /]\((\/docs\/[^)#]+)\)/g;
    let m;
    while ((m = re.exec(content)) !== null) {
      linkCount++;
      if (!validRoutes.has(m[1])) note(`${path.relative(ROOT, f)} links to ${m[1]} — NOT a valid route`);
    }
  }
}
console.log(`  · checked ${linkCount} internal links against ${validRoutes.size} routes`);

// 3) leftover provider name check
console.log('\n[3] Leftover provider names (Alchemy*)');
for (const locale of ['id', 'en']) {
  for (const f of walkMd(path.join(CONTENT, locale))) {
    const raw = fs.readFileSync(f, 'utf8');
    if (/Alchemy|alchemypay/i.test(raw)) note(`${path.relative(ROOT, f)} still mentions Alchemy*`);
  }
}
console.log('  · done');

// 4) stray legacy route folders
console.log('\n[4] Stray route folders under src/app/docs');
const docsApp = path.join(ROOT, 'src/app/docs');
for (const e of fs.readdirSync(docsApp, { withFileTypes: true })) {
  if (e.isDirectory() && e.name !== '[locale]') note(`unexpected route dir: ${e.name}`);
}
console.log('  · done');

console.log(`\n=== ${problems === 0 ? 'AUDIT PASSED ✓' : problems + ' problem(s) found'} ===\n`);
process.exit(problems === 0 ? 0 : 1);
