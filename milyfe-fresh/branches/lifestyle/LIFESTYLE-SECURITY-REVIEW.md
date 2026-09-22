# Lifestyle Branch — Security Review

**Scope:** `implementation/src/lifestyle/*` (shared, micare, mihealth, miplace, mieducation) + `tests/lifestyle-*.test.ts`, `tests/micare|mihealth|miplace|mieducation.test.ts`.
**Date:** 2026-09-21.
**Reviewer:** agent self-check. **Independent human review is still pending and required before any pilot or launch claim.**

## Properties pinned by executable tests (`tests/lifestyle-security.test.ts`)

- SR-1: agent-forbidden list covers care, clinical (diagnose/treat/prescribe), child, safety, and credential acts.
- SR-2: sealed bus traffic carries references only; record bodies are rejected with `BUS_BODY_LEAK_*`.
- SR-3: no cross-branch source imports in lifestyle code (trunk + contracts + bus only; verified by reading the source tree in-test).
- SR-4: youth health reads fail closed without guardian permission (kernel child-role rule).
- SR-5: consent revocation takes effect immediately.
- SR-6: emergency access is always flagged for human review.
- SR-7: offline work queues visibly with an honest note and syncs on reconnect.

## Boundary checks (by OS test file)

- MiCare: plans need receiver consent + human approval; agents can raise escalations but never close them; abuse path suspends + notifies via sealed bus event; deletion of youth history needs guardian approval.
- MiHealth: diagnose/treat/prescribe refused without licensed authority + human review (agents blocked even with authority); aggregates need 10+ and strip individual fields; integrations unlink with confirmation; access log records every slice read.
- MiPlace: child policy can only stay standard or tighten; every resource carries the not-a-government label; stale resources labeled then delisted; shop complaint SLA tracked with standing notes; treasury freeze needs human + reason.
- MiEducation: credentials need authorized issuer + human + signature; verification checks issuer/revocation/signature and returns no score; revocation needs due process + appeal window; kid surfaces refuse money fields; youth stories need grown-up approval.

## Known limits (not claimed)

- Self-check only — no independent reviewer has signed off.
- No penetration test, no audit of WebCrypto/Ed25519 usage beyond the kernel's own tests.
- Mandatory-reporting and jurisdiction health-privacy handling are routed to humans by design; no automated filing exists or is claimed.
- Emergency paths assume the member can still reach real authorities; MiLyfe never replaces them.
