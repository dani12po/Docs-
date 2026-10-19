# MoonPay Widget Docs Rewrite — Plan & Checklist

> Target files (kept structurally identical, in sync):
> - `content/id/integrasi/moonpay-widget.mdx` (Bahasa Indonesia — default locale)
> - `content/en/integrasi/moonpay-widget.mdx` (English — currently WRONG: it is a byte-for-byte copy of the id file in Bahasa Indonesia; must be fully translated)
>
> Scope: rewrite BOTH MDX files so they are technically accurate against the real MoonPay Web SDK and cover BOTH on-ramp (buy) and off-ramp (sell). Do NOT touch `src/lib/nav.ts` (MoonPay Widget is already listed for both locales). Do NOT touch any other file unless the build breaks because of this content. Do NOT touch the main KORAMP app at `E:\kiswap`.
>
> The coder step performs the LIVE MoonPay research (fetch dev.moonpay.com pages to confirm exact API names, callback names, param names, endpoint paths). This plan gives the authoritative target structure and the API surface to use; where a name below is marked "VERIFY", confirm it against the live doc and use what the doc says.

---

## 1. What is wrong in the current files (verified by reading both)

Both files are identical and share every defect:

1. **Wrong SDK API.** Imports `MoonPayWalletWidget` from `@moonpay/moonpay-js` and calls `widget.mount('#moonpay-widget')`. That export and method do NOT exist in the real package.
2. **Off-ramp only.** Only documents `flow: 'sell'`. No on-ramp (buy) section at all.
3. **Wrong event API.** Uses `widget.on('transactionCreated' | 'transactionCompleted' | 'transactionFailed' | 'widgetClosed', ...)`. These `.on()` event names are invented; the real web SDK uses config callbacks (e.g. an `onTransactionStatusUpdate`-style callback and `onCloseOverlay` for the overlay variant), not an `.on()` emitter.
4. **Missing URL signing (critical).** No server-side HMAC-SHA256 signing of the widget URL with the Secret Key. For buy/swap with `walletAddress`/`walletAddresses`, the URL must be signed and the `signature` query param appended before the widget is shown.
5. **Fabricated endpoints.** The "API Endpoints" section invents `POST /api/moonpay/create-sell` and `GET /api/moonpay/transaction/:id` as if they are MoonPay's. They are not — they look like a KORAMP backend that doesn't exist.
6. **Missing webhooks.** No webhook section at all.
7. **Wrong/incomplete install.** Documents npm `@moonpay/moonpay-js` (correct package, wrong usage) plus a guessed `@moonpay/moonpay-react-native` (unverified). Does NOT document the `<script>` tag / `window.MoonPayWebSdk` load method.
8. **Resources incomplete.** Only links the off-ramp overview, the demo repo, and two support pages. Must link both on-ramp and off-ramp overviews, the web SDK doc, the parameters pages, URL signing, webhooks, and the demo repo.
9. **(Extra) en file is not English.** The `en` file is a verbatim copy of the `id` file in Bahasa Indonesia. It must be fully rewritten in English.
10. **(Extra) wrong param names.** Uses `baseCurrency` and `redirectUrl`; the real params are `baseCurrencyCode` and `redirectURL` (VERIFY against the live parameters pages). Also references `theme: 'dark'` and `paymentMethod: 'credit_debit_card'` as if confirmed — keep only what the live docs confirm.

---

## 2. The real MoonPay API surface the rewrite MUST use

Confirmed by the task brief; VERIFY exact spelling against live docs:

**`@moonpay/moonpay-js` (npm, web SDK):**
- Exports an **async** `loadMoonPay` function that resolves to the SDK constructor (`init`).
- Pattern:
  ```ts
  import { loadMoonPay } from '@moonpay/moonpay-js';
  const init = await loadMoonPay();
  const sdk = new init({ flow, environment, variant, ...params });
  // overlay / newTab / newWindow:
  sdk.show();
  // embedded: pass `containerNodeSelector: '#some-id'` (CSS selector) in config instead of calling show into a node
  ```
- `flow`: `'buy'` (on-ramp) | `'sell'` (off-ramp) | `'swap'` | `'swapsCustomerSetup'`.
- `environment`: `'sandbox' | 'production'`.
- `variant`: `'embedded' | 'overlay' | 'newTab' | 'newWindow'`.
  - `embedded` REQUIRES `containerNodeSelector` (a CSS selector string).
  - `overlay` supports an `onCloseOverlay` handler.
- `useWarnBeforeRefresh`: boolean (default `true`) — relevant inside webviews.

**Callbacks (NOT an `.on()` emitter):**
- Pass callbacks in the config object. The exact callback names are on the callbacks doc page (VERIFY and use the real names). `onCloseOverlay` is confirmed for the overlay variant. For transaction status, if a specific transaction callback name cannot be confirmed from the docs, DO NOT invent one — document the signing/URL/webhook approach instead and LINK to the callbacks page. Never fabricate `.on('transactionCreated', ...)`.

**URL Signing (server-side, required for buy/swap when `walletAddress`/`walletAddresses` is passed):**
- Build the widget URL query string from your params, sign the URL with the **Secret Key** using **HMAC-SHA256**, append the result as a `signature` query param, then hand the signed URL to the SDK (or render the widget from the signed URL).
- Show a Node example. Either use the `moonpay-node` SDK helper if it provides signing, OR manual `crypto.createHmac('sha256', secret).update(url).digest('hex')`. VERIFY the exact signing input (full URL with query string vs. path+query) from the URL signing doc and use what it says.

**MoonPay REST API (server-side, secret-key bearer auth):**
- Base: `https://api.moonpay.com`. Used to QUERY transactions server-side (never expose the secret key to the client). Use the real endpoint paths from dev.moonpay.com (VERIFY). If an exact path can't be confirmed, describe it generically and LINK to the authoritative page rather than inventing a path. Do NOT present these as KORAMP's own endpoints.

**Webhooks:**
- MoonPay pushes transaction status updates to a webhook URL you configure in the dashboard.
- Verify the webhook signature: HMAC-SHA256 of the **raw request body** with the Secret Key, compared against the signature header (VERIFY the exact header name from the webhooks doc).
- Idempotency: store handled webhook IDs / `externalTransactionId` to avoid double-processing.
- Map MoonPay statuses to KORAMP order states conceptually (do NOT fabricate KORAMP code or KORAMP endpoints).

**`<script>` tag load (alternative to npm):**
- Attach the SDK via a script tag; it exposes `window.MoonPayWebSdk` (VERIFY the exact global name from the web SDK doc). Then `loadMoonPay`-equivalent init from that global.

**React Native:** Only keep a brief React Native note if the real package name is confirmed from npm. Otherwise DROP it rather than guess. (The current `@moonpay/moonpay-react-native` is unverified — confirm or remove.)

---

## 3. Exact MoonPay doc URLs to cite (best-guess; coder MUST fetch & verify each, correcting the path if it 404s/redirects)

| Page | URL (VERIFY) |
|---|---|
| On-ramp overview (user gave this) | https://dev.moonpay.com/widget/on-ramp/overview |
| Off-ramp overview | https://dev.moonpay.com/widget/off-ramp/overview |
| Web SDK (web) | https://dev.moonpay.com/widget/sdk/web |
| Web SDK callbacks | https://dev.moonpay.com/widget/sdk/web/callbacks |
| Web SDK URL signing | https://dev.moonpay.com/widget/sdk/web/url-signing |
| On-ramp parameters | https://dev.moonpay.com/widget/on-ramp/parameters |
| Off-ramp parameters | https://dev.moonpay.com/widget/off-ramp/parameters |
| Webhooks | https://dev.moonpay.com/widget/webhooks (VERIFY — may be under /widget/sdk/web/webhooks) |
| moonpay-node SDK (server-side signing/API) | https://github.com/moonpay/moonpay-node |
| Demo integrations repo | https://github.com/moonpay/moonpay-demo-integrations |

When you fetch these, capture: (a) the real callback names for the callbacks section, (b) the exact param names + types for the config table, (c) the exact URL-signing input string, (d) the real webhook signature header name, (e) the real REST API transaction-query path. Use what the docs say everywhere a name is marked VERIFY in this plan.

---

## 4. Site MDX conventions (verified from `on-ramp-off-ramp.mdx`, `Callout.tsx`, `mdxComponents.tsx`, `content.ts`, `page.tsx`, `README.md`)

- **Frontmatter:** `title` (required → becomes the page `<h1>`) + `description` (required here → renders as the subtitle paragraph below the H1). Both files already have a `description`; update it to reflect on-ramp + off-ramp coverage, and translate it to English in the `en` file.
- **Body starts at `##` (H2).** NEVER write an `#` H1 in the body — the route renders `<h1>{title}</h1>` from frontmatter. Sub-sections use `###` (H3). The TOC is auto-extracted from H2/H3 only.
- **No H4+ needed.** Keep to H2/H3 so the right-rail TOC stays clean.
- **`<Callout>` component:** `<Callout type="info|warning|success|danger" title="...">children</Callout>`. `type` defaults to `info`; `title` is optional.
  - IMPORTANT CAVEAT for the `en` file: when `title` is omitted, the default label is **Indonesian** (`Perhatian` / `Berhasil` / `Penting`). Therefore in the `en` file, EVERY `<Callout>` MUST pass an explicit English `title` so it doesn't render Indonesian labels. In the `id` file, `title` may be omitted for the default Indonesian labels, but explicit Indonesian titles read better — prefer explicit titles in both files.
- **Code fences:** use ```tsx, ```bash, ```http, ```json. They render as Shiki-highlighted blocks (not executed). Code fences are skipped by the TOC extractor, so headings inside code blocks won't pollute the TOC.
- **Tables:** GFM pipe tables (remark-gfm). Keep param tables compact.
- **Links:** external `http(s)` links get `target="_blank" rel="noopener noreferrer"` automatically. Internal links use `/docs/<locale>/...` paths (e.g. `/docs/id/integrasi/on-ramp-off-ramp`). NOTE: `npm run audit:i18n` validates that internal links resolve to a real route — only link KORAMP doc paths that exist (the integrasi pages do). MoonPay external links are fine.
- **Inline HTML:** the `<div className="not-prose ...">` grid wrapper is available but not required here; prefer plain Callouts and tables.
- **Code samples must use the REAL API** — `loadMoonPay`, `init`, `flow`, `environment`, `variant`, `containerNodeSelector`, `sdk.show()`. NO `MoonPayWalletWidget`, NO `.mount()`, NO invented `.on()` events, NO fabricated endpoints.
- **Honest KORAMP context:** KORAMP is wallet-first (no accounts; wallet address = identity), native flow uses Xendit/QRIS for IDR, MoonPay is an ADDITIONAL/alternative gateway (merchant of record — MoonPay handles KYC/AML/fraud/compliance). Note region-dependent eligibility where relevant; don't claim MoonPay supports something unconfirmed. Don't invent KORAMP backend endpoints.

---

## 5. Section-by-section outline (apply to BOTH files; id in Bahasa Indonesia, en in English — same structure, same code samples)

Heading convention below: `id heading / en heading`. Where the two are identical, one heading is shown. Technical terms (QRIS, webhook, KYC, HMAC, SDK, widget, sandbox, environment, signature) stay English in BOTH files.

### Frontmatter
- `id`: `title: "MoonPay Widget"`, `description: "Integrasi MoonPay Widget sebagai payment gateway alternatif untuk on-ramp (beli crypto) dan off-ramp (jual crypto). MoonPay bertindak sebagai merchant of record yang menangani KYC/AML, fraud, dan compliance."`
- `en`: `title: "MoonPay Widget"`, `description: "Integrate the MoonPay Widget as an alternative payment gateway for on-ramp (buy crypto) and off-ramp (sell crypto). MoonPay acts as the merchant of record, handling KYC/AML, fraud, and compliance."`

### `## Overview` (both files, same heading)
- 1–2 short paragraphs: MoonPay Widget lets users buy (on-ramp) and sell (off-ramp) crypto; MoonPay is the merchant of record (handles KYC/AML/fraud/compliance); MoonPay is an ADDITIONAL/alternative gateway alongside KORAMP's native Xendit/QRIS flow. Mention region-dependent eligibility (buy/sell availability varies by country/asset — link to on-ramp and off-ramp overviews).
- A `<Callout type="info" title="...">` noting MoonPay is alternative to the native QRIS ramp; KORAMP remains wallet-first (wallet address = identity); MoonPay is merchant of record.

### `## Prasyarat` / `## Prerequisites`
- Bullet list: MoonPay business account (dashboard.moonpay.com); Publishable API Key + Secret Key; widget domain whitelisted in dashboard; sandbox for testing. Note region/asset eligibility.

### `## Instalasi` / `## Installation`
- Two load methods:
  - **npm:** `npm install @moonpay/moonpay-js` + `import { loadMoonPay } from '@moonpay/moonpay-js'`.
  - **`<script>` tag:** attaches `window.MoonPayWebSdk` (VERIFY global name). Show the snippet.
- React Native note: keep ONLY if the real package name is confirmed from npm; otherwise omit. (Default: omit unless verified.)

### `## On-Ramp (Beli Crypto)` / `## On-Ramp (Buy)`
- Short user flow (numbered): user picks crypto + fiat amount → widget opens (flow `'buy'`) → MoonPay handles payment + KYC → crypto delivered to the user's wallet.
- Code sample (```tsx) using the REAL API: `flow: 'buy'`, pre-fill `walletAddress`/`walletAddresses`, `baseCurrencyCode`/`baseCurrencyAmount`, `currencyCode`, `email`, `externalTransactionId`. Embedded example with `containerNodeSelector`, OR overlay with `sdk.show()`.
- Callout (warning): when `walletAddress`/`walletAddresses` is passed for buy, the widget URL MUST be signed server-side with the Secret Key before display (see URL Signing). Show the buy flow obtaining a signed URL from the server, then initializing the SDK from it.
- Provide the server-side sign snippet here too OR reference the URL Signing section (avoid duplication — reference is fine, but the buy section must make the signing requirement visible).

### `## Off-Ramp (Jual Crypto)` / `## Off-Ramp (Sell)`
- Short user flow (numbered), INCLUDING the 48-hour deposit window: user picks crypto + fiat → widget (flow `'sell'`) → KYC (first time) → user sends crypto to MoonPay deposit address → deposit must arrive within 48 hours or the transaction fails with `Deposit timeout` → after deposit verified, fiat payout to user's bank.
- `<Callout type="warning" title="Deposit timeout">` for the 48-hour rule (replaces the current `> **Catatan Penting:**` blockquote).
- Code sample (```tsx) using `flow: 'sell'`, pre-fill, signing where required.

### `## Konfigurasi Widget` / `## Widget Configuration`
- A GFM table of CONFIRMED params only. Use exactly these rows (VERIFY spelling against the live parameters pages; default to these names): `flow`, `environment`, `variant`, `containerNodeSelector`, `onCloseOverlay`, `useWarnBeforeRefresh`, `baseCurrencyCode`, `baseCurrencyAmount`, `currencyCode`, `walletAddress`, `walletAddresses`, `email`, `externalCustomerId`, `externalTransactionId`, `colorCode`, `theme`, `redirectURL`, `paymentMethod`.
- Columns: `Parameter | Type | Deskripsi` (id) / `Parameter | Type | Description` (en). Mark which params require URL signing (walletAddress/walletAddresses in buy/swap).

### `## URL Signing` (both files, same heading)
- Why required: for buy/swap when `walletAddress`/`walletAddresses` is passed, the URL must be signed server-side with the Secret Key (HMAC-SHA256) and the result appended as a `signature` query param — otherwise the wallet address pre-fill is rejected.
- Node server example (```ts or ```tsx): build query string → `crypto.createHmac('sha256', secretKey).update(<signing input>).digest('hex')` → append `&signature=...` → return signed URL to the client. VERIFY the exact signing input (full URL+query vs path+query) from the URL signing doc; if `moonpay-node` provides a signing helper, show that too.
- Callout (danger): Secret Key must NEVER reach the client; signing is server-side only.

### `## Webhooks` (both files, same heading)
- MoonPay pushes transaction status updates to a webhook URL you configure in the dashboard.
- Verify signature: HMAC-SHA256 of the **raw body** with the Secret Key, compared to the signature header (VERIFY header name from the webhooks doc). Show a Node verify snippet (```ts): compare `crypto.createHmac('sha256', secretKey).update(rawBody).digest('hex')` to the header; reject on mismatch.
- Idempotency: persist handled webhook IDs / use `externalTransactionId`; ignore duplicates.
- Status mapping: map MoonPay statuses to KORAMP order states conceptually (describe the mapping in prose/table; do NOT fabricate KORAMP code or KORAMP endpoints). Link to the webhooks doc for the full status list.
- Callout (info or warning): webhook verification + idempotency reminders.

### `## Variants` (both files, same heading)
- Table or bullets: `embedded` (needs `containerNodeSelector`; in-page) | `overlay` (modal; supports `onCloseOverlay`) | `newTab` (opens a new browser tab) | `newWindow` (popup window). When to use each.
- Note `useWarnBeforeRefresh` relevance in webviews.

### `## Testing` (both files, same heading)
- Sandbox environment (`environment: 'sandbox'`); test cards / test data (reference the sandbox docs; don't invent card numbers unless confirmed from MoonPay docs); sandbox payouts don't move real funds. Note that sandbox behavior differs from production.

### `## Keamanan` / `## Security`
- Bullets: never expose the Secret Key client-side; sign widget URLs server-side; verify webhook signatures; use `externalTransactionId` for idempotency; keep publishable key client-side only.
- Callout (danger) reiterating Secret Key protection.

### `## Resources` (both files, same heading)
- Bulleted links to BOTH overviews (on-ramp + off-ramp), the web SDK doc, the on-ramp parameters page, the off-ramp parameters page, the URL signing doc, the webhooks doc, the callbacks doc, the `moonpay-node` repo, and the demo-integrations repo. (All the URLs in §3 above, verified.)

---

## 6. What was wrong → what the fix is (checklist for all 8 issues)

- [ ] **1. Wrong SDK API.** REMOVE `MoonPayWalletWidget` import and `.mount()`. USE `loadMoonPay` → `init` constructor → `sdk.show()` (overlay/newTab/newWindow) or `containerNodeSelector` (embedded). Every code sample rewritten to the real API.
- [ ] **2. Off-ramp only.** ADD the full `## On-Ramp (Beli Crypto)` / `## On-Ramp (Buy)` section with user flow, pre-fill, signing, and a buy code sample (`flow: 'buy'`).
- [ ] **3. Wrong event API.** REMOVE all `widget.on('transactionCreated'/'transactionCompleted'/'transactionFailed'/'widgetClosed', ...)`. If a real transaction callback name is confirmed on the callbacks doc, document it as a CONFIG callback (not `.on()`). Otherwise document signing/URL/webhook and LINK to the callbacks page. Keep `onCloseOverlay` (confirmed for overlay). Never invent event names.
- [ ] **4. Missing URL signing.** ADD the `## URL Signing` section with a Node HMAC-SHA256 example and the `signature` query param; make the buy section show obtaining a signed URL server-side before showing the widget.
- [ ] **5. Fabricated endpoints.** REMOVE `POST /api/moonpay/create-sell` and `GET /api/moonpay/transaction/:id` (delete the "API Endpoints" section entirely). REPLACE with the real server-side story: URL signing; MoonPay REST API at `https://api.moonpay.com` (secret-key bearer) for querying transactions (use real paths or link generically); webhooks (new section). Do NOT present these as KORAMP endpoints.
- [ ] **6. Missing webhooks.** ADD the `## Webhooks` section: configure webhook URL in dashboard; verify signature via HMAC-SHA256 of raw body; idempotency via stored IDs / `externalTransactionId`; conceptual status mapping (no fabricated KORAMP code).
- [ ] **7. Wrong/incomplete install.** DOCUMENT both npm (`@moonpay/moonpay-js`, `import { loadMoonPay }`) and the `<script>` / `window.MoonPayWebSdk` load. Keep a React Native note ONLY if the real package name is confirmed from npm; otherwise drop it.
- [ ] **8. Resources incomplete.** REPLACE the Resources list with links to BOTH overviews, web SDK, on-ramp parameters, off-ramp parameters, URL signing, webhooks, callbacks, moonpay-node, and the demo repo.
- [ ] **(9) en file not English.** Fully rewrite the `en` file in English (it is currently a verbatim Bahasa Indonesia copy). Same structure as `id`.
- [ ] **(10) wrong param names.** Use `baseCurrencyCode` (not `baseCurrency`) and `redirectURL` (not `redirectUrl`); keep only confirmed params in the config table (VERIFY each against the live parameters pages).

---

## 7. Verification (the coder step runs these after writing)

1. `npm run build` — must pass. Runs `prebuild` (regenerates `public/search-index.json` from `content/`) then `next build`. A passing build confirms both MDX files compile via `next-mdx-remote/rsc` (bad MDX/JSX in a code fence is fine, but a malformed `<Callout>` or broken frontmatter fails the build).
2. `npm run audit:i18n` — must pass. Confirms nav↔file consistency and that any internal links resolve to real routes. (The MoonPay doc is mostly external links, so this should pass; if you add internal KORAMP cross-links, the target routes must exist.)
3. `npm run lint` — must pass (`next lint`).
4. Manual spot-check: open `/docs/id/integrasi/moonpay-widget` and `/docs/en/integrasi/moonpay-widget` (or read the rendered build) and confirm: page H1 = "MoonPay Widget"; body starts at `##`; right-rail TOC lists the H2 sections in order; no `MoonPayWidget`, no `.mount()`, no `.on(...)`, no `/api/moonpay/...` endpoints remain in either file.
5. Confirm both files are structurally identical (same section count + same headings-in-translation) and that the `en` file is actually English.

---

## 8. Constraints / guardrails

- Edit ONLY `content/id/integrasi/moonpay-widget.mdx` and `content/en/integrasi/moonpay-widget.mdx`. Do NOT edit `src/lib/nav.ts` or any other file unless the build fails specifically because of this content (then fix the minimal thing).
- Do NOT touch the main KORAMP app at `E:\kiswap`.
- Do NOT fetch MoonPay docs in THIS step (already handled — the coder step does the live research). The coder step: fetch each URL in §3, correct any that 404/redirect, and use the real names found there wherever this plan says VERIFY.
- Never fabricate: SDK exports, methods, event/callback names, endpoint paths, param names, webhook header names. If something can't be confirmed, describe it generically and LINK to the authoritative page.
- Keep KORAMP context honest: wallet-first, no accounts, native flow = Xendit/QRIS, MoonPay = alternative gateway + merchant of record; note region-dependent eligibility; don't invent KORAMP backend endpoints.
- Both files structurally identical; id in Bahasa Indonesia, en in English; technical terms stay English in both; body starts at `##`; no H1 in body.
