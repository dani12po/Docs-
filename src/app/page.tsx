'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Users, Code2 } from 'lucide-react';
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

  const stats = [
    { value: 'Rp 850Jt+', label: isEn ? 'IDR Volume Processed' : 'Volume IDR Terproses' },
    { value: '12.400+', label: isEn ? 'Total Transactions' : 'Total Transaksi' },
    { value: '99,9%', label: isEn ? 'Uptime' : 'Uptime' },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16 lg:py-24">
      {/* Hero */}
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
            ? 'KORAMP is a wallet-first crypto on/off-ramp marketplace for Indonesia. No account registration — your wallet address is your identity. Buy or sell SOL, ETH, and BNB using IDR via QRIS and bank transfer.'
            : 'KORAMP adalah marketplace crypto on/off-ramp berbasis dompet (wallet-first) untuk Indonesia. Tanpa registrasi akun — alamat wallet Anda adalah identitas Anda. Beli atau jual SOL, ETH, dan BNB menggunakan IDR via QRIS dan transfer bank.'}
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
            {isEn ? 'Integration Docs' : 'Dokumentasi Integrasi'}
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="mt-12 grid grid-cols-3 gap-4 rounded-xl border border-line bg-surface-1 p-6 sm:gap-8">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-2xl font-bold text-gold sm:text-3xl">{s.value}</p>
            <p className="mt-1 text-xs text-ink-muted sm:text-sm">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Quick-start cards */}
      <section className="mt-12">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-muted">
          {isEn ? 'Quick start' : 'Mulai cepat'}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href={`/docs/${locale}/panduan-pengguna/cara-top-up`}
            className="group flex items-start gap-4 rounded-xl border border-line bg-surface-1 p-5 transition-colors hover:border-gold/50 hover:bg-surface-2"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/10">
              <Users className="h-5 w-5 text-gold" />
            </span>
            <div>
              <p className="font-semibold text-ink-primary group-hover:text-gold">
                {isEn ? 'KORAMP User' : 'Pengguna KORAMP'}
              </p>
              <p className="mt-1 text-sm text-ink-secondary">
                {isEn
                  ? 'Step-by-step guides for Top Up, Sell, and supported wallets.'
                  : 'Panduan langkah demi langkah untuk Top Up, Sell, dan wallet yang didukung.'}
              </p>
            </div>
          </Link>
          <Link
            href={`/docs/${locale}/integrasi/on-ramp-off-ramp`}
            className="group flex items-start gap-4 rounded-xl border border-line bg-surface-1 p-5 transition-colors hover:border-gold/50 hover:bg-surface-2"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/10">
              <Code2 className="h-5 w-5 text-gold" />
            </span>
            <div>
              <p className="font-semibold text-ink-primary group-hover:text-gold">
                {isEn ? 'Developer' : 'Developer'}
              </p>
              <p className="mt-1 text-sm text-ink-secondary">
                {isEn
                  ? 'API reference, transaction flows, and integration architecture.'
                  : 'Referensi API, alur transaksi, dan arsitektur integrasi.'}
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Explore docs grid */}
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

      {/* All sections */}
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

      {/* Footer note */}
      <footer className="mt-16 text-center text-xs text-ink-muted">
        docs.koramp.xyz · © 2024 KORAMP
      </footer>
    </div>
  );
}
