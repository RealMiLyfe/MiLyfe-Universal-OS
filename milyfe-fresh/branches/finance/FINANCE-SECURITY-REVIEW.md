# Finance Branch — Security Review

**Scope:** `implementation/src/finance/*` (shared, mimoney, miforge, mimarket, miwork, bridges, sandbox) + `tests/{finance-shared,finance-bridges,finance-security,mimoney-ledger,miforge-venture,mimarket,miwork,mimoney,sandbox,miforge}.test.ts`.
**Date:** 2026-09-21.
**Reviewer:** agent self-check. **Independent human review is still pending and required before any pilot or launch claim.**

All test values are synthetic. No public financial claims come from test data.

## Properties pinned by executable tests (`tests/finance-security.test.ts`)

- FR-1: no finance source imports governance or lifestyle code (verified by reading the source tree in-test).
- FR-2: agent-forbidden list covers mint/settle/refund/reverse/treasury/payout/revenue-recognition.
- FR-3: conservation survives a 20-transfer concurrent storm (sum of balances always equals issued; no negatives).
- FR-4: offline double-submit collapses to one posting (idempotency keys; key reuse with new facts rejected).
- FR-5: exports always disclose MLY-is-MLY; dollar/peg/promise wording rejected in records.
- FR-6: reversal shortfalls stay disputed — never silently completed.

## Money-law checks (by OS test file)

- MiMoney: one ledger; no negatives; pending → verified → settled with balance checks; serialized settles (no double-spend under concurrency); refunds linked to originals; disputes flaggable by anyone, resolvable by humans; mint needs human + budget ref; treasury spends capped by budget with 34% breaker → 80% override; reconciliation breaks must be zero.
- MiForge: no money for proposing/signing up; welcome credits budgeted + human + online only (offline mint refused); revenue counts settled + accepted-delivery only; splits total 100; every party signs self.
- MiMarket: campaign/donor/constituent/public-office records refused (routed to governance); merchants verify by human; orders follow the state machine; settlement via bus to MiMoney; reviews need completed orders; fees visible; volume counts settled only; takedowns need humans with appeal path.
- MiWork: relationships stated explicitly with outside-review note visible; youth fenced (apprenticeships + guardian only); device attestation rejects unverified devices; verification is human; recruitment is never work; rewards need evidence; terms flagged with labor-clinic route.

## Cross-branch bridges (bus + receipts, references only)

All seven required examples implemented and tested: credential→opportunity, care→reward, place→listing, venture→offer, order→settlement, dispute→correction/reversal/uphold, governance authorization (scope + expiry checked).

## Known limits (not claimed)

- Self-check only — no independent reviewer has signed off.
- The ledger here is an application-layer record; production persistence, key management, and audit are separate work.
- Fraud/sanctions/tax/custody handling beyond records + routing is outside this scope.
- Locked rails (L1–L10) remain locked; nothing here moves real-world money.
