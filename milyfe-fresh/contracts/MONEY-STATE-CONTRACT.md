# Money-State Contract — Phase 3

**Status:** `READY_FOR_REVIEW`. MiMoney is the sole authoritative $MLY ledger. No parallel ledger. No negative ever.

## value states — nine labels (human-directed 2026-09-21; nothing else may be shown)

| # | Label | Meaning | Spendable? |
|---|---|---|---|
| 1 | Projected | not real yet | NEVER — never shown as balance |
| 2 | Pending | in-flight, earmarked for a specific move | No |
| 3 | Verified | underlying facts checked (contribution confirmed, confirmations met, work approved) but not yet settled | No |
| 4 | Settled | final | Yes |
| 5 | Allocated | earmarked from a treasury/pot for an approved purpose; allocator still owns it | No (by recipient) |
| 6 | Rewarded | settled via verified contribution under approved rules | Yes |
| 7 | Reinvested | circulated back into commons/place (round-ups, donations, returned share) | Yes, by receiving treasury rules |
| 8 | Reserved | held in reserve or policy hold | No, except by reserve policy + approval |
| 9 | Disputed / Reversed | frozen slice under dispute (export still works) / corrected via due process, original preserved | No — reversed amounts are void |

```ts
const Posting = z.object({ id: z.string().uuid(), at: z.string().datetime(),
  entries: z.array(z.object({ account: z.string(), entity: MiIdRef, delta: z.string() })), // sum == 0, no account < 0
  state: MoneyState, // nine labels: projected/pending/verified/settled/allocated/rewarded/reinvested/reserved/disputed/reversed
  purpose: z.string(), approval: z.string(), receipt: z.string() });
```

## Money entities (schemas frozen here; tables in Phase 6/11)

- `crypto_deposits`: id, entity, asset (USDC/USDT/SOL/BTC/ETH/XRP), amount, tx, confirmations, policy, status (announced→observed→confirmed→credited), credited_mly, receipt. Credit only after confirmation policy; earlier = projected.
- `cash_exchanges`: id, node ref, member ref, fiat amount, mly credited, dual confirmations, limits check, receipts.
- `swap_listings`: id, maker, offer, terms, meeting policy, status (listed→matched→met→settled/disputed), receipts.
- `finance_cards`: id, entity, form factor (digital-nfc/ble/qr; plastic later), key ref, limits, status, receipts.
- `transfers`: atomic MiMoney postings (transfer_mly semantics: row-lock, positive-only, no self-send, sufficient balance, receipt). Circuit breaker: >34% treasury spend → 48h cooldown + 80% supermajority. Issuance split default 70% place / 30% commons. Earn caps/week.

Rules: every mutation human-signed or human-approved-policy-executed; every mutation balanced + receipted; rewards need verified contribution + approved rules; treasury explicit/auditable; USD-facing/reverse rails locked (MiScale) until risk/disclosure/partner review + evidence + H. Internal MLY activity is never gated on outside permission.
