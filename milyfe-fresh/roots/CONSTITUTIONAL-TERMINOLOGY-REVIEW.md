# Constitutional Terminology Review — Phase 1

**Status:** `READY_FOR_REVIEW`. Pass over the 4 roots docs + trunk/branch/contract/governance/roadmap + Manual + directive constraints.
**Rule applied:** Gate 1 (Coherence) — no duplicate authority, no unexplained OS, no branch conflict, consistent terms, uniform MiLyfe naming.

## 1. Source-of-truth reconciliation (decision required)

| Claim | Source | Tree V1 position |
|---|---|---|
| "This manual wins" over every other document | Manual L6 | **Superseded for Tree V1** by the build directive: the tree-foundation package is the constitutional source of truth; the Manual is the people-manual + product-spec source. Where they conflict, the conflict is logged below and resolved by human decision + ADR (Phase 10), not by silent precedence. |
| Authority order: Constitution → AGENTS.md → ADRs → contracts → manifests → roadmaps → issues → assumptions | `trunk/ARCHITECTURE-SOURCE-OF-TRUTH.md` | Adopted. Agent assumptions rank last — this file records them as `DERIVED` until approved. |

## 2. Term decisions (locked for Tree V1 design)

| Term | Decision | Sources aligned |
|---|---|---|
| MiLyfe spelling | **MiLyfe** (capital M, L, F). Never "MyLife", "Milyfe", "MiLyfe-OS" as product name. | Manual corrections table; foundation package |
| Money unit | **$MLY**. Never $MI. | Manual corrections; Constitution Art VII |
| Internal module prefix | **Mi\*** (MiPay, MiScope, MiReceipt…). Members see tab names (Pocket/Learn/Street/Voice/You), never module names. | Manual Part Five intro; Part Three |
| People-owned network + commons | Canonical self-description. "Digital voluntary commons", never "Digital Voluntary State". | Manual corrections; Constitution Art I.5 |
| Not-a-state | MiLyfe is not a government/state/nation (Oath 18). "Living Compact" (Manual Part Seven) is the member-facing agreement; "Constitution + Charters" are the Tree V1 roots texts. Same floor, two audiences — Compact language must never contradict roots text. | Oath 18; Art XII; Manual Part Seven |
| Standing | Descriptive facets/credentials, portable as VC. **Never** a universal score, never gates rights, never a credit score. | Identity §2/§7; Manual L1460 |
| Projected vs settled | Always separated, always labeled. Projected is never spendable, never displayed as balance. | Constitution Art VII.4; Finance boundary; V2 §2 |
| Receipt | MiReceipt answers: what happened / did not / who sees it / which policy / can it be undone / expiry / appeal. Portable, printable, translatable, verifiable. | Manual L357; Cross-Branch Contract §4 |
| Permission | MiScope = relationship/permission/consent graph; purpose-bound; previewable ("what can this person see?"). | Manual L355; Phase 3 contract |
| Offline | MiWalk = offline action/conflict engine (never auto-resolves money, guardianship, binding ballots); MiDTN = store-carry-forward transport. Distinct systems. | Manual L359, L340 |
| Pause | Human-only 5-of-7 halt of **money and machines**, not speech/exit; emergency roles die in 30 days; no extension without new vote. | Manual L964, L1030 |
| Oath 24 | Immutable floor; cannot be changed by any vote; travels with every fork. | Manual L43–77, L1450; WHITEPAPER; TERMS |
| MiChildGate | Non-optional child safety; cannot be voted off; no cell policy weaker. | Manual L346, L1373, L1459 |
| MiLegal posture | Fail-closed / default-deny for regulated capabilities. | Manual L963, L1458, Part Eleven |
| Youth messaging/location | No adult DMs; no public location. Absolute. | Manual L315, L1356 |
| Money signature | No money move without human signature; never auto-executes money. | Manual L637, L887 |
| Vault / Shield | Vault = member's private encrypted storage + keys (Manual Block DNA pin; Part 5E). MiShield = firewall/security layer (Manual L842). Directive rules — "vault keys never leave device", "Shield ciphertext only" — adopted as Tree V1 design constraints; exact protocol wording finalized in Phase 2 (MiSecurity/MiData) + Phase 9. | Manual L315 vault ref, L842; directive (PROMPT) |

## 3. Inconsistencies found (honest log)

1. **Manual says "single source of truth, this manual wins" (L6)** while Tree V1 directive makes the foundation package the source of truth. → Resolved as §1 above; needs human confirmation at Phase 0/1 exit.
2. **Manual stack says Next.js 14** (Part Ten); directive says **Next.js 16** + React 19 + Tailwind + Supabase + Dexie + PWA. → Directive wins for `milyfe-fresh/implementation/`; Manual stack retained as old-tree reference only.
3. **Manual references 5 docs that don't exist** (`MiLyfe_Complete_Build_Map.md`, `MiLyfe_UI_UX_Blueprint.md`, `MiLyfe_Blueprint_Gap_and_New_Tech_Audit.md`, `MiLyfe_Interactive_Design_Spec.md`, `MiLyfe_COMPLETE.md`) + a "43 services / 7,624 lines brain" codebase not present in this repo. → Logged in `../PROVENANCE.md`; Phase 2+ must not cite them as sources.
4. **"Compact" vs "Constitution" naming:** Manual Part Seven says "Not a constitution. A compact." Tree V1 roots include a document titled Constitution (explicitly internal charter, not the U.S. Constitution). → Both retained with audience split (§2 row); member-facing copy uses "Compact", builder/governance copy uses "Constitution + Charters"; legal review (Phase 8) must clear the public naming.
5. **Pots naming:** Manual Part Two shows Weekly/Thanks/Place pots; old code (`scripts/transfer_mly_rpc.sql`) uses spending/savings/community; directive mentions pot breakdown 70/30 (place/commons issuance split per Manual L~162). → Three distinct concepts (display pots vs ledger pots vs issuance split). Phase 6 must define one model; nothing copied blindly.
6. **MiPay vs Pocket vs Offline Pocket:** Manual uses MiPay (payments), Pocket (tab), Offline Pocket (bounty). V2 uses "MiPay BLE/NFC/QR offline store-carry-forward". → Phase 6 unifies: MiPay = capability, Pocket = member surface, Offline Pocket = offline mode. Until then, docs use all three only with these meanings.
7. **"Shield ciphertext only":** directive wording has no verbatim FOUND source; nearest FOUND = MiShield firewall (Manual L842) + Dual Telemetry private nerve XChaCha20 (Manual Part 5E) + "your credits, your keys" (Part Two). → Adopted as constraint; protocol proof in Phase 9.

## 4. Naming audit (Mi* uniformity)

- Roots/branches/trunk docs use Mi* names uniformly (MiID, MiName, MiMoney, MiLegal…). No "My*/Mesh*/Smart*" brand residue found in the foundation package. ✅
- Exception: Authority Matrix + Integration Map mention "Campaign OS / MiJaxx / MiPublic Office / MiElection" supporting systems — subordinate per Tree Lock rule 3, not primary OSes. No rename needed. ✅
- "Governance OS" is the only primary OS without a Mi* name — retained as-is (foundation §4.1); do not invent "MiGovern". ✅

## 5. Phase 1 exit position

Roots are coherent and reviewable. No branch can silently override them: change requires Ratification Procedure + Authority Matrix `H` approvals + ADR (per Architecture Source of Truth change rule). Substantive roots amendments are out of scope for design phases — only the human ratification path may alter roots text.
