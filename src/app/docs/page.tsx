'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { detectLocaleFromBrowser } from '@/lib/locale-storage';

/**
 * /docs — auto-redirect ke locale yang sesuai dengan bahasa browser user.
 *
 * Karena tidak ada locale switcher manual, locale ditentukan sepenuhnya
 * dari navigator.language setiap kali user mengunjungi /docs:
 *   - en-* → /docs/en/memulai/pengenalan
 *   - semua lainnya → /docs/id/memulai/pengenalan
 *
 * Tidak ada localStorage yang disimpan — setiap kunjungan fresh selalu
 * mendeteksi ulang dari bahasa browser.
 */
export default function DocsIndex() {
  const router = useRouter();

  useEffect(() => {
    const locale = detectLocaleFromBrowser();
    router.replace(`/docs/${locale}/memulai/pengenalan`);
  }, [router]);

  return null;
}
