# Provenance Register — IF IT ISN'T HERE, IT ISN'T THE PROOF

**Purpose:** record exactly where every Tree V1 input came from. Nothing is invented silently.
**Labels:** `FOUND` (repo path + commit/branch) · `PROMPT` (Tree V1 build directive text) · `DERIVED` (agent-drafted from FOUND/PROMPT sources, needs human approval) · `MISSING` (searched everywhere, not found — must be supplied by a human, never fabricated).

## Exhaustive search record (2026-09-21)

Searched for: `docs/tree-foundation/`, `FINANCE-BRANCH-CRYPTO-RAIL-V2.md`, `ULTIMATE_FEATURE_LIST.md` (151 features), `FOUNDER_STORY_COMPLETE.md`, `MANUAL.md`, `THREE_BRANCHES_BLUEPRINT.md`.

Scope checked:

- Working tree of `701` (commit `4ed5266`) — full recursive grep, case-insensitive, content + filenames.
- `git log --all --name-only` (every file in every commit).
- All remote branches: `main`, `701`, `arena/01a07f3f-milyfe-universal-os`, `arena/01a09416-milyfe-universal-os`, `feat/mijustice-phase1`, all dependabot branches.
- All 27 PR heads (`refs/pull/*/head`), including merged PR #14 (`release/live-no-mesh`).
- Content grep (`git grep`) on `main`, `origin/pr/13`, `origin/pr/14`, `origin/pr/27`, `FETCH_HEAD` (arena/01a09416).

## Register

| # | Referenced item | Verdict | Actual location / note |
|---|---|---|---|
| 1 | `docs/tree-foundation/` (21 files) | `FOUND` (moved + miscounted) | Real path: `MILYFE-TREE-FOUNDATION-PACKAGE/MILYFE-TREE-FOUNDATION-PACKAGE/` — **20 files, not 21**. Copied verbatim to `milyfe-fresh/` (see file list below). |
| 2 | `FINANCE-BRANCH-CRYPTO-RAIL-V2.md` | `MISSING` as a file; requirements `PROMPT` | Not in any branch, commit, or PR. Crypto-rail V2 requirements are taken from the Tree V1 build directive text and written to `branches/finance/FINANCE-BRANCH-CRYPTO-RAIL-V2.md`, clearly marked `PROMPT`-sourced. |
| 3 | `ULTIMATE_FEATURE_LIST.md` (151 features) | `MISSING` | Not in any branch, commit, or PR. Closest existing: `docs/planning/MiLyfe_Ultimate_Manual.md` (1465 lines, module catalog in Part Five). Feature-mapping work must use the Manual until a human supplies the 151-feature list. |
| 4 | `FOUNDER_STORY_COMPLETE.md` | `MISSING` as named; equivalent `FOUND` | `docs/planning/MiLyfe_Founder_Story.md` (124 lines). Phase 8 must confirm with a human whether this is the complete story or a stub. |
| 5 | `MANUAL.md` | `MISSING` as named; equivalent `FOUND` | `docs/planning/MiLyfe_Ultimate_Manual.md` (1465 lines) — "MiLyfe — THE ULTIMATE MANUAL". Adopted as the people-manual source unless a human says otherwise. |
| 6 | `THREE_BRANCHES_BLUEPRINT.md` | `MISSING` | Not in any branch, commit, or PR. Not source of truth per the directive itself. No equivalent adopted; branch designs come from the foundation package. |
| 7 | Tuesday tests | `FOUND` | Standard: `docs/planning/MiLyfe_Ultimate_Manual.md` L317–321; also `docs/MVP_MISSING_FEATURES_PLAN.md` L211–213. Deep: `docs/DEEP_BUILD_PLAN.md` L287–293. Copied into `milyfe-fresh/README.md`. |
| 8 | Governance Tuesday test | `DERIVED` | No prior artifact exists. Drafted in Phase 0 from Governance Branch design + Authority Matrix + Cross-Branch Contract. **Requires human approval** (`TREE-LOCK.md`). |
| 9 | MiLyfe one-sentence description | `FOUND` | Constitution preamble (`roots/MILYFE-CONSTITUTION.md`). |
| 10 | Tree diagram (roots/trunk/3 branches, 4+4+4 OSes) | `FOUND` | `TREE-FOUNDATION-SOURCE.md` §1 (was `README-TREE-FOUNDATION.md`). |
| 11 | MiForge pilot (11 tables, 1200 members, cohorts, sentinel, webhooks) | `FOUND` (partial) | `vault/miforge/` (Next.js app: onboarding, cohort-status, cron daily-report/key-rotation/sentinel, **Whop webhook**, dashboard, email, resilience). **Flag:** existing pilot uses a Whop webhook — forbidden under Tree V1 rails law; Phase 6/11 must replace, not reuse, that rail. Member-count/table-count claims are `PROMPT`-sourced until verified against Supabase. |
| 12 | `transfer_mly` atomic RPC | `FOUND` | `scripts/transfer_mly_rpc.sql` (old tree reference; row-locked, SECURITY DEFINER, pots: spending/savings/community). Usable as Phase 11 reference only — fresh implementation must be re-derived from MiMoney contracts. |
| 13 | GoCardless / Whop / Stripe usage in old tree | `FOUND` (to be excluded) | Matches in `docs/build/01-V1-RELEASE-CUTLINE.md`, `docs/build/06-DEPLOY-CHECKLIST.md`, `docs/build/NEXT-SESSION-PROMPT.md`, `docs/build/SESSION-RECAP.md`, `supabase/APPLY_ALL.sql`, `supabase/migrations/016_justice_expansion.sql`, `MASTER_BUILD_PLAN.md`, `vault/00-INDEX.md`, `vault/miforge/app/page.jsx`, `scripts/secret-scan.sh`. Tree V1 excludes all three rails. |

## Phase 0 copy manifest (20 files, verbatim)

Source root: `MILYFE-TREE-FOUNDATION-PACKAGE/MILYFE-TREE-FOUNDATION-PACKAGE/`

- `README-TREE-FOUNDATION.md` → `milyfe-fresh/TREE-FOUNDATION-SOURCE.md`
- `roots/` (4): `MILYFE-CONSTITUTION.md`, `COMMONS-CHARTER.md`, `MI-BEING-CHARTER.md`, `RATIFICATION-AND-AMENDMENT-PROCEDURE.md`
- `trunk/` (4): `MI-LYFE-TRUNK-DESIGN.md`, `ARCHITECTURE-SOURCE-OF-TRUTH.md`, `SYSTEM-CONTEXT-AND-BOUNDARIES.md`, `INTEGRATION-MAP.md`
- `branches/` (3) → split into `branches/governance/`, `branches/lifestyle/`, `branches/finance/`
- `contracts/` (1): `CROSS-BRANCH-DESIGN-CONTRACT.md`
- `governance/` (1): `AUTHORITY-MATRIX.md`
- `architecture/` (2): `IDENTITY-ROOT-AND-SEED-TO-TREE-DESIGN.md`, `TREE-ALIGNED-DOCUMENT-MAP.md`
- `roadmap/` (4): `TREE-ALIGNED-DESIGN-ROADMAP.md`, `DESIGN-QUALITY-GATES.md`, `BUILD-DOCUMENT-REGISTER.md`, `COMPLETION-AND-ACTIVATION-REGISTER.md`

(`README.md` of the package was an index only; its content is superseded by `milyfe-fresh/README.md`. No content lost.)

| 14 | Oath 24 (immutable, cannot be voted off) | `FOUND` | Full text: `docs/planning/MiLyfe_Ultimate_Manual.md` L43–77; restated L958, L1450; `WHITEPAPER.md` L46, L88–89; `TERMS.md` L59; `README.md` L77. |
| 15 | MiChildGate (non-optional, cannot be voted off), no adult DM youth, money-age rules | `FOUND` | Manual L315, L346, L961, L1356, L1373, L1390, L1459; `BOUNTY_ROADMAP.md` P0-10. |
| 16 | MiLegal fail-closed/default-deny; pause 5-of-7 (money+machines, not speech/exit; 30-day death); human signature for money | `FOUND` | Fail-closed: Manual L963, L1458 + Part Eleven rule. Pause: Manual L964, L1030. Human signature: Manual L637, L887. |
| 17 | Store-carry-forward / Offline Pocket / MiDTN / MiPay / MiScope / MiReceipt / MiWalk / MiAppeal | `FOUND` | Manual L340 (MiDTN), L353–363 (P0 coordination layer), L817–818 + L844–845 (MiPay), Part 5E (DID/CRDT/telemetry); `BOUNTY_ROADMAP.md` P2-03, P12-07. |
| 18 | Manual's referenced docs (`MiLyfe_Complete_Build_Map.md`, `MiLyfe_UI_UX_Blueprint.md`, `MiLyfe_Blueprint_Gap_and_New_Tech_Audit.md`, `MiLyfe_Interactive_Design_Spec.md`, `MiLyfe_COMPLETE.md`) + "43 services" brain codebase | `MISSING` | Verified absent (find, 2026-09-21). Must not be cited as sources until supplied. See `roots/CONSTITUTIONAL-TERMINOLOGY-REVIEW.md` §3.3. |
| 19 | "Vault keys never leave device" / "Shield ciphertext only" (verbatim wordings) | `PROMPT` + FOUND cousins | Verbatim = directive text. Cousins: Vault pin + "your keys" (Manual Part 5E, Part Two), MiShield firewall (Manual L842), Dual Telemetry XChaCha20 (Part 5E). Exact protocol: Phase 2 + Phase 9. |

| 20 | Updated Tree Foundation Design (MLY-is-MLY, internal freedom, V2 tree/roots/trunk/branch lists, seed-to-tree, strategy) | `FOUND` (human-supplied 2026-09-21) | `UPDATED-TREE-FOUNDATION-DESIGN.md` saved verbatim; reconciliation in `FOUNDATION-DELTAS-V2.md`; MLY definition extracted to `roots/MLY-DEFINITION.md`. V2 is now the current design direction. |

## Rules for later phases

1. New design docs cite sources with `FOUND` paths or `PROMPT` section names.
2. `DERIVED` docs are drafts until human-approved; approval is recorded in `PHASE-TRACKER.md`.
3. `MISSING` items (legal opinions, owner assignments, test evidence, the 151-feature list, founder-story confirmation) are NEVER fabricated. They block their gates until a human supplies them.

## 21. 2026-09-21 — V2 approval build-out (agent): wording law + nine labels + slice growth (MiMind/MiDevice/MiScale/rewards/ballots/rails-status); 71/71 tested scope; gates green.

## 22. 2026-09-21 — Governance branch code (agent): delegations/circles/milegal/miresolve/mijustice + tests; 86/86 tested scope; gates green.

## 23. 2026-09-21 — Governance accepted (human) + repo reconciliation recorded in HANDOFF.md; Lifestyle branch code (agent): shared/micare/mihealth/miplace/mieducation + tests; 142/142 tested scope; gates green; CURRENT-STATE.md + HANDOFF.md created.

## 24. 2026-09-21 — Lifestyle accepted (human, 8/12); Finance branch ordered (MiForge/MiMarket/MiMoney/MiWork only).

## 25. 2026-09-21 — Finance branch code (agent): shared/ledger/forge/market/work/bridges + tests; 198/198 tested scope; gates green; all 12 OSes in code; conformance reviewed; acceptance pending.

## 26. 2026-09-21 — Finance accepted (human, 12/12); corrections applied (agent): provisional treasury + corrected MLY/USD wording; 203/203; gates green.

## 27. 2026-09-21 — Finance corrections accepted (human); integration + hardening phase opened (no new OSes).

## 28. 2026-09-21 — Integration batch 1 (agent): 7 integration suites (J1–J10), RELEASE-GATES.md, JAX pilot prep, INTEGRATION-EVIDENCE.md; 240/240; gates green.

## 29. 2026-09-21 — Integration batch 1 accepted (human); batch 2 ordered (evidence + readiness layer, 14 items).

## 30. 2026-09-21 — Integration batch 2 (agent): evidence/readiness layer (14 items), regression pins, freeze; 246/246; gates green.
