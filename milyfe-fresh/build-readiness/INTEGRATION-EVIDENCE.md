# Integration Evidence (2026-09-21)

**Suite:** 240/240 across 41 files. Typecheck clean. Build clean. Rails-gate pass.
Tests prove only what they test. No gate is closed by this evidence.

## Trunk integration (`tests/integration/trunk-integration.test.ts`)

MiID lifecycle with lineage · onboarding save/load/complete · data-space create/grant/revoke · presence + device-revoke session end · psyche change/memory/correction/continuity · quarantine/release/panic/audit · receipt save/verify/tamper-fail · bus publish/deliver/replay with idempotent consumer.

## Cross-branch journeys (`tests/integration/journeys.test.ts`)

- J1 learn → credential → work → verified pay → settled MLY (MiEducation/MiWork/MiMoney)
- J2 care plan → respite → check-in → escalation → approved reward (MiCare/MiMoney)
- J3 street → market → order → settlement → review (MiPlace/MiMarket/MiMoney)
- J4 vote → delegation → gov authorization → scoped treasury spend (Gov OS/Finance)
- J5 complaint → dispute → fix-it room → remedy → ledger correction (MiMarket/MiResolve/MiMoney)
- J6 health consent → read → revoke → emergency path (MiHealth)
- J7 shop complaint SLA standing note (MiPlace)
- J8 venture → offering → market offer → listing → retire (MiForge/MiMarket)
- J9 legal check + hold + rights case + evidence + peace term + reentry (MiLegal/MiJustice)
- J10 every journey bus event validates against frozen MiEvent contract

## Isolation + recovery (`tests/integration/isolation-recovery.test.ts`)

Cross-space denial · grant revoke → deny · all-OS export coverage · outbox fail→pending→ack · replay rebuild · treasury correction rollback.

## Agent + device (`tests/integration/agent-device.test.ts`)

Skill register/forbidden-capability refuse · lease issue/expire/revoke · 5% chorus cap · all 28 lifestyle+finance high-impact actions agent-blocked · revoked-device attestation refused.

## Money hardening (`tests/integration/money-hardening.test.ts`)

40-posting mixed storm (settle/dispute/refund) with conservation + no-negatives · marketplace GMV == settled postings · gov authorization expiry exactness · offline queue collapse on reconnect.

## Accessibility + brand (`tests/integration/accessibility-brand.test.ts`)

All-OS notice audit (plain/audio/fallback) · public-doc MLY-claim scan · affirmative launch-claim scan.

## Support + incident (`tests/integration/support-incident.test.ts`)

Support doors in 6 areas · quarantine/release/panic/audit · support → dispute → rights-case ladder.

## Fixes this phase surfaced (all in `cf56a4e` follow-ups or this batch)

- MLY wording now negation-aware (honest disclosures pass; misleading claims fail).
- Refunds accept disputed originals (the normal dispute case).
- Treasury breaker provisional + opt-in with full override records.
