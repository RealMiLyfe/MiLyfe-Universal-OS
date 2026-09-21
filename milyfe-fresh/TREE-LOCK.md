# Tree Lock Record — Phase 0

**Status:** `APPROVED (direction + architecture only)` by human sign-off on 2026-09-21.
**Meaning:** this approves the tree shape, the rails law, the roadmap, and continued work. It is NOT certification that phases are complete, legally cleared, or production-ready.

## Locked structure

- **Roots:** MiLyfe Constitution · Commons Charter · Mi Being Charter · Ratification and Amendment Procedure (+ root commitments: dignity, consent, data ownership, security/privacy, accessibility, due process, truth+receipts, no hidden custody, no negative balances, human authority over reserved actions).
- **Trunk — MiLyfe Core (16):** Kernel (+MiID) · MiName · MiOnboard · MiData · MiPresence · MiPsyche · MiMind · MiAgent · MiDevice · MiSecurity · MiDev · MiOps · MiCloud · MiNet · MiComm · MiScale.
- **Governance Branch (4):** Governance OS · MiLegal · MiResolve · MiJustice.
- **Lifestyle Branch (4):** MiCare · MiHealth · MiPlace · MiEducation.
- **Finance Branch (4):** MiForge · MiMarket · MiMoney · MiWork.

## Lock rules

1. Exactly four primary OSes per branch. No more, no fewer.
2. **No-new-branch rule:** no fourth branch, no OS moved between branches, no primary OS added/removed without a ratified constitutional amendment (Ratification Procedure §2–9) + ADR + human approval.
3. Supporting OSes (MiElection, Campaign OS, MiJaxx, MiPublic Office, MiFamily, MiMutual, MiBank, MiCredit, MiTax, MiBooks, MiTreasury, etc. — see `architecture/TREE-ALIGNED-DOCUMENT-MAP.md`) remain subordinate to this structure and grow only through MiScale gates (seed-to-tree Stage 7).
4. **Release law:** no branch may publicly present itself as the whole MiLyfe platform while the trunk, other primary branches, or required safeguards remain unavailable (`architecture/IDENTITY-ROOT-AND-SEED-TO-TREE-DESIGN.md` §9).
5. Trunk provides shared capability; it does not absorb domain decisions (Governance OS = governance, MiLegal = neutral legal infra, MiJustice = rights/justice, MiHealth = clinical boundary, MiMarket = marketplace, MiForge = venture/creation, MiMoney = money).
6. Identity is root+trunk (MiID). Branches receive scoped references only.

## Foundation acceptance checklist (from `TREE-FOUNDATION-SOURCE.md` §11)

- [x] Every trunk component has a clear shared responsibility. → Phase 2 done (16 specs).
- [x] Each branch has exactly four primary OSes. → locked above
- [x] No primary OS duplicates another OS's authority. → verified Phases 2–6, documented Phase 10.
- [x] Every branch can explain its value to an ordinary person. → every OS has a "plain value" line (Phases 4–6).
- [x] Governance, Lifestyle, Finance remain connected but bounded. → `contracts/CROSS-BRANCH-DESIGN-CONTRACT.md`
- [x] MiLyfe remains the core identity and living system. → Constitution + Mi Being Charter
- [x] Data, security, receipts, money, human authority flow through the trunk. → Trunk design §5
- [x] Supporting OSes remain subordinate. → lock rule 3
- [x] First build can begin without redesigning the tree. → begun: Phase 11 slice 0–3 built, no tree changes needed.

## Approvals required to exit Phase 0

| Item | Approver | Status |
|---|---|---|
| Tree structure locked as above | Human (founder/steward) | APPROVED 2026-09-21 |
| Rails law (no GoCardless/Whop/Stripe/Visa-MC for $MLY; crypto + cash + own NFC cards) | Human | APPROVED 2026-09-21 |
| Governance Tuesday test draft (`README.md` Test 3) | Human | APPROVED 2026-09-21 |
| Provenance register accurate (`PROVENANCE.md`) | Human | APPROVED 2026-09-21 |
| Crypto-rail V2 requirements captured from directive (`branches/finance/FINANCE-BRANCH-CRYPTO-RAIL-V2.md`) | Human | APPROVED 2026-09-21 |

**Approval record (to be filled by human):**

- Approved by: Founder (chat sign-off: "yes this looks right") · Date: 2026-09-21 · Scope: Phase 0 exit → Phase 1
- Receipt: chat approval recorded in commit; approval meaning + status vocabulary recorded in PHASE-TRACKER.md same date.

## Approval meaning + legal-gate preservation (recorded 2026-09-21, human-directed)

- The United States Constitution is the foundation for MiLyfe's internal principles of limited authority, due process, participation, speech, association, equal treatment, and accountable governance. However, it is not the only source of law, and it does not automatically authorize every activity. Lawyer licensing, financial activity, payments, health services, campaigns, employment, taxes, consumer protection, and data handling can still involve jurisdiction-specific requirements.
- It is NOT recorded that legal review is unconstitutional or unnecessary. The opposite is recorded:

> "MiLyfe's internal constitutional foundation must be preserved. External legal, financial, tax, professional, and jurisdictional review remains an activation gate for activities that require it."

- The current app passing 56 out of 56 tests is valuable evidence for the tests that exist. It proves the current tested scope — not that the platform or roadmap is complete.
- Locked capabilities stay locked behind explicit gates. No passing suite, constitutional principle, or personal sign-off replaces the evidence required for production activation.
