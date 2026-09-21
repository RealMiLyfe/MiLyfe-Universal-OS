# MiLyfe Tree V1 — Implementation (Phase 11)

Next.js 16 App Router + React 19 + TypeScript + Tailwind + Supabase + Dexie + PWA.
Design source: `milyfe-fresh/` docs (Phases 0–10). Rails law: crypto + cash + own cards only.

- `src/kernel/` — Kernel slice (<1k lines): id, vault, store, bus, scope, receipt
- `src/contracts/` — frozen Phase 3 contracts as Zod schemas
- `src/trunk/` — MiOnboard, MiID, MiName, MiData, MiPresence, MiSecurity services
- `src/finance/` — MiMoney (sole ledger) + MiForge (cohort engine)
- `src/app/` — shell + tabs (Pocket/Learn/Street/Voice/You) + onboarding + API routes
- `supabase/migrations/` — tables + RLS (per-table; service role never in browser)
- `tests/` — vitest suites (vault, ledger invariants, replay, scope, receipts, transfer)
