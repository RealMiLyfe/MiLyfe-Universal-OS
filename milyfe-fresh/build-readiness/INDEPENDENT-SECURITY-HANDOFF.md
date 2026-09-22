# Independent Security-Review Handoff

**Purpose:** everything an outside reviewer needs to verify (or refute) the agent's work.
**Reviewer:** TODO-human (name + date). **Status:** awaiting reviewer. No findings invented here.

## What to review

- Repo + branch: `arena/01a0c5fc-milyfe-universal-os` at the commit in `HANDOFF.md`.
- Scope: `milyfe-fresh/implementation/src/{kernel,trunk,governance,lifestyle,finance}` and `tests/`.
- Start here: `CURRENT-STATE.md`, `HANDOFF.md`, `SECURITY-REVIEW-PACKET.md`, `RELEASE-GATES.md`.

## How to reproduce every claim

```bash
cd milyfe-fresh/implementation
npm install
npm run typecheck   # must be clean
npm test            # expect 246/246 (count in HANDOFF.md governs)
npm run build       # must succeed
npm run rails-gate  # must print PASS
```

## Priority probe areas (reviewer's discretion, not a limit)

1. Ledger serialization under concurrency (`src/finance/mimoney.ts` `Ledger.serial`).
2. Permission evaluation edges (`src/kernel/scope.ts` `can`, child-role rule).
3. Bus privacy enforcement (`assertReferenceOnly` in lifestyle + finance shared).
4. Receipt issue/verify round-trip + tamper behavior (`src/kernel/receipt.ts`).
5. Agent-forbidden lists vs. actual high-impact call sites (28 actions).
6. Youth/guardian gates in health, education, care, work.
7. Offline queue → reconnect paths for double-apply or loss.
8. Dependency risk (`package-lock.json`; no audit claimed by agent).

## Deliverable expected from the reviewer

Findings list (severity + location + reproduction), corrections required, re-test result,
and an explicit statement of what was and was not reviewed. Sent back to the repo as
`build-readiness/INDEPENDENT-SECURITY-FINDINGS.md` (TODO-human).
