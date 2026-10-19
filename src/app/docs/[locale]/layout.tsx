import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { LocaleSync } from '@/components/ui/LocaleSync';

interface DocsLayoutProps {
  children: ReactNode;
  params: { locale: string };
}

export default function DocsLayout({ children, params }: DocsLayoutProps) {
  return (
    <>
      {/* Sync <html lang> client-side to the active locale segment */}
      <LocaleSync locale={params.locale} />

      <div className="mx-auto flex w-full max-w-[1400px] gap-8 px-4 py-6 lg:px-8">
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto pr-2">
            <Sidebar />
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </>
  );
}
