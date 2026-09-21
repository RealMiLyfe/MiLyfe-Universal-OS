# MiData — Trunk Component 04

**Status:** `READY_FOR_REVIEW` (Phase 2).
**Sources:** Trunk design · Constitution Art VI · Commons §7 · Manual data classification (Part Eleven), Block DNA pins, MiSource/MiHaven.

- **Purpose:** identity-linked ownership and data spaces. Data belongs to its subject/designated owner; possession/processing/indexing/embedding/inference never creates ownership.
- **Users:** every member, household, shop, place; every OS (scoped access only).
- **Owns:** data-space model (personal / household / shop / place / commons / sealed); classification enforcement (public / neighbors / household / private / sealed); provenance + freshness + correction protocol (MiSource: source, maintainer, place, verification, checked date, expiry, confidence, language, correction history, safe-when-stale); retention schedules; export/deletion pipelines; storage topology (device-first, encrypted backup, cold archive).
- **Does not own:** identity records, money balances, governance decisions, content moderation verdicts.
- **Entities + data:** `data_spaces` (owner ref, kind, policy) · `grants` (purpose-bound, expiring) · `provenance` (MiSource records) · `retention_rules` · `deletion_requests`. Health/legal/abuse-history/messages default private; child reports/sealed appeals/witness recordings sealed + access-logged.
- **Permissions:** MiScope purpose-bound grants; youth assent + guardian permission; emergency exceptions narrow + logged; "what can this person see?" preview required before sharing flows.
- **Contracts:** `midata.create-space/grant/revoke/provenance/retain/export/delete` (Phase 3); every cross-space move needs registered data contract (subject, owner, steward, purpose, sensitivity, retention, recipients, export behavior).
- **Receipts:** grants, revocations, corrections, exports, deletions, sealed accesses — all receipted.
- **Offline:** device-first storage (encrypted); grants cached with expiry; revocations propagate async with safe-default (deny on doubt for sensitive); conflicts via MiWalk (never auto-merge sealed/private destructively).
- **Security:** client-encrypted; vault keys never leave device; Shield ciphertext-only handling outside vault; hardware-backed keys where available; per-person vault separation on shared devices (MiShared).
- **Accessibility:** export in plain formats (printable, translatable); "your data" dashboard at 6th-grade level; human help for export/leave.
- **Support:** correction requests, "who saw my data?" inspector, breach support path (Phase 9 incident response).
- **Legal:** legal holds narrow/time-limited/receipted; retention floors per jurisdiction profile; lawful-process minimization (hold little, claim no magic immunity).
- **Metrics:** grant volume/expiry, revocation latency, export/deletion completion time, correction counts, sealed-access audits.
- **Failure recovery:** backup/restore (hot/warm/cold twins); corrupted-space quarantine + restore from snapshot; deletion is verified + receipted.
- **Export:** always works, even during dispute (Oath-adjacent non-negotiable); full history + provenance + receipts included.
- **Removal:** deletion requests honored per retention law; tombstones for shared refs; sealed items follow stricter rule.
- **Fork behavior:** spaces do not copy to forks without owner consent; shared commons content forks with provenance intact; lineage recorded.
- **Activation gate:** grant→use→revoke→correct→export→delete cycle incl. sealed + youth spaces; gates 1,3,4,6,7,8 pass.
