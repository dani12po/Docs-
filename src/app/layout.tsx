import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { SearchProvider } from '@/components/search/SearchProvider';
import { TopNav } from '@/components/layout/TopNav';

export const metadata: Metadata = {
  metadataBase: new URL('https://docs.koramp.xyz'),
  title: {
    default: 'Dokumentasi KORAMP',
    template: '%s · KORAMP Docs',
  },
  description:
    'Dokumentasi resmi KORAMP — platform crypto on/off-ramp IDR terpercaya. Panduan Top Up, Sell, integrasi MoonPay, API reference, dan arsitektur wallet-first.',
  keywords: [
    'KORAMP dokumentasi',
    'crypto on-ramp Indonesia',
    'crypto off-ramp Indonesia',
    'integrasi MoonPay',
    'top up crypto IDR',
    'jual crypto rupiah API',
    'wallet-first crypto',
    'SOL ETH BNB IDR',
    'KORAMP API',
    'KORAMP developer docs',
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Dokumentasi KORAMP',
    description:
      'Dokumentasi resmi KORAMP — panduan integrasi crypto on/off-ramp IDR, MoonPay widget, API reference, dan arsitektur wallet-first.',
    type: 'website',
    url: 'https://docs.koramp.xyz',
    siteName: 'KORAMP Docs',
    locale: 'id_ID',
    images: [
      {
        url: 'https://www.koramp.xyz/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KORAMP Docs — Dokumentasi Crypto On/Off-Ramp IDR',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dokumentasi KORAMP',
    description:
      'Panduan integrasi KORAMP: on-ramp, off-ramp, MoonPay widget, API reference, dan arsitektur wallet-first.',
    images: ['https://www.koramp.xyz/og-image.png'],
    site: '@korampxyz',
  },
  alternates: {
    canonical: 'https://docs.koramp.xyz',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: LocaleSync patches lang client-side per locale segment.
    <html lang="id" className="dark" suppressHydrationWarning>
      <body>
        <SearchProvider>
          <TopNav />
          {children}
        </SearchProvider>
      </body>
    </html>
  );
}
