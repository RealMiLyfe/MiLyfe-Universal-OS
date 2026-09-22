# MLY Ledger + Treasury Audit Evidence

**Tests:** `mimoney.test.ts`, `mimoney-ledger.test.ts`, `money-hardening.test.ts`, `regression.test.ts`. Synthetic values only. No public financial claims.

## Ledger invariants (all tested, incl. under concurrency)

- One ledger; balances never negative (debit guarded by `canDebit`).
- Postings idempotent by key; key reuse with new facts rejected.
- No self-send; positive amounts only.
- pending → verified → settled with balance check at settle; settles serialized (40-op mixed storm holds conservation).
- Disputes flaggable; reversals restore or stay disputed (shortfalls never silently complete); refunds linked to originals (settled or disputed).
- Conservation audit: Σ balances == issued, zero breaks (`reconcile`).
- MLY-is-MLY wording enforced on notes/records/receipts/exports; negation-aware; labeled external swaps non-authoritative.

## Treasury (provisional — see HANDOFF.md correction 1)

- Books default to NO breaker; 34% threshold is opt-in only until a MiTreasury spec/ADR exists.
- Budgets + balances always cap spends, with or without a breaker.
- Overrides require: human + budget ref + scope + reason + expiry + receipt + supermajority evidence.
- Every spend returns an audit record with the rollback path; `correctTreasurySpend` rolls back with reason.

## How to re-run the audit

```bash
cd milyfe-fresh/implementation && npm install && npx vitest run tests/mimoney-ledger.test.ts tests/integration/money-hardening.test.ts
```

Conservation must read `ok: true` with zero breaks after every drill. Any break fails the suite.
