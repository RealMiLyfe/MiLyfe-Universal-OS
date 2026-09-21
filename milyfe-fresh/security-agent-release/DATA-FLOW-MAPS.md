# Data-Flow Maps — Phase 9

**Status:** `READY_FOR_REVIEW`.

## F1 — Join flow
Device (MiBoot, encrypted) → proofs → MiID (refs) → MiData spaces → receipts. Trust boundary: device vault ↔ trunk services (TLS + signed). PII stays device-side except consented proofs.

## F2 — Payment (online)
Pocket → MiScope check → human signature → MiMoney posting (balanced, no-negative) → receipt → payee notice. Ledger sees refs+amounts; memos encrypted to parties.

## F3 — Payment (offline pocket/card)
Signed payload (device-key sequence, caps, expiry) → NFC/BLE/QR → recipient store → DTN carry → MiMoney settlement checks → settled/rejected + receipts. Double-spend checked at settlement; conflicts human-queued.

## F4 — Vote
Sealed ballot (device) → carry/submit → tally (ZK-aggregate, content never exposed) → public aggregate ledger + content-free cast receipt.

## F5 — Health slice share
Private store → slice grant (consent, expiry) → clinician view (granted slice only) → access logged → revoke instant. Biometrics never leave private nerve.

## F6 — Support case (MiHandoff)
Need (minimal) → matcher (urgency/role/language/place/availability/conflicts) → human helper (no full-profile access) → case refs → resolution + receipt.

## F7 — Agent invocation
Lease check → sandboxed MCP tool → scoped data via grants → audit log → budget decrement. No lease = no call.

## Cross-cutting
Private nerve XChaCha20 (only you); public nerve OHTTP blind relay + BBS+ selective disclosure (ZK, no identity). Sealed = refs + access log, never content in transit to unauthorized parties.
