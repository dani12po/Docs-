import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content');
const OUT = path.join(ROOT, 'public', 'search-index.json');

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith('.mdx')) out.push(full);
  }
  return out;
}

function stripFences(text) {
  return text.replace(/```[\s\S]*?```/g, ' ');
}

function plain(text) {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .replace(/#{1,6}\s+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractHeadings(text) {
  const headings = [];
  let inFence = false;
  for (const line of text.split('\n')) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^(#{2,3})\s+(.+)$/.exec(line.trim());
    if (match) headings.push(match[2].replace(/[`*_]/g, '').trim());
  }
  return headings;
}

function main() {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });

  const files = walk(CONTENT_DIR).sort();
  const index = [];

  for (const file of files) {
    try {
      const rel = path.relative(CONTENT_DIR, file);
      // Normalisasi Windows backslash -> forward slash (review finding #1).
      const slug = rel.replace(/\\/g, '/').replace(/\.mdx$/, '');
      const raw = fs.readFileSync(file, 'utf8');
      const { data, content } = matter(raw);
      const body = stripFences(content);

      index.push({
        path: '/docs/' + slug,
        title: String(data.title ?? slug),
        description: data.description ? String(data.description) : '',
        headings: extractHeadings(content),
        excerpt: plain(body).slice(0, 300),
      });
    } catch (err) {
      console.error(`[gen-search] gagal memproses ${file}:`, err?.message ?? err);
    }
  }

  const hasBackslash = index.some((entry) => entry.path.includes('\\'));
  if (hasBackslash) {
    console.error('[gen-search] ERROR: path mengandung backslash — normalisasi gagal.');
    process.exit(1);
  }

  fs.writeFileSync(OUT, JSON.stringify(index, null, 2));
  console.log(`[gen-search] ${index.length} halaman -> ${path.relative(ROOT, OUT)}`);
}

main();
