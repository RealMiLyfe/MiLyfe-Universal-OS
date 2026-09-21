# Finance Branch — Crypto Rail V2

**Status:** `IN_DESIGN` — requirements sourced from the Tree V1 build directive (`PROMPT`). No prior repo copy of this file exists (see `../../PROVENANCE.md` #2). Requires human approval at Phase 0 exit and full Phase 6 design.
**Parent:** `FINANCE-BRANCH-DESIGN.md` (unchanged; this file is the binding rail spec it references).
**Rails law:** No GoCardless. No Whop. No Stripe. No Visa/MC rails for $MLY. Crypto + cash + own NFC cards only.

## 1. Design principles

1. MiMoney is the sole authoritative $MLY ledger. No parallel ledger. No negative ever.
2. Projected value is never presented as settled value.
3. value in must be observable and receipted; value out must be human-signed and receipted.
4. No external vendor silently becomes the authority for Kernel, $MLY, governance, MiPsyche, or public-office records (System Context boundary rule).
5. External USD-facing rails stay locked until legal, financial, security, reserve, partner, and human approvals (Finance boundary; Authority Matrix "Enable USD-facing rail" row).

## 2. value in — crypto deposits

Accepted in-assets: **USDC, USDT, SOL, BTC, ETH, XRP**.

- Each supported asset has an explicit adapter: deposit address management, confirmation policy, reorg handling, fee treatment, failure handling, exit behavior (per System Context boundary rule).
- Deposit lifecycle: `announced → observed-on-chain → confirmed → credited(settled)` — credit to the $MLY ledger happens only after the asset-specific confirmation policy passes. Anything earlier is `projected`, never spendable, never displayed as balance.
- Every credit emits a MiReceipt (actor/branch/OS/purpose/capability/approval/impact/status/correction path).
- Entity: `crypto_deposits` (deposit id, MiID ref, asset, amount, tx hash, confirmations, status, credited $MLY, receipts). Full schema in Phase 6.

## 3. value in — cash via trusted nodes

Cash enters through **trusted nodes**: approved people, businesses, devices, and ATMs.

- A trusted node is a registered MiID entity with a scoped cash-intake capability, approval record, limits, audit trail, and revocation path (Authority Matrix governs grant/revoke).
- Cash-intake lifecycle: `intent → in-person handoff → dual confirmation (node + member) → credited(settled)` with receipts to both parties.
- No anonymous intake above the human-approved threshold; thresholds stay conservative, and risk/disclosure review informs partner-facing cash-threshold policy.
- Entity: `cash_exchanges` (exchange id, node ref, member ref, fiat amount, $MLY credited, confirmations, receipts). Full schema in Phase 6.

## 4. The $MLY ledger (sole)

- $MLY is the sole internal unit of account. All internal prices, rewards, fees, and pots are denominated in $MLY.
- Invariants: one ledger (MiMoney), no negative balances, every posting balanced, every mutation human-signed or human-approved-policy-executed, every mutation receipted, full reconciliation support.
- Rewards require verified contribution + approved rules (Constitution Art VII.5).
- Treasury authority explicit and auditable (Art VII.6). Pot model and reserve treatment finalized in Phase 6 (old-tree reference used 70/30-style pot splits and spending/savings/community pots — must be re-derived, not copied blindly).

## 5. value out — swap via community nodes (P2P)

- Members swap $MLY out through **community nodes**: peer-to-peer, in person (e.g., meet at the library).
- Swap lifecycle: `listing → match → meet → dual confirmation → settled`, with receipts and dispute path via MiResolve.
- Entity: `swap_listings` (listing id, maker ref, offer, terms, meeting policy, status, receipts). Full schema in Phase 6.
- No automated USD redemption rail in V1 — reverse/MLY-out rails remain locked capabilities until risk/disclosure/partner review + evidence + human approval.

## 6. Own cards — digital NFC first, plastic later

- **Phase 1 (V1): digital cards, phone-first.** MiPay supports **BLE / NFC / QR**, with **offline store-carry-forward** (signed offline transaction payloads carried on the device and settled when connectivity returns; double-spend prevented by device-key-signed sequence + MiMoney settlement checks — full protocol in Phase 6, security proof in Phase 9).
- **Phase 2 (later): regular plastic cards** on MiLyfe's **own network** — debit/credit issued and settled by MiLyfe rails, not Visa/Mastercard.
- Entity: `finance_cards` (card id, MiID ref, form factor, keys/capability refs, limits, status, receipts). Full schema in Phase 6.

## 7. First 1,200 members via MiForge

- **200 Pro + 1,000 Daily** founding members onboarded through MiForge; each receives a **$MLY welcome** credit and introduces $MLY to the market through real offers/work.
- Welcome credits are settled postings under explicit treasury authority with per-cohort budgets, anti-farming controls (MiID duplicate-account review, proof-of-personhood appropriate to tier), and public aggregate disclosure.
- MiForge tracks cohorts, members, onboarding flows/progress, status snapshots, cron jobs, key rotations, sentinel checks, webhooks (MiLyfe-native — **not** the old Whop webhook), emails, and dashboard metrics; stuck-member detection with human support escalation. (Old-tree reference: `vault/miforge/`.)
- Full lifecycle in Phase 6; activation of the welcome-credit capability requires Phase 10 sign-off.

## 8. Locked until human approval

- USD-facing rails and reverse-$MLY redemption automation.
- Plastic card issuance.
- Any new in-asset beyond the six listed.
- Welcome-credit budgets and per-member amounts.
- Trusted-node designation policy and cash thresholds.

## 9. Phase 6 design checklist (from parent §8 + V2 additions)

- value states explicit (projected/pending/settled/rewarded/disputed/reversed) across all four money entities.
- Ledger invariants specified + test plan (no negative, balanced postings, atomic transfers, idempotent settlement).
- Business/campaign data separation; merchant/provider terms; refunds + disputes via MiResolve.
- Reserves + reconciliation design; MiPay offline protocol with double-spend analysis.
- Card key lifecycle (device keys never leave device; issuance/replacement/revocation).
- Accessibility (6th-grade language, offline-first, low-bandwidth, human support).
- Metrics, failure recovery, export/removal/fork behavior, activation gates per OS.
