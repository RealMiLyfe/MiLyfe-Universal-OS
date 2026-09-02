# MiLyfe — Complete Build Design

> Master synthesis of the full architecture. Companion docs:
> - `01-V1-RELEASE-CUTLINE.md` — what ships in v1, file-by-file decoupling
> - `02-DEVICE-CONTRIBUTION-SPEC.md` — the missing device-reward layer
> - `03-STORAGE-AND-SECURITY.md` — local + network persistence and the security model
> - `04-UX-DESIGN.md` — how the architecture is made *felt* in the interface

---

## 0. What we are building (one sentence)

A **downloadable, self-hostable, local-first, client-encrypted civic platform** that gives real
services to people the system forgot — where every action is provable, private data cannot be read
by the server, and the whole thing works with or without a signal — built as **one repeating unit**
that starts at the device, scales to a community instance, and later federates into a mesh.

The private **Hyperbolic Time Chamber** (the campaign war room) is **not** part of this product.
It stays private. Nothing in the public download depends on it.

---

## 1. The Fractal — the one pattern the system is made of

Everything is the same unit, repeated at three scales:

> **Local-first data → wrapped in a signed MiAction → gated by MiScope → proven by a MiReceipt → then synced.**

| Scale | What the unit becomes | Status |
|---|---|---|
| **Device (atom)** | IndexedDB + client encryption + outbox + sync | **Built** |
| **Instance (molecule)** | Postgres + RLS + audit log + community governance | **Mostly built** |
| **Federation (organism)** | instance-to-instance sync + portable standing + network governance | Design-only |

Build the atom once; the molecule and organism are the same shape zoomed out. This is why the v1
device work is never throwaway — it *is* the fractal.

---

## 2. Ground truth — real code vs. design

### Real, working code (verified in `src/`)
- **Coordination spine:** `MiAction` (envelope, state machine, Zod schema), `MiScope` (permissions
  on RLS, OpenFGA-ready), `MiReceipt`.
- **Client-side encryption:** AES-256-GCM + PBKDF2, tested; server holds ciphertext only.
- **Local-first storage:** Dexie/IndexedDB (`milyfe-offline`), outbox, sync engine, offline hooks,
  service worker, PWA install prompt.
- **Security posture:** RLS on 48 tables, service-role key server-only, Zod validation, rate
  limiting, append-only audit log, CSRF, `/api/health`, 55 tests.
- **API routes:** auth, cron, health, justice, learn, mi, notifications, safety, search, street, wallet.
- **UI shell:** responsive sidebar / bottom-nav, Pocket / Learn / Street / Connect / Voice vocabulary,
  offline indicator, data cacher, Mi bubble, command search (Meilisearch **with Supabase fallback**).
- **~30 platform routes** exist (wallet, learn, street, governance, safety, justice, mi, standing,
  treasury, rewards, contributions, bounties, and more).

### Design-only (spec'd, no code)
- OS 1 sovereign infra (K3s, self-hosted Postgres, MinIO, OpenBao)
- OS 3's 46 self-hosted services (lazy-loaded, stage-gated)
- OS 4 mesh (MiMesh, MiDTN, MiTURN, MiESP hardware)
- OS 5 ring routing (fallback chain exists in code; ring infra does not)
- OS 6 chain / on-chain $MLY
- Federation protocol, MiNation
- **Device-contribution rewards + auto-provisioning** — the one idea with no unified spec (now written: `02-...`)
- CRDT multi-device merge (code currently uses first/last-write-wins)

---

## 3. The layered architecture (the OS stack)

| Layer | Name | Role | v1 reality |
|---|---|---|---|
| **OS 1** | Infrastructure | Where services run | Cloud Supabase + Vercel; self-hosted later |
| **OS 2** | Coordination | MiAction / MiScope / MiReceipt | **Built — the crown jewel** |
| **OS 3** | Internet Services | 46 SaaS replacements, shown only as tabs | The civic app itself; services later |
| **OS 4** | Communication / Mesh | 15 transports, online → LoRa → QR | Design-only (v2/v3) |
| **OS 5** | AI | Ring routing + 25 helpers + hardcoded Rails | Fallback chain built; rings later |
| **OS 6** | Economy / Chain | $MLY | SQL ledger v1; chain gated (1,000 members + 180-day testnet) |

Design principle for OS 3: **members never see engine names.** They see Pocket, Learn, Street, Voice.
Services are lazy-loaded and stage-gated (Seed → Sprout → Root → Trunk), so a small community runs
~7 containers, not 46.

---

## 4. Storage — local + network (the hard requirement)

Three tiers (full detail in `03-STORAGE-AND-SECURITY.md`):

1. **Tier 1 — Local hardware:** Dexie/IndexedDB. Critical data cached, outbox queues actions. Works
   with zero signal. **Built.**
2. **Tier 2 — Network:** Postgres (Supabase now, self-hosted later) + MinIO for blobs. Authoritative
   community store. **App-side built.**
3. **Tier 3 — Encrypted personal vault:** client-encrypted, portable, unreadable by server. **Crypto
   built; full vault partial.**

Write path already coded: **write local → queue → replay on reconnect.** Honest gap: **CRDT** for
true multi-device offline merge (v2, not a v1 blocker).

---

## 5. Security — woven, not bolted on

The same four controls repeat at every scale:

- **Identity:** device passphrase → instance auth → federation DIDs (Ed25519, later)
- **Authorization:** MiScope everywhere; RLS is the real gate today; OpenFGA-ready
- **Confidentiality:** client-side AES-256-GCM for sensitive data; service-role keys never shipped to
  the browser; least-visibility defaults
- **Integrity:** signed MiActions + append-only audit log + MiReceipts

Guarantees enforced as protocol rules, not settings: a server compromise cannot read the vault, a
browser cannot self-escalate, records cannot be silently altered, child data never federates, AI
cannot spend without human confirmation.

---

## 6. Build phases

### v1 — "The Sovereign Single Instance"
Ship the atom + molecule. Surface the invisible strengths, cut the cord to the Chamber, ship as a
download. **Full detail in `01-V1-RELEASE-CUTLINE.md`.**

### v2 — "Local-First Hardened + Federated Islands"
CRDT / Automerge multi-device merge; vault key recovery (2-of-3); self-hosted infra (OS 1);
federation protocol + ActivityPub; E2EE messaging beyond the safety journal.

### v3 — "The Mesh + The Reward Economy"
OS 4 mesh (MiMesh / MiDTN / MiTURN, then MiESP/MiKit hardware); the device-contribution reward engine
(`02-...`); on-chain $MLY once gates are met; MiNation multi-city federation.

---

## 7. Dependency order (why layers can't be skipped)

Build bottom-up or you rework:

1. Local-first CRDT core →
2. Offline / conflict engine (MiWalk) →
3. E2EE messaging →
4. Federation protocol →
5. Mesh (MiMesh / MiDTN) →
6. Hardware mesh (MiESP / MiKit)

Federation before local-first, or mesh before conflict resolution, produces throwaway work. This
ordering is the single most important thing the bounty P-numbering does not capture.

---

## 8. The through-line

The value already exists (services for the forgotten). The foundation already exists (local-first +
encryption + coordination + receipts, in real code). **v1 is not a build-from-scratch — it is
surfacing what is invisible, cutting the cord to the private Chamber, and shipping it as a download.**
Everything deferred is a *layer on top of the same fractal*, never a rewrite.
