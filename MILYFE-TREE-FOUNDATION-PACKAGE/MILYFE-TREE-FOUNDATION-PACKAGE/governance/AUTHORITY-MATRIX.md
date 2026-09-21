# MiLyfe Authority Matrix

**Status:** Pre-build authority specification
**Purpose:** Identify who may propose, approve, execute, audit, pause, reverse, and appeal each class of action.

## 1. Legend

- **P** — Propose
- **A** — Approve
- **E** — Execute
- **V** — Verify or audit
- **S** — Suspend or pause
- **R** — Reverse, correct, or retire
- **H** — Human or authorized community approval required
- **N** — Not authorized

## 2. Core matrix

| Action | Kernel | Domain OS | Cell/community | Human steward | MiSecurity | MiLegal | MiMoney | AI agent |
|---|---|---|---|---|---|---|---|---|
| Create ordinary draft | E | E | A | V | V | N | N | E within scope |
| Create identity | E | P | N | H for recovery exceptions | V | N | N | N |
| Recover identity | E | P | N | H | V | N | N | N |
| Grant ordinary capability | E | P | A | V | V | N | N | P only |
| Grant high-risk capability | E | P | A | H | V | H where legal | H where monetary | N without H |
| Change `$MLY` ledger rules | P | N | P | H | V | H | A/E | N |
| Set treasury allocation | P | N | P | H | V | H | A/E | P only |
| Set marketplace fee | P | E | A within policy | H if material | V | H if required | V | P only |
| Enable USD-facing rail | P | P | N | H | V | H | H/A | N |
| Approve device workload | P | E | A | H for high-risk | V | N | N | E only in lease |
| Create agent skill | P | E | A | H for high-risk | V | H if regulated | H if financial | E within scope |
| Change MiPsyche identity | P | E | N | H | V | H if legal impact | N | N |
| Fork cell | P | E | A | H | V | H if external impact | H if value impact | N |
| Campaign publication | P | E | A | H where required | V | H where required | H for contributions | E only in scope |
| Election/public-office data | P | E | A if authorized | H | V | H | N | N |
| Security quarantine | P | S/E | N | H review | A/S | H if legal evidence | H if money affected | E only by policy |
| Permanent ban/removal | P | E | A | H review | V | H if legal hold | H if value affected | N |
| Legal interpretation | N | P | N | H counsel | V | A/E | N | P summary only |
| Court/rights outcome | N | N | N | H authority | V | P/support | N | N |

## 3. Principles

- Proposal is not approval.
- Execution is not ownership.
- Audit is not command authority.
- AI recommendation is not human approval.
- A cell cannot override global invariants.
- A domain OS cannot create authority assigned to another OS.
- High-impact actions require explicit, recorded approval.

## 4. Approval evidence

Every approval records:

- Approver
- Role
- Scope
- Reason
- Evidence
- Expiration
- Conditions
- Related issue or proposal
- Receipt

## 5. Review cadence

Review the matrix before pilot, after every constitutional amendment, after any security incident involving authority, and whenever a new OS or external rail is introduced.
