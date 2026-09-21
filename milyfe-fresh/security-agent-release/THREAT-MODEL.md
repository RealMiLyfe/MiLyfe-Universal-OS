# Threat Model — Phase 9

**Status:** `READY_FOR_REVIEW` (design). Sources: MiSecurity design · Manual threats (stolen phone, abusive partner, sybil UBI, captured vote, helper-gone-wrong, supply-chain, lawful process).

| # | Threat | Targets | Controls (designed) | Residual + owner |
|---|---|---|---|---|
| T1 | Stolen phone | sessions, vault, jars | panic freeze, HW-backed keys, per-person vaults, session invalidation, cached-location removal | thief with PIN → freeze-delay race; MiSecurity |
| T2 | Abusive partner (coercion, surveillance) | location, messages, money | leave-now one-tap, hidden visibility, neutral notifications, abuse-split no-auto-transfer, DV-tested flows | determined coercion → human support; MiJustice+MiSecurity |
| T3 | Sybil UBI / reward farming | issuance, rewards | personhood paths, duplicate review, earn caps, contribution verification, sentinel checks | sophisticated rings → monitoring + gov review; MiMoney+MiSecurity |
| T4 | Captured vote/governance | ballots, process | sealed ballots, personhood, concentration warnings, quorum/supermajority, fork right, pause 5-of-7 | stealth capture → transparency + fork; Governance OS |
| T5 | Helper-gone-wrong / prompt injection | actions, data, money | leases+budgets, tool sandboxing, injection defense (separate doc), runaway freeze, chorus cap, H-gates | novel injections → red-team cadence; MiAgent+MiSecurity |
| T6 | Supply-chain (deps, builds, updates) | code integrity | pinned deps, SBOM, Sigstore, reproducible builds, MiCompat license gate, secret-scan | compromised maintainer → multi-signer releases; MiDev |
| T7 | Double-spend (offline pocket/cards) | ledger | device-key sequences, caps/expiry, settlement checks, MiWalk no-auto-resolve, quarantine | colluding devices → limits + monitoring; MiMoney |
| T8 | Relay/bridge abuse | network, privacy | opt-in relay, encrypted payloads, abuse quarantine, bridge approvals | malicious relay → minimal leak (routing refs only); MiNet |
| T9 | Insider (steward/operator) | data, money, process | scoped roles, break-glass logging, dual control on treasury/actuation, rotation, audits | collusion → separation of duties + transparency; Governance+MiOps |
| T10 | Lawful process overreach | member data | minimization (hold little), sealed handling, MiLegal chain rules, canary, no magic-immunity claims | valid broad orders → comply + disclose-maximally; MiLegal |
| T11 | CSAM/exploitation | youth safety | MiChildGate always-on, public-room hash matching, no adult DMs, reporting + human review | private-space abuse → reports + safety team; MiChildGate+MiJustice |
| T12 | Key loss (member) | access | social recovery (2-of-3 Shamir) + delay, zero-friends keeper path, cold-twin rotation | total loss → delay + human review; MiSecurity |

Review cadence: before pilot, after each incident, after constitutional amendments touching authority, when new rails/OSes arrive.
