'use client';

import { useEffect } from 'react';

/**
 * Patches document.documentElement.lang to match the active locale.
 * Rendered inside the [locale] docs layout so the <html lang> attribute
 * stays correct when navigating between locales — without restructuring
 * the root layout into per-locale route groups.
 */
export function LocaleSync({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
