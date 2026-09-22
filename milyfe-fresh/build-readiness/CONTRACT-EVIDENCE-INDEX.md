# Cross-Branch Contract Evidence Index

Every cross-branch handoff travels by bus event + receipt (references only) or by
checked authorization — never by source import. Source isolation is pinned by test
(SR-3 lifestyle, FR-1 finance). All events below validate against frozen `MiEvent`
(journeys J10 + shared contract tests).

## Emitted bus events (exact inventory from source)

| Event | Privacy | Emitted by | Carries | Evidence |
|---|---|---|---|---|
| `work.credential-matched` | private | bridges.eduCredentialToWork | opportunity ref + credential label | finance-bridges, J1 |
| `money.reward-requested` | private | bridges.careSupportToMoney | care ref | finance-bridges, J2 |
| `market.listing-requested` | place | bridges.placeMerchantToMarket | merchant + place refs | finance-bridges |
| `market.offer-requested` | place | bridges.forgeVentureToOffer | venture + offering refs | finance-bridges, J8 |
| `money.settle-requested` | private | bridges.marketOrderToSettlement (via market settle) | order ref | finance-bridges, mimarket, J3 |
| `resolve.dispute-opened` | private | market/work escalations | order/agreement ref | mimarket, miwork, J5 |
| `resolve.appeal-requested` | private | care appeal | plan ref | micare |
| `care.helper-suspended` | sealed | care abuse path | plan ref + short reason | micare, SR-2 |
| `care.check-in` | private | care check-in | plan ref + time | micare, lifestyle-shared, J2 |
| `place.surplus-claimed` | place | surplus claim | pin ref | miplace, J3 |

## Non-event bridges (checked references, same branch-application rule)

| Bridge | Mechanism | Evidence |
|---|---|---|
| resolve verdict → ledger correction/refund/uphold | `resolveDisputeToCorrection` applies to finance `Ledger` | finance-bridges, J5 |
| governance authorization → scoped finance action | `assertGovAuthorization` (scope + expiry + receipt) | finance-bridges, money-hardening, J4 |
| credential → opportunity match | reference match, no education import | miwork, J1 |
| venture → offer listing | reference + terms, no forge import | mimarket, J8 |
| care record → reward claim | reference + human approval | miwork |

## Frozen contracts (Phase 3, unchanged)

`MiEvent`, `MiReceiptSchema`, `MiScopeGrant`, `MoneyState` (nine labels) — see `src/contracts/index.ts`.
