import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 py-24 text-center">
      <p className="text-sm font-medium text-gold">404</p>
      <h1 className="mt-2 text-3xl font-bold text-ink-primary">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-3 leading-7 text-ink-secondary">
        Halaman yang Anda cari tidak tersedia. Mungkin tautan sudah berpindah
        atau salah ketik.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-base transition-colors hover:bg-gold-hover"
        >
          Kembali ke beranda
        </Link>
        <Link
          href="/docs/memulai/pengenalan"
          className="rounded-lg border border-line bg-surface-1 px-4 py-2 text-sm font-medium text-ink-secondary transition-colors hover:border-line-strong hover:text-ink-primary"
        >
          Lihat dokumentasi
        </Link>
      </div>
    </div>
  );
}
