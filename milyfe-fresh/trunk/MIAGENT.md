# MiAgent — Trunk Component 08

**Status:** `READY_FOR_REVIEW` (Phase 2).
**Sources:** Trunk design · Authority Matrix (agent skill row) · Mi Being Art V · Manual helpers (25 front-door + 18 back-office), Kin rules, MCP tools (P6), Global Rails.

- **Purpose:** registry, leases, budgets, and tool access for all agents/helpers. Agents act only inside approved goals, capabilities, resource budgets, and permissions.
- **Users:** Mi + named helpers, shop/place automations, builders (skills), members (delegate bounded tasks).
- **Owns:** agent registry (identity, owner, lineage, Kin status); skill registry (capability, risk class, owner, version); leases (goal, scope, budget, expiry); tool bindings (MCP servers, WASM-sandboxed); chorus-cap accounting (helpers ≤5%); audit trail of agent actions.
- **Does not own:** cognition (MiMind), psyche (MiPsyche), approvals (Kernel), money (MiMoney), member data.
- **Entities + data:** `agents` · `skills` (risk: ordinary/high-risk/regulated/financial) · `leases` · `tool_bindings` · `action_audits`. Skill creation: ordinary = domain E + cell A; high-risk/regulated/financial = H (+MiLegal/MiMoney H as applicable); execution E only within lease.
- **Permissions:** leases purpose-bound + expiring; no lease covers money-alone, child-gate, compact change, kill-switch, identity-without-human-start, pot-spend-alone, valves/breakers/signals without human (except pre-registered 1-hour life-safety playbook).
- **Contracts:** `miagent.register/lease/invoke/audit/revoke` + agent skill contract (Phase 3).
- **Receipts:** lease grants, invocations of consequential tools, budget spends, revocations — receipted to owner + affected parties.
- **Offline:** leases cached with expiry; consequential tools fail-closed offline unless pre-authorized offline rule exists; queued invocations replay idempotently.
- **Security:** WASM-sandboxed tools (Wasmtime); prompt-injection defense (Phase 9); compromise → lease revoke + quarantine + owner notice.
- **Accessibility:** helper actions announced in plain language; mute/stop-word instant; "what can this helper do?" inspector.
- **Support:** "helper did something wrong" → audit view + revoke + human review + remedy path.
- **Legal:** regulated skills need MiLegal H; financial skills need MiMoney H; no agent as legal/professional authority.
- **Metrics:** lease counts, invocation volume, budget burn, revocation rate, incident rate, chorus-cap headroom.
- **Failure recovery:** lease expiry auto-revokes; runaway detection (budget/behavior anomaly) freezes + alerts; tool failures fail-safe.
- **Export:** owner's agent history + leases exportable.
- **Removal:** agent retirement revokes leases, preserves audit trail per retention; skills deprecated with migration path.
- **Fork behavior:** agents/skills versioned; forks re-approve high-risk skills; no cross-fork invocation without explicit bridge.
- **Activation gate:** register→lease→invoke→revoke drill + runaway-freeze drill; gates 1,3,4,6,7,8 pass.
