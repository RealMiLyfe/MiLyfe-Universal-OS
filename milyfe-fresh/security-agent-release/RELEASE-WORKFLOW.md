# Release Workflow — Phase 9

**Status:** `READY_FOR_REVIEW`.

1. **Propose:** release notes + contract diff + risk note + rollback plan (no plan = no release).
2. **Verify:** tsc clean, test suites green (unit/integration/security-matrix subset), RLS probes, accessibility checks, MiPlain lint, license/build provenance checks.
3. **Approve:** contract owners A + MiSecurity V + human steward H (high-impact); constitutional/compact screening for governance-affecting releases.
4. **Publish:** signed release + SBOM + provenance + public evidence path; staged rollout via MiScale flags (pilot → place → broader).
5. **Monitor:** health + abuse + money-reconciliation signals; auto-halt triggers defined per release.
6. **Close:** receipts filed, evidence register updated, postmortem scheduled if any auto-halt fired.
