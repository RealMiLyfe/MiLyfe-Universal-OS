# MiCare — Lifestyle Branch (Phase 5)

**Status:** `READY_FOR_REVIEW`. **Plain value:** coordinate care for kids, elders, disability, and respite — confirmed people, clear plans, no judgment, no surveillance.
**Sources:** Lifestyle design §2 · Manual life situations (single parents, abused, orphans, homeless, elderly), care exchange, Oli/Kim helpers, MiHandoff.

- **Purpose:** care coordination — caregiving, disability support, elder care, child care, respite, supported decision-making, care networks.
- **Users:** care receivers, family caregivers, professional aides, guardians, stewards (foster/aged-out), coordinators.
- **Owns:** care plans (needs, schedule, confirmed helpers, respite windows); relationship graph (who cares for whom, with consent); supported-decision records (assent + supporter + scope); respite + babysit-swap coordination; care-hour exchange (trade hours, not money); check-ins THEY set (elders); steward-on-profile flows (orphans/foster/aged-out: learn path, first-home jar, time-boxed boost — never pity feed).
- **Does not own:** diagnosis, prescription, clinical care (licensed); money settlement (MiMoney); legal custody verdicts.
- **Entities + data:** `care_plans` · `care_relationships` (consented) · `supported_decisions` · `respite_bookings` · `care_hours`. All household/private minimum; youth data guardian-scoped; abuse-split rule: hide/freeze, never auto-transfer.
- **Permissions:** receiver consent (or supported-decision record) per helper; youth via grown-up; caregiver abuse → immediate suspend + human review + MiResolve/MiJustice path.
- **Contracts:** `care.plan/match/book/attest/escalate` + handoffs to health (clinical boundary), place (rides/resources), work (caregiver livelihood), resolve (service failures), justice (abuse).
- **Receipts:** plan changes, bookings, hour exchanges, attestations ("confirmed care"), escalations.
- **Offline:** plans + schedules + contact trees cached; check-ins queue; emergency contacts via mesh/DTN.
- **Security:** caregiver vetting appropriate to role; no silent tracking of receivers; visit confirmations receiver-side (elder confirms visits).
- **Accessibility:** coordination for all literacy/tech levels; audio + human coordinator fallback; single-parent night-class-compatible scheduling.
- **Support:** human care coordinators; "this isn't working" re-match; respite crisis cover.
- **Legal:** licensed-care boundaries; mandatory-reporting handling per jurisdiction profile (routed to humans, never auto-filed by AI); custody orders respected via MiLegal.
- **Metrics:** confirmed-care rate, plan adherence, respite coverage, re-match rate, abuse reports + resolution.
- **Failure recovery:** no-show → backup chain + rebook + receipt; helper failure → suspend + replace + remedy path.
- **Export:** full care history exportable by receiver/guardian, even during dispute.
- **Removal:** relationships end with notice + handoff record; data follows retention + youth rules.
- **Fork behavior:** care plans stay in cell; cross-cell coordination via explicit consent + bridge.
- **Activation gate:** synthetic family (elder + kid + aide) runs plan→book→swap→escalate→export incl. offline; gates 1,2,4,6,7,8 pass.
