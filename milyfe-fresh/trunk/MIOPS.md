# MiOps — Trunk Component 12

**Status:** `READY_FOR_REVIEW` (Phase 2).
**Sources:** Trunk design · Manual MiNOC/MiPulse/AutoOps, cron/sentinel (vault/miforge), Alive Rules (speed <1s), Part 5C hybrid node telemetry.

- **Purpose:** operational health — monitoring, cron, incident ops, backup/restore execution. Keeps the tree alive and honest about its state.
- **Users:** on-call stewards, place keepers (MiNOC community-visible topology/health/coverage), members (status honesty).
- **Owns:** health topology (MiNOC); cron jobs (UBI, reports, rotation, sentinel); alerting + incident ops runbooks; backup/restore execution (hot/warm/cold twins); status communication; capacity signals to MiScale.
- **Does not own:** security verdicts, release approvals, governance decisions, money rules.
- **Entities + data:** `health_checks` · `cron_jobs` (schedule, owner, last-run, receipt) · `incidents` (severity, timeline, comms) · `backups` (snapshots, restore tests) · `status_posts`. Dual telemetry: private nerve encrypted, public nerve ZK-aggregate only.
- **Permissions:** ops actions scoped + logged; incident commander designated per incident; member-data access only via break-glass (logged, reviewed).
- **Contracts:** `miops.check/run-cron/incident/backup/restore/status` (Phase 3).
- **Receipts:** cron runs, incident timelines, backup/restore proofs, status posts — receipted.
- **Offline:** on-device health first; mesh islands report via DTN; status degrades honestly (staleness labeled).
- **Security:** break-glass最小 + review; ops secrets in MiKey; no silent ops changes (all receipted).
- **Accessibility:** status in plain language; outage comms multi-channel (app, SMS/voice fallbacks for critical).
- **Support:** incident comms cadence; postmortems public (blameless, privacy-scrubbed).
- **Legal:** uptime is best-effort commons (no SLA overclaim); regulated notification duties per jurisdiction (Phase 8).
- **Metrics:** SLOs (local-first latency, sync lag, restore RTO/RPO), cron success, incident MTTR, backup-test pass rate.
- **Failure recovery:** runbooks per failure class; disaster recovery (Phase 9); chaos drills scheduled.
- **Export:** incident + ops history exportable (scrubbed where others' privacy requires).
- **Removal:** decommissioned systems leave tombstone + data disposition record.
- **Fork behavior:** each fork runs own ops; upstream incidents linked by lineage, not shared control.
- **Activation gate:** cron→alert→incident→restore→postmortem drill; gates 1,6,8,9 pass.
