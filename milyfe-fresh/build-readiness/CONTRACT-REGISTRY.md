# Contract Registry — Phase 10

**Status:** `READY_FOR_REVIEW` (registry of frozen Phase 3 surfaces; version 1.0.0-draft, binding on Phase 11).

| ID | Contract | Version | Owner | Consumers | State |
|---|---|---|---|---|---|
| C1 | API envelope + method registry | 1.0.0-draft | Trunk | all OSes | frozen |
| C2 | Events (envelope + families) | 1.0.0-draft | Trunk | all OSes | frozen |
| C3 | MiReceipt | 1.0.0-draft | Trunk | all OSes | frozen |
| C4 | MiScope grants | 1.0.0-draft | Trunk | Kernel/MiData/Agent/Device | frozen |
| C5 | Data-space contracts | 1.0.0-draft | MiData | branches | frozen |
| C6 | Export/deletion jobs | 1.0.0-draft | MiData | all OSes | frozen |
| C7 | Agent skills + leases | 1.0.0-draft | MiAgent | agents | frozen |
| C8 | Device workloads | 1.0.0-draft | MiDevice | devices | frozen |
| C9 | MiPsyche continuity | 1.0.0-draft | MiPsyche | Mi instances | frozen |
| C10 | Money-state + 4 money entities | 1.0.0-draft | MiMoney | finance | frozen |
| C11 | Branch handoffs H1–H12 | 1.0.0-draft | Trunk | branches | frozen |
| C12 | Versioning/compat rules | 1.0.0-draft | MiDev | all | frozen |

Change rule: post-freeze changes need contract-owner A + impact review + version bump + migration + dual-run (per C12). Source docs: `contracts/`.
