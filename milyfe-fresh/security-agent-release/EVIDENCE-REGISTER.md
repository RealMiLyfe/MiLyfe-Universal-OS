# Evidence Register — Phase 9 (structure; entries produced by Phase 11 runs)

**Status:** `READY_FOR_REVIEW` (empty by rule — evidence must come from real runs).

| ID | Evidence | Producer | When | Location |
|---|---|---|---|---|
| E1 | tsc --noEmit clean | CI | every release | linked build log |
| E2 | vitest suites (unit/integration) | CI | every release | linked report |
| E3 | Security test matrix results (S1–S12) | security runs | pre-pilot + per release | linked reports |
| E4 | RLS probe results | CI | every migration | linked report |
| E5 | Reconciliation (zero-break) proofs | MiMoney jobs | continuous | ledger attestations |
| E6 | Accessibility checks | CI + human | per release | linked reports |
| E7 | SBOM + provenance + signatures | CI | every release | attached artifacts |
| E8 | Rollback drill records | MiOps | per season | drill logs |
| E9 | Incident postmortems | incident process | per incident | published notes |
| E10 | Tuesday-test proofs (offline) | pilot runs | Phase 11 gate | videos/logs/receipts |

Rule: no entry is pre-filled. "Pass" without a linked artifact is a defect.
