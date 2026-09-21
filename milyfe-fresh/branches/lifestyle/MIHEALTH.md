# MiHealth — Lifestyle Branch (Phase 5)

**Status:** `READY_FOR_REVIEW`. **Plain value:** your health info stays yours, on your device, shared only when you say so — and AI never pretends to be your doctor.
**Sources:** Lifestyle design §3 · Manual Sol helper, MiBody/MiWell, biometrics-never-leave-private-nerve, clinical boundaries.

- **Purpose:** health-service boundary — health information permissions, clinical integrations, public-health coordination, professional-care routing.
- **Users:** members, clinicians/clinics (integrations), public-health coordinators (aggregate only), caregivers (consented slices).
- **Owns:** health permission envelopes (what slice, to whom, for how long, revocable); personal health records store (MiData private, device-first); clinical integration adapters (records in/out with consent); public-health coordination (aggregate, de-identified, Dual-Telemetry public nerve only); professional routing (Sol info + clinician handoff); medication reminders YOU set (Oli).
- **Does not own:** diagnosis, treatment decisions, prescriptions, emergency authority; general AI NEVER presented as licensed clinician.
- **Entities + data:** `health_records` (private, provenance-tagged) · `health_grants` (slice-scoped, expiring) · `clinical_links` · `public_health_reports` (aggregate-only). Biometrics/health NEVER leave the private nerve; community metrics via ZK aggregate only.
- **Permissions:** explicit per-slice consent; youth via grown-up + assent; emergency access narrow + logged + reviewed; clinicians see only granted slices.
- **Contracts:** `health.grant/slice/integrate/route/report-aggregate/revoke` + handoffs to care (coordination), place (emergency resources), comms (alerts), resolve (complaints).
- **Receipts:** grants, accesses (who saw what, when), revocations, integrations, aggregate reports.
- **Offline:** records on-device; grants cached with expiry; emergency info card (allergies, conditions YOU choose) available offline to chosen responders.
- **Security:** private-nerve encryption; access anomaly alerts; integration adapters sandboxed + audited; no health data in analytics.
- **Accessibility:** health literacy plain language; audio; caregiver-assisted views (consented); low-bandwidth record cards.
- **Support:** "who saw my health data?" inspector + instant revoke + human help; patient navigators.
- **Legal:** licensed-professional boundaries; jurisdiction health-privacy rules in profiles; public-health duties aggregate-only; no unlicensed clinical devices.
- **Metrics:** grant volume/expiry, access counts, revocation latency, integration uptime, routing completion.
- **Failure recovery:** integration outage → cached records + honest labels; wrong disclosure → contain + notify + remedy + review.
- **Export:** full health record + access log exportable, even during dispute.
- **Removal:** record deletion per retention + law; grants revoked on leave; integrations unlinked with confirmation.
- **Fork behavior:** health data never crosses forks without fresh consent; aggregates recomputed per cell.
- **Activation gate:** grant→access→revoke→audit→export drill + emergency-card drill + routing drill; gates 1,2,4,6,7,8 pass.
