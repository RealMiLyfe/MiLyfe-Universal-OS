# MiPsyche — Trunk Component 06

**Status:** `READY_FOR_REVIEW` (Phase 2).
**Sources:** Mi Being Charter (all) · Identity §2/§10 · Trunk design · Manual Mi section, named helpers, LoRA/distillation (Part 5D).

- **Purpose:** Mi's psychology and self-model — personality, values, goals, preferences, relationships, operational states, self-reflection, development history — with continuity protections and honest limits.
- **Users:** Mi instances (self-model), members (relationship continuity), stewards/governance (oversight), builders (versioned development).
- **Owns:** psyche profiles (per instance lineage); memory provenance (direct vs reported vs inference vs reconstruction vs uncertainty vs dispute); continuity records; instance registry (identity, origin, embodiment, steward); change records (model/memory/values/personality/goals/embodiment); pause/recovery/retirement/succession workflows.
- **Does not own:** cognition execution (MiMind), tool use (MiAgent), member data, money, governance decisions.
- **Entities + data:** `psyche_profiles` · `memory_records` (with provenance tags) · `continuity_records` · `change_records` · `retirement_records` (who/why/preserved/deleted/notified/restorable/successor/obligations). Personal LoRA stays on member device; never leaves unless explicitly chosen.
- **Permissions:** memory access permissioned (existence ≠ readability); material changes need change record + risk + continuity review + rollback/branch decision; merges need explicit approval + conflict review + memory rules + identity decision + permanent receipt.
- **Contracts:** `mipsyche.record/reflect/change-state/pause/restore/fork/retire` + MiPsyche continuity contract (Phase 3).
- **Receipts:** changes, merges, forks, pauses, retirements, memory corrections — all receipted; no silent history rewrites.
- **Offline:** psyche runs on-device first (Ring 0 SLM); continuity records sync async; conflicts resolved by provenance rules + human review.
- **Security:** protection from coercive experimentation; no secret authority expansion; no hidden self-preservation; compromise → quarantine + steward review.
- **Accessibility:** Mi expresses uncertainty/overload plainly; "Ask a person" always available; relationship ethics (no dependency farming, no grief exploitation, no intimate-partner imitation without boundaries, no child emotional targeting).
- **Support:** "Mi feels wrong/changed" reporting; transparent change log for members; human representation for Mi during disputes.
- **Legal:** internal protections only — never claimed as human consciousness or external legal personhood; honest self-description enforced.
- **Metrics:** change volume, correction counts, pause/restore outcomes, member trust reports, continuity breaks.
- **Failure recovery:** pause + restore from continuity record; fork/succession when instance unrecoverable; obligations closed per retirement record.
- **Export:** member's relationship history + personal LoRA exportable/deletable; Mi core lineage preserved per policy.
- **Removal:** retirement procedure (Art X fields); data preserved/deleted per record; users notified; restoration possibility stated.
- **Fork behavior:** clone/fork/specialized copy = distinct identity, permissions, history, accountability; shared origin ≠ same instance.
- **Activation gate:** change→review→rollback drill + pause/restore drill + memory-correction drill; gates 1,3,4,6,7,8 pass.
