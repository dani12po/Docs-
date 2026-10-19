import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { SearchProvider } from '@/components/search/SearchProvider';
import { TopNav } from '@/components/layout/TopNav';

export const metadata: Metadata = {
  title: {
    default: 'Dokumentasi KORAMP',
    template: '%s · KORAMP Docs',
  },
  description:
    'Dokumentasi KORAMP — Crypto On/Off-Ramp IDR, wallet-first, tanpa registrasi akun.',
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
