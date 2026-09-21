# MiID — Trunk Identity Services (inside Kernel)

**Status:** `READY_FOR_REVIEW` (Phase 2).
**Sources:** Identity doc §2–7 (FINAL) · Constitution Art II/VI · Manual P1 DID+VC, Part Fourteen (personhood), Block DNA pins.

- **Purpose:** stable existence for every entity (person, household, business, community, agent, device, service, cell) before any branch serves it. Identity is root+trunk, never branch-owned.
- **Users:** MiOnboard (creation), MiName (naming), MiPresence (sessions), MiData (ownership links), MiSecurity (auth/recovery), branches (scoped refs only).
- **Owns:** stable entity IDs (`did:milyfe:<multibase>`, ed25519; never silently reused); entity types; lifecycle (unrecognized→invited→claimed→verified-claim→active→context-linked→delegated→suspended→recovered→migrated→forked/merged→retired/preserved); account linking; session/context/relationship refs; proof claims; credential refs; recovery refs (incl. 2-of-3 Shamir social recovery via MiKey); delegation refs; merge review; migration continuity; fork lineage; revocation/suspension state; tombstones + preservation records; identity receipts.
- **Does not own:** legal identity conclusions; government ID authority; universal reputation; money balances; health diagnoses; election outcomes; public-office authority; private data; agent goals/personality.
- **Entities + data:** `entities` (stable id, type, status, lineage) · `claims` (claim-specific verification: email/device/business-license/community-relationship/gov-credential — one verified claim never implies others) · `links` (accounts, sessions, contexts, relationships) · `delegations` (scope, duration, revocation) · `recoveries` (method, stewards, delay) · `tombstones`. Personhood paths (any one): 3-member intro, in-person hello-day stamp, optional gov ID (never required for basic profile). Kids: profile through grown-up, gifts into watched pocket, no UBI until money-age.
- **Permissions:** create identity = Kernel E; recovery exceptions = H; duplicate-account resolution requires review, never silent merge; suspension restricts access, never deletes existence.
- **Contracts:** `miid.create/claim/verify-link/delegate/suspend/recover/migrate/fork/retire` (Phase 3 freeze). Branches receive scoped refs (id + role + permission set), never full identity graphs.
- **Receipts:** name changes, links, delegations, recoveries, migrations, forks, suspensions, retirements — all receipted with lineage preserved.
- **Offline:** identity proofs cached as signed VCs (BBS+ selective disclosure); verification degrades to cached-trust with explicit staleness labels; recovery never completes fully offline (delay + steward confirmation required).
- **Security:** device ≠ person; agent ≠ owner; business ≠ representative; keys hardware-backed where available; cold-twin key rotation; panic freeze invalidates sessions.
- **Accessibility:** "how to pronounce me", language, access needs on profile; zero-recovery-friends path (street keeper + delay — still YOUR profile).
- **Support:** life events — lost/stolen phone, move (street-known standing cools), abuse split (hide/freeze, no auto-transfer), death (steward, UBI stops, optional memory page), leave (export card+pocket+standing+history), place-ban appeal.
- **Legal:** no gov-ID requirement for basic profile; jurisdiction profile from MiBoot; sealed records (child reports, sealed appeals, witness recordings) access-logged.
- **Metrics:** claim-verification rates, recovery success/time, duplicate-review queue, suspension appeals.
- **Failure recovery:** account recovery preserves prior security history; forked/merged identities keep permanent lineage receipts.
- **Export:** identity card + links + history export; standing portable as VC with cooling period on import.
- **Removal:** retire → tombstone + preservation record; personal data follows MiData retention/deletion; existence record preserved.
- **Fork behavior:** Mi fork = related lineage, distinct identity/permissions/history; merges need explicit approval + conflict review + memory rules + identity decision + permanent receipt.
- **Activation gate:** synthetic person: invited→claimed→verified→active→delegated→suspended→recovered→exported→retired, all receipted; gates 1,3,4,6,7,8 pass.
