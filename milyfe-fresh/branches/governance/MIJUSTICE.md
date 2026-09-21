# MiJustice — Governance Branch (Phase 4)

**Status:** `READY_FOR_REVIEW`. **Plain value:** when your rights are violated — by anyone, including MiLyfe itself — you get knowledge, witnesses, paper, lawyers, and neighbors. Shield, not sword.
**Sources:** Governance Branch design §5 · Foundation V2 §7
**V2 V3 CONFIRMED KEPT (2026-09-21):** jail/reentry support stays under MiJustice as rights, reentry, family, legal-access, education, work, and reintegration support. MiLyfe claims no authority over incarceration itself. · Manual Part Eight (shield philosophy/table, leave-now, defense circles, peace system), rights prep (court-date flows), incarceration access.

- **Purpose:** rights defense, serious accountability, court support, appeals, redress, restitution, government accountability, incarceration access, civil-rights pathways.
- **Users:** rights-holders in trouble, witnesses, families, reentering members, incarcerated members (where facility allows), lawyers/aides.
- **Owns:** rights cards (jurisdiction-specific, offline); encounter tools (witness mode, write-it-while-fresh, timestamped evidence anchoring); court support (what the paper is, deadlines, forms, legal-aid links — never unauthorized orders); accountability cases (serious appeals, redress, restitution); incarceration access (offline lessons, family contact where allowed, courses/teaching inside); reentry packs (day-one pocket, clothes/food jar, ID help, job board, calendar); defense circles (5–12 neighbors: rides/childcare/witness/food; common gift pot; de-escalation/first-aid/rights training — never weapons); peace system coordination (peace tables, verified-peace rewards 30/90/180d, exit pathways).
- **Does not own:** courts (supports, never replaces); policing; incarceration itself (supports people inside and returning; claims no authority over facilities or sentences); legal advice (routes to counsel); violence or evasion (explicitly excluded).
- **Entities + data:** `rights_cases` (sealed options) · `evidence` (anchored, chain-of-custody) · `encounters` · `redress_tracks` · `circles` · `peace_terms` (escrow, 30-day truce windows). Shield-table enforced: vs person/police/courts/agencies/MiLyfe — each row defines what you get AND what you don't.
- **Permissions:** rights tools open to all; sealed cases need H + access log; evidence handling per MiLegal chain rules; peace escrow needs dual consent.
- **Contracts:** `justice.rights-card/encounter/case/evidence/redress/circle/peace-track` + handoffs from resolve (escalations), legal (holds/counsel), finance (restitution settlement only), trunk (leave-now integration).
- **Receipts:** encounter records, evidence anchors, case milestones, redress/restitution postings (via MiMoney), circle commitments, peace-term outcomes.
- **Offline:** rights cards + encounter capture + lessons fully offline; evidence anchors queue for timestamping; witness notify via mesh/DTN.
- **Security:** witness protection handling; sealed evidence; anti-retaliation; no face-hunt features; cameras only if street votes (event-only, stranger-ID off).
- **Accessibility:** one-tap encounter mode; plain-language rights; languages; accessibility-matched supporters; DV-expert-tested flows.
- **Support:** Rue helper + human defenders; 911 path preserved (never hidden); shelter directories (e.g., Hubbard House-class listings with freshness dates).
- **Legal:** knowledge/witnesses/paper/lawyers/neighbors — not violence, not unauthorized law, not obstruction ("not eating a warrant"); contraband/escape/fraud never assisted; lawful officers never hidden from.
- **Metrics:** encounter outcomes, evidence-admissibility hygiene, redress completion, restitution paid, peace-term hold rates, reentry milestones.
- **Failure recovery:** lost evidence → custody-log audit + re-anchor; broken truce → escrow to community pot per terms + re-mediation offer; failed redress → escalation + L∞ courts path.
- **Export:** full rights-case file + evidence manifest exportable, even mid-case.
- **Removal:** cases close with outcome + retention; sealing/expungement-support where lawful; memory pages optional.
- **Fork behavior:** rights cases stay in cell; evidence lineage preserved; fork never erases accountability records.
- **Activation gate:** synthetic encounter→evidence→court-support→redress drill + peace-table drill + reentry drill, all offline-capable; gates 1–4,6–9 pass.
