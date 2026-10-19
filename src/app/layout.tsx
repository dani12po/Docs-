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
    'Dokumentasi resmi KORAMP — platform crypto on/off-ramp IDR terpercaya. Panduan Top Up, Sell, integrasi API, dan arsitektur wallet-first.',
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
