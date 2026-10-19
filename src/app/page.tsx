'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getFirstPageOfEachGroup, getNav } from '@/lib/nav';
import { detectLocaleFromBrowser } from '@/lib/locale-storage';

export default function HomePage() {
  const [locale, setLocale] = useState<'id' | 'en'>('id');

  useEffect(() => {
    setLocale(detectLocaleFromBrowser());
  }, []);

  const groups = getFirstPageOfEachGroup(locale);
  const NAV = getNav(locale);

  const isEn = locale === 'en';

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16 lg:py-24">
      <section className="max-w-3xl">
        <p className="mb-4 inline-flex items-center rounded-full border border-line bg-surface-1 px-3 py-1 text-xs font-medium text-gold">
          {isEn ? 'KORAMP Documentation' : 'Dokumentasi KORAMP'}
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-ink-primary sm:text-5xl">
          {isEn ? 'KORAMP Documentation' : 'Dokumentasi KORAMP'}
        </h1>
        <p className="mt-4 text-lg text-gold">
          {isEn
            ? 'Receive global crypto, settle in Rupiah instantly.'
            : 'Terima crypto global, settle Rupiah instan.'}
        </p>
        <p className="mt-4 leading-7 text-ink-secondary">
          {isEn
            ? 'KORAMP is a wallet-first crypto on/off-ramp with no account registration required. This site explains how the product works, integration flows, privacy model, architecture, API reference, and development roadmap.'
            : 'KORAMP adalah crypto on/off-ramp berbasis dompet (wallet-first) tanpa registrasi akun. Panduan di situs ini menjelaskan cara kerja produk, alur integrasi, model privasi, arsitektur, referensi API, dan roadmap pengembangan.'}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/docs/${locale}/memulai/pengenalan`}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-base transition-colors hover:bg-gold-hover"
          >
            {isEn ? 'Get started' : 'Mulai membaca'}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/docs/${locale}/integrasi/on-ramp-off-ramp`}
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface-1 px-4 py-2 text-sm font-medium text-ink-secondary transition-colors hover:border-line-strong hover:text-ink-primary"
          >
            On-Ramp &amp; Off-Ramp
          </Link>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide text-ink-muted">
          {isEn ? 'Explore the docs' : 'Jelajahi dokumentasi'}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map(({ label, item }) => (
            <Link
              key={label}
              href={item.path}
              className="group rounded-xl border border-line bg-surface-1 p-5 transition-colors hover:border-gold/50 hover:bg-surface-2"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                {label}
              </p>
              <p className="mt-2 text-base font-semibold text-ink-primary group-hover:text-gold">
                {item.title}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs text-gold opacity-0 transition-opacity group-hover:opacity-100">
                {isEn ? 'Open page' : 'Buka halaman'}
                <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-xl border border-line bg-surface-1 p-6">
        <h2 className="text-base font-semibold text-ink-primary">
          {isEn ? 'All sections' : 'Semua grup'}
        </h2>
        <ul className="mt-3 grid gap-1 text-sm text-ink-secondary sm:grid-cols-2">
          {NAV.map((group) => (
            <li key={group.label}>
              <Link
                href={group.items[0].path}
                className="text-gold hover:text-gold-hover"
              >
                {group.label}
              </Link>
              <span className="text-ink-muted">
                {isEn
                  ? ` — ${group.items.length} pages`
                  : ` — ${group.items.length} halaman`}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
