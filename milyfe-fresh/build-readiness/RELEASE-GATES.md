# MiLyfe Release Gates — visible tracking

**Rule:** a gate closes only with all seven: evidence package · named owner/reviewer ·
review date · findings · corrections · re-test result · explicit human closure decision.
Passing tests alone close nothing. Per-gate checklists: `GATE-REVIEW-CHECKLISTS.md`.
**Status date:** 2026-09-21. **Suite:** 246/246 (43 files). Tests prove only what they test.

| # | Gate | Status | Evidence so far (not a pass) | Needed to close |
|---|------|--------|-------------------------------|-----------------|
| 1 | Integrated security | OPEN | Batch-2 packets: `SECURITY-REVIEW-PACKET.md` + `INDEPENDENT-SECURITY-HANDOFF.md` + suites | Independent human review + penetration test + key-management audit |
| 2 | Accessibility | OPEN | `ACCESSIBILITY-EVIDENCE.md` + notice audit (plain/audio/fallback) | Human review with disabled testers + assistive-tech pass + plain-language audit |
| 3 | Support | OPEN | `SUPPORT-PLAN.md` (roles TODO-human) + doors + ladder tested | Named humans staffed, response-time promises, incident runbook drill |
| 4 | Recovery | OPEN | `RECOVERY-EXERCISE.md` + `recovery-drill` suite + exports | Backup/restore drill on real devices + documented RPO/RTO + human sign-off |
| 5 | Human review | OPEN | Checklists open in `GATE-REVIEW-CHECKLISTS.md` (gate 5) | Named reviewers sign each branch + integration |
| 6 | External-boundary documentation | OPEN | `EXTERNAL-BOUNDARY-REGISTER.md` (X1–X11, reviews TODO-human) | Counsel-level review of outside-touchpoint docs where the activity requires it |
| 7 | Real-person pilot | OPEN | `JACKSONVILLE-PILOT-PREP.md` + `PILOT-CONSENT-AND-SAFETY.md` + `PILOT-OPERATIONS.md` (TODOs open) | Pilot runs with real people + safety + support + published learnings |
| 8 | Cross-branch testing | OPEN | `CONTRACT-EVIDENCE-INDEX.md` + J1–J10 + regression pins | Human-witnessed journey runs + failure-injection drills |
| 9 | Brand + public-document readiness | OPEN | Doc scans green + human brand review TODO | Human brand review + plain-language pass + final doc sign-off |

**Locks:** L1–L10 remain locked. **Launch:** not claimed, not ready.
