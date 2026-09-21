# Export / Deletion Contract — Phase 3

**Status:** `READY_FOR_REVIEW`. Export always works, even during dispute.

- **Export:** one-tap full export (identity card, data spaces, pocket/history, standing VC, receipts, settings) in portable formats (JSON + printable + translatable); completes async with progress + receipt; works offline for on-device data; no account standing/age gates.
- **Deletion:** request → scope confirmation (what goes, what law keeps) → narrow legal-hold check → verified deletion + receipt; shared refs tombstoned; sealed items follow stricter rule; youth deletion via grown-up + best-interest review.
- **Leave:** export → close → optional memory page; profile closes, existence tombstone preserved, history portable (standing VC with cooling period on import elsewhere).

```ts
const ExportJob = z.object({ id: z.string().uuid(), subject: MiIdRef, scope: z.array(z.string()),
  format: z.array(z.string()), status: z.enum(["queued","running","ready","expired"]), receipt: z.string() });
const DeletionJob = z.object({ id: z.string().uuid(), subject: MiIdRef, scope: z.array(z.string()),
  holds: z.array(z.string()), status: z.enum(["review","approved","executed","verified"]), receipt: z.string() });
```
