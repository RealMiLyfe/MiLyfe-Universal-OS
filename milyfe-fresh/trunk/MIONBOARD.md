# MiOnboard — Trunk Component 03

**Status:** `READY_FOR_REVIEW` (Phase 2).
**Sources:** Trunk design · Identity §4–5 · Manual MiBoot/MiKey/MiPlain, jurisdiction profile (Part Eleven), 7-step onboarding (UI spec ref), Part Fourteen.

- **Purpose:** one signup, one profile, whole life together — joining, proof, recovery setup, context selection, and jurisdiction profile in plain language, offline-capable, save-and-resume.
- **Users:** first-time members (incl. no-ID, no-address, low-literacy, youth-via-grown-up), joining businesses/shops, rejoining members.
- **Owns:** onboarding flows (person/shop/place/helper-track), proof-of-personhood orchestration (3 paths), recovery-friends + delay setup, context selection (household/place/circles), jurisdiction profile questionnaire, progress + resume state, stuck-member detection + human handoff.
- **Does not own:** identity records (MiID), money issuance, governance admission votes, legal advice.
- **Entities + data:** `onboarding_flows` (kind, steps, version) · `onboarding_progress` (entity ref, step, state, resume token) · `personhood_proofs` (path, attestations, status) · `jurisdiction_profiles` (answers, signed OPA bundle ref). Profile never requires address ("where do you spend time?" — library/kiosk OK) or gov ID.
- **Permissions:** invited/unrecognized → claimed under flow policy; youth flows require grown-up sponsor; shop flows require place + owner verification.
- **Contracts:** `mionboard.start/resume/attest/select-context/complete` (Phase 3); emits identity + receipt + presence events.
- **Receipts:** join receipt (what was created, what it means, exit path), proof receipts, context-selection receipts.
- **Offline:** full flow works offline (MiBoot one-tap); attestations queue; completion syncs when connected; progress stored on-device encrypted.
- **Security:** proof replay protection; sybil resistance via personhood paths + MiID duplicate review; no biometric capture without consent; kiosk mode (MiShared) with session clearing.
- **Accessibility:** 6th-grade plain language (MiPlain lint), 10+ languages, audio guidance, large-text/high-contrast modes, human greeter handoff (Sam helper + human).
- **Support:** stuck detection (stall → nudge → human greeter); zero-recovery-friends path.
- **Legal:** jurisdiction questions (operate-where, radio license, household/coop/school/clinic, minors on device, "MiLyfe is not a government" acknowledgment); profiles as signed, reviewable, forkable bundles; communities tighten-only.
- **Metrics:** start/complete rate, time-to-active, stall points, proof-path mix, support escalations.
- **Failure recovery:** resume tokens; abandoned flows expire with notice; partial proofs preserved for retry.
- **Export:** onboarding record + proofs included in identity export.
- **Removal:** abandon → progress purged per retention; claimed identities follow MiID retire path.
- **Fork behavior:** onboarding flows versioned; forks inherit flow version + lineage; policy diffs shown before join.
- **Activation gate:** synthetic persons (adult, youth-via-grown-up, no-ID, shop) complete offline→sync→active; gates 1,2,4,6,7,8 pass.
