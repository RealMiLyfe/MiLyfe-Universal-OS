# Phase Tracker — Tree V1

**Rule:** design-only until Phase 10 exit. No implementation without contract/test/security/support/rollback design.
**Status values:** `NOT_STARTED` · `IN_DESIGN` · `READY_FOR_REVIEW` · `APPROVED` · `BLOCKED` (per `roadmap/COMPLETION-AND-ACTIVATION-REGISTER.md`).

| Phase | Scope | Status | Exit gate | Evidence |
|---|---|---|---|---|
| 0 — Tree lock | Roots/trunk/3-branch definitions, 4+4+4 OSes, no-new-branch rule, README, skeleton, finance→V2 ref | `READY_FOR_REVIEW` | Human approval that the tree is stable | `TREE-LOCK.md`, `README.md`, `PROVENANCE.md`, this file |
| 1 — Roots | Constitution, Commons, Mi Being, Ratification, rights map, human/AI rules, external-law boundary, terminology | `READY_FOR_REVIEW` | Roots coherent, reviewable, cannot be silently overridden by a branch | `roots/` (4 adopted + 4 companions, 2026-09-21) |
| 2 — Trunk | 16 components fully specified + trunk-to-branch interface, context/entity/capability/event/receipt/offline/failure maps | `READY_FOR_REVIEW` | One responsibility per component; every branch knows what it receives | `trunk/` (16 components + TRUNK-BRANCH-INTERFACE + TRUNK-MAPS, 2026-09-21)|
| 3 — Shared contract freeze | API/event/receipt/permission/data-space/export/agent/device/MiPsyche/money-state/handoff/versioning contracts | `READY_FOR_REVIEW` | No primary branch OS designed without registered interfaces | `contracts/` (12 frozen: API/event/receipt/permission/data/export/agent/device/psyche/money/handoff/versioning)|
| 4 — Governance | Governance OS, MiLegal, MiResolve, MiJustice full specs | `READY_FOR_REVIEW` | People understand decisions, disputes, legal, rights protection | `branches/governance/` (Governance OS, MiLegal, MiResolve, MiJustice + GOVERNANCE-GATES)|
| 5 — Lifestyle | MiCare, MiHealth, MiPlace, MiEducation full specs | `READY_FOR_REVIEW` | Improves daily life; no professional overclaim; no sensitive-data exposure | `branches/lifestyle/` (MiCare, MiHealth, MiPlace, MiEducation + LIFESTYLE-GATES)|
| 6 — Finance | MiForge, MiMarket, MiMoney, MiWork full specs + crypto rail V2 | `READY_FOR_REVIEW` | Value circulates; no fake balances, hidden fees, unverified rewards, unsupported claims | `branches/finance/` (MiForge, MiMarket, MiMoney, MiWork + V2 rail + FINANCE-GATES)|
| 7 — Cross-branch | 8 journeys, handoffs, permissions, receipts, failure/rollback | `READY_FOR_REVIEW` | Branches cooperate without merging authorities | `journeys/` (8 journeys + 12 handoffs + failure/rollback laws)|
| 8 — Brand/public/legal | Brand, story, white paper, terms, disclosures, U.S. legal + financial review | `READY_FOR_REVIEW` | Public claims accurate, sourced, owned, accessible, reviewed | `brand-public-legal/` (12 docs; legal/financial OPINIONS still human-supplied, see LEGAL-REVIEW-REQUESTS)|
| 9 — Security/agent/release | Threat model, data flows, secrets, agents, tests, incident, backup, SBOM, release, rollback | `READY_FOR_REVIEW` | Future build testable, publishable, monitorable, rollback-safe | `security-agent-release/` (threat model, flows, policy, agents, injection defense, test matrix, incident, backup, SBOM, release, rollback, evidence register)|
| 10 — Build readiness | Doc register, owners, ADRs, contract registry, risks, repo plan, slice plan, synthetic data, pilot, locked capabilities | `READY_FOR_REVIEW` | **Human approval to leave design phase** | `build-readiness/` (register, ADRs proposed, contracts, risks, repo plan, slice plan, synthetic data, pilot, locked caps; OWNERS still TBD-human)|
| 11 — Implementation | Repo bootstrap, kernel slice, MiOnboard, trunk contracts, first branch slice, tests + security evidence | `IN_DESIGN` (blocked until Phase 10) | Tuesday tests proven offline | `implementation/` slice 0–3 BUILT: tsc clean, 38/38 vitest, next build 15 routes, rails-gate PASS, kernel 490 lines, RLS×24; slice 4 (Tuesday proofs vs live backend) + pilot PENDING|

## Quality gates (per `roadmap/DESIGN-QUALITY-GATES.md`)

Gates 1–9 must pass for each phase's scope before the next phase begins; Gate 10 (build authorization) opens only at Phase 10 exit.

- Gate 1 Coherence · Gate 2 Human value · Gate 3 Authority · Gate 4 Data · Gate 5 Economic truth · Gate 6 Security/safety · Gate 7 Accessibility/inclusion · Gate 8 Contract/integration · Gate 9 Publication · Gate 10 Build authorization

## Human-supplied items (blockers — never fabricated)

| Item | Needed by | Status |
|---|---|---|
| Phase 0 exit approval | Phase 1 start | PENDING |
| 151-feature `ULTIMATE_FEATURE_LIST` (or confirmation the Manual replaces it) | Phase 2 (trunk mapping) | PENDING |
| Founder-story confirmation (is `docs/planning/MiLyfe_Founder_Story.md` complete?) | Phase 8 | PENDING |
| Owner/steward assignments | Phase 10 | PENDING |
| U.S. legal review + U.S. financial review (qualified opinions) | Phase 8 | PENDING |
| Test/security evidence (from real runs) | Phase 11 | PENDING |
| GitHub settings (branch protection, secrets, scanning) | Phase 10/11 | PENDING |

## Change log

- 2026-09-21: Phase 0 drafted — tree locked (pending human approval), 20-file source copy, README/TREE-LOCK/PROVENANCE/TRACKER created, finance V2 rail spec drafted from directive.
- 2026-09-21: Phase 1 drafted — 4 roots adopted with review notes + RIGHTS-MAP + HUMAN-AI-AUTHORITY-RULES + EXTERNAL-LAW-BOUNDARY + CONSTITUTIONAL-TERMINOLOGY-REVIEW. Oath/MiChildGate/fail-closed/pause/signature/store-carry-forward all grounded as FOUND (Manual/BOUNTY/WHITEPAPER/TERMS). Manual's 5 referenced docs confirmed MISSING.

- 2026-09-21: Phases 2–10 drafted (trunk 16 + contracts 12 + OSes 12 + journeys + brand/legal + security + readiness). Phase 11 slice 0–3 BUILT + evidenced (tsc/vitest/build/rails-gate/RLS). Built per explicit human order to complete all phases; phase-exit APPROVALS still pending human sign-off. Human-supplied items still open: owners, legal/financial opinions, 151-feature list, UI blueprint, founder-story confirm, live-backend + pilot evidence.
