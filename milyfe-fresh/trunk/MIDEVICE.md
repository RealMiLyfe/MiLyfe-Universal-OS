# MiDevice — Trunk Component 09

**Status:** `READY_FOR_REVIEW` (Phase 2).
**Sources:** Trunk design · Identity (device ≠ person) · Manual Oath 4 (every device is a node), Hybrid Node, MiESP, actuation gates, MiShared.

- **Purpose:** device participation — every device is a node: compute, relay, sensing, actuation within leases. Members earn for contribution (esp. grid failures — 10x multiplier per Manual), never coerced.
- **Users:** members (phones, home servers, ESP32 density nodes), places (radios on roofs, sensors), shops (tills, kiosks).
- **Owns:** device registry (MiID-linked, distinct from person); capability profiles (compute/relay/sense/actuate); workload leases (job, scope, budget, expiry); contribution metering; actuation gates (two-person gate; no valves/breakers/signals without human except pre-registered 1-hour life-safety playbook); kiosk/shared-device modes.
- **Does not own:** person identity, money issuance (contribution value settled by MiMoney under approved rules), clinical/utility authority.
- **Entities + data:** `devices` · `workload_leases` · `contributions` (metered, verifiable) · `actuation_gates`. Device approval: ordinary E; high-risk H; execution E only in lease.
- **Permissions:** owner consent per workload class; place devices follow place policy; actuation always gated; biometrics never without consent.
- **Contracts:** `midevice.register/lease/meter/actuate/retire` + device workload contract (Phase 3).
- **Receipts:** leases, contributions, payouts-claims, actuations, retirements — receipted.
- **Offline:** devices operate автономно on cached leases; metering signed on-device (store-carry-forward); sync settles later; mesh relay (MiDTN) across lawful transports.
- **Security:** hardware-backed keys (StrongBox/Secure Enclave/TPM); attestation where available; stolen-device panic freeze; no pirate cellular; radio lawful-subset only.
- **Accessibility:** contribution understandable ("your node earned X for Y"); one-tap pause contribution; low-end device support (ESP32-class, feature phones via pSIM path).
- **Support:** "my device is doing something odd" → lease inspector + revoke + human help; node health dashboards (MiNOC community-visible).
- **Legal:** spectrum/air/drone/radio law compliance; licensed-radio profiles; no unauthorized actuation; AIS receive-only; OpenPilot/Autoware not road-legal claims.
- **Metrics:** node counts/coverage, contribution volume, payout accuracy, lease violations, offline-sync lag.
- **Failure recovery:** lease expiry halts workloads; failed metering reconciles on next sync; bricked-node recovery via owner + twin snapshots.
- **Export:** device + contribution history exportable.
- **Removal:** retire wipes keys, preserves contribution receipts; stolen-device remote freeze + wipe-where-possible.
- **Fork behavior:** devices re-home to one cell at a time; cross-cell relay needs explicit bridge; no double-counted contributions.
- **Activation gate:** register→lease→contribute→settle→retire drill incl. offline metering; gates 1,2,4,5,6,7,8 pass.
