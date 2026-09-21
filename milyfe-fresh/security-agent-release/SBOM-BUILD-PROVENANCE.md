# SBOM & Build Provenance — Phase 9

**Status:** `READY_FOR_REVIEW`.

- Every release ships: SBOM (deps + licenses), SLSA-class provenance (source commit, builder, inputs), Sigstore signatures, reproducible-build attestation (rebuild → same bytes).
- License gate (MiCompat): OSI-only; Tree V1 app AGPL-3.0; incompatible dep = build fail.
- Secret-scan + dep-audit + vuln-scan in CI; failures block release (no override except documented emergency + post-review).
- Provenance published publicly (proof rule); members can verify release → source → contract versions.
