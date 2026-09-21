# Trunk-to-Branch Interface Contract — Phase 2

**Status:** `READY_FOR_REVIEW`. Freezes in Phase 3 with schemas. Sources: Trunk design §5–6 · Cross-Branch Contract · Identity §6.

## Every branch receives (identical envelope)

| Service | From | Content |
|---|---|---|
| Identity reference | MiID/Kernel | scoped ref (stable id, entity type, active cell/context, role, permission set) — never full graphs |
| Naming | MiName | resolved names/aliases + dispute states |
| Onboarding | MiOnboard | join/proof/context APIs + progress |
| Data spaces | MiData | purpose-bound grants + provenance + retention + export/delete |
| Presence | MiPresence | sessions, visibility-filtered states, timers |
| Continuity | MiPsyche/MiMind | labeled cognition + relationship continuity (no private-data leak across branches) |
| Agents/devices | MiAgent/MiDevice | leases + tool bindings + workload leases |
| Security baseline | MiSecurity | auth, secrets, quarantine hooks, audit, incident path |
| Build/release | MiDev/MiOps | contract registry, publishing gates, health, status |
| Infra/net/comm | MiCloud/MiNet/MiComm | services, transports, threads/notifications |
| Growth gates | MiScale | capability flags (locked/pilot/active) |
| Support/disputes | Kernel routes | MiHandoff routing + MiAppeal flow entry |
| Offline rules | MiWalk/MiDTN | classification + custody + replay contracts |

## Every branch returns (identical envelope)

Domain events (versioned/idempotent/replay-safe, emitted only after commit) · MiReceipts · metrics · risks · data-ownership records · support cases · activation status · export/retirement behavior declarations.

## Per-branch conformance (what branches may NOT do with trunk services)

- **Governance:** uses identity for participation/roles/delegation/due-process/appeals; must not build universal social scores or deny rights without process; votes sealed, aggregates public.
- **Lifestyle:** uses identity to personalize + preserve consent; must not leak private health/care/family/education data across services merely because the person is the same; professional boundaries enforced (MiHealth/MiLegal rails).
- **Finance:** uses identity to associate businesses/workers/customers + authorize offers/work/orders/settlement + prevent farming/impersonation; must not build hidden credit scores, create money authority outside MiMoney, or merge campaign/business records.

## Interface laws

1. One identity model (MiID), one capability model (MiScope), one receipt model (MiReceipt), one event model, one data-space model, one security baseline, one configuration hierarchy, one human-approval policy.
2. Trunk provides shared capability; never absorbs domain decisions (money/governance/legal/clinical/marketplace/venture/work-livelihood/campaign authority stay put). V2 adds: MiWork owns work and livelihood records.
3. No hidden branch authority: any branch-side capability not in this contract + Phase 3 registry is a defect.
4. Reserved actions need H regardless of initiating branch. Offline never auto-resolves money/guardianship/binding ballots.
5. All interfaces versioned; breaking changes need migration + dual-run + notice (Phase 3 versioning rules).
