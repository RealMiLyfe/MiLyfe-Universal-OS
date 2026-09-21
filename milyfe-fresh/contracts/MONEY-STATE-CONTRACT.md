# Money-State Contract — Phase 3

**Status:** `READY_FOR_REVIEW`. MiMoney is the sole authoritative $MLY ledger. No parallel ledger. No negative ever.

## value states (only these; always labeled)

`projected` (never spendable, never shown as balance) → `pending` (in-flight, earmarked) → `settled` (final, spendable) · `rewarded` (settled via verified contribution) · `disputed` (frozen slice, export still works) · `reversed` (corrected via due process, original preserved).

```ts
const Posting = z.object({ id: z.string().uuid(), at: z.string().datetime(),
  entries: z.array(z.object({ account: z.string(), entity: MiIdRef, delta: z.string() })), // sum == 0, no account < 0
  state: z.enum(["pending","settled","rewarded","disputed","reversed"]),
  purpose: z.string(), approval: z.string(), receipt: z.string() });
```

## Money entities (schemas frozen here; tables in Phase 6/11)

- `crypto_deposits`: id, entity, asset (USDC/USDT/SOL/BTC/ETH/XRP), amount, tx, confirmations, policy, status (announced→observed→confirmed→credited), credited_mly, receipt. Credit only after confirmation policy; earlier = projected.
- `cash_exchanges`: id, node ref, member ref, fiat amount, mly credited, dual confirmations, limits check, receipts.
- `swap_listings`: id, maker, offer, terms, meeting policy, status (listed→matched→met→settled/disputed), receipts.
- `finance_cards`: id, entity, form factor (digital-nfc/ble/qr; plastic later), key ref, limits, status, receipts.
- `transfers`: atomic MiMoney postings (transfer_mly semantics: row-lock, positive-only, no self-send, sufficient balance, receipt). Circuit breaker: >34% treasury spend → 48h cooldown + 80% supermajority. Issuance split default 70% place / 30% commons. Earn caps/week.

Rules: every mutation human-signed or human-approved-policy-executed; every mutation balanced + receipted; rewards need verified contribution + approved rules; treasury explicit/auditable; USD-facing/reverse rails locked (MiScale) until review + H.
