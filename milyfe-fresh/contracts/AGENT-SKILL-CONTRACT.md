# Agent Skill Contract — Phase 3

**Status:** `READY_FOR_REVIEW`.

```ts
const Skill = z.object({ id: z.string(), version: z.string(), owner: z.string(),
  risk: z.enum(["ordinary","high-risk","regulated","financial"]),
  capabilities: z.array(z.string()), tools: z.array(z.string()), // MCP servers, WASM-sandboxed
  budget: z.object({ calls: z.number(), value: z.number().default(0) }),
  offlineRule: z.enum(["deny","queue","preauthorized"]),
  approval: z.string(), // ordinary: cell A; high-risk/regulated/financial: H (+MiLegal/MiMoney H)
  audit: z.enum(["full","summary"]) });
const Lease = z.object({ id: z.string().uuid(), agent: MiIdRef, skill: z.string(),
  goal: z.string(), scope: z.array(z.string()), expires: z.string().datetime(), receipt: z.string() });
```

Rules: execution E only within lease; forbidden lease scopes (money-alone, child-gate, compact change, kill-switch, identity-without-human-start, pot-spend-alone, ungated actuation); runaway detection freezes + alerts; chorus-cap ≤5% enforced at registry.
