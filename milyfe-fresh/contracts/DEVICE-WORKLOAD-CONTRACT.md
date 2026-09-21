# Device Workload Contract — Phase 3

**Status:** `READY_FOR_REVIEW`.

```ts
const WorkloadLease = z.object({ id: z.string().uuid(), device: MiIdRef, owner: MiIdRef,
  class: z.enum(["compute","relay","sense","actuate","kiosk"]),
  job: z.string(), scope: z.array(z.string()), budget: z.string(),
  expires: z.string().datetime(), metering: z.enum(["signed-device","witnessed","estimated-never-money"]),
  actuationGate: z.enum(["none","two-person","life-safety-playbook"]).default("none"),
  approval: z.string() }); // high-risk actuation: H
```

Rules: metering signed on-device (store-carry-forward); money-affecting metering never estimated; actuation always gated; owner one-tap pause; expiry halts workloads; contributions settle only via MiMoney approved rules.
