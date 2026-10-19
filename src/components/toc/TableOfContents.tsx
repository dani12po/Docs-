'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import type { TocItem } from '@/lib/content';

export function TableOfContents({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string>('');

  useEffect(() => {
    if (!items.length) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const headings = Array.from(
      document.querySelectorAll<HTMLElement>('article h2[id], article h3[id]'),
    );
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [items]);

  if (!items.length) return null;

  return (
    <nav className="text-sm">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
        Pada halaman ini
      </p>
      <ul className="space-y-1 border-l border-line-subtle">
        {items.map((item) => (
          <li key={item.slug}>
            <a
              href={`#${item.slug}`}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById(item.slug)
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={clsx(
                'block border-l-2 py-1 text-ink-secondary transition-colors hover:text-ink-primary',
                item.depth === 3 ? 'pl-6' : 'pl-3',
                active === item.slug ? 'border-gold text-gold' : 'border-transparent',
              )}
            >
              {item.value}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
