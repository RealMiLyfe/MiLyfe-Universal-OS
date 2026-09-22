# MiLyfe Release Gates — visible tracking

**Rule:** no gate closes without named evidence + a human sign-off. Self-checks never close a gate.
**Status date:** 2026-09-21. **Suite:** 240/240 (41 files). Tests prove only what they test.

| # | Gate | Status | Evidence so far (not a pass) | Needed to close |
|---|------|--------|-------------------------------|-----------------|
| 1 | Integrated security | OPEN | Branch self-checks (SR-1…7, FR-1…6) + integration suites (trunk, journeys, isolation, agent/device, money-hardening, support/incident) | Independent human review + penetration test + key-management audit |
| 2 | Accessibility | OPEN | Executable notice audit (all OS paths: plain ≤280, code-free, audio offered, human fallback) | Human review with disabled testers + assistive-tech pass + plain-language audit |
| 3 | Support | OPEN | Support doors tested in care/education/market/work/resolve/justice; escalation ladder tested | Named humans staffed, response-time promises, incident runbook drill |
| 4 | Recovery | OPEN | Outbox fail→pending→ack, replay rebuild, treasury correction, export coverage | Backup/restore drill on real devices + documented RPO/RTO + human sign-off |
| 5 | Human review | OPEN | None claimed | Named reviewers sign each branch + integration |
| 6 | External-boundary documentation | OPEN | Risk/disclosure docs list outside touchpoints; provisional treasury marked; MLY wording enforced + tested | Counsel-level review of outside-touchpoint docs where the activity requires it |
| 7 | Real-person pilot | OPEN | Jacksonville/Duval prep doc written (`JACKSONVILLE-PILOT-PREP.md`) | Pilot runs with real people + safety + support + published learnings |
| 8 | Cross-branch testing | OPEN | 10 cross-branch journeys (J1–J10) green; every journey event validates against MiEvent | Human-witnessed journey runs + failure-injection drills |
| 9 | Brand + public-document readiness | OPEN | Executable doc scans (no misleading MLY claims, no launch-ready claims) | Human brand review + plain-language pass + final doc sign-off |

**Locks:** L1–L10 remain locked. **Launch:** not claimed, not ready.
