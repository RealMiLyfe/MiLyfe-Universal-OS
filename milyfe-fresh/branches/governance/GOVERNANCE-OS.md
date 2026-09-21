# Governance OS — Governance Branch (Phase 4)

**Status:** `READY_FOR_REVIEW`. **Plain value:** you can read every rule, see who made it, vote on changes, and appeal — in words a 6th-grader understands.
**Sources:** Governance Branch design §2 · Authority Matrix · Ratification Procedure · Manual Part Seven (Living Compact, proposal lifecycle, circles, delegation, federation).

- **Purpose:** proposals, participation, amendments, stewardship, treasury oversight, community decisions, constitutional review, anti-capture.
- **Users:** members, circles (geo/thematic/special, 500 cap, 90-day rotating steward via sortition at Standing≥50), stewards, delegates, auditors.
- **Owns:** proposals (Idea→Talk→Try-it-first→Decide→What-happened + sunset dates); ballots (private, one human one vote; shops/helpers don't multiply); delegations (topic-specific, time-limited, instantly revocable, ≤3 hops, cycle-detected, no re-delegation); circles + micro-treasuries + participatory budgeting; Living Compact registry (tap any rule → history, vote, change path); quorum tracking (15% + 48h extension); supermajority rules (67% compact changes; 80% treasury-breaker); constitutional screening badges; federation elevation (circle→city→nation-adapter→globe mutual-aid); permaweb archival of votes.
- **Does not own:** courts, clinical care, $MLY issuance, election results, campaigns, public-office authority, member private data.
- **Entities + data:** `proposals` (version, sponsor, text, impact reviews, stage, sunset) · `ballots` (sealed choices; public aggregate ledger) · `delegations` · `circles` (members, treasury, stewards) · `compact_rules` (text, history, vote ref) · `screenings` · `gate_decisions`. Votes sealed; aggregates public; choice never exposed.
- **Permissions:** propose per scope (street rules stay street-level); vote = verified human in scope; high-impact = H + thresholds; AI drafts + screens only, never decides; emergency changes narrow + expiring + post-reviewed + ratify-or-rollback.
- **Contracts:** `gov.propose/comment/delegate/vote/screen/promote/archive/appeal-route` (Phase 3 envelope); handoffs to MiLegal (legal review), MiMoney (treasury execution), MiResolve (process disputes), MiJustice (rights questions).
- **Receipts:** proposal stage transitions, ballot-cast (content-free), delegation grant/revoke, screening verdicts, decisions, archival anchors.
- **Offline:** proposals/compact cached; votes cast offline as sealed ballots carried (store-carry-forward) with double-vote prevention at tally; results sync honestly.
- **Security:** ballot secrecy (sealed + ZK-aggregate where tallied); sybil resistance via personhood; capture detection (concentration warnings, aggregate not who-to-who); 5% helper chorus cap.
- **Accessibility:** plain-language proposal summaries + audio; delegate-to-trusted-human flows; quorum/progress bars; multi-language.
- **Support:** facilitators (Ivo drafts + human facilitator), voter help desk, "what did I vote on?" history.
- **Legal:** internal governance ≠ legal rights; campaign/election/public-office records strictly separated; compact changes with external impact need MiLegal review.
- **Metrics:** participation rate, quorum hits, delegation depth, decision lead time, appeal rate, capture signals.
- **Failure recovery:** failed quorum → extension → re-stage (never silent pass); disputed tally → independent recount + MiResolve; captured process → pause (human-only 5-of-7) + fork right.
- **Export:** member's full participation record (proposals, votes-cast receipts content-free, delegations) exportable.
- **Removal:** proposals withdrawn with reason + receipt; delegations revoked instantly; circle exit preserves history.
- **Fork behavior:** compact forks with lineage; dissenting cells fork with full records; Oath travels with every fork.
- **Activation gate:** synthetic circle runs Idea→Decide→archive with sealed votes + delegation + appeal; gates 1–4,6–9 pass.
