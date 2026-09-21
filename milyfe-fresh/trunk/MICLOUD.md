# MiCloud — Trunk Component 13

**Status:** `READY_FOR_REVIEW` (Phase 2).
**Sources:** Trunk design · Manual Part 5F (MiCloud services, $0 stack), self-hosting path, MiHaven/MiVault Deep.

- **Purpose:** community-owned infrastructure services (compute, data, integration, AI/media, identity/security layers) with a $0 start and a self-host exit. Cloud is a convenience, never a custody trap.
- **Users:** builders (services), places (local clouds), members (invisible — powers tabs underneath).
- **Owns:** service catalog (MiCompute/MiFlow/MiFleet/MiLaunch/MiHaven/MiDrive/MiVault-Deep/MiBeam/MiName/MiMesh/MiLink; MiBase SQL/Pulse/Flash/Lake/Find/Graph/Tick/Ledger/Refine/Query; MiGate/MiQueue/MiSignal/MiStream/MiLoom/MiPulse; MiForge-AI/MiMind-inf/MiVision/MiVoice/MiTongue/MiScribe/MiCast/MiRender); tenancy/quotas; portability tooling (export → self-host → federate).
- **Does not own:** member data (MiData), money ledger (MiMoney), governance, security verdicts.
- **Entities + data:** `services` (owner, SLO, portability score) · `tenancies` · `quotas` · `migrations`. Start: $0 tiers (Vercel/Supabase free → K3s self-hosted later); no vendor may become authority for Kernel/$MLY/governance/MiPsyche.
- **Permissions:** service provisioning scoped to cell/place; quota changes logged; member-data processing only under MiData grants.
- **Contracts:** `micloud.provision/quota/migrate/decommission` (Phase 3); every service ships portability + exit docs.
- **Receipts:** provisioning, quota changes, migrations, decommissions — receipted.
- **Offline:** local-first services degrade gracefully; edge nodes (MiFleet) serve mesh islands; sync on reconnect.
- **Security:** tenant isolation; encryption at rest/in transit; provider-access minimization; SBOM per service.
- **Accessibility:** N/A direct UI; cost/latency honesty in builder surfaces ("this call costs X, works offline? Y").
- **Support:** service status + migration help; "leave the cloud" guided path.
- **Legal:** data-residency options per jurisdiction; subprocessors disclosed; no lock-in clauses.
- **Metrics:** cost per member, portability scores, migration success, vendor-dependency index (must trend down).
- **Failure recovery:** provider outage → edge + mesh fallback; data restore from member-held + twin backups.
- **Export:** full tenancy export (data + config + history) always available.
- **Removal:** decommission leaves tombstone + disposition receipts; data returned or verifiably destroyed.
- **Fork behavior:** forks re-provision independently; shared services need explicit federation agreements.
- **Activation gate:** provision→migrate→decommission drill with zero member-data loss; gates 1,4,6,8 pass.
