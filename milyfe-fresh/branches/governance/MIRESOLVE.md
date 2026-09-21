# MiResolve — Governance Branch (Phase 4)

**Status:** `READY_FOR_REVIEW`. **Plain value:** when something goes wrong — a bad purchase, a wrong ban, a broken promise — you get notice, a fair hearing, a fix, and a way to appeal. No retaliation for complaining.
**Sources:** Governance Branch design §4 · Foundation V2 §7
**V2 V2 CONFIRMED KEPT (2026-09-21):** community-level fix-it rooms stay in MiResolve (Governance Branch): everyday disputes, corrections, appeals, service failures, marketplace disputes, and restorative processes. · Constitution Art V · Manual dispute path L1–L5, MiAppeal/MiHandoff/MiPeace, restorative processes.

- **Purpose:** internal disputes, service failures, marketplace disputes, corrections, appeals, restorative processes, community-level resolution.
- **Users:** complainants, respondents, peer panels, mediators, stewards, builders (correction intake).
- **Owns:** case lifecycle (notice → evidence → reviewer independence → time limits → interim restrictions → member response → decision → remedy → escalation → export-during-case, per MiAppeal); mediation (MiPeace voluntary, labeled, not-a-judge + human mediators); peer panels (restorative); community juries (association rules only); binding arbitration ONLY if both parties signed valid ADR clause; correction workflows; retaliation guard (good-faith reporting protected).
- **Does not own:** criminal/constitutional/civil-rights/court/incarceration/public-office matters (routes to MiJustice/MiLegal/real courts).
- **Entities + data:** `cases` (parties, claims, evidence refs, reviewers, timeline, interim measures) · `decisions` (findings, remedy, appeal window) · `remedies` (refund/repair/apology-amends/service-credit/standing-note) · `escalations`. Evidence access-scoped; sealed where youth/safety requires.
- **Permissions:** case open to affected parties; reviewers independent (conflict-of-interest screened via MiHandoff matching: urgency/role/language/access/place/availability/conflicts); interim restrictions narrow + time-limited; AI mediates only voluntarily + labeled.
- **Contracts:** `resolve.open/respond/evidence/mediate/decide/remedy/escalate/export-case` + handoffs from market (disputes), gov (process disputes), care/work (service failures), to justice (rights/serious-harm escalation).
- **Receipts:** notice, filings, hearings, decisions, remedies, escalations, appeal outcomes — all receipted to parties.
- **Offline:** filings queue offline; hearings need connectivity but evidence prep works offline; notices delivered via DTN/async with honesty labels.
- **Security:** reviewer independence enforced; anti-retaliation monitoring; sealed evidence access-logged; binding outcomes only via valid ADR consent.
- **Accessibility:** plain-language notice ("what's happening, what you can do, by when"); representation help; language/access matching for reviewers.
- **Support:** case navigators (human), "appeal this" one-tap, export-during-case always available.
- **Legal:** waivers of criminal process void; real courts remain available (L∞); arbitration consent verified, never assumed.
- **Metrics:** case volume, resolution time, remedy completion, appeal/escalation rates, retaliation reports (must trend to zero), satisfaction.
- **Failure recovery:** reviewer conflict → reassign; stalled case → escalate + notify; wrong decision → appeal + correction + remedy.
- **Export:** full case file exportable by parties at any time, even mid-case.
- **Removal:** cases close with decision + retention schedule; expungement-equivalent sealing where policy allows + receipt.
- **Fork behavior:** cases stay in originating cell; cross-cell cases via explicit bridge + consent; fork preserves case history.
- **Activation gate:** synthetic marketplace + ban-appeal + correction cases run full lifecycle incl. escalation + export-mid-case; gates 1–4,6–9 pass.
