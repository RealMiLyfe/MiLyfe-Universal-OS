# Backup & Disaster Recovery — Phase 9

**Status:** `READY_FOR_REVIEW`.

- **Twins:** hot (live CRDT peers) / warm (periodic CID snapshots) / cold (deterministic snapshots, long-term archive). Member vault: device + encrypted backup + social-recovery path.
- **Targets:** RTO/RPO declared per data class in Phase 11 runbooks (member data prioritizes zero-loss; aggregates rebuildable).
- **Drills:** restore tested per season; failed restore = SEV2 + fix before next release.
- **Island mode:** mesh islands operate on cached leases + DTN; partition healing via CRDT + custody logs + MiWalk classification.
- **Fork-safe:** restores never cross cell boundaries without lineage process; tombstones survive restores (no resurrection of deleted existence).
