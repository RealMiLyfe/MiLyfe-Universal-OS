# Architecture Decision Records — Phase 10

**Status:** `PROPOSED` (agent-drafted, DERIVED). Each needs human approval to become binding. Format: context → decision → consequences.

## ADR-0001 — Tree structure locked (roots/trunk/3 branches, 4+4+4)
Context: competing catalogs (44+32 Manual modules vs 12 primary OSes). Decision: the tree in `TREE-LOCK.md` is the structure; all other modules are subordinate/supporting via MiScale gates. Consequences: no-new-branch rule; supporting-OS growth only post-launch.

## ADR-0002 — Single $MLY ledger (MiMoney sole authority)
Context: parallel-ledger risk across market/work/treasury features. Decision: one ledger, no negative, projected≠settled, all mutations human-signed + receipted. Consequences: every money feature integrates MiMoney; no OS keeps balances.

## ADR-0003 — Human approval & AI boundaries
Context: AI capability vs reserved actions. Decision: adopt `roots/HUMAN-AI-AUTHORITY-RULES.md` (AI advises; H approves; 5% chorus cap; pause human-only). Consequences: every reserved flow carries H-gate + evidence; AI-overreach is a defect.

## ADR-0004 — Identity is root+trunk (MiID), never branch-owned
Context: branch silos risk. Decision: MiID owns stable IDs/lifecycle/recovery/delegation/migration/fork-lineage/tombstones/receipts; branches get scoped refs. Consequences: no branch-local identity stores.

## ADR-0005 — Crypto + cash + own cards only (no GoCardless/Whop/Stripe/Visa-MC)
Context: rail sovereignty + fee capture + values. Decision: V2 rail spec is binding; forbidden rails never integrated; old Whop webhook excluded. Consequences: intake/out rails built as specified; USD automation locked pending review.

## ADR-0006 — Offline-first, local-first, client-encrypted
Context: Tuesday test (no internet) + dignity + resilience. Decision: device-first data, MiWalk classification, DTN store-carry-forward, vault keys never leave device. Consequences: every feature ships an offline rule; money/guardianship/ballots never auto-resolve.

## ADR-0007 — Design-only until Phase 10 exit; evidence never fabricated
Context: proof rule. Decision: Gates 1–9 per phase; Gate 10 opens only at human-approved Phase 10; code/assets/settings/opinions/assignments/evidence produced in their phases by runs/humans. Consequences: this register stays truthful; blockers visible.

## ADR-0008 — AGPL-3.0 + OSI-only dependencies
Context: people-owned forever + license purity. Decision: Tree V1 app ships AGPL-3.0; MiCompat gate blocks non-OSI deps; Oath travels with forks. Consequences: license review in every release.
