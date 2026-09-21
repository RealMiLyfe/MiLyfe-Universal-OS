# API Contracts — Phase 3 (frozen surface, schemas illustrative until Phase 11 Zod)

**Status:** `READY_FOR_REVIEW`. All trunk/branch methods share one envelope, auth, pagination, error, idempotency model.

## Envelope

```ts
// Request
{ api: "milyfe/1", op: "midata.grant", idempotencyKey: "uuid", actor: MiIdRef,
  context: { cell, context, role }, params: {...}, signature?: "..." }
// Success
{ ok: true, idempotencyKey, receipt: MiReceipt, data: {...} }
// Error
{ ok: false, code: "SCOPE_DENIED | VALIDATION | CONFLICT | OFFLINE_QUEUED | ...",
  message: "6th-grade plain words", appeal: { route, receipt }, retryable: bool }
```

Rules: auth = passkey session + MiScope grant check per op; high-impact ops require embedded human signature (never auto); pagination cursor-based; `OFFLINE_QUEUED` returned by clients when outboxing (server never invents it); every mutating op returns a MiReceipt.

## Method registry (frozen names; params in domain contracts)

- Kernel: `kernel.issueAction/evaluateApproval/recordReceipt/forkCell/migrateContext`
- MiID: `miid.create/claim/verify/link/delegate/suspend/recover/migrate/fork/retire`
- MiName: `miname.claim/release/change/lookup/dispute`
- MiOnboard: `mionboard.start/resume/attest/select-context/complete`
- MiData: `midata.create-space/grant/revoke/read/write/provenance/retain/export/delete`
- MiPresence: `mipresence.set-state/session/checkin/timer/pulse-input`
- MiPsyche: `mipsyche.record/reflect/change-state/pause/restore/fork/retire`
- MiMind: `mimind.infer/parse-formula/screen/debate`
- MiAgent: `miagent.register/lease/invoke/audit/revoke`
- MiDevice: `midevice.register/lease/meter/actuate/retire`
- MiSecurity: `misecurity.authenticate/quarantine/release/attest/disclose`
- MiDev: `midev.register-contract/submit-build/publish/release/rollback`
- MiOps: `miops.check/run-cron/incident/backup/restore/status`
- MiCloud: `micloud.provision/quota/migrate/decommission`
- MiNet: `minet.send/fetch/relay/bridge`
- MiComm: `micomm.send/call/announce/notify/flag`
- MiScale: `miscale.stage/flag/quota/decide`
- Branches (Phases 4–6): `gov.*`, `legal.*`, `resolve.*`, `justice.*`, `care.*`, `health.*`, `place.*`, `edu.*`, `forge.*`, `market.*`, `money.*`, `work.*`

```ts
const ApiEnvelope = z.object({ api: z.literal("milyfe/1"), op: z.string(),
  idempotencyKey: z.string().uuid(), actor: MiIdRef, context: ContextRef,
  params: z.record(z.unknown()), signature: z.string().optional() });
```
