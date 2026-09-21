# First Vertical Slice Plan — Phase 10 (build order for Phase 11)

**Status:** `READY_FOR_REVIEW`.

## Slice 0 — Bootstrap
Next.js 16 App Router + React 19 + TypeScript + Tailwind + Supabase + Dexie + PWA in `milyfe-fresh/implementation/`. CI: tsc, vitest, RLS probes, secret-scan, license gate. PWA manifest + offline shell + connection chip.

## Slice 1 — Kernel (<1k lines)
id primitive (did:milyfe, ed25519) · vault (AES-256-GCM + PBKDF2; keys never leave device) · store (Supabase + Dexie + outbox + sync) · bus (publish/subscribe/replay, idempotent) · scope (MiScope check) · receipt (MiReceipt issue/verify) · shell (layout/nav/offline chip/balance chip/celebrations/Vibe Bar).

## Slice 2 — Trunk onboarding path
MiOnboard (join → proof → context) + MiID (claim/lifecycle) + MiName (claim) + MiData (personal space + grants) + MiPresence (session) + MiSecurity (passkey + recovery setup) + trunk contracts as Zod schemas + RLS per table + service role never in browser + DOMPurify rich text.

## Slice 3 — First branch slice: Finance (MiMoney + MiForge)
MiMoney: sole ledger, no-negative, `crypto_deposits/cash_exchanges/swap_listings/finance_cards`, atomic `transfer_mly` RPC, circuit breaker (34%/48h/80%), runway gauge, pot breakdown (70/30). MiForge: 11 tables, cohorts/members/flows/progress/snapshots/cron/rotations/sentinel/webhooks (native)/emails/metrics, stuck detection. First-1200 engine behind locked flag until sign-off.

## Slice 4 — Tuesday proofs (offline)
Standard + deep + governance Tuesday tests executed offline-first with receipts/logs/video; evidence filed in Evidence Register. No GoCardless/Whop/Stripe anywhere (CI grep gate).
