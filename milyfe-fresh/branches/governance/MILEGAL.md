# MiLegal — Governance Branch (Phase 4)

**Status:** `READY_FOR_REVIEW`. **Plain value:** understand legal papers, get routed to a real lawyer, and never be fooled by AI pretending to be one. Fail-closed: if unsure, it blocks and routes to a human.
**Sources:** Governance Branch design §3 · External-Law Boundary · Manual MiLegal default-deny, jurisdiction profiles, Part Eight (courts/agencies rows).

- **Purpose:** neutral legal infrastructure — information, contracts, jurisdiction profiles, professional routing, legal holds, review workflows, external legal relationship records.
- **Users:** members facing papers/deadlines/forms, shops (compliance), builders (capability enablement), stewards (holds/reviews).
- **Owns:** legal information library (jurisdiction-tagged, freshness-dated, MiSource provenance); contract workflows (templates, e-sign routing, filing); jurisdiction profiles (signed OPA bundles: enable only if profile-yes AND consent AND class ≤ ceiling; stricter wins); professional routing (legal-aid links, lawyer finder, privilege-preserving handoff); legal holds (narrow/recorded/time-limited/reviewable/revocable); legal review workflows (for proposals/releases/flags); document provenance chain; external counsel relationship records.
- **Does not own:** legal advice (only H counsel); court outcomes; governance verdicts; member private data beyond holds.
- **Entities + data:** `legal_docs` (doc, jurisdiction, provenance, freshness) · `jurisdiction_profiles` · `contracts` (parties, status, signatures) · `holds` · `reviews` · `referrals` (privilege-flagged). Fail-closed: regulated capability stays denied until all three enable conditions verify.
- **Permissions:** holds need MiLegal A + H review; legal interpretation = MiLegal A/E with H counsel; AI = summary only with "not a lawyer" label + sources.
- **Contracts:** `legal.lookup/profile/check-enable/route/hold/review/provenance` + handoffs from gov (proposal review), resolve/justice (case support), finance (rail enablement gates).
- **Receipts:** enablement decisions (allow/deny + which profile rule), holds, referrals, reviews, provenance verifications.
- **Offline:** jurisdiction bundles + legal-aid directory cached; enablement decisions fail-closed offline; holds queue with safe-default.
- **Security:** privilege-flagged data sealed + access-logged; chain-of-custody for evidence-bound docs; no stealth enablement (all decisions receipted).
- **Accessibility:** "what is this paper / what is the deadline / what do I do next" plain-language cards; forms help; language support; human lawyer path always visible.
- **Support:** legal-aid navigation, deadline calendars, FOIA/benefits packet builders; "find a human lawyer" one-tap.
- **Legal:** (meta) not a law firm; no unauthorized practice; no evasion/forgery/false-status assistance; real courts always available.
- **Metrics:** enablement allow/deny rates, hold volume/duration/appeals, referral completion, doc freshness compliance.
- **Failure recovery:** stale profile → fail-closed + update push; wrong routing → correction + re-referral + receipt; hold errors → immediate release + review.
- **Export:** member's legal docs + holds + referral history exportable (privilege preserved in export handling).
- **Removal:** holds expire/release with receipt; docs follow retention; referrals close with outcome (where consented).
- **Fork behavior:** jurisdiction profiles fork with lineage; tighter-only rule travels; holds don't cross forks without new process.
- **Activation gate:** enable/deny drill across 2 conflicting jurisdiction profiles + hold lifecycle + referral drill; gates 1,3,4,6,7,8,9 pass.
