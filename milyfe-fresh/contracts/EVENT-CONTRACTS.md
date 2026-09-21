# Event Contracts — Phase 3

**Status:** `READY_FOR_REVIEW`. Laws: versioned, privacy-aware, idempotent, replay-safe, emitted only after authoritative state commits.

```ts
const MiEvent = z.object({
  id: z.string().uuid(), family: z.string(), name: z.string(), version: z.string(), // "money.credited/1"
  at: z.string().datetime(), actor: MiIdRef, cell: z.string(), entity: z.string(),
  privacy: z.enum(["public","place","circle","private","sealed"]),
  payload: z.record(z.unknown()), causationId: z.string().uuid().optional(),
  receipt: z.string(), // receipt id — every consequential event carries one
});
```

Rules: consumers dedupe on `id`; handlers must be pure replays (same event twice = same state); `sealed` events carry refs + access log, never content; `private` events encrypted to grantees; ordering per entity via sequence numbers; retention per MiData schedules; bridge/federation events re-signed at boundaries. Families: see `../trunk/TRUNK-MAPS.md` §4 + branch families (`gov.*`, `legal.*`, `resolve.*`, `justice.*`, `care.*`, `health.*`, `place.*`, `edu.*`, `forge.*`, `market.*`, `money.*`, `work.*`).
