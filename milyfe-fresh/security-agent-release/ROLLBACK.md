# Rollback — Phase 9

**Status:** `READY_FOR_REVIEW`.

- Every release carries a rollback plan: flag re-lock (minutes), prior-version restore (dual-run window where data shapes changed), data migration down-path or forward-fix decision, comms template.
- Ledger/data safety: rollback never fabricates state — replays journals, re-runs reconciliation to zero breaks, preserves receipts (rollback itself receipted).
- Money-affecting rollback needs MiMoney + human review; governance-affecting needs screening; safety-affecting is SEV-handled.
- Rollback drills per season; drill failure blocks next high-impact release.
