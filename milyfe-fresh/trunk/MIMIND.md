# MiMind — Trunk Component 07

**Status:** `READY_FOR_REVIEW` (Phase 2).
**Sources:** Trunk design · Manual Part 5D (Word-to-Math, SLM pipeline, routing rings, constellation debate), Global Rails.

- **Purpose:** cognition only — understand, reason, draft, explain, translate. MiMind thinks; it never executes consequential actions itself (execution flows through Kernel approvals + MiAgent leases).
- **Users:** Mi + named helpers (reasoning substrate), members (answers, drafts, translations, formula cards), builders (inference APIs).
- **Owns:** model routing (Ring 0 on-device <500ms → Ring 1 local mesh → Ring 2 cloud escalation only via explicit Charter-Pin consent, output re-vetted locally); Word-to-Math parsing (natural language → Formula AST → human-readable Formula Card); constitutional screening hooks; constellation debate orchestration; confidence + source labeling.
- **Does not own:** execution authority; permissions; memory (MiPsyche); tools (MiAgent); any "auto" path for money/child-gate/compact/peace (Manual corrections: auto only for self-heal).
- **Entities + data:** `inference_requests` (prompt refs, ring used, consent) · `formula_cards` (AST, compliance verdict, human-readable text, signature state) · `debate_records`. Formula types: ALLOCATE/TRANSFER/SAVE/PROPOSE/MANDATE — all require explicit human signature; breeding formulas requires circle vote; critical formulas formally verified (Lean 4) where designated.
- **Permissions:** inference allowed within context + consent; Ring 2 needs explicit opt-in per escalation class; no inference on sealed spaces without human open ticket.
- **Contracts:** `mimind.infer/parse-formula/screen/debate` (Phase 3); every consequential output carries sources + confidence + "I don't know" when uncertain.
- **Receipts:** formula-card creation/screening/signing/execution-request receipted; Ring 2 escalations receipted with consent ref.
- **Offline:** Ring 0 runs fully offline (0.5–2B GGUF via WASM); degraded-model disclosure when offline models are smaller ("answering from on-device model, may know less").
- **Security:** prompt-injection defense (Phase 9); tool calls only via MiAgent leases; no direct ledger/device/identity mutation; output re-vetting for Ring 2.
- **Accessibility:** plain-language answers; translations labeled (machine vs human); reading-level adaptation; audio I/O.
- **Support:** "bad answer" feedback → correction loop; formula-card inspector explains every field.
- **Legal:** outputs are information, never legal/medical/professional advice; MiLegal/MiHealth rails enforced (no loosening).
- **Metrics:** ring mix, latency, consent rates, screening blocks, signature conversion, correction rates.
- **Failure recovery:** inference fallback Ring 0→1→(consented)2; failed screenings explain + route to human; no silent downgrade of safety.
- **Export:** member's formula cards + inference history exportable.
- **Removal:** cached inferences purged per retention; personal LoRA deleted on request.
- **Fork behavior:** models/configs versioned; forks pin versions + lineage; no cross-fork learning without consent (Chiasm handshake rules).
- **Activation gate:** parse→screen→sign→execute-request drill incl. offline Ring-0-only mode; gates 1,2,3,4,6,7,8 pass.
