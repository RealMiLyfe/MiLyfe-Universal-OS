# Synthetic-Data Plan — Phase 10

**Status:** `READY_FOR_REVIEW`. All test data synthetic, seeded, and clearly labeled. No real PII, no real money, no real biometrics — ever in non-production.

- **Personas:** adult member, youth-via-grown-up, elder, shop owner, founder, steward, mediator, helper (labeled synthetic), attacker-probe accounts (sybil/farming/injection fixtures).
- **Fixtures:** cells/places/circles, proposals + sealed ballots, listings/orders, care plans, classes/credentials, work agreements, money postings (all states incl. disputed/reversed), offline outboxes + DTN bundles, incident drills.
- **Determinism:** seeded RNG; snapshots for replay tests; fixtures versioned with contracts.
- **Hygiene:** synthetic banner in UI; synthetic-data detector in CI (blocks real-looking PII patterns); separate Supabase project/RLS for test; teardown jobs purge per run.
