# Branch Handoff Contract — Phase 3

**Status:** `READY_FOR_REVIEW`. A handoff must identify all nine fields — no informal cross-branch moves.

```ts
const Handoff = z.object({ id: z.string().uuid(),
  from: z.object({ branch: z.string(), os: z.string() }),
  to: z.object({ branch: z.string(), os: z.string() }),
  purpose: z.string(), dataScope: z.string(), authorityScope: z.string(),
  timing: z.string(), failure: z.string(), receipt: z.string(), reversal: z.string() });
```

Standard handoffs: care→legal/support→settlement · merchant-dispute→MiResolve→MiJustice-escalation · venture→market→settlement→activation · credential→work→permission→appeal. Each has a registered data contract + authority scope + failure/reversal path (Phase 7 journeys instantiate these).
