# MiLyfe / MiJustice — Build Design Index

The coherent build design + session handoff for this codebase. Read in order.

> ## ⚠️ Reconciliation note (read first)
> Docs **00–04 are the original architecture design from an earlier session.**
> Their *intent, philosophy, and design direction are correct and still hold*
> (surface-don't-redesign, stay uniform with the platform, local-first, $MLY-only,
> no ads, no dark theme). **But their factual snapshots predate the 9-phase +
> gap-closing build** done later. Specifically, in 00–04 treat these as stale:
> - Table/route/test counts ("48 tables", "~30 routes", "55 tests") — actual is
>   now **27 migrations, 77 platform routes, 60 tests** (see SESSION-RECAP.md).
> - "To-build / surface in v1" items (sync chip, receipt sheet, lock chips,
>   instance badge, Chamber decoupling) — **several are already built.** Check
>   SESSION-RECAP.md before rebuilding anything.
>
> **Authoritative current state = `SESSION-RECAP.md` + `05-WHATS-LEFT.md`.**
> When 00–04 and the recap disagree on *what exists*, the recap wins. Do not bend
> the built platform to match a stale snapshot; extend the platform as it is.

## Design
- **00-BUILD-DESIGN.md** — master synthesis: fractal, ground truth, OS stack,
  phases, dependency order.
- **01-V1-RELEASE-CUTLINE.md** — ship/defer list + file-by-file Chamber decoupling.
- **02-DEVICE-CONTRIBUTION-SPEC.md** — device-reward + auto-provisioning layer.
- **03-STORAGE-AND-SECURITY.md** — three-tier storage, CRDT gap, security, key recovery.
- **04-UX-DESIGN.md** — surfacing the four pillars, uniform with the platform design.

## Status & handoff
- **05-WHATS-LEFT.md** — what remains (ops + human gates; NOT unbuilt features).
- **06-DEPLOY-CHECKLIST.md** — launch runbook: env vars, DB, cron registration,
  deploy + domain, and the human/legal + external-infra gates.
- **07-INFRA-PILLARS-DESIGN.md** — design (not yet built) for the four core-infra
  pillars an audit found buggy/missing: offline-sync replay fix, Mi AI fleet
  unification, mesh networking (WebRTC/CRDT), and E2EE messaging.
- **SESSION-RECAP.md** — everything built this session (paste as "what we did").
- **NEXT-SESSION-PROMPT.md** — (1) paste-ready prompt to continue here;
  (2) generic build spec + tech/components for another agent to build generically.

## One-line status
Feature build DONE — migrations through 027 applied to live Supabase, seeded,
build green (120 pages), 60 tests pass, on branch `feat/mijustice-phase1` / PR #13.
Remaining = merge + crons + deploy + domain (ops) and attorney/board/translators
(human gates).
