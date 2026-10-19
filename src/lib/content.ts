import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import GithubSlugger from 'github-slugger';

export interface TocItem {
  depth: 2 | 3;
  value: string;
  slug: string;
}

export interface DocData {
  title: string;
  description?: string;
  [key: string]: unknown;
}

export interface DocPage {
  slug: string[];
  data: DocData;
  content: string;
  toc: TocItem[];
}

const CONTENT_DIR = path.join(process.cwd(), 'content');

export const VALID_LOCALES = ['id', 'en'] as const;
export type Locale = (typeof VALID_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'id';

function cleanHeading(text: string): string {
  return text.replace(/[`*_]/g, '').trim();
}

export function extractToc(body: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  let inFence = false;

  for (const line of body.split('\n')) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{2,3})\s+(.+)$/.exec(line.trim());
    if (!match) continue;

    const value = cleanHeading(match[2]);
    if (!value) continue;
    items.push({ depth: match[1].length as 2 | 3, value, slug: slugger.slug(value) });
  }

  return items;
}

export function isLocale(value: string): value is Locale {
  return (VALID_LOCALES as readonly string[]).includes(value);
}

export function resolveContentFile(locale: string, slug: string[]): string {
  return path.join(CONTENT_DIR, locale, path.join(...slug) + '.mdx');
}

export function parsePage(locale: string, slug: string[]): DocPage {
  const rel = path.join(locale, path.join(...slug) + '.mdx');
  const filePath = resolveContentFile(locale, slug);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Konten tidak ditemukan: ${rel}`);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(raw);
  const data = parsed.data as Record<string, unknown>;

  const title = typeof data.title === 'string' ? data.title : slug[slug.length - 1];
  const description = typeof data.description === 'string' ? data.description : undefined;

  return {
    slug,
    data: { ...data, title, description } as DocData,
    content: parsed.content,
    toc: extractToc(parsed.content),
  };
}
