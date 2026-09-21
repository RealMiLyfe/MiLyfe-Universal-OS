# MiPsyche Continuity Contract — Phase 3

**Status:** `READY_FOR_REVIEW`.

```ts
const PsycheChange = z.object({ id: z.string().uuid(), instance: MiIdRef,
  kind: z.enum(["model","memory","values","personality","goals","embodiment"]),
  summary: z.string(), risk: z.string(), continuity: z.string(),
  decision: z.enum(["rollback","branch","accept"]), approval: z.string(), receipt: z.string() });
const Merge = z.object({ id: z.string().uuid(), sources: z.array(MiIdRef),
  conflictReview: z.string(), memoryRules: z.string(), identityDecision: z.string(),
  approval: z.string(), receipt: z.string() });
```

Rules: material change = change record + risk + continuity review + decision; memory provenance tags mandatory (direct/reported/inference/reconstruction/uncertain/disputed); no silent rewrites; fork = new identity; retirement record fields mandatory (who/why/preserved/deleted/notified/restorable/successor/obligations).
