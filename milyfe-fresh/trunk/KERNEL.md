# Kernel — Trunk Component 01

**Status:** `READY_FOR_REVIEW` (Phase 2). **Impl budget:** <1,000 lines (Phase 11).
**Sources:** Trunk design §1–6 · Architecture Source of Truth (authority order + invariants) · Identity doc §3–5 · Constitution Art III/IV/X · Manual MiScope/MiAction/Word-to-Math.

- **Purpose:** the one shared authority primitive layer. Every consequential action is issued, scoped, approved, executed, receipted, and appealable through Kernel rules. No branch bypasses it.
- **Users:** all trunk components, all 12 primary OSes, cells, agents, devices (no direct member UI; members see effects via context displays + receipts).
- **Owns:** cells + contexts registry; capability issuance/enforcement hooks; MiID identity services (see `MIID.md`); action envelope (MiAction fields: actor, role, place, jurisdiction, audience, purpose, sensitivity, state, approvals, consent, source, expiry, reversal rules, appeal route, offline rule, explanation); approval evaluation (incl. constitutional screening); receipt anchoring; fork/migration lineage rules; configuration hierarchy; human-approval policy evaluation.
- **Does not own:** domain decisions (money, legal conclusions, clinical, marketplace offers, governance outcomes, campaign/public-office); private data content; agent goals/personality.
- **Entities + data:** `cells` (id, parent, policy, bridges, status) · `contexts` (cell ref, kind, active flag) · `capabilities` (issuer, subject, target, purpose, scope, duration, approval, delegation, revocation) · `actions` (envelope + state machine: draft→proposed→approved→executed→receipted→closed/corrected) · `approvals` (approver, role, scope, reason, evidence, expiration, conditions, proposal ref, receipt) · `lineage` (fork/merge/migrate records). No PII beyond refs; content lives in MiData spaces.
- **Permissions:** Kernel evaluates; grants per Authority Matrix (ordinary: cell A; high-risk: H; AI: P-only/N). Delegation chains max 3 hops, cycle-detected, instantly revocable.
- **Contracts:** consumes Phase 3: permission (MiScope), receipt (MiReceipt), event, data-space contracts. Exposes: `kernel.issueAction`, `kernel.evaluateApproval`, `kernel.recordReceipt`, `kernel.forkCell`, `kernel.migrateContext` (signatures frozen Phase 3).
- **Receipts:** every state transition emits MiReceipt (actor/branch/OS/purpose/capability/approval/impact/status/correction path). Missing receipt = defect.
- **Offline:** MiWalk rules — offline actions classified mergeable/rejectable/reservable/expiring/human-review. Never auto-resolves money, guardianship, binding ballots. Outbox + replay with idempotency keys.
- **Security:** least privilege; no agent self-authorization; quarantine hook to MiSecurity; sealed ops (votes) evaluated without exposing content.
- **Accessibility:** N/A direct UI; requires every OS to render context + explanation at 6th-grade level (MiPlain lint in Phase 8/9).
- **Support:** action states queryable; stuck actions surface to human support with full envelope.
- **Legal:** constitutional screening badges on proposals; legal-hold hook (MiLegal may freeze narrow items); lawful-process minimization (Kernel holds refs, not content).
- **Metrics:** actions by state, approval latency, revocation count, fork/migrate counts, offline-replay conflict rate.
- **Failure recovery:** action journal replay; approval timeouts escalate (never auto-approve); fork conflicts require explicit merge process.
- **Export:** full action/approval/receipt history exportable per MiID, even during dispute.
- **Removal:** entities tombstoned, never silently deleted; preservation records per retention policy.
- **Fork behavior:** fork creates child cell with lineage record, copied policy, no copied private data without consent; parent cannot silently own child people/data/devices/balances/decisions.
- **Activation gate:** synthetic person can join→act→receipt→export→leave in a test cell; gates 1,3,4,6,8 pass.
