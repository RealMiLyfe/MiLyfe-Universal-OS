# Storage & Security — Design

> ⚠️ **Snapshot note:** Original design from an earlier session; the model holds.
> Counts ("48 tables, 108 policies") predate the later build (now 27 migrations,
> many more tables). CRDT/key-recovery gaps noted here are still accurate v2 items.
> Current state: `SESSION-RECAP.md` / `05-WHATS-LEFT.md`.

> How MiLyfe persists data locally **and** on the network, and how security is woven through every
> layer. Companion to `00-BUILD-DESIGN.md`. Hard requirement: everything must save on the user's own
> hardware **and** on the network.

---

## 1. The three-tier storage model

| Tier | Where | What it holds | Status |
|---|---|---|---|
| **Tier 1 — Local hardware** | Dexie / IndexedDB (`milyfe-offline`) | Cached profile, wallet, messages, resources, learn progress + the **outbox** of pending actions | **Built** |
| **Tier 2 — Network** | Postgres (Supabase now, self-hosted later) + MinIO for blobs | Authoritative community store: wallet ledger, governance, treasury, standing, listings | **App-side built** |
| **Tier 3 — Encrypted vault** | Client-encrypted rows (server holds ciphertext) | Safety journal today; personal vault, receipts, exports later | **Crypto built; full vault partial** |

The requirement "save locally in their hardware **and** on the network" is met by Tier 1 + Tier 2
together, joined by the sync engine.

---

## 2. The write path (already coded)

```
User action
   │
   ▼
Write to Tier 1 (IndexedDB) immediately    ← instant, works offline
   │
   ├── ONLINE  → call server action → Tier 2 (Postgres) → mark synced
   │
   └── OFFLINE → enqueue to outbox → (on reconnect) sync engine replays in order → Tier 2
```

- Every state-changing action is a **MiAction** carrying `offline` metadata (conflict rule, vector
  clock fields, device_id).
- The outbox tracks `pending → sending → synced | failed`, with retry on failure.
- The UI reflects this honestly ("Saved on your device / Synced") — see `04-UX-DESIGN.md`.

---

## 3. The honest gap: multi-device conflict (CRDT)

Today the code uses simple `first_write_wins` / `last_write_wins`. That is **correct and safe for v1**
where a user is effectively single-device-per-session. It is **not** sufficient for true concurrent
multi-device offline editing.

- **v1:** ship as-is. Single-writer semantics; last sync wins with receipts for auditability.
- **v2:** introduce **CRDT / Automerge** (bounty P12-01) + the MiWalk offline/conflict engine
  (P0-08) so concurrent offline edits merge deterministically without data loss. Safety-critical
  actions already force `human_review` conflict handling — that rule stays.

This is a **v2 item, not a v1 blocker.**

---

## 4. Security model — woven through every scale

The same four controls repeat at device, instance, and federation scale (the fractal):

### 4.1 Identity
- **Device:** passphrase-derived key for the encrypted vault (PBKDF2).
- **Instance:** Supabase Auth (sessions, revocation).
- **Federation (later):** instance DIDs / Ed25519 keys.

### 4.2 Authorization
- **MiScope** is the permission layer, designed as an interface over **Supabase RLS** today and
  swappable to **OpenFGA** relationship graphs later without changing callers.
- **RLS is the real gate** — enforced at the database on all 48 tables, 108 policies.
- Least-visibility defaults: voter status, private votes, and safety data default to **private**.

### 4.3 Confidentiality
- **Client-side AES-256-GCM + PBKDF2** for sensitive data (safety journal today). Salt + IV per entry,
  random each time. The **server stores only ciphertext and cannot decrypt.** Verified by tests.
- **Service-role keys are server-only** — the browser only ever receives keys safe to be public.
- **Audience picker** (`public / community / friends / private / custom`) on every shareable object,
  defaulting to the least-visible sensible option.

### 4.4 Integrity & accountability
- Every action is a **signed MiAction**.
- **Append-only audit log** on sensitive operations.
- **MiReceipts** make each action provable (what / when / who / reversible? / the rule that allowed it).

---

## 5. Threat model (what a compromise cannot do)

- **Server compromise cannot read the vault** — safety journal is client-encrypted; server holds
  ciphertext only.
- **Browser cannot self-escalate** — the service-role key is never shipped to the client.
- **Records cannot be silently altered** — append-only audit log + receipts.
- **Child data never federates** — enforced as a protocol rule, not a setting.
- **AI cannot spend without human confirmation** — a hardcoded Rail.

---

## 6. The key-recovery gap (must close before wide download)

A client-encrypted vault means a **forgotten passphrase = lost data**. For a public download this will
burn trust unless handled.

- **v1:** ship the vault with a clear, honest onboarding warning and an **optional recovery-contacts
  step** (see UX doc). Encourage but don't force.
- **v2:** build the full **2-of-3 social recovery** — the member picks three trusted people; any two
  can help reconstruct the vault key. The platform itself **cannot** recover it (that's the point).

---

## 7. Self-hosted secrets (later)

- **v1:** secrets live in environment config (`.env.local`), Supabase-managed keys.
- **v2 (OS 1):** self-hosted secret management via **OpenBao** for communities running their own
  infrastructure, so no secret depends on a third-party dashboard.

---

## 8. Storage & security checklist for v1

- [ ] Critical tables cached in IndexedDB; readable offline
- [ ] Outbox queues actions offline and replays in order on reconnect
- [ ] Safety journal encrypts client-side; DB row is ciphertext (test asserts this)
- [ ] Service-role key never reaches the client bundle
- [ ] RLS enforced on all tables; least-visibility defaults verified
- [ ] Every state-changing action emits an auditable receipt
- [ ] Vault onboarding warns about passphrase loss + offers recovery contacts
- [ ] Conflict rule for safety-critical actions forces human review
