'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useState } from 'react';
import { ChevronRight, Search, Globe } from 'lucide-react';
import clsx from 'clsx';
import { getNav, slugFromPath, DEFAULT_LOCALE, LOCALES, type Locale } from '@/lib/nav';
import { rememberLocale } from '@/lib/locale-storage';
import { useSearch } from '@/components/search/SearchProvider';

function LocaleSwitcher({ locale, slug }: { locale: string; slug: string }) {
  const other = locale === 'en' ? 'id' : 'en';
  // Build a set of slug strings ("memulai/pengenalan") for the target locale so
  // we can keep the user on the same page when switching, or fall back.
  const targetSlugs = new Set(
    getNav(other).flatMap((g) => g.items.map((i) => slugFromPath(i.path).join('/'))),
  );
  const keep = targetSlugs.has(slug);
  const href = `/docs/${other}/${keep ? slug : 'memulai/pengenalan'}`;

  return (
    <div className="mt-3 flex items-center gap-1 rounded-lg border border-line bg-surface-1 p-1">
      <Globe className="ml-1 h-3.5 w-3.5 shrink-0 text-ink-muted" />
      {LOCALES.map((l: Locale) => {
        const isTarget = l === other;
        return (
          <Link
            key={l}
            href={isTarget ? href : '#'}
            onClick={
              isTarget
                ? () => rememberLocale(l)
                : (e) => e.preventDefault()
            }
            className={clsx(
              'flex-1 rounded-md px-2 py-1 text-center text-[11px] font-medium uppercase tracking-wide transition-colors',
              l === locale
                ? 'bg-surface-2 text-gold'
                : 'text-ink-muted hover:text-ink-primary',
            )}
          >
            {l}
          </Link>
        );
      })}
    </div>
  );
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { locale } = useParams<{ locale: string }>();
  const currentLocale = (locale as string) || DEFAULT_LOCALE;
  const NAV = getNav(currentLocale);
  const { open } = useSearch();

  const slug = pathname.replace(/^\/docs\/(id|en)\//, '');

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    NAV.forEach((group) => {
      init[group.label] = group.items.some((item) => item.path === pathname);
    });
    return init;
  });

  const toggle = (label: string) =>
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <nav className="flex flex-col gap-1">
      <button
        onClick={open}
        className="flex w-full items-center gap-2 rounded-lg border border-line bg-surface-1 px-3 py-2 text-sm text-ink-muted transition-colors hover:border-line-strong hover:text-ink-primary"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">
          {currentLocale === 'en' ? 'Search docs…' : 'Cari dokumentasi…'}
        </span>
        <kbd className="rounded border border-line bg-surface-2 px-1.5 py-0.5 text-[10px] text-ink-muted">
          ⌘K
        </kbd>
      </button>

      <LocaleSwitcher locale={currentLocale} slug={slug} />

      <div className="mt-3 space-y-4">
        {NAV.map((group) => {
          const isOpen = expanded[group.label] ?? true;
          return (
            <div key={group.label}>
              <button
                onClick={() => toggle(group.label)}
                className="flex w-full items-center gap-1 rounded px-1 py-1 text-xs font-semibold uppercase tracking-wide text-ink-muted transition-colors hover:text-ink-secondary"
              >
                <ChevronRight
                  className={clsx(
                    'h-3.5 w-3.5 transition-transform',
                    isOpen && 'rotate-90',
                  )}
                />
                {group.label}
              </button>

              {isOpen && (
                <ul className="mt-1 space-y-0.5 border-l border-line-subtle pl-2">
                  {group.items.map((item) => {
                    const active = pathname === item.path;
                    return (
                      <li key={item.path}>
                        <Link
                          href={item.path}
                          onClick={onNavigate}
                          className={clsx(
                            'block rounded border-l-2 px-2 py-1.5 text-sm transition-colors',
                            active
                              ? 'border-gold bg-surface-1 text-gold'
                              : 'border-transparent text-ink-secondary hover:bg-surface-1 hover:text-ink-primary',
                          )}
                        >
                          {item.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
