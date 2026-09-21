# Data-Space Contracts — Phase 3

**Status:** `READY_FOR_REVIEW`. Branches exchange data ONLY through registered contracts.

```ts
const DataContract = z.object({ id: z.string().uuid(), subject: MiIdRef, owner: MiIdRef,
  steward: z.string(), purpose: z.string(), sensitivity: z.enum(["public","neighbors","household","private","sealed"]),
  retention: z.string(), recipients: z.array(z.string()), exportBehavior: z.string(),
  aiAccess: z.enum(["none","aggregate","consented"]), thirdParty: z.enum(["none","named"]),
  approval: z.string(), expires: z.string().datetime().optional() });
```

Rules: one contract per (purpose × recipient-set); cross-branch reads cite contract id; sealed spaces need human open ticket + access log; AI access defaults none; corrections propagate with provenance (MiSource); safe-when-stale behavior declared per dataset.
