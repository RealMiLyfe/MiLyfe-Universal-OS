# MiScale — Trunk Component 16

**Status:** `READY_FOR_REVIEW` (Phase 2).
**Sources:** Trunk design · Seed-to-tree stages 0–7 · Manual deployment stages (Lab→First Street→Roots→Canopy→Forest→Ecosystem), locked capabilities, quarantine rules.

- **Purpose:** controlled growth — staged gates, activation policy, capacity management. Growth never rewrites roots or trunk authority. Rights/learn/emergency never gated.
- **Users:** stewards (gate decisions), places (stage progression), builders (capability flags), members (honest "not yet here" states).
- **Owns:** stage model (Seed→Rooting→Trunk→Branch-formation→Tree-growth→First-fruit→Public-launch→Replication mapped to Lab→First Street→Roots→Canopy→Forest→Ecosystem); activation gates per capability; locked-capability register; capacity quotas (members, devices, storage, throughput); "not yet" UX contracts.
- **Does not own:** gate verdicts (governance + human approvers), money rules, security verdicts.
- **Entities + data:** `stages` (criteria, evidence, approver) · `capability_flags` (locked/pilot/active/retired) · `quotas` · `gate_decisions` (receipted). Locked at V1: USD-facing rails, reverse-$MLY automation, public exchange listing, plastic cards, new in-assets beyond six, welcome-credit budgets, trusted-node policy.
- **Permissions:** gate decisions need defined approvers + H for high-impact; flags changes receipted; emergency re-lock allowed (narrow + reviewed).
- **Contracts:** `miscale.stage/flag/quota/decide` (Phase 3); every flag has owner + evidence + rollback.
- **Receipts:** gate decisions, flag flips, quota changes, stage promotions — receipted + public where governance-relevant.
- **Offline:** flags cached + signed; locked stays locked offline (fail-closed); promotions require connectivity + quorum evidence.
- **Security:** flag tampering detected (signed bundles); unauthorized activation → quarantine + incident.
- **Accessibility:** "not yet in your place — here's why + when + what you CAN do" states; never dead ends.
- **Support:** stage-readiness coaching for places; flag-request queue with human review.
- **Legal:** regulated capabilities unlock only with jurisdiction-profile clearance (MiLegal default-deny enforced here).
- **Metrics:** stage distribution, gate lead times, flag counts by state, capacity headroom, premature-activation attempts.
- **Failure recovery:** bad activation → re-lock + rollback + incident review; overloaded stage → quotas throttle with honest UX.
- **Export:** gate history + flag history exportable.
- **Removal:** retired capabilities sunset with notice + migration + tombstone.
- **Fork behavior:** forks start at gated stage with lineage; promotions independent; locked set is a floor (forks may lock more, never less, for regulated items).
- **Activation gate:** lock→pilot→activate→relock drill on test capability; gates 1,3,6,8,9 pass.
