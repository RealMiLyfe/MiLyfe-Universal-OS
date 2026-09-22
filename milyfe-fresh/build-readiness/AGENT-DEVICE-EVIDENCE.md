# Agent + Device Permission Evidence

**Tests:** `tests/integration/agent-device.test.ts`, `tests/integration/regression.test.ts`, branch suites. All green.

## Agent controls (tested)

- 13 lifestyle high-impact actions agent-blocked (`AGENT_FORBIDDEN_ACTIONS`).
- 15 finance high-impact actions agent-blocked (`FINANCE_FORBIDDEN`).
- Total: 28 actions, each tested agent-blocked + human-passing.
- Skill registry refuses forbidden capabilities (`SKILL_FORBIDDEN_SCOPE`).
- Leases: purpose-bound + expiring; forbidden scopes refused; revoke ends validity; expiry ends validity.
- Helper chorus capped at 5% (`chorusCapOk`).
- Lease forbidden scopes include: money.move-alone, child.gate-change, compact.change, kill-switch, identity.create-without-human, actuation.ungated.

## Device controls (tested)

- Registry under MiID: register once, revoke tombstones (never vanishes).
- Presence sessions tombstone to `offline` on end-all (pinned R2).
- Work contributions require active-device attestation; revoked/unknown devices rejected (`UNVERIFIED_DEVICE`).
- Vault keys never leave device (design; device-key flows untested on hardware — see gate 1).

## Gaps (honest)

- No on-hardware key test. No biometric/PIN policy test. No stolen-device field drill (see pilot ops).
