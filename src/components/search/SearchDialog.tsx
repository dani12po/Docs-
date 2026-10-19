'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { search, type SearchDoc } from '@/lib/search';
import { DEFAULT_LOCALE } from '@/lib/nav';
import clsx from 'clsx';

export function SearchDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [docs, setDocs] = useState<SearchDoc[] | null>(null);
  const [error, setError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Derive the active locale from the URL so search results match the user's
  // current language (e.g. /docs/en/... -> 'en'). Falls back to the default.
  const locale = useMemo(() => {
    const m = /^\/docs\/(id|en)\//.exec(pathname);
    return (m?.[1] as 'id' | 'en') ?? DEFAULT_LOCALE;
  }, [pathname]);

  const isEn = locale === 'en';

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    if (docs === null && !error) {
      fetch('/search-index.json')
        .then((res) => {
          if (!res.ok) throw new Error('gagal memuat indeks');
          return res.json();
        })
        .then((data) => {
          if (!cancelled) setDocs(data as SearchDoc[]);
        })
        .catch(() => {
          if (!cancelled) setError(true);
        });
    }
    return () => {
      cancelled = true;
    };
  }, [isOpen, docs, error]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      const timer = setTimeout(() => inputRef.current?.focus(), 10);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Filter the full index to the active locale, then score against the query.
  const results = useMemo(() => {
    if (!docs) return [];
    const localeDocs = docs.filter((d) => d.path.startsWith(`/docs/${locale}/`));
    return search(localeDocs, query);
  }, [docs, query, locale]);

  const go = (path: string) => {
    onClose();
    router.push(path);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (results[activeIndex]) go(results[activeIndex].path);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[15vh]"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-line bg-surface-2 shadow-2xl">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-ink-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={isEn ? 'Search docs…' : 'Cari dokumentasi…'}
            className="flex-1 bg-transparent text-sm text-ink-primary outline-none placeholder:text-ink-muted"
          />
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="text-ink-muted transition-colors hover:text-ink-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {error && (
            <p className="px-2 py-6 text-center text-sm text-ink-muted">
              {isEn ? 'Search is currently unavailable.' : 'Pencarian tidak tersedia saat ini.'}
            </p>
          )}
          {!error && docs === null && (
            <p className="px-2 py-6 text-center text-sm text-ink-muted">
              {isEn ? 'Loading index…' : 'Memuat indeks…'}
            </p>
          )}
          {!error && docs !== null && results.length === 0 && (
            <p className="px-2 py-6 text-center text-sm text-ink-muted">
              {isEn ? `No results for “${query}”.` : `Tidak ada hasil untuk “${query}”.`}
            </p>
          )}
          {!error && results.length > 0 && (
            <ul>
              {results.map((r, i) => (
                <li key={r.path}>
                  <button
                    onClick={() => go(r.path)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={clsx(
                      'block w-full rounded-lg px-3 py-2 text-left transition-colors',
                      i === activeIndex ? 'bg-surface-1' : '',
                    )}
                  >
                    <span className="block text-sm font-medium text-ink-primary">
                      {r.title}
                    </span>
                    <span className="block truncate text-xs text-ink-muted">
                      {r.description || r.path}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
