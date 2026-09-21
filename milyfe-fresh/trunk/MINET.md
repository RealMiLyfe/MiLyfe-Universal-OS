# MiNet — Trunk Component 14

**Status:** `READY_FOR_REVIEW` (Phase 2).
**Sources:** Trunk design · Manual MiDTN/MiTURN/MiMesh/MiNetwork/MiConnect telecom path, wire protocols P2/P5/P8, MiQoS/MiSpectrum.

- **Purpose:** connectivity that works when the internet fails — mesh, delay-tolerant transport, NAT traversal, federation. Voice + life-safety first (MiQoS).
- **Users:** members (connectivity), places (coverage), devices (relay), builders (transports).
- **Owns:** transport portfolio (internet, BLE, Wi-Fi, LoRa/LoRaWAN lawful-subset, ESP-NOW); MiDTN store-carry-forward across lawful transports; MiTURN volunteer NAT cluster; mesh routing + density nodes (MiESP $5 class); federation links (Matrix/DID/VC portability); spectrum compliance (MiSpectrum RF optimizer inside legal power/duty-cycle).
- **Does not own:** message content (MiComm), money transport semantics (MiPay over MiDTN), surveillance.
- **Entities + data:** `links` (transport, peers, quality) · `dtn_bundles` (payload refs, custody, expiry) · `relays` · `federation_bridges`. Payloads encrypted; relays see routing refs, not content.
- **Permissions:** relay participation opt-in; federation bridges need cell A + H for high-impact; emergency traffic preemptible per life-safety playbook.
- **Contracts:** `minet.send/fetch/relay/bridge` (Phase 3); custody transfer receipted; replay-safe + idempotent.
- **Receipts:** bundle custody transfers, bridge agreements, coverage contributions — receipted.
- **Offline:** IS the offline layer — store-carry-forward by design; expiry + custody rules prevent limbo; conflicts to MiWalk.
- **Security:** encrypted transports; signatures OK on amateur radio, hidden meaning NOT (illegal); no pirate cellular; relay abuse → quarantine.
- **Accessibility:** coverage honesty ("mesh only — texts yes, calls maybe"); low-bandwidth modes; feature-phone/SMS fallbacks for critical flows.
- **Support:** "no connection" diagnostics in plain words; keeper tools for roof radios.
- **Legal:** spectrum/power/duty-cycle compliance; lawful-subset transports only; intercept/compliance per jurisdiction (Phase 8).
- **Metrics:** coverage maps, delivery latency/success by transport, relay contribution, bridge health.
- **Failure recovery:** transport failover; bundle re-routing; island-mode operation; partition healing via CRDT + custody logs.
- **Export:** member's routing/relay history exportable.
- **Removal:** decommissioned relays tombstoned; bridges closed with notice + in-flight drain.
- **Fork behavior:** networks partition cleanly; cross-fork relay needs explicit bridge + consent.
- **Activation gate:** internet-killed drill: message + $MLY offline payload + presence all traverse mesh/DTN; gates 1,2,6,7,8 pass.
