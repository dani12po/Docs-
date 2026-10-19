# Requirements — KORAMP Docs Site

## Ringkasan

Membangun sebuah situs dokumentasi produksi yang berdiri sendiri di dalam direktori kosong `E:\kiswap\docs`. Situs ini menampilkan dokumentasi produk KORAMP (on/off-ramp IDR ⇄ crypto, wallet-first, tanpa registrasi akun) dan secara visual/struktural meniru Helius Docs (referensi: `https://www.helius.dev/docs/id/privacy/integration/on-off-ramp`) yang ber-tema gelap dengan locale Bahasa Indonesia.

Tujuan utama dari permintaan pengguna: "buatkan saya web docs ... beserta roadmaps nya didalamnya." Maka selain 5 grup dokumen pendukung, terdapat satu **halaman Roadmap** sebagai deliverable kunci yang eksplisit diminta, plus satu **halaman unggulan On-Ramp & Off-Ramp** yang meniru struktur halaman referensi Helius namun dengan konten yang jujur terhadap model privasi nyata KORAMP (transaksi on-chain bersifat publik; identitas = alamat dompet; tidak ada saldo terenkripsi).

Stack yang dipilih: **Fumadocs** (Next.js App Router, Tailwind, MDX, sidebar/TOC/search bawaan) sebagai jalur utama, dengan **fallback** ke Next.js 14 App Router + `@next/mdx` + komponen sidebar/TOC/search buangan tangan HANYA bila Fumadocs terbukti tidak bisa diandalkan di environment ini. Semua konten dalam Bahasa Indonesia, tema gelap mengikuti palet KORAMP, dan seluruh dependency di-pin ke versi eksak.

> Catatan: dokumen ini mendefinisikan **APA** yang harus dibangun, bukan bagaimana. Pilihan arsitektur (misal struktur file MDX, komponen, konfigurasi Fumadocs spesifik) diserahkan ke tahap desain.

## Asumsi (inferensi karena permintaan ambigu)

- **Locale default = Bahasa Indonesia, satu locale saja.** Permintaan hanya menyebut meniru gaya `/id/` Helius; tidak ada permintaan untuk locale Inggris. Tidak ada i18n-switcher yang diminta, jadi situs di-render statis sebagai single-locale Indonesia. (Implementasi boleh menyertakan struktur `/id/` bila Fumadocs mendukungnya tanpa biaya, namun bukan persyaratan.)
- **Search lokal.** Search box di sidebar dan trigger di nav menggunakan indeks lokal sisi-klien (Fumadocs built-in atau in-memory index di fallback). Tidak ada layanan eksternal (Algolia/Meilisearch) yang dipasang.
- **Konten MDX/Markdown.** Halaman dokumen ditulis sebagai konten MDX/Markdown agar callout, tabel, code block, dan ordered-list step flow dapat dirender seperti referensi.
- **Fumadocs adalah jalur utama.** Tim desain/implementasi wajib mencoba Fumadocs lebih dulu; fallback hanya bila `npm install`/`npm run build` Fumadoks gagal terulang di environment ini, bukan karena preferensi estetika.
- **Versi dependency.** "Pin EXACT versions" berarti tidak boleh ada rentang terbuka (`^`/`~`). Versi eksak mengikuti KORAMP stack bila sama (Next.js 14.2.35, React 18.2.0, Tailwind 3.4.0, TypeScript 5.3.3) untuk konsistensi; sisa mengikuti latest stable yang kompatibel, dipin.
- **Fakta produk** diambil dari spesifikasi permintaan dan diverifikasi cepat terhadap sumber KORAMP: `E:\kiswap\src\lib\assets.ts` (aset/jaringan cocok persis) dan `E:\kiswap\prisma\schema.prisma` (semua model yang dirujuk ada, plus tambahan `KipayWebhook`, `TransfiWebhook`, `SupportMessage` yang boleh disebut sebagai riwayat/pendukung).
- **Privasi jujur.** KORAMP memakai transfer on-chain PUBLIK; pengirim/penerima DAN jumlah terlihat on-chain. Dokumentasi TIDAK boleh mengklaim saldo/balance terenkripsi (itu model Helius Solana, bukan KORAMP). Halaman On-Ramp & Off-Ramp harus merefleksikan kebijakan privasi nyata.
- **Roadmap = satu halaman** dengan 4 fase (Fase 1–4), bukan 4 halaman terpisah, disesuaikan permintaan "roadmaps nya didalamnya".

## Functional Requirements

### FR-1 Scaffold & struktur proyek
- FR-1.1 Proyek berdiri sendiri di `E:\kiswap\docs`; tidak memodifikasi direktori induk `E:\kiswap` (aplikasi KORAMP utama) kecuali membaca untuk referensi.
- FR-1.2 `package.json` dengan script `dev`, `build`, `start`, `lint`; semua dependency di-pin ke versi eksak (tidak ada `^`/`~`).
- FR-1.3 Konfigurasi TypeScript (`tsconfig.json`) dengan pengecekan ketat aktif; ESLint aktif; tidak boleh menonaktifkan TS/ESLint agar build lolos.
- FR-1.4 Framework: Fumadocs (App Router, Tailwind, MDX) sebagai jalur utama; fallback Next.js 14 App Router + `@next/mdx` + komponen buatan hanya bila Fumadocs tidak bisa diandalkan di environment ini.

### FR-2 Layout & navigasi (meniru referensi Helius)
- FR-2.1 **Top nav bar**: logo wordmark "KORAMP", trigger search, dan beberapa header link (mis. GitHub/docs home). Sticky di atas.
- FR-2.2 **Left sidebar**: terkelompok & bertingkat (nested), dipresentasikan sebagai 6 grup berurutan persis: `Memulai`, `Integrasi`, `Privasi & Kepatuhan`, `Arsitektur`, `API Reference`, `Roadmap` (lihat FR-4 untuk isi tiap grup). Sidebar memuat search box.
- FR-2.3 **Right "Pada halaman ini" (On this page)**: TOC otomatis dari heading halaman, scroll-spy (highlight sesuai posisi baca). Disembunyikan di layar kecil.
- FR-2.4 **Main content area** merender rich markdown: heading, paragraf, tabel, callout/admonition, code block, ordered list, dan step flow bernomor.
- FR-2.5 **Search dialog** terbuka dari trigger nav dan/atau box sidebar; indeks lokal; hasil membuka halaman terkait.
- FR-2.6 **Mobile responsive**: sidebar collapse menjadi drawer; TOC tersembunyi; nav tetap dapat dipakai.

### FR-3 Tema & palet (dark theme)
- FR-3.1 Background utama `#08080A`; surface `#141416` / `#232326`; accent gold `#D4B78F`; success green `#22C55E`; text `#F5F5F5` (primer), `#CFCFD4` (sekunder), `#8B8B93` (muted).
- FR-3.2 Tema gelap sebagai default (tidak diwajibkan toggle light, namun bila Fumadocs bawaan punya toggle, gelap adalah default). Palet diimplementasikan sebagai design tokens (Tailwind/CSS variables) agar konsisten.

### FR-4 Konten & sidebar (semua Bahasa Indonesia, urutan grup persis)

**Grup 1 — MEMULAI**
- FR-4.1 `Pengenalan`: apa itu KORAMP (wallet-first IDR⇄crypto on/off-ramp, tanpa registrasi akun; tagline "Terima crypto global, settle Rupiah instan").
- FR-4.2 `Quickstart`: hubungkan dompet → pilih aset → kunci quote → bayar QRIS / kirim crypto → terima; 3 langkah sederhana.
- FR-4.3 `Konsep Inti`: Wallet-First, Quote, Top Up vs Sell, Aset & Jaringan.

**Grup 2 — INTEGRASI**
- FR-4.4 `On-Ramp & Off-Ramp` — **HALAMAN UNGGULAN**, meniru struktur halaman referensi Helius (lihat FR-5).
- FR-4.5 `Alur Transaksi`: langkah Top Up, langkah Sell, dan state order (`CREATED → ... → COMPLETED`).
- FR-4.6 `Quote & Pricing`: market price, spread, service fee, network fee, tax, locked price, expiry; konsumsi quote atomik (via `usedAt`).
- FR-4.7 `Aset & Jaringan`: SOL (Solana Devnet), ETH (Base Sepolia, chain 84532), BNB (BSC Testnet, chain 97); testnet sekarang, mainnet direncanakan.

**Grup 3 — PRIVASI & KEPATUHAN**
- FR-4.8 `Kebijakan Privasi`: ringkasan 15-bagian kebijakan KORAMP (tanpa akun/password; alamat dompet = identitas; tidak menyimpan private key; ledger transaksi publik dengan wallet ter-mask + 4 digit akhir bank; QRIS via pihak ketiga; analitik halaman yang menjaga privasi).
- FR-4.9 `Kepatuhan`: model wallet-first tanpa KYC; apa yang terlihat on-chain vs off-chain; audit trail.
- FR-4.10 `Penyaringan Dompet`: sikap KORAMP saat ini terkait wallet screening — jujur tentang apa yang ada hari ini.
- FR-4.11 `Catatan & Audit`: `AuditLog`, `LedgerEntry` (gaya double-entry), idempotensi webhook (`XenditWebhook` @@unique pada kind/event/ids).

**Grup 4 — ARSITEKTUR**
- FR-4.12 `Wallet-First`: tidak ada tabel users, alamat dompet = identitas pelanggan (`TopUpOrder.walletAddress` + `walletType`).
- FR-4.13 `Stack`: Next.js 14.2.35, React 18.2, TypeScript, Prisma 5.7 + PostgreSQL (Neon), Redis (ioredis), Tailwind 3.4, ethers/viem (EVM), `@solana/web3.js` 1.99, Xendit.
- FR-4.14 `Database`: peran model Prisma kunci — `Network`, `Asset`, `PlatformWallet`, `Quote`, `TopUpOrder`, `SellOrder`, `Payment`, `Payout`, `CryptoDeposit`, `CryptoWithdrawal`, `LedgerEntry`, `AuditLog`, `SystemSetting`, `FeeConfig`, `SecurityEvent`, `IpBan`, `PageVisit`, `AdminAccessKey`, `SupportTicket`, `WalletChallenge`, `RewardConfig`, `RewardCycle`, `RewardClaim` (akurasi terhadap `schema.prisma`; boleh menyebut `KipayWebhook`/`TransfiWebhook`/`SupportMessage` sebagai riwayat/pendukung).
- FR-4.15 `Keamanan`: rate limiting (Redis), progressive IP ban (level/violationCount, permanen hanya manual), agregasi `SecurityEvent` per hour-bucket, `AdminAccessKey` (SHA-256 keyVerifier, single-device `activeSessionJti`, `keyVersion` rotasi), TOTP.
- FR-4.16 `Admin`: satu access key credential, tanpa email/password/hierarki peran; skrip: `setup-admin.cjs`, `admin-key-rotator.cjs`, `setup-totp.cjs`.

**Grup 5 — API REFERENCE**
- FR-4.17 Overview grup endpoint dengan deskripsi singkat tiap grup: `/quotes`, `/orders`, `/payments`, `/prices`, `/assets`, `/wallets`, `/rewards`, `/support`, `/transactions`, `/webhooks`, `/cron`, `/visits`, `/admin`. Tanda tangan endpoint harus akurat terhadap handler rute nyata di `E:\kiswap\src\app\api\` (boleh dibaca; tidak boleh mengarang signature).

**Grup 6 — ROADMAP** (deliverable kunci)
- FR-4.18 Satu halaman Roadmap dengan 4 fase, dipresentasikan sebagai timeline vertikal atau kartu bertahap dengan badge status + legenda yang menjelaskan badge:
  - **Fase 1 — MVP** (badge "Sudah Ship"): on/off-ramp wallet-first; Top Up via QRIS (Xendit Payments v3) → crypto ke dompet; Sell via crypto deposit → payout IDR ke bank (Xendit Payout v3); aset SOL/ETH/BNB di testnet; quote dengan locked pricing; progressive IP ban + rate limiting Redis; admin access key + TOTP; support ticket; analitik halaman yang menjaga privasi; double-entry ledger + audit log.
  - **Fase 2 — Aktif** (badge "Aktif"): program reward (eligibility + progress + claim reservation, **DRY-RUN payout only**; tanpa akses treasury on-chain; tanpa signing; klaim tetap `PENDING_PAYOUT`); kualifikasi berbasis siklus (bulanan); anti-fraud review; terms versioning.
  - **Fase 3 — Direncanakan** (badge "Direncanakan"): payout reward on-chain live (broadcast tx nyata, tracking konfirmasi via `confirmations`/`requiredConfirmations`); jaringan mainnet (Solana Mainnet, Base Mainnet, BSC Mainnet); aset tambahan (mis. stablecoin USDC/USDT); penguatan keandalan webhook.
  - **Fase 4 — Masa Depan** (badge "Masa Depan"): tooling compliance/AML/Travel-Rule; API merchant/hosted-checkout pihak ketiga; fiat rail tambahan di luar QRIS; payout rail yang diperluas; docs multi-bahasa; SDK publik.
  - Tiap fase: paragraf pendek + bullet item dengan indikator status; sertakan legenda badge.

### FR-5 Halaman unggulan On-Ramp & Off-Ramp (meniru referensi Helius)
Halaman ini wajib memiliki struktur berikut, diadaptasi jujur ke model KORAMP (fiat = IDR via QRIS; transfer on-chain KORAMP bersifat PUBLIK sehingga pengirim/penerima DAN jumlah terlihat on-chain; privasi datang dari: tanpa akun, alamat dompet sebagai identitas, tampilan ter-mask di ledger publik, hanya 4 digit akhir bank):
- FR-5.1 Paragraf intro: untuk siapa panduan ini + apa yang dilakukan.
- FR-5.2 Dua tabel berdampingan (visibility On-ramp & Off-ramp) — tiap tabel kolom `Bidang | Visibilitas | Alasan`, baris: `Pembayaran IDR (QRIS)`, `Aset`, `Jumlah`, `Pengirim`, `Penerima`, `Memo (opsional)`.
- FR-5.3 Daftar "Anda memerlukan" (persyaratan).
- FR-5.4 Bagian "Aset dan Inventaris" dengan langkah bernomor.
- FR-5.5 Bagian "Pertimbangan Kepatuhan" dengan sub-tabel ("Informasi yang Dapat Anda Lihat", "Penyaringan Dompet", "Travel Rule") — disesuaikan ke model wallet-first tanpa KYC.
- FR-5.6 Tabel "Petakan Alur yang Sudah Ada" (langkah eksisting → langkah KORAMP).
- FR-5.7 Bagian "Catatan dan Audit".
- FR-5.8 Bagian "Alur Transaksi" dengan dua alur bernomor (1. On-Ramp, 2. Off-Ramp).
- FR-5.9 CTA "Mulai Integrasi".
- FR-5.10 **Larangan**: tidak mengklaim saldo/balance terenkripsi atau privasi on-chain model Helius. Refleksikan kebijakan privasi nyata KORAMP.

### FR-6 Halaman pendukung
- FR-6.1 **Homepage/landing** di root `/` yang memperkenalkan docs dan menautkan ke tiap grup sidebar.
- FR-6.2 **Halaman 404** kustom bertema gelap.

### FR-7 Aksesibilitas & kualitas konten
- FR-7.1 Semua konten dalam Bahasa Indonesia (judul, body, label nav, callout). Istilah teknikal tetap Inggris bila merupakan terminologi baku (QRIS, webhook, quote, dll.).
- FR-7.2 Link antar halaman dokumen harus resolve (tidak ada 404 internal di antara halaman dokumen).
- FR-7.3 Heading memiliki hierarki yang benar (satu H1 per halaman); TOC mengikuti heading.

## Non-Functional Requirements

### NFR-1 Build & reliability
- NFR-1.1 `npm install` berhasil di `E:\kiswap\docs`.
- NFR-1.2 `npm run build` keluar dengan exit code 0, nol error, tanpa menonaktifkan TypeScript/ESLint. Semua error tipe/lint diperbaiki.
- NFR-1.3 `npm run dev` mulai tanpa crash (verifikasi start sebentar lalu hentikan).
- NFR-1.4 `npm start` (production server) berfungsi sesudah build.

### NFR-2 Performa
- NFR-2.1 Halaman statis di-prerender bila memungkinkan (docs konten konstan). Search indeks dibangun sisi-klien; tidak ada pemanggilan API runtime untuk konten statis.

### NFR-3 Responsif & aksesibilitas
- NFR-3.1 Responsif penuh: desktop, tablet, mobile (drawer sidebar, TOC tersembunyi di layar kecil).
- NFR-3.2 Komponen interaktif (nav, sidebar, search, TOC) dapat dioperasikan via keyboard; kontras warna teks memenuhi legibility pada tema gelap.
- NFR-3.3 Catatan: kepatuhan WCAG penuh memerlukan pengujian manual dengan teknologi bantu & tinjauan aksesibilitas; NFR ini hanya mensyaratkan praktik dasar yang masuk akal.

### NFR-4 Lokalisasi
- NFR-4.1 Default/source locale = Bahasa Indonesia untuk seluruh konten dan label UI shell yang user-facing.

### NFR-5 Dokumentasi proyek
- NFR-5.1 `README.md` di `E:\kiswap\docs` berisi deskripsi proyek singkat + instruksi: `npm install`, `npm run dev`, `npm run build`, `npm start`, plus catatan stack/palet.

## Acceptance Criteria

Kriteria penerimaan berikut memetakan ke gate verifikasi dan harus dilaporkan pass/fail.

1. **AC-1**: `npm install` berhasil di `E:\kiswap\docs` (exit 0).
2. **AC-2**: `npm run build` berhasil dengan exit code 0; nol error tipe/lint; TypeScript/ESLint tidak dimatikan untuk lolos.
3. **AC-3**: `npm run dev` mulai tanpa crash — diverifikasi dengan start sebentar (HTTP 200 pada `http://localhost:3000`) lalu dihentikan.
4. **AC-4**: Sidebar merender 6 grup persis (`Memulai`, `Integrasi`, `Privasi & Kepatuhan`, `Arsitektur`, `API Reference`, `Roadmap`) dengan semua halaman masing-masing; navigasi antar halaman dokumen resolve (tidak ada 404 internal antar halaman dokumen).
5. **AC-5**: Halaman On-Ramp & Off-Ramp memiliki struktur meniru referensi: dua tabel visibility (`Bidang|Visibilitas|Alasan`), daftar "Anda memerlukan", "Pertimbangan Kepatuhan" dengan sub-bagian, tabel "Petakan Alur yang Sudah Ada", "Catatan dan Audit", "Alur Transaksi" (On-Ramp + Off-Ramp), CTA "Mulai Integrasi"; serta TIDAK mengklaim saldo/balance terenkripsi (merefleksikan privasi nyata KORAMP).
6. **AC-6**: Halaman Roadmap merender 4 fase (Fase 1–4) dengan badge (`Sudah Ship` / `Aktif` / `Direncanakan` / `Masa Depan`) dan legenda yang menjelaskan badge; Fase 2 mencatat payout DRY-RUN (tanpa treasury access/signing; klaim tetap `PENDING_PAYOUT`).
7. **AC-7**: Tema gelap cocok palet KORAMP — bg `#08080A`, surface `#141416`/`#232326`, accent gold `#D4B78F`, success green `#22C55E`, text `#F5F5F5`/`#CFCFD4`/`#8B8B93`.
8. **AC-8**: `README.md` hadir di `E:\kiswap\docs` dengan deskripsi proyek dan instruksi run (`npm install`, `npm run dev`, `npm run build`, `npm start`).
9. **AC-9**: Seluruh konten dalam Bahasa Indonesia (judul, body, label nav, callout); istilah teknikal baku boleh tetap Inggris.
10. **AC-10**: `package.json` mem-pin semua dependency ke versi eksak (tidak ada `^`/`~`).
11. **AC-11**: Homepage `/` memperkenalkan docs dan menautkan ke grup sidebar; halaman 404 kustom hadir; mobile responsive (sidebar drawer, TOC tersembunyi di layar kecil).

## Out of Scope

- **Tidak memodifikasi aplikasi KORAMP utama** di `E:\kiswap` selain membaca untuk referensi. Semua pekerjaan terbatas pada `E:\kiswap\docs`.
- **Tidak men-deploy** situs ke produksi/hosting (verhicle/deployment CI di luar scope); hanya lokal `dev`/`build`/`start`.
- **Tidak mengimplementasikan fitur produk KORAMP** (ramp nyata, pembayaran, webhook, reward payout). Ini adalah situs dokumentasi statis; apapun "live reward payout"/"mainnet" hanya konten Roadmap, bukan fungsionalitas.
- **Tidak ada locale Inggris** (single-locale Indonesia) — kecuali Fumadocs menambahkan struktur `/id/` tanpa biaya tambahan.
- **Tidak ada backend/runtime API** untuk konten (search indeks sisi-klien; tidak ada CMS/database docs).
- **Tidak ada penulisan ulang kebijakan privasi lengkap** — halaman Kebijakan Privasi adalah ringkasan/adaptasi dari kebijakan KORAMP, bukan dokumen hukum baru.
- **Tidak ada penambahan domain/CI/observability** untuk situs docs.
- **Pemilihan jalur framework** (Fumadocs vs fallback) adalah keputusan implementasi yang ditetapkan di tahap desain; dokumen ini hanya menetapkan Fumadops sebagai jalur utama yang dicoba pertama dan fallback bila tidak dapat diandalkan di environment ini.
