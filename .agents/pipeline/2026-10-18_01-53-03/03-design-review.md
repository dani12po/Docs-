# Design Review — KORAMP Docs Site

Review of `02-design.md` against `01-requirements.md`. Design claims about existing KORAMP source were verified against `E:\kiswap` (`src/lib/assets.ts`, `prisma/schema.prisma`, `package.json`, `src/app/api/**/route.ts`, `src/lib/privacy.ts`, `scripts/`) and against the npm registry (peer-dependencies for `fumadocs-mdx`, `next-mdx-remote`, `rehype-slug`, `rehype-pretty-code`). The design's product-fact accuracy is excellent; the issues below are about design-level ambiguity, missing details, and one Next.js behavior subtlety.

## Findings

### 1. [MEDIUM] Search-index path normalization unspecified for Windows
**Where:** §10 (`scripts/gen-search.mjs`); also §4 file tree.
**Problem:** The design states the stored `path` field uses "`/`" as the separator, but the script runs an `fs` walk on Windows (this environment — repo is `E:\kiswap\docs`, platform `win32`), where `path.relative`/glob results use `\`. The design never specifies the normalization step. An implementer who stores the raw Windows relpath produces entries like `/docs/memulai\pengenalan`; `router.push` on such a path 404s, so search results break on Windows dev/build — contradicting FR-2.5 ("hasil membuka halaman terkait"). `content.ts` is unaffected (its `slug` comes from URL params, already `/`-split), so the trap is specifically in `gen-search.mjs`.
**Fix:** Specify the normalization explicitly in `gen-search.mjs`:
```js
const rel = path.relative(CONTENT_DIR, file);                       // may contain '\' on Windows
const slug = rel.replace(/\\/g, '/').replace(/\.mdx$/, '');         // forward-slash, no ext
const entry = { path: '/docs/' + slug, /* title, description, headings, excerpt */ };
```
Add a sanity assertion that no emitted `path` contains `\`.

### 2. [MEDIUM] `/docs` redirect will not fire under `dynamicParams = false`
**Where:** §5 (pipeline step 2: "Untuk slug kosong (`/docs`): `redirect('/docs/memulai/pengenalan')`") combined with §5 step 1 (`generateStaticParams` emits "slug array per halaman"; `dynamicParams = false`).
**Problem:** With an optional catch-all `[[...slug]]` and `dynamicParams = false`, a request is served only if its params match a `generateStaticParams` entry. The design emits only the real pages (non-empty slug arrays). The bare `/docs` route (empty slug) is NOT among them, so under `dynamicParams = false` it returns 404 — the in-page `redirect()` never executes. The stated 302-to-first-page behavior is therefore infeasible as written.
**Fix:** Pick one:
- (a) include the empty-slug entry in `generateStaticParams` and redirect in-page:
```ts
export function generateStaticParams() {
  const pages = NAV.flatMap(g => g.items.map(i => ({ slug: i.path.replace('/docs/','').split('/') })));
  return [{ slug: [] }, ...pages];
}
// in page: if (!slug || slug.length === 0) redirect('/docs/memulai/pengenalan');
```
- (b) add a dedicated `src/app/docs/page.tsx` whose only line is `redirect('/docs/memulai/pengenalan')` (cleaner — the catch-all keeps `dynamicParams = false` without needing the empty param).

### 3. [MEDIUM] Conflicting location for the `mdxComponents` map
**Where:** §4 file tree vs §5.
**Problem:** §4 lists `src/lib/typography.ts` with the note "ekspor mdxComponents map + plugin lists" AND also lists `src/components/mdx/mdxComponents.tsx` with "map elemen → komponen; dipakai `<MDXRemote components=...>`". §5 then says the route passes `components: mdxComponents` where `mdxComponents` is `src/components/mdx/mdxComponents.tsx`. Two files are both described as exporting the components map; the route's actual import source is ambiguous, and it is unclear whether `typography.ts` re-exports or duplicates the map.
**Fix:** Define a single ownership split:
- `src/components/mdx/mdxComponents.tsx` → exports `mdxComponents` (element → component map). Remove "mdxComponents map" from `typography.ts`'s description.
- `src/lib/typography.ts` → exports only `remarkPlugins` and `rehypePlugins` arrays.
- Route imports: `import { mdxComponents } from '@/components/mdx/mdxComponents'` and `import { remarkPlugins, rehypePlugins } from '@/lib/typography'`, passed to `<MDXRemote components={mdxComponents} options={{ remarkPlugins, rehypePlugins }} />`.

### 4. [MEDIUM] SearchDialog open-state cannot be shared via "prop callback" across layouts
**Where:** §6 (Sidebar "shared state via prop callback `onOpenSearch`"), §7/§10 (TopNav triggers ⌘/Ctrl+K; SearchDialog "dibuka dari TopNav dan Sidebar box").
**Problem:** TopNav lives in the root layout (`src/app/layout.tsx`) and Sidebar lives in the docs layout (`src/app/docs/layout.tsx`); they are neither siblings nor in a parent-child relationship. A plain "prop callback" cannot share the SearchDialog `isOpen` state between them, and the design never says where `<SearchDialog/>` is mounted or what holds the state. As described, at most one trigger could open the dialog, breaking FR-2.5/AC-11 search from the other.
**Fix:** Introduce a client context provider in the root layout that owns `isOpen` and renders `<SearchDialog/>` once:
```tsx
// src/components/search/SearchProvider.tsx ('use client')
const Ctx = createContext<{ open: () => void }>(null!);
export function SearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  return (
    <Ctx.Provider value={{ open: () => setOpen(true) }}>
      {children}
      <SearchDialog isOpen={isOpen} onClose={() => setOpen(false)} />
    </Ctx.Provider>
  );
}
export const useSearch = () => useContext(Ctx);
```
Mount `<SearchProvider>` in `src/app/layout.tsx` wrapping `{children}`; both `TopNav` and `Sidebar` call `useSearch().open()`. Replace the "prop callback" wording with this provider.

### 5. [NIT] Tailwind pinned to 3.4.19; requirement names 3.4.0
**Where:** §3 (`tailwindcss: 3.4.19`); requirement Asumsi ("Tailwind 3.4.0 … untuk konsistensi"); §2 "stack identik dengan KORAMP" thesis.
**Problem:** KORAMP uses `tailwindcss: 3.4.0` (verified in `E:\kiswap\package.json`); the requirement explicitly names 3.4.0 as the consistency version. The design pins 3.4.19 without acknowledging the deviation (§8 acknowledges the ink-color deviation but not this). AC-10 (exact pinning) is still satisfied, 3.4.19 is within the 3.4 line, and `@tailwindcss/typography@0.5.20` peer `tailwindcss >=3` is satisfied, so impact is low.
**Fix:** Either pin `tailwindcss: 3.4.0` to match KORAMP and the requirement, or add a one-line rationale for 3.4.19 next to §3.

### 6. [NIT] TOC↔heading slug parity invariant is overstated
**Where:** §6 ("Invariant slug dimiliki bersama oleh content.ts (TOC) dan rehype-slug (heading id); parity dijamin oleh versi github-slugger yang sama").
**Problem:** The same `github-slugger@2` version guarantees identical slug OUTPUT for identical INPUT, but the two pipelines do not share identical input: `content.ts` slugs the RAW markdown heading text (regex), while `rehype-slug` slugs the RENDERED text content (via `hast-util-to-string`, which strips inline formatting and link targets). For plain text, bold/italic/inline-code headings the slugs match; for headings containing links or images (e.g. `## [Foo](/x) Bar`) the raw text includes the URL and the slugs diverge, so the TOC anchor points to a non-existent `id`. The design's fallback ("jalankan pipeline unified terpisah … opsi, bukan default") is reactive, not preventive.
**Fix:** Add an explicit content rule to the §17 invariants: "H2/H3 headings must be plain text — no links, images, or inline HTML" (bold/italic/inline-code are allowed), and state that parity holds under that rule. Alternatively, make the unified `rehype-slug`+collector extraction the default and drop the regex.

### 7. [NIT] Content-file count misstated
**Where:** §20 step 5 ("Tulis semua 19 file `content/*.mdx`").
**Problem:** The §4 file tree and the §6 nav table define 18 pages: Memulai 3 + Integrasi 4 + Privasi 4 + Arsitektur 5 + API Reference 1 + Roadmap 1 = 18. §20 says 19. No 19th page is referenced anywhere else.
**Fix:** Change "19 file" to "18 file".

### 8. [NIT] Search scoring "token-match" underspecified
**Where:** §10 ("token-match pada title … headings … description/excerpt; substring case-insensitive; hasil top-N (≤8)").
**Problem:** For a single-token query the rule is clear; for multi-token queries it is unspecified whether ALL tokens must match (AND) or ANY (OR), in which field(s), and how multi-match rank combines.
**Fix:** Specify, e.g.: "A document matches only if every query token is a case-insensitive substring of `title ∪ headings ∪ description ∪ excerpt` (AND across tokens). Rank by weighted match count: title×4, headings×2, description×1, excerpt×1; ties by nav order. Return top 8."

---

## Verified Assumptions

Independently confirmed against `E:\kiswap` source or the npm registry.

- **Assets/networks/chains** (`src/lib/assets.ts`): SOL→Solana Devnet (chainId `null`); ETH→Base Sepolia (chainId 84532); BNB→BSC Testnet (chainId 97). Matches design §11 / FR-4.7 exactly.
- **Stack versions** (`E:\kiswap\package.json`): next 14.2.35, react/react-dom 18.2.0, typescript 5.3.3, @types/node 20.10.5, @types/react 18.2.46, @types/react-dom 18.2.18, eslint 8.56.0, autoprefixer 10.4.16, postcss 8.4.32, lucide-react 0.303.0 — all match design §3. (KORAMP `tailwindcss` 3.4.0 and `eslint-config-next` 14.0.4 differ from design's 3.4.19 / 14.2.35 — see NIT 5; `clsx` 2.0.0 in KORAMP vs design 2.1.1 is not a claimed match.)
- **Prisma models** (`prisma/schema.prisma`): all 23 models named in FR-4.14 exist (Network, Asset, PlatformWallet, Quote, TopUpOrder, SellOrder, Payment, Payout, CryptoDeposit, CryptoWithdrawal, LedgerEntry, AuditLog, SystemSetting, FeeConfig, SecurityEvent, IpBan, PageVisit, AdminAccessKey, SupportTicket, WalletChallenge, RewardConfig, RewardCycle, RewardClaim) plus the support/legacy models KipayWebhook, TransfiWebhook, SupportMessage.
- **Specific fields/uniqueness** the design cites, all confirmed in schema: `Quote.usedAt`; `TopUpOrder.publicId`/`walletAddress`/`walletType`; `SellOrder.confirmations`/`requiredConfirmations`; `AdminAccessKey.keyVerifier` (SHA-256)/`activeSessionJti`/`keyVersion`; `IpBan.level`/`violationCount`/`permanent` (manual-only); `SecurityEvent.bucket` (hour bucket) + `@@unique([bucket,ip,eventType])`; `LedgerEntry.direction` (CREDIT|DEBIT, double-entry); `XenditWebhook @@unique([kind,event,paymentRequestId,payoutId])`; `RewardClaim.status @default("PENDING_PAYOUT")`; `RewardConfig.termsVersion @default("2026-09-v1")`; `RewardConfig.cycle @default("monthly")`.
- **API route tree** (`E:\kiswap\src\app\api/**/route.ts`): every path in design §13 exists (58 route files). Spot-checked methods all match: `/quotes/topup` & `/quotes/sell` POST (body `{asset,network,idrAmount}`, 30/min, ban-gated); `/orders/topup` POST (10/min, ban-gated, wallet/network/asset validation, 201/202); `/orders/[publicId]` GET; `/orders/[publicId]/payment-status` GET|POST; `/admin/fees/[key]` PUT; `/admin/rewards` GET|PUT; `/admin/security/bans` GET|POST|PATCH|DELETE; `/admin/keys` & `/admin/prices` GET|POST; `/admin/fees/bulk` PUT; `/support` GET|POST; `/prices` `/assets` `/transactions` `/rewards` GET; `/rewards/claim` POST; `/visits` POST; `/wallets/{validate,challenge,verify,signature}` POST; `/webhooks/xendit/{payment,payout}` POST; `/cron/{scan-deposits,reconcile}` GET; `/admin/{login,logout}` POST; `/admin/session` GET.
- **No public `/payments` route** — design §13 is honest ("TIDAK ada endpoint publik `/payments` terpisah").
- **Webhook auth** (`webhooks/xendit/payment/route.ts`): header `x-callback-token` compared to `process.env.XENDIT_WEBHOOK_TOKEN`; idempotent via `XenditWebhook`; signal-only (fulfillment server-side). Matches design §13.
- **Cron auth** (`cron/scan-deposits/route.ts`): `guardCron(req)` (CRON_SECRET bearer); GET; scheduler-only. Matches design §13.
- **Bank masking** (`src/lib/privacy.ts`): `maskAccount` returns `****` + last 4 digits. Confirms the design's "4 digit akhir rekening bank" claim (FR-4.8 / AC-5).
- **Public ledger masking** (`api/transactions/route.ts`): `maskWallet` (EVM `0x1234...abcd`); server-side pagination (limit ≤ 50); filters `side/asset/network/status/q`; safe DTO (no payment/bank/provider). Matches design §13.
- **Admin scripts** (`E:\kiswap\scripts` + `package.json`): `setup-admin.cjs`, `admin-key-rotator.cjs`, `setup-totp.cjs` all exist. Matches FR-4.16.
- **Framework fallback justified** (npm registry): `fumadocs-mdx@latest` peerDependencies require `next ^15.3.0 || ^16.0.0` and `react ^19.2.0` — incompatible with the pinned Next 14.2.35 / React 18.2.0, confirming the design's reason to take the fallback.
- **Fallback package & parity peers compatible** (npm registry): `next-mdx-remote@5.0.0` peer `react >=16` (OK with 18.2.0) and `exports` includes `./rsc` (the path the design uses). `rehype-slug@6.0.0` depends `github-slugger ^2.0.0` (matches the design's pinned 2.0.0 line). `rehype-pretty-code@0.14.5` peer `shiki ^1||^2||^3||^4` with devDeps `shiki ^4.0.1` (matches the design's pinned `shiki 4.5.0`).

## Unverified / Wrong Assumptions

- **"fumadocs-mdx di SEMUA versi 10.x–15.x memerlukan `next ^15.3.0 || ^16.0.0` dan `react ^19.2.0`" (§2)** — over-broad. I verified only `fumadocs-mdx@latest` (which does require `next ^15.3` / `react ^19.2`). The design contradicts its own "SEMUA versi" claim two paragraphs later by carving out the legacy 13.x line (`fumadocs-mdx@10.0.2`, `next: >= 14.1.0`) as installable. The universal claim is therefore wrong; however the conclusion (use fallback) still holds — modern fumadocs-mdx is incompatible AND the design provides the secondary "proven identical stack" justification AND the requirement explicitly permits the fallback. Not blocking. Recommend rewording to "fumadocs-mdx modern (14.x–15.x) memerlukan `next ^15.3` / `react ^19.2`."
- **Actual `npm install` / `npm run build` of the docs site** not run (the design states this itself in §20). It relies on the stack being identical to KORAMP's proven build. Acceptable for a design doc; the gate (AC-1 / AC-2) confirms it at implementation.

## Verdict

4 MEDIUM + 4 NIT findings → **CHANGES_REQUESTED** (any HIGH or MEDIUM ⇒ CHANGES_REQUESTED). The MEDIUM findings are localized and each has a concrete fix; none require re-architecting.
