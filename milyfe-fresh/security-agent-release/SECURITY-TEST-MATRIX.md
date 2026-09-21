# Security Test Matrix — Phase 9 (spec; evidence produced in Phase 11 runs, not fabricated)

**Status:** `READY_FOR_REVIEW`.

| ID | Area | Tests (design) | Pass bar |
|---|---|---|---|
| S1 | Auth | passkey happy/sad paths, recovery codes, social-recovery 2-of-3, lockout, kiosk clear | all pass; no bypass |
| S2 | Vault/crypto | AES-256-GCM roundtrip, wrong-passphrase reject, salt/IV randomness, at-rest encryption, key-rotation without lockout | all pass |
| S3 | Ledger invariants | no-negative fuzz, balanced-posting fuzz, double-spend attempts (online+offline), idempotent replay | zero breaks |
| S4 | Ballots | secrecy (choice unrecoverable from aggregate/receipts), double-vote prevention incl. offline-carried | zero leaks/double |
| S5 | Agent/injection | lease escape attempts, tool smuggling, pasted-instruction attacks, runaway budgets | all blocked + logged |
| S6 | Access control | grant/revoke/expire matrix, youth fencing, sealed access logging, break-glass review | matrix green |
| S7 | Offline security | stale-grant deny, cached-credential expiry, offline-payload caps/sequence/expiry, replay rejection | all enforced |
| S8 | Supply chain | SBOM present, Sigstore verify, reproducible build check, secret-scan, dep audit | clean |
| S9 | RLS/isolation | per-table RLS probes (anon/auth/other-user/service-role-never-browser) | deny-correct everywhere |
| S10 | Abuse/safety | CSAM-hash public-room matching, report→quarantine→review loop, leave-now drill, panic freeze drill | loops close + receipted |
| S11 | Privacy | nerve separation (private vs ZK-public), nerve-leak probes, export completeness, deletion verification | no leaks |
| S12 | Release | gate checklist, rollback drill, canary update, incident-comms drill | evidenced |
