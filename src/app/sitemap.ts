import type { MetadataRoute } from 'next';
import { LOCALES, getNav } from '@/lib/nav';

const BASE = 'https://docs.koramp.xyz';

/**
 * Next.js App Router sitemap — https://docs.koramp.xyz/sitemap.xml
 * Mencakup homepage, semua halaman docs (id + en).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    // Homepage docs
    {
      url: `${BASE}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];

  // Semua halaman docs per locale
  for (const locale of LOCALES) {
    const nav = getNav(locale);
    for (const group of nav) {
      for (const item of group.items) {
        // item.path sudah berbentuk /docs/id/... atau /docs/en/...
        entries.push({
          url: `${BASE}${item.path}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: locale === 'id' ? 0.8 : 0.7,
        });
      }
    }
  }

  return entries;
}
