'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, Search, Globe } from 'lucide-react';
import { useSearch } from '@/components/search/SearchProvider';
import { MobileDrawer } from './MobileDrawer';
import { LOCALES, type Locale, getNav, slugFromPath } from '@/lib/nav';
import { rememberLocale } from '@/lib/locale-storage';
import clsx from 'clsx';

export function TopNav() {
  const { open } = useSearch();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const m = /^\/docs\/(id|en)\/(.+)?/.exec(pathname);
  const locale = (m?.[1] as Locale) || 'id';
  const slug = m?.[2] ?? '';

  const headerLinks = [
    { label: locale === 'en' ? 'Home' : 'Beranda', href: '/' },
    { label: locale === 'en' ? 'Docs' : 'Dokumentasi', href: `/docs/${locale}/memulai/pengenalan` },
    { label: 'Roadmap', href: `/docs/${locale}/roadmap` },
  ];

  const switchLocale = (target: Locale) => {
    // Try to keep the same page when switching locales; if the page doesn't
    // exist in the target locale, fall back to that locale's first page.
    const targetSlugs = new Set(
      getNav(target).flatMap((g) => g.items.map((i) => slugFromPath(i.path).join('/'))),
    );
    const keep = targetSlugs.has(slug);
    return `/docs/${target}/${keep ? slug : 'memulai/pengenalan'}`;
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-base/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-4 px-4 lg:px-8">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Buka menu"
            className="text-ink-secondary transition-colors hover:text-ink-primary lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="text-lg font-semibold tracking-tight text-gold">
            KORAMP
          </Link>

          <button
            onClick={open}
            className="ml-2 hidden items-center gap-2 rounded-lg border border-line bg-surface-1 px-3 py-1.5 text-sm text-ink-muted transition-colors hover:border-line-strong hover:text-ink-primary sm:flex"
          >
            <Search className="h-4 w-4" />
            <span>{locale === 'en' ? 'Search…' : 'Cari…'}</span>
            <kbd className="rounded border border-line bg-surface-2 px-1.5 py-0.5 text-[10px]">
              ⌘K
            </kbd>
          </button>

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {headerLinks.map((link) => {
              const active =
                link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    'rounded-lg px-3 py-1.5 text-sm transition-colors',
                    active
                      ? 'bg-surface-1 text-gold'
                      : 'text-ink-secondary hover:bg-surface-1 hover:text-ink-primary',
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="ml-1 flex items-center gap-1 rounded-lg border border-line bg-surface-1 p-1">
              <Globe className="ml-1 h-3.5 w-3.5 text-ink-muted" />
              {LOCALES.map((l) => (
                <Link
                  key={l}
                  href={switchLocale(l)}
                  onClick={() => rememberLocale(l)}
                  className={clsx(
                    'rounded-md px-2 py-1 text-[11px] font-medium uppercase tracking-wide transition-colors',
                    l === locale ? 'bg-surface-2 text-gold' : 'text-ink-muted hover:text-ink-primary',
                  )}
                >
                  {l}
                </Link>
              ))}
            </div>
          </nav>

          <button
            onClick={open}
            aria-label="Cari"
            className="ml-auto text-ink-secondary transition-colors hover:text-ink-primary sm:hidden"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </header>

      <MobileDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
