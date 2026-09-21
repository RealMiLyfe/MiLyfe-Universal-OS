# Receipt Contracts (MiReceipt) — Phase 3

**Status:** `READY_FOR_REVIEW`. One receipt model everywhere. Portable, printable, translatable, cryptographically verifiable.

```ts
const MiReceipt = z.object({
  id: z.string().uuid(), at: z.string().datetime(),
  actor: MiIdRef, branch: z.enum(["trunk","governance","lifestyle","finance"]),
  os: z.string(), purpose: z.string(), capability: z.string(),
  approval: z.object({ by: z.string(), role: z.string(), scope: z.string(),
    reason: z.string(), evidence: z.string().optional(), expires: z.string().datetime().optional() }),
  impact: z.object({ data: z.string().optional(), value: z.string().optional(), other: z.string().optional() }),
  status: z.enum(["proposed","approved","executed","settled","rejected","reversed","expired","corrected"]),
  correction: z.object({ path: z.string(), route: z.string(), window: z.string().optional() }),
  explains: z.string(), // 6th-grade plain words: what happened / did not / who sees it / which policy / undo? / expiry / appeal
  signature: z.string(), // MiSeal
});
```

Rules: no consequential action without a receipt; receipts reference policy version applied; sealed content referenced by id only; member can tap any receipt → full chain (action → approval → policy → appeal). See trunk receipt map (`../trunk/TRUNK-MAPS.md` §5) for the full registry.
