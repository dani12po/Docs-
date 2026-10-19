import { LOCALES, DEFAULT_LOCALE, type Locale } from '@/lib/nav';

const STORAGE_KEY = 'koramp-docs-locale';

function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/**
 * Read the locale the user previously chose. Returns null if none saved or if
 * localStorage is unavailable (e.g. private mode). Client-only — guard with a
 * try/catch when calling during render.
 */
export function getRememberedLocale(): Locale | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return isLocale(saved) ? saved : null;
  } catch {
    return null;
  }
}

/**
 * Persist the user's locale choice so the /docs auto-detection honors it on
 * the next visit. Client-only — safe to call from event handlers.
 */
export function rememberLocale(locale: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // localStorage unavailable — non-fatal; detection falls back to navigator.
  }
}

/**
 * Detect the locale from the browser's language list, ignoring any saved
 * choice. Used by the /docs entry page when no saved choice exists.
 * Client-only.
 */
export function detectLocaleFromBrowser(): Locale {
  try {
    const langs = navigator.languages ?? [navigator.language ?? ''];
    const primary = (langs[0] ?? '').toLowerCase();
    return primary.startsWith('en') ? 'en' : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}
