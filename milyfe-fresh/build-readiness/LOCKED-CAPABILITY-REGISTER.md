# Locked-Capability Register — Phase 10

**Status:** `READY_FOR_REVIEW`. Locked = fail-closed everywhere including offline. Unlock needs: reviews + evidence + human approval + flag ceremony (receipted).

| ID | Capability | Locked since | Unlock requires |
|---|---|---|---|
| L1 | USD-facing rails | design | risk/disclosure/partner review, reserves evidence, consumer terms, fraud/sanctions controls, reconciliation, H |
| L2 | Reverse-$MLY redemption automation | design | same as L1 |
| L3 | Public exchange listing | design | community vote + risk/disclosure review + H |
| L4 | Merchant fiat-settlement POS | design | same as L1 |
| L5 | Plastic card issuance | design | partner review + legal + H |
| L6 | New in-assets beyond USDC/USDT/SOL/BTC/ETH/XRP | design | MiMoney + MiLegal + security review + H |
| L7 | Welcome-credit budgets + per-member amounts | design | treasury H + Phase 10 sign-off |
| L8 | Trusted-node designation policy + cash thresholds | design | MiMoney + MiLegal + H |
| L9 | Regulated skills/agents (per jurisdiction) | design | MiLegal H per profile |
| L10 | Emergency pause use | armed | 5-of-7 humans, money+machines only, 30-day death, post-review |

Flags enforced by MiScale; tamper-evident signed bundles; unauthorized activation = incident.

Scope: these locks cover outside touchpoints only. They are not permission gates for MiLyfe's existence or internal voluntary MLY activity.
