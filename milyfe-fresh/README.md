# MiLyfe Tree V1 — Fresh Build

**Status:** Phase 0 — Tree lock (design-only; no implementation until Phase 10 exit)
**Source of truth:** `milyfe-fresh/` — copied from `MILYFE-TREE-FOUNDATION-PACKAGE/MILYFE-TREE-FOUNDATION-PACKAGE/` on 2026-09-21. Originals untouched.
**Proof rule:** PUBLIC CODE. PUBLIC VOTES. IF IT ISN'T HERE, IT ISN'T THE PROOF. See `PROVENANCE.md`.

## MiLyfe in one sentence

MiLyfe is a people-owned network connecting people, knowledge, work, care, commerce, devices, agents, communities, and places without surrendering ownership to hidden central control.

*(Source: Constitution preamble, `roots/MILYFE-CONSTITUTION.md`.)*

## The tree

```text
MiLyfe
│
├── Roots
│   ├── MiLyfe Constitution
│   ├── Commons Charter
│   ├── Mi Being Charter
│   ├── Ratification and Amendment Procedure
│   ├── Human dignity
│   ├── Consent
│   ├── Data ownership
│   ├── Security and privacy
│   ├── Accessibility
│   ├── Due process
│   ├── Truth and receipts
│   ├── No hidden custody
│   ├── No negative balances
│   └── Human authority over reserved actions
│
├── Trunk — MiLyfe Core (16 components)
│   ├── Kernel (+ MiID identity services)
│   ├── MiName
│   ├── MiOnboard
│   ├── MiData
│   ├── MiPresence
│   ├── MiPsyche
│   ├── MiMind
│   ├── MiAgent
│   ├── MiDevice
│   ├── MiSecurity
│   ├── MiDev
│   ├── MiOps
│   ├── MiCloud
│   ├── MiNet
│   ├── MiComm
│   └── MiScale
│
├── Governance Branch (4 primary OSes)
│   ├── Governance OS
│   ├── MiLegal
│   ├── MiResolve
│   └── MiJustice
│
├── Lifestyle Branch (4 primary OSes)
│   ├── MiCare
│   ├── MiHealth
│   ├── MiPlace
│   └── MiEducation
│
└── Finance Branch (4 primary OSes)
    ├── MiForge
    ├── MiMarket
    ├── MiMoney
    └── MiWork
```

**Tree lock rules (Phase 0):** exactly 4 primary OSes per branch. No new branch without a ratified constitutional amendment. No branch may publicly present itself as the whole MiLyfe platform while the trunk, other primary branches, or required safeguards remain unavailable (seed-to-tree release law). Full lock record: `TREE-LOCK.md`.

## Rails law (Tree V1)

- **No GoCardless. No Whop. No Stripe. No Visa/MC rails for $MLY.**
- **In:** USDC / USDT / SOL / BTC / ETH / XRP crypto deposits + cash in via trusted nodes (people, businesses, devices, ATMs).
- **Ledger:** $MLY sole ledger (MiMoney). No negative ever. No parallel ledger. Projected ≠ settled.
- **Out:** swap out via community nodes, P2P (meet at library).
- **Cards:** own cards — digital NFC phone-first (MiPay: BLE / NFC / QR, offline store-carry-forward); regular plastic later on our own network (debit/credit, not Visa).
- Spec: `branches/finance/FINANCE-BRANCH-CRYPTO-RAIL-V2.md` (requirements sourced from the Tree V1 build directive; no prior repo copy exists — see `PROVENANCE.md`).

## Tuesday tests

### Test 1 — The Tuesday Test (standard)

> Wake → optional check-in → kid to class or street tutor → surplus food pin → Learn path → thank the neighbor → vote shade sails → evening hello (not a patrol) → story only if you tap in.

**Pass rule:** a person can do this on a Tuesday with no internet, no car, and a 6th-grade reading level.

*(Source: `docs/planning/MiLyfe_Ultimate_Manual.md` §"The Tuesday Test"; also `docs/MVP_MISSING_FEATURES_PLAN.md`.)*

### Test 2 — The Tuesday Test (deep version)

> Wake → Mi suggests "Good morning. You have a court date in 3 days. Rue can help you prep." → kid to class → Learn shows progress, offline pack downloaded → surplus food pin → Street map: see pin, tap, claim, pickup directions → Learn module renders, exercise completes, progress saves offline → thank the neighbor → Wallet: search name, amount, reason, animated send, receipt generated → vote → evening hello → story only on tap-in.

*(Source: `docs/DEEP_BUILD_PLAN.md` §"Success Criteria (The Tuesday Test — Deep Version)".)*

### Test 3 — The Governance Tuesday Test (derived — requires human approval)

> Wake → read one active proposal in plain language (6th-grade level, offline) → ask Mi what it changes for you → discuss with your household/cell → cast a sealed vote → see your vote counted in the public ledger aggregate (your choice stays sealed) → appeal a decision you disagree with → receive a receipt for every step → export your participation record.

**Pass rule:** same as Test 1 (no internet, no car, 6th-grade reading level), plus: votes sealed, ledger aggregate public, every consequential step receipted, appeal path visible, export works even during a dispute.

*(Derived from: Governance Branch design + Authority Matrix + Cross-Branch Design Contract. Not found as a prior artifact in the repo — drafted in Phase 0, must be human-approved per `TREE-LOCK.md`.)*

## Constraints (all phases)

- One signup/profile, free forever, offline-first, client-encrypted, local-first, people-owned, AGPL-3.0.
- Vault keys never leave device. Shield ciphertext only. Governance votes sealed + ledger aggregate public.
- No adult DM to youth. No money move without human signature. Export always, even during dispute.
- Oath 24 + MiChildGate cannot be voted off. MiLegal fail-closed. Pause = 5-of-7 halts money+machines, not speech/exit; 30-day death.
- Trunk provides shared capability; it does not absorb domain decisions.
- Identity is root+trunk (MiID), never branch-owned.
- No implementation without contract/test/security/support/rollback design.
- Markdown design must be complete for build prep; actual code, assets, GitHub settings, legal opinions, owner assignments, and test evidence must be produced or supplied in their respective phases — never fabricated by an agent.

## Map

| Area | Path |
|---|---|
| Proof register | `PROVENANCE.md` |
| Tree lock record | `TREE-LOCK.md` |
| Phase tracker + gates | `PHASE-TRACKER.md` |
| Roots (Phase 1) | `roots/` |
| Trunk (Phase 2) | `trunk/` |
| Shared contracts (Phase 3) | `contracts/` |
| Governance (Phase 4) | `branches/governance/` |
| Lifestyle (Phase 5) | `branches/lifestyle/` |
| Finance (Phase 6) | `branches/finance/` |
| Cross-branch journeys (Phase 7) | `journeys/` |
| Brand / public / legal (Phase 8) | `brand-public-legal/` |
| Security / agent / release (Phase 9) | `security-agent-release/` |
| Build readiness (Phase 10) | `build-readiness/` |
| Implementation (Phase 11, after Phase 10 only) | `implementation/` |
| Authority matrix | `governance/AUTHORITY-MATRIX.md` |
| Roadmap + quality gates | `roadmap/` |
| Identity + seed-to-tree | `architecture/` |
