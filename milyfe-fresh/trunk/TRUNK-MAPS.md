# Trunk Maps — Phase 2

**Status:** `READY_FOR_REVIEW`. Diagram + models + matrices. Schemas freeze in Phase 3.

## 1. Context diagram

```text
                    ┌──────────────────────────────────────────────┐
                    │            GOVERNANCE BRANCH                 │
                    │  Governance OS · MiLegal · MiResolve · MiJustice │
                    └──────────▲───────────────────▲───────────────┘
                               │ scoped refs /      │ decisions, cases,
                               │ grants / events    │ appeals, policies
┌──────────────────┐   ┌───────┴───────────────────┴────────┐   ┌──────────────────┐
│  LIFESTYLE BRANCH│◄──│              TRUNK                 │──►│  FINANCE BRANCH  │
│ MiCare·MiHealth  │   │ Kernel+MiID · MiName · MiOnboard   │   │ MiForge·MiMarket │
│ MiPlace·MiEdu    │   │ MiData · MiPresence · MiPsyche     │   │ MiMoney·MiWork   │
└──────────────────┘   │ MiMind · MiAgent · MiDevice        │   └──────────────────┘
                       │ MiSecurity · MiDev · MiOps         │
                       │ MiCloud · MiNet · MiComm · MiScale │
                       └───────▲───────────────────▲────────┘
                               │ roots rules       │ adapters only
                    ┌──────────┴──────┐   ┌────────┴─────────────────────────┐
                    │  ROOTS          │   │  EXTERNAL (banks, courts, gov,   │
                    │ Constitution,   │   │  vendors, infra — explicit terms,│
                    │ Charters, Oath  │   │  provenance, failure+exit docs)  │
                    └─────────────────┘   └──────────────────────────────────┘
```

## 2. Entity model (trunk-owned, refs not content)

- **MiID:** entities, claims, links, delegations, recoveries, tombstones, identity receipts.
- **Kernel:** cells, contexts, capabilities, actions (draft→proposed→approved→executed→receipted→closed/corrected), approvals, lineage.
- **MiName:** names, aliases, disputes. **MiOnboard:** flows, progress, personhood proofs, jurisdiction profiles.
- **MiData:** data spaces, grants, provenance, retention rules, deletion requests. **MiPresence:** sessions, presence states, visibility rules, check-ins, timers.
- **MiPsyche:** psyche profiles, memory records (provenance-tagged), continuity/change/retirement records. **MiMind:** inference requests, formula cards, debate records.
- **MiAgent:** agents, skills, leases, tool bindings, action audits. **MiDevice:** devices, workload leases, contributions, actuation gates.
- **MiSecurity:** credential refs, quarantines, incidents, disclosures, canaries. **MiDev:** contracts, manifests, builds (SBOM), releases, seasons.
- **MiOps:** health checks, cron jobs, incidents (ops view), backups, status posts. **MiCloud:** services, tenancies, quotas, migrations.
- **MiNet:** links, DTN bundles, relays, federation bridges. **MiComm:** threads, messages, delivery states, notification prefs, announcements.
- **MiScale:** stages, capability flags, quotas, gate decisions.

## 3. Capability matrix (trunk capabilities × consumer)

| Capability | Gov | Life | Fin | Agents | Devices | Members(direct) |
|---|---|---|---|---|---|---|
| Identity refs | ✓ | ✓ | ✓ | lease | lease | card/export |
| Data grants | ✓ | ✓ | ✓ | lease | N | dashboard |
| Presence | ✓ | ✓ | ✓ | N | ✓ | live display |
| Cognition (labeled) | ✓ | ✓ | ✓ | ✓ | N | Mi/answers |
| Agent leases | ✓ | ✓ | ✓ | ✓ | N | delegate |
| Device workloads | N | place | meter/settle | N | ✓ | earn/pause |
| Security baseline | ✓ | ✓ | ✓ | ✓ | ✓ | auth/safety |
| Contracts/flags | ✓ | ✓ | ✓ | ✓ | ✓ | "not yet" states |
| Net/transports | ✓ | ✓ | ✓ | ✓ | ✓ | offline-first |
| Comm/threads | ✓ | ✓ | ✓ | labeled | N | messages/calls |

## 4. Event map (families; versioned/idempotent/replay-safe/privacy-aware in Phase 3)

`identity.*` (created/claimed/verified/linked/delegated/suspended/recovered/migrated/forked/retired) · `cell.*` (created/forked/bridged/policy-changed) · `action.*` (proposed/approved/executed/corrected) · `grant.*` (granted/revoked/expired) · `presence.*` (state/session/timer) · `psyche.*` (changed/paused/restored/retired) · `formula.*` (parsed/screened/signed) · `lease.*` (granted/invoked/revoked) · `workload.*` (leased/metered/actuated) · `quarantine.*` · `contract.*`/`release.*` · `cron.*`/`incident.*`/`backup.*` · `service.*` · `bundle.*` (custody)/`bridge.*` · `message.*`/`announce.*` · `flag.*`/`stage.*`. Money events come only from MiMoney (`money.*`, Phase 6).

## 5. Receipt map (every receipt carries: actor/branch/OS/purpose/capability/approval/impact/status/correction-or-dispute-path)

Join/proof/context receipts (MiOnboard) · name claim/change/dispute (MiName) · grants/revokes/corrections/exports/deletions/sealed-access (MiData) · sessions/visibility/timers/emergency (MiPresence) · psyche changes/merges/forks/pauses/retirements (MiPsyche) · formula screening/signing/Ring-2 consent (MiMind) · leases/invocations/budget/revoke (MiAgent) · leases/contributions/actuations (MiDevice) · auth/quarantine/release/disclosure/canary (MiSecurity) · contract/build/release/rollback (MiDev) · cron/incident/backup/status (MiOps) · provision/quota/migrate/decommission (MiCloud) · custody/bridge (MiNet) · delivery/announce/flags (MiComm) · gate/flag/quota/stage (MiScale).

## 6. Offline behavior map

| Class | Offline rule |
|---|---|
| Reads | serve cached + signed; label staleness; never fake freshness |
| Identity proofs | cached VCs; degraded trust disclosed |
| Data writes | device-first; revocations deny-on-doubt for sensitive |
| Actions | MiWalk classify: mergeable / rejectable / reservable / expiring / human-review |
| Money/guardianship/ballots | NEVER auto-resolve; queue for human/commit path |
| Presence/timers | on-device timers; "last seen" honesty |
| Agent tools | fail-closed unless pre-authorized offline rule |
| Flags/locks | locked stays locked; promotions need connectivity + quorum evidence |
| Sync | outbox + idempotency keys + custody logs; conflicts surface to humans with receipts |

## 7. Failure/recovery map

| Failure | Detection | Response | Recovery |
|---|---|---|---|
| Approval timeout | Kernel journal | escalate, never auto-approve | re-request + steward review |
| Sync conflict | MiWalk | classify + human queue | merge/reject/reserve/expire + receipt |
| Key compromise | MiSecurity | quarantine + rotate (cold-twin) | re-issue + audit; no lockout of owner |
| Node loss | MiOps/MiNOC | island mode + DTN reroute | twin restore + custody-log healing |
| Runaway agent | budget/behavior anomaly | freeze lease + alert | revoke + remedy + postmortem |
| Bad release | health signals | rollback (MiDev workflow) | dual-run + fix-forward + evidence |
| False activation | flag attestation | re-lock + incident | review + re-gate |
| Abuse/safety | reports + signals | quarantine + leave-now support | MiResolve/MiJustice path + correction |
| Data corruption | checksums/provenance | quarantine space | snapshot restore + receipt |
