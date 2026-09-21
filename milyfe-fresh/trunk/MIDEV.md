# MiDev — Trunk Component 11

**Status:** `READY_FOR_REVIEW` (Phase 2).
**Sources:** Trunk design · Architecture invariants (no implementation without contract/test/security/support/rollback) · Manual license purity, MiCompat, SBOM/Sigstore, Season Method.

- **Purpose:** building and publishing — contracts registry, license gates, build provenance, release controls. Nothing ships without contract + test + security + support + rollback design.
- **Users:** builders, reviewers, release stewards, auditors.
- **Owns:** contract registry (API/event/receipt/permission/data/skill/workload/versioned); OS manifests + data boundaries; license-compat gate (MiCompat — OSI or it does not ship; Tree V1: AGPL-3.0); build provenance (SBOM, Sigstore, reproducible builds); publishing pipeline (draft→review→approve→release→evidence); Season tickets (MiGit opens tickets only for the season page).
- **Does not own:** runtime ops (MiOps), security verdicts (MiSecurity), governance approvals (Governance OS), money logic.
- **Entities + data:** `contracts` (versions, owners) · `manifests` · `builds` (SBOM, attestations) · `releases` (gates, evidence) · `seasons` (one-page scope). Ticketing only for current season scope.
- **Permissions:** publish needs contract-owner A + MiSecurity V + human steward H for high-impact; hotfix path narrow + post-reviewed.
- **Contracts:** `midev.register-contract/submit-build/publish/release/rollback` (Phase 3); versioning/compat rules enforced here.
- **Receipts:** contract registrations, build attestations, release approvals, rollbacks — receipted + publicly verifiable.
- **Offline:** builds reproducible offline; contract registry cached + signed; publishing queues for connectivity.
- **Security:** supply-chain defense (pinned deps, SBOM, Sigstore, secret-scan); no secrets in repos; protected branches + signed releases.
- **Accessibility:** MiPlain lint on member-facing copy; access-mode test matrix in release gates.
- **Support:** builder docs, contract-change migration guides, deprecation windows.
- **Legal:** license purity enforced; asset ownership/licensing checks; export-control screening for crypto/mesh components.
- **Metrics:** contract coverage, build reproducibility rate, gate pass/fail, rollback frequency, season completion.
- **Failure recovery:** rollback per release (Phase 9 workflow); broken builds quarantined; contract breaking changes need migration + dual-run window.
- **Export:** build attestations + release evidence publicly exportable (proof rule).
- **Removal:** deprecated contracts sunset with notice + migration + tombstone; releases immutable once published.
- **Fork behavior:** forks inherit contract registry + lineage; contract changes in forks need upstream-compat review or explicit divergence record.
- **Activation gate:** register→build→attest→release→rollback drill on test contract; gates 1,3,6,8,9 pass.
