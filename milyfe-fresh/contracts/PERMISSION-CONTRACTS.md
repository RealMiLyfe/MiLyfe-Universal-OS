# Permission Contracts (MiScope) — Phase 3

**Status:** `READY_FOR_REVIEW`. Relationship, permission, consent graph. Purpose-bound, expiring, previewable, instantly revocable.

```ts
const MiScopeGrant = z.object({
  id: z.string().uuid(), issuer: MiIdRef, subject: MiIdRef, target: z.string(),
  purpose: z.string(), scope: z.array(z.string()), duration: z.string(), // ISO; "once" allowed
  roles: z.array(z.enum(["household","child","shop","recovery","teacher","keeper","mediator","auditor","helper","temporary"])),
  youthAssent: z.boolean().optional(), guardianPermission: z.string().optional(), // receipt id
  emergency: z.boolean().default(false), delegable: z.boolean().default(false), hopsLeft: z.number().max(3).default(0),
  approval: z.string(), // receipt id
});
```

Rules: anything not granted remains unavailable; youth flows need assent + guardian permission; emergency exceptions narrow + logged + reviewed; delegation ≤3 hops, cycle-detected, instantly revocable; every share flow shows "what can this person see?" preview; expired grants deny (fail-closed); enforcement points in Kernel + MiData + MiAgent + MiDevice.
