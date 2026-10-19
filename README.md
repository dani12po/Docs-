# KORAMP Docs

Situs dokumentasi untuk **KORAMP** — Crypto On/Off-Ramp IDR (wallet-first, tanpa registrasi akun). Situs ini berdiri sendiri di `e:/kiswap/docs`, terpisah dari aplikasi KORAMP utama di `e:/kiswap`. Tema gelap dengan palet KORAMP, **dua locale: `id` (default) dan `en`**.

## Stack

- **Next.js** 14.2.35 (App Router) + **React** 18.2.0 + **TypeScript** 5.3.3
- **Tailwind CSS** 3.4.0 + `@tailwindcss/typography` (prose)
- **MDX** via `next-mdx-remote/rsc` (satu route server merender MDX dari `content/`)
- **Shiki** (`rehype-pretty-code`) untuk syntax highlighting
- Semua dependency di-pin ke versi eksak (tidak ada `^`/`~`)

## i18n (multi-bahasa)

- **Locale didukung:** `id` (default) dan `en`. Struktur: `content/<locale>/<group>/<page>.mdx`, route `/docs/<locale>/...`.
- **Deteksi otomatis:** `/docs` adalah halaman client yang memilih locale dari `localStorage` (pilihan tersimpan) → `navigator.language` (`en-*` → `en`, lainnya → `id`).
- **Switcher:** tombol ID ⇄ EN di TopNav dan Sidebar; pilihan tersimpan via `rememberLocale` agar deteksi otomatis menghormatinya pada kunjutan berikutnya.
- **`<html lang>`** diperbarui per-locale oleh `LocaleSync`.
- **Pencarian** difilter per-locale (hasil hanya dari locale aktif).
- **Sumber kebenaran nav:** `src/lib/nav.ts` — `ID_NAV` dan `EN_NAV`. Untuk menambah locale baru: tambah ke `LOCALES`, buat blok nav baru, dan folder `content/<locale>/`.
- **Audit konsistensi:** `npm run audit:i18n` — memeriksa nav↔file, link internal→route, nama provider, dan folder route liar.

## Palet

| Token | Nilai |
|---|---|
| Background | `#08080A` |
| Surface | `#141416` / `#1A1A1E` / `#232326` |
| Accent (gold) | `#D4B78F` |
| Success (green) | `#22C55E` |
| Text | `#F5F5F5` / `#CFCFD4` / `#8B8B93` |

## Menjalankan

```bash
# 1. Pasang dependency
npm install

# 2. Mode pengembangan (predev membangun indeks pencarian lalu next dev)
npm run dev

# 3. Build produksi (prebuild membangun indeks pencarian lalu next build)
npm run build

# 4. Jalankan server produksi
npm start

# 5. Audit konsistensi i18n (nav↔file, link, provider, route)
npm run audit:i18n
```

Buka `http://localhost:3000`. Rute `/docs` akan mendeteksi locale dari browser (atau pilihan tersimpan) lalu mengarahkan ke `/docs/<locale>/memulai/pengenalan`.

> Catatan: bila pernah menjalankan `npm run build` lalu `npm run dev` dan menemui error `Cannot find module './vendor-chunks/@swc.js'`, hapus folder `.next` dulu lalu jalankan `npm run dev` lagi (ini masalah cache, bukan bug kode).

## Struktur

```
docs/
├─ content/            # file .mdx — content/<locale>/<group>/<page>.mdx
├─ src/
│  ├─ app/             # layout, route docs/[locale]/[[...slug]], homepage, 404
│  ├─ components/      # TopNav, Sidebar, TOC, SearchProvider/Dialog, mdx/*, ui/LocaleSync
│  └─ lib/             # nav.ts, content.ts, search.ts, typography.ts, locale-storage.ts
├─ scripts/
│  ├─ gen-search.mjs   # prebuild: bangun public/search-index.json
│  └─ audit-i18n.mjs   # audit konsistensi i18n
└─ public/             # search-index.json (di-generate)
```

`src/lib/nav.ts` adalah sumber kebenaran untuk 6 grup sidebar dan urutannya (per locale): Memulai, Integrasi, Privasi & Kepatuhan, Arsitektur, API Reference, Roadmap.
