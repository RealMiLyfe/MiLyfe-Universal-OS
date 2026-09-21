# Phase Tracker — Tree V1

**Rule:** design-only until Phase 10 exit. No implementation without contract/test/security/support/rollback design.
**Status values:** `NOT_STARTED` · `IN_DESIGN` · `READY_FOR_REVIEW` · `APPROVED` · `BLOCKED` (per `roadmap/COMPLETION-AND-ACTIVATION-REGISTER.md`).

| Phase | Scope | Status | Exit gate | Evidence |
|---|---|---|---|---|
| 0 — Tree lock | Roots/trunk/3-branch definitions, 4+4+4 OSes, no-new-branch rule, README, skeleton, finance→V2 ref | `READY_FOR_REVIEW` | Human approval that the tree is stable | `TREE-LOCK.md`, `README.md`, `PROVENANCE.md`, this file |
| 1 — Roots | Constitution, Commons, Mi Being, Ratification, rights map, human/AI rules, external-law boundary, terminology | `READY_FOR_REVIEW` | Roots coherent, reviewable, cannot be silently overridden by a branch | `roots/` (4 adopted + 4 companions, 2026-09-21) |
| 2 — Trunk | 16 components fully specified + trunk-to-branch interface, context/entity/capability/event/receipt/offline/failure maps | `NOT_STARTED` | One responsibility per component; every branch knows what it receives | `trunk/` |
| 3 — Shared contract freeze | API/event/receipt/permission/data-space/export/agent/device/MiPsyche/money-state/handoff/versioning contracts | `NOT_STARTED` | No primary branch OS designed without registered interfaces | `contracts/` |
| 4 — Governance | Governance OS, MiLegal, MiResolve, MiJustice full specs | `NOT_STARTED` | People understand decisions, disputes, legal, rights protection | `branches/governance/` |
| 5 — Lifestyle | MiCare, MiHealth, MiPlace, MiEducation full specs | `NOT_STARTED` | Improves daily life; no professional overclaim; no sensitive-data exposure | `branches/lifestyle/` |
| 6 — Finance | MiForge, MiMarket, MiMoney, MiWork full specs + crypto rail V2 | `NOT_STARTED` | Value circulates; no fake balances, hidden fees, unverified rewards, unsupported claims | `branches/finance/` |
| 7 — Cross-branch | 8 journeys, handoffs, permissions, receipts, failure/rollback | `NOT_STARTED` | Branches cooperate without merging authorities | `journeys/` |
| 8 — Brand/public/legal | Brand, story, white paper, terms, disclosures, U.S. legal + financial review | `NOT_STARTED` | Public claims accurate, sourced, owned, accessible, reviewed | `brand-public-legal/` |
| 9 — Security/agent/release | Threat model, data flows, secrets, agents, tests, incident, backup, SBOM, release, rollback | `NOT_STARTED` | Future build testable, publishable, monitorable, rollback-safe | `security-agent-release/` |
| 10 — Build readiness | Doc register, owners, ADRs, contract registry, risks, repo plan, slice plan, synthetic data, pilot, locked capabilities | `NOT_STARTED` | **Human approval to leave design phase** | `build-readiness/` |
| 11 — Implementation | Repo bootstrap, kernel slice, MiOnboard, trunk contracts, first branch slice, tests + security evidence | `NOT_STARTED` (blocked until Phase 10) | Tuesday tests proven offline | `implementation/` |

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
