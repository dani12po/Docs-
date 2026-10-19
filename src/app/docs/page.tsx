'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getRememberedLocale,
  detectLocaleFromBrowser,
  rememberLocale,
} from '@/lib/locale-storage';

/**
 * Client-side locale detection for the static docs site.
 *
 * Landing on /docs picks a locale by:
 *   1. a previously saved choice in localStorage, then
 *   2. the browser's primary language (en-* -> 'en', anything else -> 'id'), then
 *   3. the default locale ('id').
 *
 * Because the site is statically exported (no middleware at runtime), locale
 * detection has to happen in the browser. The chosen locale is remembered so
 * the choice sticks on future visits (and is honored by the locale switcher).
 */
export default function DocsIndex() {
  const router = useRouter();

  useEffect(() => {
    const saved = getRememberedLocale();
    const locale = saved ?? detectLocaleFromBrowser();
    if (!saved) rememberLocale(locale);
    router.replace(`/docs/${locale}/memulai/pengenalan`);
  }, [router]);

  return null;
}
