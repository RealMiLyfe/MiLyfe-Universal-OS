# Access & Secret Policy — Phase 9

**Status:** `READY_FOR_REVIEW`.

- **Least privilege + scoped roles:** every human/operator/agent/device holds minimum scope with expiry; high-impact needs H + dual control (treasury, actuation, quarantine-release affecting money/evidence).
- **Secrets:** MiKey custody (2-of-3 Shamir social recovery for members; hardware-backed where available); service secrets in managed store, never in repos/chats (secret-scan in CI); rotation scheduled (cron) + emergency rotation without lockout.
- **Break-glass:** member-data access by ops only via break-glass (logged, time-boxed, post-reviewed); abuse = incident + due process.
- **Credentials:** passkeys/WebAuthn primary; recovery codes + social recovery backup; no passwords stored centrally; no biometrics without consent.
- **Vault law:** vault keys never leave device; Shield handles ciphertext only outside vault; cold-twin rotation preserves access.
- **Reviews:** access recertification per season;offboarding/de-role revocation same-day; audit evidence retained per schedule.
