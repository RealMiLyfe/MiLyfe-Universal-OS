# Tuesday Test Status — Phase 11 slice (honest record, 2026-09-21)

## Proven in this slice (local evidence, reproducible)

- **Offline shell:** service worker caches `/`, `/pocket`, `/learn`, `/street`, `/voice`, `/you`, `/onboarding` + manifest; connection chip shows Offline state; outbox queues ops (tested: `kernel-store-bus.test.ts`, 6 tests).
- **Device-first onboarding:** join flow runs fully on-device (entity create, name claim, progress save/resume) — see `/onboarding` + `mionboard`/`miid`/`miname` services.
- **Signed money shape:** `/api/transfer` rejects unsigned/malformed calls (`BAD_ENVELOPE`, shape checks), requires auth, enforces idempotency + atomic RPC; ledger math tested (no-negative, 70/30, breaker 34%/48h/80%, runway) — `mimoney.test.ts`, 7 tests.
- **Export always:** one-tap client export (Dexie → JSON download) on `/you`; `GET /api/export` has NO freeze/dispute/status gate by design (auth only).
- **Safety one tap:** leave-now button → session kill + presence hide + jar-freeze request (`panicFreeze`).
- **Build/test evidence:** `tsc --noEmit` clean, vitest 56/56, `next build` green (18 routes), rails-gate PASS, kernel ~500/1000 lines, RLS on 25 tables, service role server-only, Zod on all 6 API routes.

- **Foundation batch 2:** MiPsyche continuity (change/memory/pause lineage), agent leases + chorus cap, MiWalk offline classifier (money/guardianship/ballots always human-review), synthetic-ledger + forge/market sandboxes (refused by real paths), business onboarding (shops table + RLS), grants API (create/revoke, owner-checked), receipts keeper + verify page, offline sync panel, roots About page, a11y baseline (skip link, focus, 44px targets), CI workflow + release checklist + PR template.

## NOT yet proven (needs live backend + later slices + pilot runs)

- Full Standard/Deep/Governance Tuesday journeys end-to-end (need: UBI engine, Learn paths, Street pins, sealed-vote tally, MiDay flows — later slices per `FIRST-VERTICAL-SLICE-PLAN.md`).
- Live-Supabase integration (RPC + RLS probes against a real project), offline-pocket settlement over DTN, card NFC/BLE hardware paths.
- Accessibility/human-value field evidence (pilot with real members, 6th-grade-language validation, DV-expert flows).

## Rule

E10 (Tuesday-test proofs) stays OPEN until pilot runs produce receipts/logs/video. Nothing above is claimed as a full Tuesday pass.
