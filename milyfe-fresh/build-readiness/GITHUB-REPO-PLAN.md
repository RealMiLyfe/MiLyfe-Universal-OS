# GitHub Repo Plan — Phase 10 (settings applied by humans in Phase 11, not fabricated)

**Status:** `READY_FOR_REVIEW` as plan.

- **Layout:** `milyfe-fresh/` = Tree V1 root (design docs + `implementation/` app). Old tree stays untouched at repo root until Tree V1 replaces it by explicit cutover decision.
- **Branching:** `main` protected; session branches per workstream; PRs only, no direct push; required: CI green (tsc, tests, RLS probes, secret-scan, license gate), 1 human review (2 for money/security/governance paths), signed commits.
- **Secrets:** GitHub secrets + environment protection rules; service-role keys server-only; rotation schedule; secret-scan (push + PR + scheduled).
- **Scanning:** CodeQL (or equivalent), dep audit, SBOM attestations, Sigstore signing on releases.
- **Releases:** signed tags + GitHub Releases with SBOM/provenance/evidence links; staged rollout via MiScale flags.
- **Templates:** issue/PR templates (already in repo) extended with: contract ref, test plan, security note, rollback plan, receipt/behavior note.
- **Proof:** CI logs + artifacts public; evidence register links resolved per release.
