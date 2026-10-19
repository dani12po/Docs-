# Technical Design — KORAMP Docs Site

> Repo target: `E:\kiswap\docs` (saat ini kosong; hanya berisi `.agents/`). Semua pekerjaan terbatas di sini. Aplikasi KORAMP utama di `E:\kiswap` HANYA dibaca untuk referensi fakta.
> Dokumen ini adalah desain teknis (HOW). Spesifikasi (WHAT) ada di `01-requirements.md`; bila ada konflik, `01-requirements.md` menang.

## 1. Overview

Situs dokumentasi KORAMP adalah aplikasi Next.js 14 (App Router) berdiri-sendiri, single-locale Bahasa Indonesia, tema gelap dengan palet KORAMP, yang meniru struktur & tampilan Helius Docs (referensi: halaman On-Ramp/Off-Ramp). Konten ditulis sebagai file MDX di bawah `content/`, dirender oleh satu dynamic route server-component (`app/docs/[[...slug]]/page.tsx`) yang mem-parsing frontmatter, mengekstrak TOC dari heading, dan meng-compile MDX via `next-mdx-remote/rsc` dengan plugin remark/rehype (GFM, slug, autolink-heading, syntax-highlighting Shiki). Shell terdiri dari TopNav (sticky, di root layout), Sidebar kiri (driven oleh nav config bertipe-tipe, drawer di mobile), area konten tengah (rich markdown), dan TOC kanan "Pada halaman ini" dengan scroll-spy (IntersectionObserver). Search adalah dialog klien yang meng-fetch indeks JSON statis hasil prebuild (no runtime API).

Dua halaman kunci: **On-Ramp & Off-Ramp** (unggulan, meniru struktur Helius dengan konten privasi yang JUJUR ke model KORAMP — transfer on-chain bersifat PUBLIK) dan **Roadmap** (satu halaman, 4 fase dengan badge status + legenda).

## 2. Keputusan Framework — Fumadocs vs Fallback (dengan bukti empiris)

Requirement menetapkan Fumadocs sebagai jalur utama dengan fallback bila Fumadocs "tidak dapat diandalkan di environment INI". Saya memverifikasi ketersesuaian Fumadocs terhadap stack yang di-pin (Next 14.2.35 / React 18.2.0 / Tailwind 3.4) lewat `npm view` terhadap registry (Node v24.18, npm 11.16 tersedia, jaringan up). Temuan:

- **`fumadocs-ui`/`fumadocs-core` baris 14.7.7 dan 15.8.5** mendukung `next: 14.x.x || 15.x.x` dan `react: 18.x.x || 19.x.x` (shell components kompatibel). ✅
- **`fumadocs-mdx` (pipeline konten) di SEMUA versi 10.x–15.x** memerlukan `next: ^15.3.0 || ^16.0.0` dan `react: ^19.2.0`. Karena npm 7+ menolak install bila ada peer conflict, memasang `fumadocs-mdx@10+` bersama React 18.2 **akan gagal pada `npm install`** (AC-1 gagal) kecuali memakai `overrides`/`--legacy-peer-deps` — yang melanggar semangat "tidak menonaktifkan agar lolos". ❌
- Satu-satunya triple Fumadocs yang konsisten & bebas konflik untuk Next 14.2.35 adalah **baris 13.x lama**: `fumadocs-ui/core@13.4.10` + `fumadocs-mdx@10.0.2` (`next: >= 14.1.0`, `fumadocs-core: ^13.2.1`). Tetapi ini baris ~1,5+ tahun yang `source.config.ts`/loader/konvensi Tailwind-nya mendahului dokumentasi Fumadocs saat ini — risiko konfigurasi build yang tinggi (dan dokumentasi online hampir selalu membahas 14.x+/15.x, bukan 13.x).

Kesimpulan: **Fumadocs modern (yang terdokumentasi baik) tidak bisa dipakai pada Next 14.2.35/React 18.2; hanya baris 13.x lama yang bisa, dan baris itu justru membawa risiko konfigurasi build yang sulit dide-risk di tahap desain.** Ini persis kondisi "tidak dapat diandalkan di environment ini" yang diantisipasi requirement.

**Keputusan: pakai FALLBACK** — Next.js 14 App Router + `next-mdx-remote/rsc` (MDX dari string) + Tailwind 3.4 + komponen shell buatan tangan. Alasan:
1. Memakai **stack identik dengan KORAMP** (Next 14.2.35 / React 18.2.0 / TS 5.3.3 / Tailwind 3.4) yang sudah terbukti build di environment ini — menghapus seluruh risiko peer-dependency.
2. Sidebar/TOC/search buatan tangan adalah pola standar yang bisa dispesifikasi secara konkrit di desain ini; tidak ada API framework yang perlu diingat-exact.
3. `next-mdx-remote@5.0.0` meng-compile MDX dengan plugin remark/rehype yang sama persis yang dipakai Fumadocs, jadi kualitas rich-markdown (tabel, callout, code block, ordered step flow) setara.
4. Requirement secara eksplisit mengizinkan jalur ini, dan `01-requirements.md` Out-of-Scope menetapkan pemilihan jalur framework sebagai keputusan tahap desain.

Tech stack **terkunci** setelah desain ini disetujui.

## 3. Tech Stack (versi eksak, tidak ada `^`/`~`)

Verifikasi peer-dependency dilakukan terhadap registry untuk semua baris di bawah; tidak ada konflik peer dengan Next 14.2.35/React 18.2.0.

**dependencies:**
- `next`: 14.2.35
- `react`: 18.2.0
- `react-dom`: 18.2.0
- `next-mdx-remote`: 5.0.0  (peer `react >=16`; exports `./rsc`; membawa `@mdx-js/mdx@^3.0.1` + `@mdx-js/react@^3.0.1` sebagai dep — tidak perlu menambah @next/mdx/@mdx-js/loader)
- `gray-matter`: 4.0.3  (parsing frontmatter di route + di script prebuild)
- `github-slugger`: 2.0.0  (slug heading untuk TOC; **versi sama dengan dep `rehype-slug@6` `github-slugger@^2.0.0`** → slug TOC = slug heading, parity terjamin)
- `remark-gfm`: 4.0.1  (tabel, strikethrough, autolink, task list)
- `rehype-slug`: 6.0.0  (id heading)
- `rehype-autolink-headings`: 7.1.0  (anchor `#` pada heading, behavior `wrap`)
- `rehype-pretty-code`: 0.14.5  (syntax highlighting via Shiki; peer shiki `^1||^2||^3||^4`)
- `shiki`: 4.5.0  (versi yang dipakai rehype-pretty-code 0.14.5 di devDeps-nya `shiki ^4.0.1`)
- `clsx`: 2.1.1
- `lucide-react`: 0.303.0  (ikon; peer `react ^18` — dipilih supaya sama persis dengan KORAMP yang terbukti build)

**devDependencies:**
- `typescript`: 5.3.3
- `@types/node`: 20.10.5
- `@types/react`: 18.2.46
- `@types/react-dom`: 18.2.18
- `tailwindcss`: 3.4.19
- `@tailwindcss/typography`: 0.5.20  (plugin `prose`; peer `tailwindcss >=3`)
- `postcss`: 8.4.32
- `autoprefixer`: 10.4.16
- `eslint`: 8.56.0
- `eslint-config-next`: 14.2.35

> Catatan: `next-mdx-remote` membawa `@mdx-js/mdx` & `@mdx-js/react` sebagai dep-nya sendiri; jangan tambahkan `@next/mdx`/`@mdx-js/loader` (tidak dipakai dan bisa menimbulkan dua pipeline MDX).

## 4. Struktur Proyek & File

```
E:\kiswap\docs\
├─ package.json
├─ next.config.mjs
├─ tsconfig.json
├─ tailwind.config.ts
├─ postcss.config.cjs
├─ .eslintrc.json
├─ next-env.d.ts            (di-generate `next build`; jangan commit manual)
├─ README.md
├─ .gitignore
├─ scripts/
│  └─ gen-search.mjs         (prebuild: bangun public/search-index.json dari content/)
├─ public/
│  └─ search-index.json     (di-generate prebuild; di-fetch klien)
├─ content/                 (file .mdx; satu file = satu halaman)
│  ├─ memulai/{pengenalan,quickstart,konsep-inti}.mdx
│  ├─ integrasi/{on-ramp-off-ramp,alur-transaksi,quote-pricing,aset-jaringan}.mdx
│  ├─ privasi-kepatuhan/{kebijakan-privasi,kepatuhan,penyaringan-dompet,catatan-audit}.mdx
│  ├─ arsitektur/{wallet-first,stack,database,keamanan,admin}.mdx
│  ├─ api-reference.mdx
│  └─ roadmap.mdx
└─ src/
   ├─ app/
   │  ├─ globals.css        (@import font + tailwind + :root palette + base)
   │  ├─ layout.tsx         (root: <html lang="id" class="dark">, body, TopNav, {children})
   │  ├─ page.tsx           (homepage/landing, server)
   │  ├─ not-found.tsx      (404 kustom, server)
   │  ├─ docs/
   │  │  ├─ layout.tsx      (shell docs: Sidebar + main slot)
   │  │  └─ [[...slug]]/page.tsx  (renderer MDX + TOC; generateStaticParams)
   │  └─ sitemap.ts         (opsional; bila dibuat, link semua /docs/*)
   ├─ lib/
   │  ├─ nav.ts             (sumber kebenaran grup+urutan+judul+path sidebar)
   │  ├─ content.ts         (server-only: resolve slug→file, frontmatter, TOC, body)
   │  ├─ search.ts           (client: skor pencarian in-memory)
   │  └─ typography.ts      (ekspor mdxComponents map + plugin lists)
   └─ components/
      ├─ layout/TopNav.tsx        (client: sticky, logo, search trigger, header links)
      ├─ layout/Sidebar.tsx       (client: grup collapsible, active highlight, search box)
      ├─ layout/MobileDrawer.tsx  (client: hamburger → drawer di <lg)
      ├─ toc/TableOfContents.tsx  (client: render TOC + scroll-spy IntersectionObserver)
      ├─ search/SearchDialog.tsx  (client: dialog + fetch /search-index.json + keyboard nav)
      ├─ mdx/Callout.tsx          (client: admonition info/warning/success/danger)
      ├─ mdx/Pre.tsx              (client: wrapper code block + tombol copy + label bahasa)
      ├─ mdx/CodeInline.tsx       (inline code styling)
      ├─ mdx/mdxComponents.tsx    (map elemen → komponen; dipakai <MDXRemote components=...>)
      └─ ui/Badge.tsx             (badge status roadmap: Sudah Ship/Aktif/Direncanakan/Masa Depan)
```

File `content/` TIDAK di-include di `tsconfig.json` (bukan TS) sehingga `tsc` tidak memeriksanya; pipeline MDX dipisah dari type-check. Ini menghilangkan seluruh kelas type-error dari konten MDX.

## 5. Model Konten & Pipeline MDX

Setiap halaman adalah satu file `.mdx` di `content/` dengan frontmatter:

```yaml
---
title: "On-Ramp & Off-Ramp"      # wajib; jadi H1 halaman + judul nav/search
description: "..."               # opsional; meta description + hasil search
---
```

**Aturan penulisan (invariant konten):** H1 TIDAK ditulis di body MDX; halaman merender `<h1>{frontmatter.title}</h1>` dari route, sehingga body dimulai dari `##` (H2) untuk seksi, dan `###` (H3) untuk sub-seksi. Ini menjamin **tepat satu H1 per halaman** (FR-7.3) dan TOC bersih dari H2/H3.

**Pipeline render** (`src/app/docs/[[...slug]]/page.tsx`, server component):
1. `generateStaticParams()` membaca `src/lib/nav.ts` (sumber kebenaran halaman) → emit slug array per halaman. `dynamicParams = false` → slug tak dikenal = 404.
2. Untuk slug kosong (`/docs`): `redirect('/docs/memulai/pengenalan')` (302).
3. Resolve `slug` → path file `content/<slug-joined>.mdx` via `src/lib/content.ts`.
4. `gray-matter` parse → `{ data: frontmatter, content: body }`.
5. Ekstrak TOC dari `body` mentah (lihat §6) → `toc: {depth, value, slug}[]` (H2/H3).
6. `MDXRemote` dari `next-mdx-remote/rsc` compile `body` dengan `mdxOptions`:
   - `remarkPlugins: [remarkGfm]`
   - `rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior:'wrap' }], [rehypePrettyCode, { theme:'github-dark-dimmed', keepBackground:true }]]`
   - `components: mdxComponents` (map elemen + komponen kustom `Callout`)
7. Render: `<article class="prose ...">{h1}{mdx}</article>` + `<TableOfContents items={toc}/>`.

**`mdxComponents` (`src/components/mdx/mdxComponents.tsx`)** memetakan: `a` (target+rel, gold hover), `table/thead/tbody/tr/th/td` (border line, surface header), `blockquote` (callout-like), `ul/ol/li` (ol pakai CSS counter untuk tampilan step-flow bernomor), `code` inline, `pre` → `<Pre>` (copy button + label bahasa dari `data-language` Shiki), `h2/h3` (margin + scroll-margin-top agar anchor tidak tertutup TopNav sticky). Komponen kustom yang bisa dipakai langsung di MDX: `<Callout type="info|warning|success|danger" title="...">`, dan grid bungkus untuk dua tabel berdampingan (`<div className="not-prose grid gap-6 md:grid-cols-2">`).

**Mengapa `next-mdx-remote/rsc` bukan `@next/mdx` app-dir pages:** `@next/mdx` menjadikan `.mdx` sebagai halaman/route yang sulit diekstrak TOC-nya tanpa plugin estree yang rapuh. `next-mdx-remote` merender MDX dari string di satu route terpusat, memberi kontrol penuh atas frontmatter, TOC, dan komponen — dan TOC diekstrak dari sumber mentah (sederhana, deterministik untuk konten yang kita kuasai).

## 6. Navigasi — nav config, Sidebar, TOC

### Nav config (`src/lib/nav.ts`) — sumber kebenaran
Array bertipe-tipe `NavGroup[]`. Tiap grup: `{ label: string, items: NavItem[] }`. Tiap item: `{ title: string, path: string }` (path = `/docs/<slug>`). Urutan grup **persis** 6: Memulai, Integrasi, Privasi & Kepatuhan, Arsitektur, API Reference, Roadmap. `generateStaticParams` dan halaman depan memakai config ini; jika sebuah item menunjuk ke file `content/` yang tidak ada, `next build` gagal (diinginkan — mencegah link mati). Mapping judul/path:

| Grup | Item (judul → path) |
|---|---|
| Memulai | Pengenalan → /docs/memulai/pengenalan; Quickstart → /docs/memulai/quickstart; Konsep Inti → /docs/memulai/konsep-inti |
| Integrasi | On-Ramp & Off-Ramp → /docs/integrasi/on-ramp-off-ramp; Alur Transaksi → /docs/integrasi/alur-transaksi; Quote & Pricing → /docs/integrasi/quote-pricing; Aset & Jaringan → /docs/integrasi/aset-jaringan |
| Privasi & Kepatuhan | Kebijakan Privasi → /docs/privasi-kepatuhan/kebijakan-privasi; Kepatuhan → /docs/privasi-kepatuhan/kepatuhan; Penyaringan Dompet → /docs/privasi-kepatuhan/penyaringan-dompet; Catatan & Audit → /docs/privasi-kepatuhan/catatan-audit |
| Arsitektur | Wallet-First → /docs/arsitektur/wallet-first; Stack → /docs/arsitektur/stack; Database → /docs/arsitektur/database; Keamanan → /docs/arsitektur/keamanan; Admin → /docs/arsitektur/admin |
| API Reference | Overview → /docs/api-reference |
| Roadmap | Roadmap → /docs/roadmap |

### Sidebar (`src/components/layout/Sidebar.tsx`, client)
- Render grup sebagai blok ber-label (label grup = `uppercase tracking-wide text-ink-muted`), item sebagai link `next/link`.
- Active state: pakai `usePathname()`; item aktif jika `pathname === item.path` (exact match); gaya `text-gold border-l-2 border-gold bg-surface-1`.
- Search box di atas: input yang membuka `SearchDialog` (shared state via prop callback `onOpenSearch`); di mobile, sidebar adalah drawer (lihat `MobileDrawer`).
- Grup collapsible opsional; default expand grup yang mengandung halaman aktif.

### TOC "Pada halaman ini" (`src/components/toc/TableOfContents.tsx`, client)
- Props: `items: { depth:2|3, value:string, slug:string }[]` dari route.
- Render daftar nested (H2 indent-0, H3 indent). Sembunyi seluruhnya jika `items` kosong.
- Scroll-spy: `IntersectionObserver` atas semua `h2/h3[id]` di `<article>`; kelas aktif pada item TOC yang sesuai `id`. `rootMargin: '-80px 0px -70% 0px'` agar heading yang baru masuk viewport bawah jadi aktif. Klik item → smooth-scroll ke `#slug` (CSS `scroll-behavior:smooth` + `scroll-margin-top` di heading agar tidak tertutup sticky nav).
- Disembunyikan di layar kecil (`hidden lg:block`).

### Ekstraksi TOC (`src/lib/content.ts`)
Regex atas body mentah (frontmatter sudah dibuang oleh gray-matter): untuk setiap baris yang cocok `^(#{2,3})\s+(.+)$` DAN tidak berada di dalam fenced code block (track ```` ``` ```` toggle), catat `{ depth, value: trim(text) }`. Slug via `new GithubSlugger().slug(value)`. Karena `rehype-slug@6` memakai `github-slugger@^2` dan kita pin `github-slugger@2.0.0`, slug TOC identik dengan `id` heading yang dirender. **Invariant slug dimiliki bersama oleh content.ts (TOC) dan rehype-slug (heading id); parity dijamin oleh versi github-slugger yang sama.** (Fallback bila ditemukan mismatch saat implementasi: jalankan pipeline unified terpisah dengan rehype-slug+collector untuk mendapatkan slug yang sama persis — dicatat sebagai opsi, bukan default, karena regex cukup untuk konten terkontrol.)

## 7. Shell Layout

- **Root layout** (`src/app/layout.tsx`, server): `<html lang="id" class="dark">`, `<body class="bg-base text-ink-primary ...">`, font via CSS `@import` (lihat §8), render `<TopNav/>` lalu `{children}`. TopNav tampil di SEMUA halaman (homepage + docs), mengikuti pola docs-site.
- **Docs layout** (`src/app/docs/layout.tsx`, server): kontainer `max-w-[1400px] mx-auto` berisi flex: `<Sidebar/>` (lebar fixed `w-72`, `hidden` di `<lg`, drawer via `MobileDrawer`) + `<main class="flex-1 min-w-0">{children}</main>`. `children` adalah halaman (article + TOC).
- **Halaman** (`app/docs/[[...slug]]/page.tsx`): di dalam `<main>`, grid `lg:grid-cols-[minmax(0,1fr)_220px] gap-10`: `<article class="prose prose-invert ...">` + `<aside class="hidden lg:block"><TableOfContents items={toc}/></aside>`.
- **TopNav** (`src/components/layout/TopNav.tsx`, client): sticky `top-0 z-50 bg-base/80 backdrop-blur border-b border-line`. Kiri: logo wordmark "KORAMP" (`text-gold font-semibold tracking-tight`, link ke `/`). Tengah/kiri setelah logo: tombol search (icon `Search` lucide + teks "Cari…", shortcut `⌘/Ctrl+K`) membuka `SearchDialog`. Kanan: link header (mis. "GitHub" placeholder `#`, "Beranda" → `/`). Mobile: tombol hamburger (`Menu` icon) toggle `MobileDrawer`.
- **MobileDrawer** (`src/components/layout/MobileDrawer.tsx`, client): overlay + panel kiri berisi Sidebar; tutup saat klik link atau overlay; fokus-trap sederhana.

## 8. Tema & Palet

**Font** (mirip KORAMP, hindari `next/font/google` yang fetch saat build): di awal `src/app/globals.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap');
```
`@import` di-resolve browser saat runtime (bukan fetch build), jadi build tidak gagal karena font. Body `font-family: 'Inter', system-ui, sans-serif`; code `font-family: 'JetBrains Mono', monospace`.

**`tailwind.config.ts`** — extend colors (pas palet AC-7; nilai `secondary`/`muted` disesuaikan ke requirement `#CFCFD4`/`#8B8B93`):
```ts
colors: {
  base: '#08080A',
  surface: { 1:'#141416', 2:'#1A1A1E', 3:'#232326' },
  line:   { subtle:'#232326', DEFAULT:'#2A2A2E', strong:'#333338' },
  gold:   { DEFAULT:'#D4B78F', hover:'#E2C9A5' },
  green:  '#22C55E',
  ink:    { primary:'#F5F5F5', secondary:'#CFCFD4', muted:'#8B8B93', disabled:'#5A5A60' },
},
plugins: [require('@tailwindcss/typography')],
darkMode: 'class',  // <html class="dark"> hard-aktif
```
> Catatan deviasi dari tailwind.config.ts KORAMP: di KORAMP `ink.secondary=#8B8B93`. Requirement AC-7 menetapkan `text #F5F5F5 / #CFCFD4 / #8B8B93`; agar persis, di docs ini `ink.secondary=#CFCFD4` dan `ink.muted=#8B8B93`. Ini sengaja dan memenuhi AC-7.

**`globals.css`** juga mendefinisikan `:root` CSS variables (sama dengan KORAMP) untuk pemakaian langsung bila perlu, plus `@layer base` (`html { scroll-behavior:smooth }`, `body { @apply bg-base text-ink-primary }`, `::selection { background: rgba(212,183,143,.25) }`).

**Prose (rich markdown):** `<article class="prose prose-invert max-w-none">` + override `--tw-prose-*` di `@layer components` agar teks `ink-primary`, heading `ink-primary`, link `gold`, border tabel `line`, code block background `surface-1`. Tabel: `th` `bg-surface-1 text-ink-secondary border-b border-line`, `td` `border-b border-line-subtle`. Ordered list: `list-none` + CSS `counter-reset`/`counter-increment` + `::before` menampilkan angka dalam badge bulat `bg-gold/10 text-gold` untuk tampilan step-flow bernomor (meniru Helius).

## 9. Homepage & 404

- **Homepage** (`src/app/page.tsx`, server): hero `bg-base` dengan judul "Dokumentasi KORAMP", tagline "Terima crypto global, settle Rupiah instan", paragraf intro singkat, dan grid 6 kartu (satu per grup sidebar) yang menautkan ke halaman pertama tiap grup. Tidak ada Sidebar (hanya TopNav dari root layout). Konten statis (RSC).
- **404** (`src/app/not-found.tsx`, server): tema gelap, judul "404 — Halaman tidak ditemukan", deskripsi, tombol "Kembali ke beranda" (`/`) dan "Lihat dokumentasi" (`/docs/memulai/pengenalan`). `next/link`.

## 10. Search sisi-klien (no runtime API)

- **Indeks** (`scripts/gen-search.mjs`, Node ESM, dijalankan `predev`/`prebuild`): walk `content/**/*.mdx`; per file: `import matter from 'gray-matter'` → `title`/`description`; strip code fences; ekstrak heading H2/H3 (regex sama §6) + excerpt teks polos (~300 char pertama body tanpa heading/markdown). Output `public/search-index.json`: `[{ path, title, description, headings[], excerpt }]`. `path = '/docs/' + relpathWithoutExt` (path-separator `/`). Skrip pure `fs`+regex+`gray-matter`, try/catch per file, menulis `[]` bila kosong — tidak bisa crash build kecuali disk gagal.
- **`package.json` scripts:** `"predev":"node scripts/gen-search.mjs"`, `"dev":"next dev"`, `"prebuild":"node scripts/gen-search.mjs"`, `"build":"next build"`, `"start":"next start"`, `"lint":"next lint"`.
- **SearchDialog** (`src/components/search/SearchDialog.tsx`, client): dibuka dari TopNav (⌘/Ctrl+K) dan Sidebar box. Pada open pertama: `fetch('/search-index.json')` (cache di ref). Skor in-memory (`src/lib/search.ts`): token-match pada `title` (bobot tertinggi), `headings`, lalu `description`/`excerpt`; substring case-insensitive; hasil top-N (≤8). Keyboard: ↑↓ navigasi, Enter buka (`router.push`), Esc tutup. Klik hasil → buka. Gaya: dialog terpusat `bg-surface-2 border border-line`, item aktif `bg-surface-1`. Bila fetch gagal: tampilkan "Pencarian tidak tersedia saat ini" (recoverable, non-fatal; `console.warn`).

## 11. Halaman Unggulan On-Ramp & Off-Ramp (`content/integrasi/on-ramp-off-ramp.mdx`)

Meniru struktur referensi Helius, **dijujurkan ke model privasi nyata KORAMP**. Frontmatter `title: "On-Ramp & Off-Ramp"`. Body (seksi H2/H3), persis urutan:

1. **Intro** (`## Pengenalan`): untuk siapa (developer yang mengintegrasikan ramp IDR⇄crypto) + apa yang dilakukan panduan. Paragraf.
2. **Dua tabel visibility berdampingan** (`## Visibilitas Bidang`): dibungkus `<div class="not-prose grid gap-6 md:grid-cols-2">`. Tiap tabel `Bidang | Visibilitas | Alasan`, baris: Pembayaran IDR (QRIS), Aset, Jumlah, Pengirim, Penerima, Memo (opsional).
   - **Konten JUJUR KORAMP** (bukan model Helius): pengirim, penerima, DAN jumlah **terlihat on-chain** (KORAMP memakai transfer on-chain PUBLIK). Privasi datang dari: tanpa akun, alamat dompet = identitas, tampilan ter-mask di ledger publik (mis. `0x1234…abcd`), dan **hanya 4 digit akhir rekening bank** ditampilkan. Kolom "Visibilitas" jujur: `Pengirim`/`Penerima`/`Jumlah` = "Terlihat di on-chain"; `Pembayaran IDR (QRIS)` = "Terlihat via Xendit (pihak ketiga)"; `Memo` = "Opsional, terlihat on-chain bila diisi". Tidak ada klaim "terenkripsi"/"private balance".
3. **"Anda memerlukan"** (`## Anda memerlukan`): ordered list persyaratan (dompet EVM/Solana, asset supported di testnet, jumlah min/max IDR dari FeeConfig, dsb.).
4. **"Aset dan Inventaris"** (`## Aset dan Inventaris`): numbered steps (ol step-flow) menjelaskan SOL (Solana Devnet), ETH (Base Sepolia, chain 84532), BNB (BSC Testnet, chain 97) + cara mendaftar/aktif.
5. **"Pertimbangan Kepatuhan"** (`## Pertimbangan Kepatuhan`) dengan sub-bagian + sub-tabel:
   - `### Informasi yang Dapat Anda Lihat` (tabel: apa terlihat on-chain vs off-chain; mask wallet + last-4 bank).
   - `### Penyaringan Dompet` (apa yang KORAMP lakukan/lakukan hari ini — jujur; lihat §13/§Penyaringan Dompet).
   - `### Travel Rule` (model wallet-first tanpa KYC: apa yang tidak ada; diadaptasi, bukan mengklaim compliance penuh).
6. **"Petakan Alur yang Sudah Ada"** (`## Petakan Alur yang Sudah Ada`): tabel `Langkah eksisting | Langkah KORAMP` (mis. "Kirim fiat" → "Bayar QRIS via Xendit Payments v3"; "Terima crypto" → "Crypto dikirim ke dompet tujuan"; "Jual crypto" → "Kirim ke deposit address platform → payout IDR ke bank via Xendit Payout v3").
7. **"Catatan dan Audit"** (`## Catatan dan Audit`): paragraf + tabel `AuditLog`, `LedgerEntry` (double-entry), idempotensi webhook `XenditWebhook` (`@@unique([kind,event,paymentRequestId,payoutId])`).
8. **"Alur Transaksi"** (`## Alur Transaksi`): dua sub-alur bernomor:
   - `### 1. On-Ramp` (numbered steps: quote TOP_UP → POST /orders/topup → bayar QRIS → webhook Xendit → crypto withdrawal ke dompet → COMPLETED).
   - `### 2. Off-Ramp` (numbered steps: quote SELL → POST /orders/sell → deposit address → kirim crypto → cron scan-deposits/confirmations → payout IDR via Xendit Payout v3 → COMPLETED).
9. **CTA "Mulai Integrasi"** (`## Mulai Integrasi`): paragraf + callout `<Callout type="info" title="Mulai Integrasi">` berisi link ke `/docs/integrasi/alur-transaksi` dan `/docs/api-reference`.

**Invariant privasi (dimiliki halaman ini):** tidak boleh ada frasa "saldo terenkripsi", "private balance", atau model privasi on-chain Helius. Implementer harus menjaga ini saat menulis konten (AC-5 larangan).

## 12. Halaman Roadmap (`content/roadmap.mdx`)

Frontmatter `title: "Roadmap"`. Body:
- `## Legenda` di atas: jelaskan 4 badge via komponen `<Badge>` (`src/components/ui/Badge.tsx`): `Sudah Ship` (hijau `#22C55E`), `Aktif` (gold `#D4B78F`), `Direncanakan` (muted `#8B8B93`/bordered), `Masa Depan` (outline dashed).
- `## Fase 1 — MVP` + `<Badge status="shipped">Sudah Ship</Badge>`: paragraf + bullet (lihat FR-4.18). Item: Top Up QRIS (Xendit Payments v3); Sell deposit→payout (Xendit Payout v3); SOL/ETH/BNB testnet; locked-pricing quotes; progressive IP ban + Redis rate limiting; admin access key + TOTP; support tickets; privacy-preserving page analytics; double-entry ledger + audit log.
- `## Fase 2 — Aktif` + `<Badge status="active">Aktif</Badge>`: paragraf + bullet: reward eligibility/progress/claim reservation; **payout DRY-RUN saja** (tanpa akses treasury on-chain, tanpa signing, klaim tetap `PENDING_PAYOUT`); kualifikasi siklus bulanan; anti-fraud review; terms versioning (`termsVersion '2026-09-v1'`).
- `## Fase 3 — Direncanakan` + `<Badge status="planned">Direncanakan</Badge>`: payout on-chain live (broadcast tx nyata, tracking `confirmations`/`requiredConfirmations`); mainnet (Solana Mainnet, Base Mainnet, BSC Mainnet); aset tambahan (USDC/USDT); penguatan keandalan webhook.
- `## Fase 4 — Masa Depan` + `<Badge status="future">Masa Depan</Badge>`: compliance/AML/Travel-Rule tooling; API merchant/hosted-checkout; fiat rail tambahan; payout rail diperluas; docs multi-bahasa; SDK publik.

Tiap fase: paragraf pendek + bullet dengan indikator status (✓ untuk sudah/aktif, ○ untuk direncanakan/masa depan). Badge `Badge` menerima `status: 'shipped'|'active'|'planned'|'future'` dan merender label + warna sesuai.

## 13. API Reference — akurasi endpoint (`content/api-reference.mdx`)

Halaman **overview grup** (bukan per-endpoint deep). Tanda tangan (method + path) akurat terhadap handler nyata di `E:\kiswap\src\app\api\` (diekstrak dengan grep method exports). Setiap grup: paragraf deskripsi + tabel `Method | Endpoint | Catatan`. Grup persis 13 sesuai FR-4.17:

- **/quotes** — `POST /quotes/topup`, `POST /quotes/sell`. Body `{asset, network, idrAmount}`. Rate-limited 30/min, ban-gated. Membuat `Quote` dengan locked pricing; konsumsi atomik via `usedAt`.
- **/orders** — `POST /orders/topup` (201/202; membuat TopUpOrder + Xendit QRIS PaymentRequest), `POST /orders/sell` (membuat SellOrder + deposit address + bank payout per-transaksi). `GET /orders/[publicId]` (detail by public id). Sub-aksi polling/submit: `GET|POST /orders/[publicId]/payment-status`, `GET /orders/[publicId]/payout-status`, `POST /orders/[publicId]/check-delivery`, `POST /orders/[publicId]/confirmed-sent`, `POST /orders/[publicId]/poll-deposit`, `POST /orders/[publicId]/submit-tx`. Rate-limited 10/min, ban-gated, validasi wallet/network/asset.
- **/payments** — **TIDAK ada endpoint publik `/payments` terpisah.** Objek `Payment` (Xendit QRIS, `providerOrderId` `pr-...`, `qrPayload`) dibuat server-side di dalam `POST /orders/topup`; status diakses via `/orders/[publicId]/payment-status`. Nyatakan ini jujur (FR-4.17 melarang mengarang signature).
- **/prices** — `GET /prices`. Papan kurs indikatif publik (SOL/ETH/BNB live + spot + limit IDR). Read-only.
- **/assets** — `GET /assets`. Daftar aset+network aktif. Cache 60s.
- **/wallets** — `POST /wallets/validate` (validasi kombinasi address/network/asset), `POST /wallets/challenge` (nonce proof-of-ownership), `POST /wallets/verify` (verifikasi signature), `POST /wallets/signature`, `GET /wallets/[address]/orders` (riwayat order dompet — wallet-first).
- **/rewards** — `GET /rewards?wallet=` (progress/eligibility; `payoutActive:false`), `POST /rewards/claim` (reservasi klaim; Phase 2 = `PENDING_PAYOUT`).
- **/support** — `GET|POST /support` (list/submit tiket; wallet-auth via signature; WAJIB referensi order), `GET /support/[publicId]`, `GET|POST /support/[publicId]/messages`.
- **/transactions** — `GET /transactions`. **Ledger publik global** KORAMP; wallet ter-mask (`0x1234…abcd`), pagination server-side, filter `side/asset/network/status/q`. DTO aman (tidak expose payment/bank/provider).
- **/webhooks** — `POST /webhooks/xendit/payment` (auth `x-callback-token` = `XENDIT_WEBHOOK_TOKEN`; idempoten via `XenditWebhook @@unique([kind,event,paymentRequestId,payoutId])`), `POST /webhooks/xendit/payout`. Signal-only; fulfillment server-side.
- **/cron** — `GET /cron/scan-deposits`, `GET /cron/reconcile` (auth `CRON_SECRET` bearer; dipanggil scheduler, bukan browser).
- **/visits** — `POST /visits`. Beacon privacy-preserving (path + UTC day only; tidak ada IP/UA/fingerprint; allowlist path).
- **/admin** — `POST /admin/login` (access key 64-hex + TOTP; session cookie), `POST /admin/logout`, `GET /admin/session`, plus kelompok manajemen: fees (`GET /admin/fees`, `PUT /admin/fees/bulk`, `PUT /admin/fees/[key]`), prices (`GET|POST /admin/prices`), keys (`GET|POST /admin/keys`), orders (`GET /admin/orders/topup`, `GET /admin/orders/sell`, `POST /admin/orders/sell/[id]/confirm-crypto`, `POST /admin/orders/sell/[id]/confirm-payout`), rewards (`GET|PUT /admin/rewards`, `PATCH /admin/rewards/claims/[publicId]`, `POST .../payout`, `POST .../payout-test`, `POST .../reconcile`), security (`GET /admin/security/events`, `GET|POST|PATCH|DELETE /admin/security/bans`), settings (`GET /admin/settings`, `PUT /admin/settings/[key]`), stats (`GET /admin/stats`, `GET /admin/stats/timeseries`), support (`GET /admin/support`, `GET|PATCH /admin/support/[id]`, `GET|POST /admin/support/[id]/messages`), wallets (`GET /admin/wallets/balance`), health (`GET /admin/health/xendit`). Satu kredensial access key (tanpa email/password/hierarki peran).

Semua nama field di atas diverifikasi terhadap `schema.prisma` (mis. `TopUpOrder.publicId`, `Quote.usedAt`, `XenditWebhook`, `RewardClaim.status`, `AdminAccessKey.keyVerifier`).

## 14. Edge Cases

- **Slug dengan banyak segmen vs satu segmen** — `['memulai','pengenalan']` dan `['roadmap']` keduanya di-resolve oleh join dengan `/` + cari `content/<joined>.mdx`. Uniform.
- **`/docs` tanpa slug** — `[[...slug]]` memberikan `slug=undefined`; route `redirect()` ke halaman pertama (302).
- **Heading dengan karakter khusus / duplikat** — github-slugger menangani dedup (suffix `-1`) dan karakter; TOC (regex+slugger) dan heading (rehype-slug+slugger) konsisten.
- **Heading di dalam code block** — regex TOC melewati baris di dalam ```` ``` ```` (toggle fence), sehingga `# di dalam kode` tidak masuk TOC.
- **Halaman tanpa H2/H3** — TOC menyembunyikan diri; grid page tetap utuh (aside kosong).
- **Search index belum ada saat dev pertama** — `predev` men-generate sebelum `next dev`; bila file hilang, SearchDialog fail-grace.
- **Tabel sangat lebar di mobile** — `overflow-x-auto` di wrapper tabel; dua tabel berdampingan stack ke 1 kolom (`md:grid-cols-2`).
- **Konten MDX invalid** — gagal saat build (lihat §15), bukan runtime.
- **404 internal antar halaman docs** — dicegah: `generateStaticParams` dari `nav.ts`; `next/link` ke path yang ada di nav; link relatif antar MDX pakai path absolut `/docs/...` yang ada di nav. Tidak ada link ke slug yang tidak di-generate.
- **`dynamicParams=false`** — request ke `/docs/tidak-ada` → 404 (`not-found.tsx`).
- **Anchor dengan sticky nav** — `scroll-margin-top: 80px` di heading agar klik TOC tidak menempel di bawah nav.
- **Konten dengan emoji/inline HTML** — MDX mendukung JSX; hindari raw `<script>` (tidak ada). Inline HTML sederhana diizinkan oleh @mdx-js.

## 15. Error Handling (per operasi)

| Operasi | Kondisi gagal | Recoverable/Fatal | Yang diterima pemanggil | Logging |
|---|---|---|---|---|
| `npm install` | konflik peer | (sudah dicegah: semua peer terverifikasi kompatibel) | — | — |
| `next build` type-check | type error di `.ts/.tsx` | Fatal (build gagal) | exit ≠0, pesan tsc | stdout build |
| `next build` ESLint | eslint error | Fatal (Next fail-on-error) | exit ≠0 | stdout build |
| `next build` MDX compile (next-mdx-remote serialize) | syntax MDX invalid / plugin error | Fatal saat SSG | build error menunjuk file/line | stdout build |
| `next build` gray-matter parse | frontmatter YAML invalid | Fatal saat SSG | build error | stdout build |
| `prebuild` gen-search.mjs | file tidak bisa dibaca | Recoverable per-file (try/catch); fatal hanya bila write JSON gagal | file dilewati; `search-index.json` tetap terisi sisanya | stderr per-file |
| Route: slug tidak dikenal | `dynamicParams=false` | Recoverable (404) | halaman `not-found.tsx` (404) | Next default 404 log |
| Route: file content hilang (item nav tanpa file) | build-time | Fatal (build gagal) — diinginkan | build error | stdout build |
| Route: TOC ekstraksi | (tidak bisa gagal — string ops) | — | TOC array (mungkin kosong) | — |
| Client: SearchDialog fetch `/search-index.json` | 404/jaringan | Recoverable | dialog tampilkan "Pencarian tidak tersedia"; fungsi lain normal | `console.warn` (client) |
| Client: SearchDialog search | (tidak bisa gagal — in-memory) | — | daftar hasil (mungkin kosong) | — |
| Client: IntersectionObserver | browser sangat lama tanpa IO | Recoverable | TOC tampil tanpa highlight aktif (feature-detect, fallback noop) | — |
| `next start` | port dipakai | Recoverable | exit dgn pesan; gunakan `PORT=` lain | stdout |

Prinsip: kegagalan **build-time** (MDX/frontmatter/file-hilang) bersifat fatal dan sengaja demikian — terdeteksi saat implementasi & gate verifikasi, bukan di runtime produksi. Kegagalan **runtime klien** (search, scroll-spy) selalu fail-grace (UI tetap berfungsi tanpa fitur tsb).

## 16. Validasi Input Eksternal

Tidak ada input user runtime yang masuk DB/backend (situs statis). Input eksternal yang relevan:
- **Slug URL** (`[[...slug]]`): dari path. `generateStaticParams` membatasi ke nilai dari `nav.ts`; `dynamicParams=false` menolak lainnya → 404. Validasi dimiliki route layer. Tidak ada interpolasi path ke fs tanpa batas: path selalu `content/<join(slug)>.mdx` dan slug hanya berasal dari static params yang valid.
- **Klik TOC `#slug`**: slug berasal dari github-slugger atas heading konten sendiri — bukan input user.
- **Query search dialog**: string klien, dipakai hanya untuk matching in-memory; tidak dikirim ke server; di-`escape` secara implisit (render via React text, bukan `dangerouslySetInnerHTML`). Tidak ada XSS vektor.
- **Frontmatter `title`/`description`**: ditulis oleh kita (konten); dirender sebagai teks React (bukan HTML). Aman.

## 17. Invariant & Ownership

- **Satu H1 per halaman** — dimiliki route (`<h1>{frontmatter.title}</h1>`); body MDX dilarang `#`. Verifikasi: review konten.
- **6 grup sidebar persis & urutan** — dimiliki `src/lib/nav.ts` (sumber tunggal). Sidebar & homepage membaca darinya.
- **Parity slug TOC ↔ heading id** — dimiliki bersama `content.ts` (TOC) & `rehype-slug` (heading); dijamin `github-slugger@2.0.0` sama.
- **Tidak ada klaim saldo terenkripsi** — dimiliki halaman On-Ramp & Off-Ramp (konten);Invariant konten, verifikasi review.
- **Roadmap: 4 fase + badge + legenda; Fase 2 DRY-RUN** — dimiliki halaman Roadmap (konten) + komponen `Badge`.
- **Build bersih tanpa menonaktifkan TS/ESLint** — dimiliki konfigurasi (`tsconfig strict`, `.eslintrc next/core-web-vitals`, `next.config` tidak set `eslint.ignoreDuringBuilds`/`typescript.ignoreBuildErrors`).
- **Versi dependency eksak** — dimiliki `package.json` (tidak ada `^`/`~`).
- **Bahasa Indonesia** — dimiliki seluruh konten + label UI shell (TopNav/Sidebar/TOC/Search/404). Istilah teknikal baku (QRIS, webhook, quote, dll.) boleh Inggris.
- **Tidak memodifikasi E:\kiswap** — dimiliki scope pekerjaan (hanya tulis di `E:\kiswap\docs`).

## 18. Testability

- **Unit-testable** (pure functions, tanpa framework): `src/lib/content.ts` extract TOC (regex+slugger) — input string MDX, output array; `src/lib/search.ts` skor pencarian — input query+index, output ranked list; `src/lib/nav.ts` (data) struktur. Test: Vitest/Jest opsional; bila ditambahkan, pin `vitest@1.6.1` atau `jest@29.7.0`+`ts-jest@29.1.1` (KORAMP pakai jest). Tidak wajib per requirement, tetapi render TOC & search adalah unit yang bersih.
- **Integration-testable** (perlu Next): render route `/docs/[[...slug]]` untuk slug sampel → cek H1 dari frontmatter, keberadaan TOC, heading id; render Sidebar dari nav → 6 grup; render 404. Pakai `@testing-library/react` bila ditambahkan.
- **Build gate (paling penting)**: `npm run build` sendiri adalah integration test terbesar — me-prerender semua halaman, jalankan tsc+eslint. AC-1..AC-3 dijamin di sini.
- **Verifikasi manual cepat** (gate): `npm run dev` → buka `/`, `/docs/integrasi/on-ramp-off-ramp`, `/docs/roadmap`; cek 6 grup sidebar, TOC scroll-spy, search, tema gelap, mobile drawer.
- Komponen client (SearchDialog, TableOfContents, Sidebar, TopNav) bisa diuji terisolasi dengan mock `usePathname`/`fetch`/`IntersectionObserver`. Karena tidak ada test framework yang dipasang secara default, desain ini tidak mewajibkan test file, tetapi struktur memung-x-nya tanpa refactor (logika murni dipisah dari komponen).

## 19. Pemetaan ke Acceptance Criteria

- **AC-1** (install): semua dep ter-verifikasi peer-kompatibel dgn Next 14.2.35/React 18.2.0; tanpa `^`/`~`. §3.
- **AC-2** (build exit 0): stack = KORAMP-proven; `tsconfig` strict, ESLint aktif, tidak dimatikan; konten MDX di luar type-check. §3,§4,§17.
- **AC-3** (dev start): `predev` bangun search index lalu `next dev`; fail-grace. §10.
- **AC-4** (6 grup + semua halaman, no 404 internal): `nav.ts` sumber tunggal; `generateStaticParams` dari nav; link pakai path nav. §6.
- **AC-5** (On-Ramp page struktur + no encrypted-balance claim): §11; invariant privasi §17.
- **AC-6** (Roadmap 4 fase + badge + legenda + Fase2 DRY-RUN): §12.
- **AC-7** (palet gelap): §8 (Tailwind colors + prose).
- **AC-8** (README): deliverable; §4 (`README.md` dengan deskripsi + `npm install/dev/build/start` + stack/palet).
- **AC-9** (Bahasa Indonesia): §17 invariant.
- **AC-10** (pin eksak): §3 + `package.json`.
- **AC-11** (homepage + 404 + mobile): §7,§9; `MobileDrawer` + TOC `hidden lg:block` + Sidebar drawer.

## 20. Catatan Implementasi (urutan, risiko, verifikasi)

Urutan yang disarankan untuk tahap implementasi:
1. Scaffold `package.json`/`tsconfig.json`/`next.config.mjs`/`postcss.config.cjs`/`tailwind.config.ts`/`.eslintrc.json`/`globals.css` (§3,§8) → `npm install` → `npm run build` minimal dengan homepage kosong untuk konfirmasi baseline build bersih SEBELUM konten banyak.
2. `lib/nav.ts` + `lib/content.ts` + route `docs/[[...slug]]` + satu file `content/memulai/pengenalan.mdx` → verifikasi render MDX + TOC.
3. Shell: `TopNav`, `Sidebar`, `TableOfContents`, `MobileDrawer`, root/docs layout.
4. `SearchDialog` + `scripts/gen-search.mjs` + `predev`/`prebuild`.
5. Tulis semua 19 file `content/*.mdx` (Bahasa Indonesia), prioritaskan `on-ramp-off-ramp.mdx` (unggulan) dan `roadmap.mdx` (deliverable kunci).
6. Homepage + 404 + README.
7. `npm run lint && npm run build && npm start` (verifikasi AC-1..AC-3); `npm run dev` cek manual AC-4..AC-11.

Risiko terbesar & mitigasi:
- **Syntax highlighting Shiki di build**: rehype-pretty-code 0.14.5 + shiki 4.5.0 menjalankan highlighter saat serialize (SSG). Bila menimbulkan error/waktu-build lambat, fallback: lepas `rehype-pretty-code` dan `Pre` styling plain (konten tetap render; "code block" AC tetap terpenuhi tanpa pewarnaan token). Highlighting bersifat aditif, bukan dependency konten.
- **`@import` font offline saat build**: `@import` di-resolve runtime browser, bukan build, jadi build tidak bergantung jaringan font. Bila diinginkan 100% offline, ganti ke `next/font/local` dengan file `.woff2` di `public/fonts` (opsi cadangan, tidak default).
- **Peer/npm resolusi**: bila `npm install` memilih sub-dependency yang berbeda dari harapan, kunci via `package-lock.json` yang di-commit (akan dihasilkan install pertama).

Verifikasi diri desain: semua versi dependency di §3 sudah dicek `peerDependencies` terhadap Next 14.2.35/React 18.2.0 via registry (tidak ada konflik). Slug parity (github-slugger 2.0.0 = dep rehype-slug 6) sudah dicek. Metode+path API (§13) diekstrak dari handler nyata. Fakta produk (aset/jaringan, model Prisma, status order) diverifikasi terhadap `E:\kiswap/src/lib/assets.ts` & `prisma/schema.prisma`. Yang TIDAK diverifikasi secara empiris: `npm run build` aktual (tahap implementasi); desain ini mengandalkan stack yang identik dengan KORAMP (terbukti build di env ini) dan config standar.

## 21. Catatan: tidak ada review loop

Direktori pipeline hanya berisi `01-requirements.md` (tidak ada `design-review.json`), sehingga ini desain baru, bukan revisi. Tidak ada finding untuk direspons.
