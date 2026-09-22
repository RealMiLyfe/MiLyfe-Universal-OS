# Phase Tracker — Tree V1

**Rule:** design-only until Phase 10 exit. No implementation without contract/test/security/support/rollback design.
**Status values:** `NOT_STARTED` · `IN_DESIGN` · `APPROVED` · `APPROVED` · `BLOCKED` (per `roadmap/COMPLETION-AND-ACTIVATION-REGISTER.md`).

| Phase | Scope | Status | Exit gate | Evidence |
|---|---|---|---|---|
| 0 — Tree lock | Roots/trunk/3-branch definitions, 4+4+4 OSes, no-new-branch rule, README, skeleton, finance→V2 ref | `APPROVED` | Human approval that the tree is stable | `TREE-LOCK.md`, `README.md`, `PROVENANCE.md`, this file |
| 1 — Roots | Constitution, Commons, Mi Being, Ratification, rights map, human/AI rules, external-law boundary, terminology | `APPROVED` | Roots coherent, reviewable, cannot be silently overridden by a branch | `roots/` (4 adopted + 4 companions, 2026-09-21) |
| 2 — Trunk | 16 components fully specified + trunk-to-branch interface, context/entity/capability/event/receipt/offline/failure maps | `APPROVED` | One responsibility per component; every branch knows what it receives | `trunk/` (16 components + TRUNK-BRANCH-INTERFACE + TRUNK-MAPS, 2026-09-21)|
| 3 — Shared contract freeze | API/event/receipt/permission/data-space/export/agent/device/MiPsyche/money-state/handoff/versioning contracts | `APPROVED` | No primary branch OS designed without registered interfaces | `contracts/` (12 frozen: API/event/receipt/permission/data/export/agent/device/psyche/money/handoff/versioning)|
| 4 — Governance | Governance OS, MiLegal, MiResolve, MiJustice full specs | `APPROVED` | People understand decisions, disputes, legal, rights protection | `branches/governance/` (Governance OS, MiLegal, MiResolve, MiJustice + GOVERNANCE-GATES)|
| 5 — Lifestyle | MiCare, MiHealth, MiPlace, MiEducation full specs | `APPROVED` | Improves daily life; no professional overclaim; no sensitive-data exposure | `branches/lifestyle/` (MiCare, MiHealth, MiPlace, MiEducation + LIFESTYLE-GATES)|
| 6 — Finance | MiForge, MiMarket, MiMoney, MiWork full specs + crypto rail V2 | `APPROVED` | Value circulates; no fake balances, hidden fees, unverified rewards, unsupported claims | `branches/finance/` (MiForge, MiMarket, MiMoney, MiWork + V2 rail + FINANCE-GATES)|
| 7 — Cross-branch | 8 journeys, handoffs, permissions, receipts, failure/rollback | `APPROVED` | Branches cooperate without merging authorities | `journeys/` (8 journeys + 12 handoffs + failure/rollback laws)|
| 8 — Brand/public/legal | Brand, story, white paper, terms, disclosures, U.S. legal + financial review | `APPROVED` | Public claims accurate, sourced, owned, accessible, reviewed | `brand-public-legal/` (12 docs; risk/disclosure/partner reviews still human-supplied, see LEGAL-REVIEW-REQUESTS)|
| 9 — Security/agent/release | Threat model, data flows, secrets, agents, tests, incident, backup, SBOM, release, rollback | `APPROVED` | Future build testable, publishable, monitorable, rollback-safe | `security-agent-release/` (threat model, flows, policy, agents, injection defense, test matrix, incident, backup, SBOM, release, rollback, evidence register)|
| 10 — Build readiness | Doc register, owners, ADRs, contract registry, risks, repo plan, slice plan, synthetic data, pilot, locked capabilities | `APPROVED` | **Human approval to leave design phase** | `build-readiness/` (register, ADRs proposed, contracts, risks, repo plan, slice plan, synthetic data, pilot, locked caps; OWNERS still TBD-human)|
| 11 — Implementation | Repo bootstrap, kernel slice, MiOnboard, trunk contracts, first branch slice, tests + security evidence | `IN_DESIGN` (blocked until Phase 10) | Tuesday tests proven offline | `implementation/` slice 0–3 extended: tsc clean, 56/56 vitest, next build 18 routes, rails-gate PASS, kernel ~500 lines, RLS×25 (shops added); slice 4 (Tuesday proofs vs live backend) + pilot PENDING|

## Quality gates (per `roadmap/DESIGN-QUALITY-GATES.md`)

Gates 1–9 must pass for each phase's scope before the next phase begins; Gate 10 (build authorization) opens only at Phase 10 exit.

- Gate 1 Coherence · Gate 2 Human value · Gate 3 Authority · Gate 4 Data · Gate 5 Economic truth · Gate 6 Security/safety · Gate 7 Accessibility/inclusion · Gate 8 Contract/integration · Gate 9 Publication · Gate 10 Build authorization

## Human-supplied items (blockers — never fabricated)

| Item | Needed by | Status |
|---|---|---|
| Phase 0 exit approval | Phase 1 start | DONE 2026-09-21 |
| 151-feature `ULTIMATE_FEATURE_LIST` (or confirmation the Manual replaces it) | Phase 2 (trunk mapping) | PENDING |
| Founder-story confirmation (is `docs/planning/MiLyfe_Founder_Story.md` complete?) | Phase 8 | PENDING |
| Owner/steward assignments | Phase 10 | PENDING |
| Risk/disclosure/partner reviews for external touchpoints | Phase 8 | PENDING (never a gate on existence or internal MLY) |
| Test/security evidence (from real runs) | Phase 11 | PENDING |
| GitHub settings (branch protection, secrets, scanning) | Phase 10/11 | PENDING |

## Change log

- 2026-09-21: Phase 0 drafted — tree locked (pending human approval), 20-file source copy, README/TREE-LOCK/PROVENANCE/TRACKER created, finance V2 rail spec drafted from directive.
- 2026-09-21: Phase 1 drafted — 4 roots adopted with review notes + RIGHTS-MAP + HUMAN-AI-AUTHORITY-RULES + EXTERNAL-LAW-BOUNDARY + CONSTITUTIONAL-TERMINOLOGY-REVIEW. Oath/MiChildGate/fail-closed/pause/signature/store-carry-forward all grounded as FOUND (Manual/BOUNTY/WHITEPAPER/TERMS). Manual's 5 referenced docs confirmed MISSING.

- 2026-09-21: Phases 2–10 drafted (trunk 16 + contracts 12 + OSes 12 + journeys + brand/legal + security + readiness). Phase 11 slice 0–3 BUILT + evidenced (tsc/vitest/build/rails-gate/RLS). Built per explicit human order to complete all phases; phase-exit APPROVALS still pending human sign-off. Human-supplied items still open: owners, legal/financial opinions, 151-feature list, UI blueprint, founder-story confirm, live-backend + pilot evidence.

- 2026-09-21: HUMAN BLANKET APPROVAL ("yes this looks right") — Phases 0–10 marked APPROVED. Still open and still blocking pilot/launch (not the design record): owner names, U.S. legal + financial opinions, 151-feature list, UI blueprint, founder-story confirmation, live-backend + pilot Tuesday evidence. Phase 11 stays IN_DESIGN until slice 4 + pilot runs complete.

## Status vocabulary (human-directed, 2026-09-21)

Every phase/item carries EACH of these states separately. One state never implies another.

| State | Meaning |
|---|---|
| Designed | design doc exists and is coherent |
| Approved | human approved the direction/plan (NOT completion, legal clearance, or production-readiness) |
| Implemented | working code exists for the stated scope |
| Tested | automated + manual tests exist AND have been run with linked evidence |
| Security-reviewed | independent security review completed with findings tracked (not just self-tests) |
| Legally reviewed | risk/disclosure/partner/professional review completed for the external touchpoints that require it |
| Piloted | run with real people in the pilot scope with evidence |
| Released | shipped to members through the release workflow with receipts |
| Locked | intentionally gated; activation needs named reviews + evidence + human approval |

## Approval meaning (human-directed, 2026-09-21)

Human approval on 2026-09-21 covers **architecture + roadmap direction only**. It certifies none of: phase completeness, legal clearance, production-readiness. Binding rule:

> "MiLyfe's internal constitutional foundation must be preserved. External legal, financial, tax, professional, and jurisdictional review remains an activation gate for activities that require it."

Legal and financial gates stay in place. Locked capabilities stay locked. A passing test suite (56/56 proves the current tested scope only), a constitutional principle, or a personal sign-off never replaces the evidence required for production activation.

## Current accurate status (human-directed, 2026-09-21)

- Direction: Approved
- Roots/trunk/tree design: Approved for continued design
- Core application slice: Implemented within tested scope
- Full 12-OS tree: Not fully implemented
- Real-person Tuesday test: Not completed
- Independent security evidence: Not completed
- Risk/disclosure/partner reviews for external touchpoints: Not completed (internal activity not gated on them)
- Production brand assets: Not completed
- Public monetary rails: Locked
- Public launch: Not approved yet

## Per-phase nine-state matrix (2026-09-21)

✓ = yes · ◐ = partial (see note) · — = no · n/a = not applicable to a design phase

| Phase | Designed | Approved | Implemented | Tested | Sec-reviewed | Legally-reviewed | Piloted | Released | Locked |
|---|---|---|---|---|---|---|---|---|---|
| 0 Tree lock | ✓ | ✓ direction | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| 1 Roots | ✓ | ✓ direction | n/a | n/a | n/a | — (opinions pending) | n/a | n/a | n/a |
| 2 Trunk | ✓ | ✓ direction | ◐ kernel+9 services | ◐ 240/240 scope | — | n/a | — | — | n/a |
| 3 Contracts | ✓ | ✓ direction | ◐ Zod schemas live | ◐ schema tests | — | n/a | — | — | n/a |
| 4 Governance | ✓ | ✓ direction | ◐ gov-os+milegal+miresolve+mijustice | ◐ handed off (86/86) | — | — | — | — | n/a |
| 5 Lifestyle | ✓ | ✓ direction | ◐ micare+mihealth+miplace+miedu | ◐ handed off (142/142) | — (self-check) | — | — | — | n/a |
| 6 Finance | ✓ | ✓ direction | ◐ miforge+mimarket+mimoney+miwork | ◐ handed off (198/198) | — (self-check) | — | — | — | rails locked (L1–L10) |
| 7 Journeys | ✓ | ✓ direction | — | — | — | n/a | — | — | n/a |
| 8 Brand/legal | ✓ | ✓ direction | — | — | — | — (reviews requested) | — | — | n/a |
| 9 Security | ✓ | ✓ direction | ◐ controls in slice | ◐ suite subset | — (self-tests only) | n/a | — | — | n/a |
| 10 Readiness | ✓ | ✓ direction | ◐ repo controls (CI next) | — | — | — | — | — | register live |
| 11 Implementation | ✓ slice plan | ✓ direction | ◐ all 12 OSes in code | ◐ 240/240 scope | — | — | — | — | rails locked |

- 2026-09-21 CORRECTION: earlier entry said phases "marked APPROVED" without qualification. Corrected meaning: APPROVED = direction/plan approved only. Completeness, legal clearance, and production-readiness are NOT claimed. Nine-state vocabulary + matrix added so status can never be misread again.

- 2026-09-21: Foundation V2 adopted (human-supplied Updated Tree Foundation Design, saved verbatim). MLY-is-MLY definition, internal freedom, V2 tree lists reconciled across README/TREE-LOCK/branches/disclosure/terminology. 3 variances (legal provenance, community resolution, incarceration access) retained as subordinate detail pending human confirmation. Approval meaning, gates, locks, and nine-state vocabulary unchanged.

- 2026-09-21: V2 APPROVED as current direction (human). Variances 1–3 confirmed kept with framings (legal paper trails, MiResolve fix-it rooms, MiJustice reentry support). Wording law applied: outside review = risk/disclosure/partner homework for external touchpoints only; L1–L10 scoped to outside touchpoints; nothing gates existence or internal voluntary MLY activity.
- 2026-09-21: Nine-label value system live in contract (MoneyState: projected/pending/verified/settled/allocated/rewarded/reinvested/reserved/disputed/reversed), MiMoney (isSpendable = settled/rewarded/reinvested; transition enforcement), sandbox, disclosure, and docs. Core slice grew: MiMind, MiDevice, MiScale (+ /api/rails-status), rewards/treasury, proposals/ballots. Suite 71/71 in tested scope; typecheck/build/rails-gate pass. Tests prove only what they test.

- 2026-09-21: Governance branch code live (first 4-OS branch): delegations + circles (Governance OS), MiLegal (fail-closed enable checks, holds, counsel routing), MiResolve (case lifecycle, remedies, retaliation guard), MiJustice (rights cases, evidence anchors, peace terms, reentry packs). Suite 86/86 in tested scope; typecheck/build/rails-gate pass. Tests prove only what they test.

- 2026-09-21: Governance branch ACCEPTED by human as first completed 4-OS branch (design/release gates still apply). Commit `2c5f485` (86/86). Repository reconciliation recorded in HANDOFF.md (local history lost in sandbox, remote verified intact, clean 13-file recommmit, nothing lost).
- 2026-09-21: Lifestyle branch code live (second 4-OS branch, no scope expansion): MiCare, MiHealth, MiPlace, MiEducation + shared trunk wiring. Suite 142/142 (27 files); required coverage (unit/contract/permission/isolation/consent/accessibility/offline/export/agent-boundary/escalation/security-self-check) present. Agent self-check only; human review pending. Next: Finance branch.

- 2026-09-21: Lifestyle branch ACCEPTED by human for defined implementation scope (code `b41aebf`, records `e813ad2`). Counts: Governance 4/4, Lifestyle 4/4, total 8/12. Security review remains agent self-check; 142/142 = tested scope only, no launch claim.

- 2026-09-21: Finance branch code live (third 4-OS branch, no scope expansion): MiForge, MiMarket, MiMoney (authoritative ledger), MiWork + 7 cross-branch bridges. Suite 198/198 (34 files); all required Finance coverage present. All 12 primary OSes now exist in code — NOT a launch claim; integrated gates still pending. Agent self-check only; human review pending.

- 2026-09-21: Finance branch ACCEPTED by human for implemented scope (`61a6c63`, 198/198). Two corrections applied after: (1) treasury 34%/80% marked PROVISIONAL + opt-in with full override records/audit/rollback; (2) MLY wording corrected (misleading claims banned, labeled external swaps recordable). Suite now 203/203. Security: agent self-check, human review pending. No launch claim. Next: integration/hardening/evidence/pilot readiness; no new OSes.

- 2026-09-21: Finance corrections ACCEPTED by human (`cf56a4e`, 203/203). Treasury provisional-only; MLY wording corrected + tested. All 12 OSes accepted in implemented scope. Phase opened: integration + hardening (18 work items, 9 release gates tracked open). No new OSes. No launch claim.

- 2026-09-21: Integration + hardening batch 1 (agent): trunk integration, J1–J10 cross-branch journeys, isolation/recovery, agent/device, money hardening, accessibility + brand scans, support/incident suites. Suite 240/240 (41 files). Release gates file created (all 9 open). Jacksonville pilot prep written (no real people yet). Negation-aware MLY wording fix included.
