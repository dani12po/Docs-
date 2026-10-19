'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, Search } from 'lucide-react';
import { useSearch } from '@/components/search/SearchProvider';
import { MobileDrawer } from './MobileDrawer';
import { type Locale } from '@/lib/nav';
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

  const headerLinks = [
    { label: locale === 'en' ? 'Home' : 'Beranda', href: '/' },
    { label: locale === 'en' ? 'Docs' : 'Dokumentasi', href: `/docs/${locale}/memulai/pengenalan` },
    { label: 'Roadmap', href: `/docs/${locale}/roadmap` },
  ];

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
            <a
              href="https://www.koramp.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 rounded-lg border border-gold/40 bg-gold/10 px-3 py-1.5 text-sm font-medium text-gold transition-colors hover:border-gold/70 hover:bg-gold/20"
            >
              {locale === 'en' ? 'Open App' : 'Buka App'}
            </a>
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
