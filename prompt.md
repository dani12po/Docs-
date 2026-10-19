# Prompt — Lanjutkan & Selesaikan Docs Site KORAMP (Helius-style)

> Berikan prompt ini ke opencode (mis. `@prompt.md` di dalam sesi opencode yang berjalan di `e:\kiswap\docs`).
> opencode akan melanjutkan pembuatan website dokumentasi KORAMP dari desain yang sudah ada.

---

## 0. Peran & Tujuan

Anda adalah agen coding yang **melanjutkan dan menyelesaikan** pembuatan website dokumentasi untuk **KORAMP** di folder `e:\kiswap\docs`.

Tujuan akhir: sebuah docs site yang secara visual & struktural menyerupai **Helius Docs**
(referensi: https://www.helius.dev/docs/id/privacy/integration/on-off-ramp) — dark theme,
sidebar kiri bergrup + search, TOC kanan "Pada halaman ini", top nav, **seluruh konten dalam Bahasa Indonesia** — termasuk halaman **Roadmap**.

KORAMP adalah codebase di `E:\kiswap` (boleh dibaca untuk referensi konten, **jangan diubah**).

---

## 1. Konteks — Desain SUDAH ADA, jangan ulangi dari nol

Sebuah pipeline desain sebelumnya sudah selesai dan menghasilkan artefak desain yang sudah di-review.
**Baca ketiga file ini terlebih dahulu sebelum menulis kode:**

- `e:\kiswap\docs\.agents\pipeline\2026-10-18_01-53-03\02-design.md` → **desain teknis final** (arsitektur, stack, struktur file, palet, rancangan tiap halaman). Ini acuan utama.
- `e:\kiswap\docs\.agents\pipeline\2026-10-18_01-53-03\03-design-review.md` → review desain, **verdict: CHANGES_REQUESTED**. Berisi **4 temuan MEDIUM yang WAJIB diterapkan** saat implementasi (lihat §3).
- `e:\kiswap\docs\.agents\pipeline\2026-10-18_01-53-03\01-requirements.md` → requirement + acceptance criteria.

Implementasi sebelumnya mungkin **sebagian sudah ada / parsial**. Jika file sudah ada, **tinjau dulu**, lanjutkan & sesuaikan dengan desain — jangan menimpa sembarangan, tapi pastikan hasil akhir 100% konsisten dengan `02-design.md` + 4 perbaikan di §3.

Folder `e:\kiswap\docs` saat ini: kosong kecuali direktori `.agents/` (artefak desain). Scaffold aplikasi Next.js baru di sini.

---

## 2. Keputusan desain (SUDAH FINAL — jangan diubah/diperdebatkan)

- **Framework:** custom **Next.js 14.2.35 App Router + React 18.2.0 + Tailwind 3.4 + `next-mdx-remote/rsc`**. **BUKAN Fumadocs** — Fumadocs MDX butuh Next 15 / React 19 dan `npm install` akan gagal di stack yang di-pin (sudah diverifikasi terhadap npm registry).
- **Pin EXACT version** untuk SEMUA dependency — jangan pakai `^` atau `~`.
- **Layout:** TopNav (logo "KORAMP", search trigger, header links); Sidebar kiri bergrup & nested (collapse jadi drawer di mobile); TOC kanan "Pada halaman ini" pakai `IntersectionObserver` scroll-spy; search client-side via **JSON index statik hasil prebuild** (script `gen-search.mjs`).
- **`nav.ts`** adalah single source of truth untuk 6 grup sidebar (urutannya persis §4).
- **Route tunggal:** `app/docs/[[...slug]]/page.tsx` merender MDX dari `content/`.
- **Palet dark KORAMP:** background `#08080A`, surface `#141416` / `#232326`, accent gold `#D4B78F`, success green `#22C55E`, text `#F5F5F5` / `#CFCFD4` / `#8B8B93`.
- **Semua konten Bahasa Indonesia.**
- Homepage/landing di `/`, custom 404, dan `README.md` berisi instruksi run.

---

## 3. 4 Perbaikan WAJIB dari review (`03-design-review.md`)

Terapkan keempatnya saat implementasi:

1. **`gen-search.mjs` (search index):** normalisasi backslash Windows → forward slash pada path/href hasil search, agar link hasil search tidak 404 di Windows.
2. **Redirect `/docs` → `/docs/memulai/pengenalan`:** harus benar-benar jalan saat `dynamicParams = false`. Solusi: emit `{ slug: [] }` di `generateStaticParams` **atau** tambah dedicated `app/docs/page.tsx` redirect.
3. **Selesaikan konflik kepemilikan `mdxComponents`:** taruh **map `mdxComponents`** di `components/mdx/`, dan **plugin rehype/remark** di `lib/typography`. Satu pemilik jelas masing-masing, jangan duplikat/export yang bertabrakan.
4. **State `SearchDialog` (open):** bagikan via **client `SearchProvider` context di ROOT layout** yang render `<SearchDialog/>` sekali; dikonsumsi TopNav dan Sidebar. **Jangan** pakai prop callback antar layout.

---

## 4. Struktur konten / sidebar (6 grup, urutan persis ini)

1. **Memulai** — Pengenalan; Quickstart; Konsep Inti (Wallet-First, Quote, Top Up vs Sell, Aset & Jaringan)
2. **Integrasi** — On-Ramp & Off-Ramp ⭐(flagship, lihat §5); Alur Transaksi (Top Up flow + Sell flow + status order); Quote & Pricing (market price, spread, service fee, network fee, tax, locked price, expiry, atomic consumption); Aset & Jaringan (SOL/Solana Devnet, ETH/Base Sepolia chain 84532, BNB/BSC Testnet chain 97; testnet sekarang, mainnet rencana)
3. **Privasi & Kepatuhan** — Kebijakan Privasi (ringkas 15 bagian); Kepatuhan (model KYC-less, apa yang terlihat on-chain vs off-chain, audit trail); Penyaringan Dompet (posisi KORAMP saat ini, jujur); Catatan & Audit (AuditLog, LedgerEntry double-entry, idempotensi webhook `XenditWebhook` @@unique kind/event/ids)
4. **Arsitektur** — Wallet-First (no users table, wallet address = identitas); Stack; Database (model Prisma utama — baca `E:\kiswap\prisma\schema.prisma`); Keamanan (Redis rate limit, progressive IP ban, SecurityEvent, AdminAccessKey SHA-256 + single-device session + rotation, TOTP); Admin (single access key, no email/password, scripts)
5. **API Reference** — overview grup endpoint: `/quotes`, `/orders`, `/payments`, `/prices`, `/assets`, `/wallets`, `/rewards`, `/support`, `/transactions`, `/webhooks`, `/cron`, `/visits`, `/admin`. **Baca handler asli di `E:\kiswap\src\app\api\`** untuk akurasi — jangan mengarang signature. Jika endpoint tidak public (mis. `/payments`), sebutkan jujur.
6. **Roadmap** — lihat §6.

---

## 5. Halaman flagship: On-Ramp & Off-Ramp (MIRROR Helius, tapi jujur ke model KORAMP)

Mirror struktur halaman referensi Helius **secara presisi**, tapi **sesuaikan isi dengan jujur** ke model KORAMP (lihat catatan privasi di bawah):

- Paragraf intro: untuk siapa panduan ini + apa yang dilakukannya.
- **Dua tabel berdampingan** (On-Ramp & Off-Ramp), kolom: `Bidang | Visibilitas | Alasan`. Baris: "Pembayaran IDR (QRIS)", "Aset", "Jumlah", "Pengirim", "Penerima", "Memo (opsional)".
- Bagian **"Anda memerlukan"** (daftar persyaratan).
- Bagian **"Aset dan Inventaris"** dengan langkah bernomor.
- Bagian **"Pertimbangan Kepatuhan"** dengan sub-bagian: "Informasi yang Dapat Anda Lihat" (tabel), "Penyaringan Dompet", "Travel Rule" — adaptasi ke model KYC-less wallet-first KORAMP.
- Tabel **"Petakan Alur yang Sudah Ada"** (langkah umum → langkah KORAMP).
- Bagian **"Catatan dan Audit"**.
- Bagian **"Alur Transaksi"** dengan flow bernomor: **1. On-Ramp**, **2. Off-Ramp**.
- CTA **"Mulai Integrasi"**.

**Catatan kejujuran privasi (WAJIB):** KORAMP pakai **transfer on-chain PUBLIK**. Pengirim, penerima, DAN jumlah **terlihat di on-chain**. **JANGAN** klaim saldo terenkripsi/privat — itu model "private balance" Solana milik Helius, **bukan** KORAMP. Refleksikan model privasi KORAMP yang sebenarnya: tanpa akun, wallet address = identitas, tidak menyimpan private key, ledger publik dengan wallet disamarkan + 4 digit terakhir nomor rekening.

---

## 6. Halaman Roadmap (deliverable utama yang diminta user)

Satu halaman, **4 fase**, tampilkan sebagai timeline vertikal atau kartu bertahap dengan **badge status + legenda**:

- **Fase 1 — MVP** (badge `Sudah Ship`): wallet-first on/off-ramp; Top Up via QRIS (Xendit Payments v3) → crypto ke wallet; Sell via deposit crypto → payout IDR ke bank (Xendit Payout v3); aset SOL/ETH/BNB di testnet (Solana Devnet, Base Sepolia, BSC Testnet); quote dengan harga terkunci (spread/service/network fee/tax); progressive IP ban + Redis rate limiting; admin access key + TOTP; support ticket; page analytics yang menjaga privasi; ledger double-entry + audit log.
- **Fase 2 — Aktif** (badge `Aktif`): program reward — eligibility + progress tracking + claim reservation (payout **DRY-RUN** saja, tanpa akses treasury on-chain, klaim tetap `PENDING_PAYOUT`); kualifikasi per cycle (bulanan); anti-fraud review; terms versioning.
- **Fase 3 — Direncanakan** (badge `Direncanakan`): live on-chain reward payout (broadcast tx asli, tracking konfirmasi via `confirmations`/`requiredConfirmations`); jaringan mainnet (Solana Mainnet, Base Mainnet, BSC Mainnet); aset tambahan (mis. stablecoin USDC/USDT); penguatan reliabilitas webhook.
- **Fase 4 — Masa Depan** (badge `Masa Depan`): tooling compliance/AML/Travel Rule; Merchant/hosted-checkout API untuk pihak ketiga; fiat rail tambahan selain QRIS; payout rail yang diperluas; docs multi-bahasa; SDK publik.

Tiap fase: paragraf singkat + bullet list dengan indikator status. Sertakan **legenda badge**.

---

## 7. Fakta KORAMP (untuk konten akurat; baca `E:\kiswap` jika butuh detail)

- Produk: "KORAMP — Crypto On/Off-Ramp. Top Up Crypto & Sell Crypto with IDR. Wallet-only, no account registration." Tagline: "Terima crypto global, settle Rupiah instan."
- Aset/jaringan (`E:\kiswap\src\lib\assets.ts`): SOL di Solana Devnet, ETH di Base Sepolia (chain 84532), BNB di BSC Testnet (chain 97). Ramp (Top Up + Sell) aktif di ketiganya.
- Pembayaran: Xendit QRIS untuk Top Up (Payments API v3), Xendit Payout v3 untuk Sell (payout IDR ke bank). Provider legacy KiPay + TransFi sudah **pensiun** (kolom DB disimpan untuk riwayat saja).
- Status order: `TopUpOrder` status `CREATED`→…→`completedAt`; `SellOrder` dengan `confirmations`/`requiredConfirmations`, `depositAddress` (deposit platform), detail bank payout per-transaksi (tidak ada profil bank tersimpan). `Quote`: type TOP_UP|SELL, idrAmount, cryptoAmount, marketPrice, spread, serviceFee, networkFee, tax, totalIdr, expiresAt, konsumsi atomik via `usedAt`.
- Reward (Fase 2, **DRY-RUN** — tanpa treasury/signing/transfer, klaim tetap `PENDING_PAYOUT`): `RewardConfig` singleton (minTransactionIdr 100000, requiredCount 50, rewardMinUsd 1 / rewardMaxUsd 2, cycle monthly, networks CSV `SOLANA,BNB,BASE`, termsVersion `2026-09-v1`), `RewardCycle`, `RewardClaim` status flow `PENDING_PAYOUT`→`PROCESSING`→`SUBMITTED`→`CONFIRMING`→`PAID` (+ `DRY_RUN`/`UNDER_REVIEW`/`REJECTED`/`FAILED`).
- Keamanan: `SecurityEvent` diagregasi per hour bucket; `IpBan` temp-ban progresif (level, violationCount, durationMs, expiresAt; permanent hanya manual); rate limiting via Redis; `AdminAccessKey` (SHA-256 `keyVerifier`, single-device `activeSessionJti`, `keyVersion` rotation); TOTP via `otplib`.
- Admin: single access key credential, no email/password/role hierarchy. Scripts: `setup-admin.cjs`, `admin-key-rotator.cjs`, `setup-totp.cjs`, `security-test.cjs`, `unban-ip.cjs`.
- Privasi: wallet address = identitas; TIDAK menyimpan private key/seed phrase; ledger transaksi publik (wallet disamarkan, 4 digit terakhir nomor rekening, order public ID); `PageVisit` yang menjaga privasi (path + UTC day saja, tanpa IP/UA/fingerprint).
- Tech: Next.js 14.2.35, React 18.2.0, TypeScript 5.3.3, Prisma 5.7.1 + PostgreSQL (Neon), Redis (ioredis 5.11), Tailwind 3.4.0, ethers 6.9 / viem 2.56, @solana/web3.js 1.99, Xendit, jose 5.2, otplib, zod 3.22.

---

## 8. Batasan

- Kerja **HANYA di dalam `e:\kiswap\docs`**. **JANGAN ubah** `E:\kiswap` (aplikasi KORAMP utama) — boleh dibaca untuk referensi.
- **Semua path di kode/config pakai huruf drive kecil `e:\`** (jangan `E:\` uppercase) agar cocok dengan workspace root terdaftar.
- Semua konten **Bahasa Indonesia**.
- **Pin exact version** dependency; tanpa range `^`/`~`.
- **WAJIB lulus** `npm install && npm run build` exit code 0, **zero error**. Jangan matikan TypeScript/eslint demi lulus — perbaiki error aslinya.
- Mobile responsive: sidebar jadi drawer, TOC sembunyi di layar kecil.

---

## 9. Langkah kerja (jalankan berurutan)

1. **Baca 3 artefak desain** (§1) + `E:\kiswap\prisma\schema.prisma` + `E:\kiswap\src\lib\assets.ts` + pindai `E:\kiswap\src\app\api\` untuk halaman API Reference.
2. **Scaffold / lanjutkan** app Next.js di `e:\kiswap\docs`: `package.json` (pinned), `next.config`, `tailwind.config`, `tsconfig`, `postcss.config`, app shell (root layout + `SearchProvider`/`SearchDialog`, `TopNav`, `Sidebar` + drawer mobile, TOC kanan scroll-spy, homepage `/`, 404), `app/docs/[[...slug]]/page.tsx`, `nav.ts`, `lib/typography` (plugins), `components/mdx/` (map + komponen MDX), script prebuild `gen-search.mjs`, dan **semua file MDX** di `content/` untuk seluruh halaman 6 grup.
3. **Terapkan 4 perbaikan** §3.
4. **Tulis konten** semua halaman dalam Bahasa Indonesia, ikuti struktur §4–§6. Halaman On-Ramp & Off-Ramp & Roadmap harus lengkap sesuai §5 & §6.
5. **Buat `README.md`** dengan instruksi run (`npm install`, `npm run dev`, `npm run build`, `npm start`) + deskripsi singkat.
6. **Bangun & iterasi:** `npm install` lalu `npm run build`. Perbaiki tiap error type/lint sampai exit 0.
7. **Smoke test:** start `npm run dev` sebentar, konfirmasi tidak crash, lalu hentikan.
8. **Laporkan** hasil tiap gerbang verifikasi (§10) ke user.

---

## 10. Gerbang verifikasi (wajib lapor pass/fail masing-masing)

1. `npm install` sukses di `e:\kiswap\docs`
2. `npm run build` exit 0, zero error
3. `npm run dev` boot tanpa crash
4. Sidebar merender **6 grup** (Memulai, Integrasi, Privasi & Kepatuhan, Arsitektur, API Reference, Roadmap) dengan semua halaman; link internal antar halaman resolve (tidak ada 404)
5. Halaman **On-Ramp & Off-Ramp** punya struktur Helius: dua tabel visibilitas (Bidang|Visibilitas|Alasan), "Anda memerlukan", "Pertimbangan Kepatuhan" (+sub-bagian), "Petakan Alur yang Sudah Ada", "Catatan dan Audit", "Alur Transaksi" (On-Ramp + Off-Ramp), "Mulai Integrasi"
6. Halaman **Roadmap** merender 4 fase (Fase 1–4) dengan badge (Sudah Ship / Aktif / Direncanakan / Masa Depan) + legenda
7. Dark theme cocok palet KORAMP (`#08080A` bg, `#141416`/`#232326` surface, `#D4B78F` gold, `#22C55E` green)
8. `README.md` ada berisi instruksi run
9. Seluruh konten dalam Bahasa Indonesia

---

## 11. Definisi selesai

Semua 9 gerbang verifikasi lulus, `npm run build` exit 0, dan docs site bisa dijalankan dengan `npm run dev` di `e:\kiswap\docs`. Tidak ada file di `E:\kiswap` yang berubah.

Mulai sekarang: baca 3 artefak desain di §1, lalu kerjakan §9.
