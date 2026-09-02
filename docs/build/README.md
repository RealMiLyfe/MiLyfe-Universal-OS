# MiLyfe / MiJustice — Build Design Index

The coherent build design + session handoff for this codebase. Read in order.

## Design
- **00-BUILD-DESIGN.md** — master synthesis: fractal, ground truth, OS stack,
  phases, dependency order.
- **01-V1-RELEASE-CUTLINE.md** — ship/defer list + file-by-file Chamber decoupling.
- **02-DEVICE-CONTRIBUTION-SPEC.md** — device-reward + auto-provisioning layer.
- **03-STORAGE-AND-SECURITY.md** — three-tier storage, CRDT gap, security, key recovery.
- **04-UX-DESIGN.md** — surfacing the four pillars, uniform with the platform design.

## Status & handoff
- **05-WHATS-LEFT.md** — what remains (ops + human gates; NOT unbuilt features).
- **SESSION-RECAP.md** — everything built this session (paste as "what we did").
- **NEXT-SESSION-PROMPT.md** — (1) paste-ready prompt to continue here;
  (2) generic build spec + tech/components for another agent to build generically.

## One-line status
Feature build DONE — migrations through 027 applied to live Supabase, seeded,
build green (120 pages), 60 tests pass, on branch `feat/mijustice-phase1` / PR #13.
Remaining = merge + crons + deploy + domain (ops) and attorney/board/translators
(human gates).
