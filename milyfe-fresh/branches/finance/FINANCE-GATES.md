# Finance Branch Design Gates — Phase 6

**Status:** `READY_FOR_REVIEW`.

1. **value states explicit** — projected/pending/settled/rewarded/disputed/reversed labeled everywhere; projected never spendable/shown-as-balance (Money-State Contract).
2. **No negative balances** — no-deprivation invariant in ledger design + transfer semantics + offline-pocket caps; test plan in Phase 11.
3. **Ledger invariants tested** — balanced postings, atomic transfers, idempotent settlement, zero-reconciliation-break target; tests specified Phase 11.
4. **Business and campaign data separated** — Finance never merges campaign/business records (trunk conformance); shops ≠ campaigns in identity + data + money.
5. **Merchant and provider terms exist** — MiMarket fee/terms + MiWork agreement templates design-complete; legal sign-off Phase 8.
6. **Refunds and disputes work** — market refunds + resolve handoff + money reversals via due process; export-during-dispute guaranteed.
7. **Reserves and reconciliation exist** — treasury ops + reserves + reconciliation jobs + runway gauge designed; evidence Phase 11.
8. **USD-facing rails remain locked until reviewed** — locked-capability register (MiScale): USD rails, reverse automation, exchange listing, fiat POS, plastic, new assets, welcome budgets, trusted-node policy.
9. **Contributors receive verified receipts** — every payout/reward carries contribution proof + rule + receipt; farming defenses specified.
