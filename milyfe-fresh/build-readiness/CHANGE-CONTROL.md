# Change-Control Record — architecture freeze

## Frozen baseline

- **Frozen at:** integration batch 1 acceptance (`e48b688`, stamp `5a00d7e`), suite 240/240.
- **Tree shape:** Roots → Trunk → three Branches (Governance, Lifestyle, Finance), 12 primary OSes, no more.
- **Frozen contracts:** `MiEvent`, `MiReceiptSchema`, `MiScopeGrant`, `MoneyState` (nine labels) — Phase 3 v1.0.0-draft.
- **Frozen laws:** one MLY ledger, no negatives, projected≠settled, MLY-is-MLY wording, human-only money acts, branch source isolation (bus + receipts only), L1–L10 locked.
- **Provisional (not frozen):** treasury 34% breaker figures, retention windows, pilot staffing/dates.

## Change process (from this point on)

1. Propose: what changes, why, blast radius, rollback plan.
2. Classify: patch (docs/tests only) · minor (additive, backward-compatible) · major (contracts, money law, tree shape, locks).
3. Major changes need: human approval + affected-gate re-evidence + re-test + HANDOFF/PROVENANCE entries.
4. Locks open only per their own named reviews + evidence + human approval (never by this process alone).
5. Emergency changes: narrow + expiring + post-reviewed + ratify-or-rollback.

## Change log

| Date | Change | Class | Approved by | Evidence |
|---|---|---|---|---|
| 2026-09-21 | Baseline frozen | — | TODO-human ratification | `HANDOFF.md`, `PROVENANCE.md` |
