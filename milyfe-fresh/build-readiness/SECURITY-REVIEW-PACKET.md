# Security Review Packet (agent self-check — NOT an independent review)

**Date:** 2026-09-21. **Scope:** `implementation/src/{kernel,trunk,governance,lifestyle,finance}` + all tests.
**Author:** agent self-check. **Independent review:** pending (see `INDEPENDENT-SECURITY-HANDOFF.md`).
This packet organizes evidence. It closes no gate.

## 1. Threat model (design source + implementation mapping)

Design threats T1–T12 live in `security-agent-release/THREAT-MODEL.md`. Implementation coverage:

| Threat | Implemented control (tested) | Test pointer | Gap / residual |
|---|---|---|---|
| T1 stolen phone | panic freeze, session tombstones, device revoke | trunk-integration, recovery-drill | HW-backed keys not implemented; freeze-delay race untested on real devices |
| T2 coercion | sealed records, retaliation guard, emergency access review flags | micare, mihealth, mijustice | DV-expert flow review pending (human) |
| T3 farming | earn verification, recruitment≠work, duplicate-key review, idempotency | miwork, mimoney-ledger, money-hardening | personhood paths are design-only; no live monitoring |
| T4 captured vote | sealed ballots, quorum, supermajority, delegation caps, cycle refuse | proposals, delegations, journeys J4 | concentration monitoring not implemented |
| T5 helper-gone-wrong | leases, forbidden scopes, chorus cap, 28 agent-forbidden actions | agent-device, regression | red-team cadence pending (human) |
| T6 supply-chain | rails-gate (no banned rails), pinned lockfile | rails-gate.sh, CI | SBOM/signing not wired to releases |
| T7 double-spend | serialized settles, idempotency keys, conservation audits | mimoney-ledger, money-hardening, FR-3/FR-4 | offline-pocket device-key sequences are design-only |
| T8 relay abuse | reference-only sealed bus payloads | SR-2, FR-1, lifestyle-shared | relay network not implemented |
| T9 insider | human-only money acts, full override records, audit trails | finance suites, bridges | break-glass logging not implemented |
| T10 lawful overreach | minimization (refs not bodies), holds with ends, export/delete | milegal, isolation-recovery | counsel review pending per touchpoint |
| T11 youth safety | grown-up gates, guardian approvals, youth-work fencing, kid-safe surfaces | mihealth, mieducation, miwork | MiChildGate service + human safety team pending |
| T12 key loss | recovery/delegation lineage in MiID design | miid lifecycle (status only) | social recovery not implemented |

## 2. Findings (self-found, all fixed or fenced)

- F1 MLY wording over-blocked honest disclosures → fixed, negation-aware, pinned (R1).
- F2 refunds rejected disputed originals → fixed, pinned (R3).
- F3 treasury breaker presented as universal → fenced provisional + opt-in, pinned (R4).
- F4 presence sessions vanished on revoke → tombstone behavior, pinned (R2).
- F5 test DID helper collided (`voter1` vs `voter10`) → padded names; test-only, no product impact.

## 3. What this packet does NOT claim

No penetration test. No cryptography audit beyond kernel unit tests. No production persistence/keys. No monitoring. No human sign-off. See gate 1 in `RELEASE-GATES.md` for what closes it.
