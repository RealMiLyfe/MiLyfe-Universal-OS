# MiSecurity — Trunk Component 10

**Status:** `READY_FOR_REVIEW` (Phase 2).
**Sources:** Constitution Art X · Trunk design · Manual Part Eleven (security posture, MiLegal rule, threats), MiKey/MiShield/MiWatch/MiSeal/MiAuth, 90-day disclosure, SBOM/Sigstore.

- **Purpose:** protect people, data, systems, continuity. May block/quarantine unsafe activity; may never silently own money, identity, governance, legal status, or MiPsyche. Emergency powers narrow, logged, temporary, post-reviewed.
- **Users:** everyone (protection), stewards (quarantine review), builders (baselines), auditors (evidence).
- **Owns:** auth (passkeys/WebAuthn + recovery codes + social recovery via MiKey 2-of-3 Shamir); encryption standards (XChaCha20-Poly1305 private nerve; TLS/BLE/ISM); secret management (MiKey) + access policy; firewall posture (MiShield); monitoring/signal layer (MiWatch); signing (MiSeal); quarantine + threat response; coordinated disclosure (90-day) + warrant-canary process; security test matrix (with Phase 9).
- **Does not own:** money, identity records, governance verdicts, legal conclusions, psyche content.
- **Entities + data:** `credentials` (refs, not secrets) · `quarantines` (scope, reason, expiry, reviewer) · `incidents` · `disclosures` · `canaries`. Threats acknowledged: stolen phone, abusive partner, sybil UBI, captured vote, helper-gone-wrong, supply-chain, lawful process.
- **Permissions:** quarantine A/S per Matrix (H review; H from MiLegal/MiMoney when legal-evidence/money affected); agents E only by policy; permanent removal needs H review.
- **Contracts:** `misecurity.authenticate/quarantine/release/attest/disclose` (Phase 3); inherits into every branch (secret/access/audit/incident/release requirements).
- **Receipts:** auth events (member-visible), quarantines, releases, disclosures, canary updates — receipted; sealed-vote content never in receipts.
- **Offline:** cached credentials with strict expiry; quarantine decisions fail-safe offline (deny-risky); canary staleness labeled.
- **Security:** least privilege; secrets separated; hardware-backed keys; reproducible builds + SBOM + Sigstore; public-room illegal-hash matching only; private messages stay private.
- **Accessibility:** auth usable without biometrics; plain-language security prompts; human help for lockouts (still YOUR profile — street keeper + delay path).
- **Support:** lockout recovery, compromise triage, abuse-support coordination (leave-now), disclosure intake.
- **Legal:** CSAM/sanctions/crime-planning prohibitions; lawful-process honesty (hold little, no magic immunity); evidence handling with MiLegal chain rules.
- **Metrics:** auth success/fail, quarantine volume/duration/appeals, disclosure SLA, patch latency, audit coverage.
- **Failure recovery:** incident response (Phase 9); quarantine auto-expiry + review; key rotation (cold-twin) without lockout.
- **Export:** member's auth/security history exportable; incident records per retention.
- **Removal:** credentials revoked on leave/retire; quarantine records tombstoned per policy.
- **Fork behavior:** security baselines travel with forks (cannot fork to weaker); incidents isolated per cell with lineage links.
- **Activation gate:** lockout→recovery drill + quarantine→appeal→release drill + disclosure drill; gates 1,3,4,6,7,8 pass.
