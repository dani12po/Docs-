/**
 * Sumber kebenaran untuk sidebar docs.
 * Navigasi per locale (id = default). Dipakai oleh Sidebar,
 * generateStaticParams, dan homepage. Jika sebuah item menunjuk ke file
 * content/ yang tidak ada, `next build` gagal (diinginkan — mencegah link mati).
 */

export interface NavItem {
  title: string;
  path: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

const ID_NAV: NavGroup[] = [
  {
    label: 'Memulai',
    items: [
      { title: 'Pengenalan', path: '/docs/id/memulai/pengenalan' },
      { title: 'Quickstart', path: '/docs/id/memulai/quickstart' },
      { title: 'Konsep Inti', path: '/docs/id/memulai/konsep-inti' },
    ],
  },
  {
    label: 'Panduan Pengguna',
    items: [
      { title: 'Cara Top Up', path: '/docs/id/panduan-pengguna/cara-top-up' },
      { title: 'Cara Sell', path: '/docs/id/panduan-pengguna/cara-sell' },
      { title: 'Wallet yang Didukung', path: '/docs/id/panduan-pengguna/wallet-yang-didukung' },
    ],
  },
  {
    label: 'Integrasi',
    items: [
      { title: 'On-Ramp & Off-Ramp', path: '/docs/id/integrasi/on-ramp-off-ramp' },
      { title: 'Alur Transaksi', path: '/docs/id/integrasi/alur-transaksi' },
      { title: 'Membuat Transaksi', path: '/docs/id/integrasi/membuat-transaksi' },
      { title: 'Quote & Pricing', path: '/docs/id/integrasi/quote-pricing' },
      { title: 'Aset & Jaringan', path: '/docs/id/integrasi/aset-jaringan' },
      { title: 'MoonPay Widget', path: '/docs/id/integrasi/moonpay-widget' },
    ],
  },
  {
    label: 'Privasi & Kepatuhan',
    items: [
      { title: 'Kebijakan Privasi', path: '/docs/id/privasi-kepatuhan/kebijakan-privasi' },
      { title: 'Kepatuhan', path: '/docs/id/privasi-kepatuhan/kepatuhan' },
      { title: 'Penyaringan Dompet', path: '/docs/id/privasi-kepatuhan/penyaringan-dompet' },
      { title: 'Catatan & Audit', path: '/docs/id/privasi-kepatuhan/catatan-audit' },
    ],
  },
  {
    label: 'Arsitektur',
    items: [
      { title: 'Wallet-First', path: '/docs/id/arsitektur/wallet-first' },
      { title: 'Stack', path: '/docs/id/arsitektur/stack' },
      { title: 'Database', path: '/docs/id/arsitektur/database' },
      { title: 'Keamanan', path: '/docs/id/arsitektur/keamanan' },
    ],
  },
  {
    label: 'API Reference',
    items: [{ title: 'Overview', path: '/docs/id/api-reference' }],
  },
  {
    label: 'Roadmap',
    items: [{ title: 'Roadmap', path: '/docs/id/roadmap' }],
  },
];

const EN_NAV: NavGroup[] = [
  {
    label: 'Getting Started',
    items: [
      { title: 'Introduction', path: '/docs/en/memulai/pengenalan' },
      { title: 'Quickstart', path: '/docs/en/memulai/quickstart' },
      { title: 'Core Concepts', path: '/docs/en/memulai/konsep-inti' },
    ],
  },
  {
    label: 'User Guide',
    items: [
      { title: 'How to Top Up', path: '/docs/en/panduan-pengguna/cara-top-up' },
      { title: 'How to Sell', path: '/docs/en/panduan-pengguna/cara-sell' },
      { title: 'Supported Wallets', path: '/docs/en/panduan-pengguna/wallet-yang-didukung' },
    ],
  },
  {
    label: 'Integration',
    items: [
      { title: 'On-Ramp & Off-Ramp', path: '/docs/en/integrasi/on-ramp-off-ramp' },
      { title: 'Transaction Flow', path: '/docs/en/integrasi/alur-transaksi' },
      { title: 'Creating Transactions', path: '/docs/en/integrasi/membuat-transaksi' },
      { title: 'Quote & Pricing', path: '/docs/en/integrasi/quote-pricing' },
      { title: 'Assets & Networks', path: '/docs/en/integrasi/aset-jaringan' },
      { title: 'MoonPay Widget', path: '/docs/en/integrasi/moonpay-widget' },
    ],
  },
  {
    label: 'Privacy & Compliance',
    items: [
      { title: 'Privacy Policy', path: '/docs/en/privasi-kepatuhan/kebijakan-privasi' },
      { title: 'Compliance', path: '/docs/en/privasi-kepatuhan/kepatuhan' },
      { title: 'Wallet Screening', path: '/docs/en/privasi-kepatuhan/penyaringan-dompet' },
      { title: 'Records & Audit', path: '/docs/en/privasi-kepatuhan/catatan-audit' },
    ],
  },
  {
    label: 'Architecture',
    items: [
      { title: 'Wallet-First', path: '/docs/en/arsitektur/wallet-first' },
      { title: 'Stack', path: '/docs/en/arsitektur/stack' },
      { title: 'Database', path: '/docs/en/arsitektur/database' },
      { title: 'Security', path: '/docs/en/arsitektur/keamanan' },
    ],
  },
  {
    label: 'API Reference',
    items: [{ title: 'Overview', path: '/docs/en/api-reference' }],
  },
  {
    label: 'Roadmap',
    items: [{ title: 'Roadmap', path: '/docs/en/roadmap' }],
  },
];

export const LOCALES = ['id', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'id';

/** Alias pakai langsung — ID sebagai default (dipakai homepage tanpa locale). */
export const NAV: NavGroup[] = ID_NAV;

export function getNav(locale: string): NavGroup[] {
  return locale === 'en' ? EN_NAV : ID_NAV;
}

/** Ubah path nav ("/docs/id/foo/bar") menjadi array slug (["foo","bar"]). */
export function slugFromPath(path: string): string[] {
  return path.replace(/^\/docs\/(id|en)\//, '').split('/');
}

/** Semua slug halaman untuk locale (dipakai generateStaticParams). */
export function getAllSlugs(locale: string): string[][] {
  return getNav(locale).flatMap((g) => g.items.map((i) => slugFromPath(i.path)));
}

/** Halaman pertama tiap grup per locale (dipakai homepage). */
export function getFirstPageOfEachGroup(locale: string = DEFAULT_LOCALE): { label: string; item: NavItem }[] {
  return getNav(locale).map((g) => ({ label: g.label, item: g.items[0] }));
}
