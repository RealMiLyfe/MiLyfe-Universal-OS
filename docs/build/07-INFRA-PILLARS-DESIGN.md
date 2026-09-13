# Infrastructure Pillars — Design (offline sync, Mi AI fleet, mesh, E2EE)

Status: **DESIGN ONLY — no code written yet.** This is the reviewable plan for the
four core-infrastructure pillars that a codebase audit found to be either buggy,
inconsistent, or entirely unbuilt (despite marketing/legal copy implying they exist).

Ground rules that constrain every option below: **no payment processors, no ads, no
dark theme; $MLY-only; free/open/offline/accessible; guardrails on law/money/safety/
minors; RLS on every user table; AI never emits unverified legal citations.** Where a
pillar touches safety features, correctness and privacy win over shipping speed.

Verified starting facts (read from the code, not the docs):
- Offline stack is real: Dexie IndexedDB cache + outbox (`src/lib/offline/*`).
- Mi chat (`/api/mi/chat`) is real (streaming + tools) but only has a 2-tier AI
  fallback; the Justice fleet (`src/lib/justice/ai.ts`) has real 6-provider self-heal.
- Messaging (`src/lib/actions/messages.ts`) is real but **plaintext**, server-relayed,
  1:1, connection-gated. `messages.body` is a plain `TEXT` column (migration 001).
- **Mesh does not exist** — "mesh" appears only in landing/`/developers`/terms copy.
  No WebRTC/libp2p/Bluetooth/CRDT anywhere. Deps present: `dexie`, `web-push` only.

---

## Pillar 1 — Offline sync endpoint mismatch  (bug fix, small)

### The bug
`src/lib/offline/sync.ts` `getEndpointForAction()` maps outbox `action_type`s to REST
routes and replays them with `fetch(POST)`. But the app's mutations are **Next.js
server actions**, not REST routes. Cross-checking the map against routes that actually
exist under `src/app/api/**`:

| Outbox action_type   | Mapped endpoint                | Exists? |
|----------------------|--------------------------------|---------|
| `pocket.thank`       | `/api/wallet/transfer`         | ✅ yes  |
| `safety.leave_now`   | `/api/safety/leave-now`        | ✅ yes  |
| `safety.timer_arrived`| `/api/safety/timer/arrived`   | ✅ yes  |
| `voice.ballot`       | `/api/governance/vote`         | ❌ no (server action `castVote`) |
| `quest.claim`        | `/api/street/quest/claim`      | ❌ no (server action `claimQuest`) |
| `quest.submit`       | `/api/street/quest/submit`     | ❌ no (server action `submitQuestEvidence`) |
| `learn.progress`     | `/api/learn/progress`          | ❌ no (only `/api/learn/enroll` exists) |
| `message.send`       | `/api/messages/send`           | ❌ no (server action `sendMessage`) |
| `listing.create`     | `/api/street/listing/create`   | ❌ no (server action `createListing`) |

Result: anything a user does **offline** for votes, quests, learn progress, messages,
or listings is queued, replayed to a 404, marked failed, retried 5×, then stuck
forever. Silent data loss of user intent. Safety + wallet happen to work.

### Options
- **A. Add the six missing REST routes** — thin `route.ts` handlers that validate and
  call the existing server-action logic. Keeps the outbox's fetch-replay design intact.
- **B. Replace fetch-replay with a server-action dispatch map** — the sync engine
  imports the actions and calls them directly. No new routes, but server actions aren't
  callable from the sync engine's context the same way (they expect the RSC action
  boundary), and it couples the offline engine to every action module.
- **C. Hybrid** — one generic `/api/outbox/replay` endpoint that authenticates the
  user and dispatches by `action_type` to the right server action server-side.

### Recommendation: **Option C (single replay endpoint)** + fix the map.
Rationale: one authenticated, rate-limited, auditable surface for all replayed intent;
the sync engine keeps its simple fetch design; we don't scatter six near-duplicate
routes. The replay endpoint re-validates every payload (never trust queued input),
re-checks auth/ownership, and is **idempotent** (see below) because a queued action may
already have partially applied before the device dropped.

### Idempotency (must-have, not optional)
Add a client-generated `idempotency_key` (uuid) to each outbox item at enqueue time.
Replay sends it; the endpoint records processed keys (a small `processed_actions`
table, `unique(user_id, idempotency_key)`) and no-ops on replay of an already-applied
key. Prevents double-votes / double-spends / duplicate listings after flaky reconnects.
This is the one piece that makes offline replay safe for money + governance.

### Scope / touch list
- `src/lib/offline/db.ts` — add `idempotency_key` to `OutboxItem` (schema v2 migration
  in Dexie; bump `this.version(2)`).
- `src/lib/offline/outbox.ts` `enqueueAction` — generate + store the key.
- `src/lib/offline/sync.ts` — post to `/api/outbox/replay` with `{action_type, payload,
  idempotency_key}`; delete the stale `getEndpointForAction` map.
- New `src/app/api/outbox/replay/route.ts` — auth, rate-limit, idempotency check,
  dispatch table → server actions (`castVote`, `claimQuest`, `submitQuestEvidence`,
  `sendMessage`, `createListing`, learn-progress, `transferMLY`, safety).
- New migration `028_processed_actions.sql` (+ RLS: user sees only own rows).
- Tests: replay of each action_type; double-replay no-ops; unknown type rejected.

### Risk / effort
Low-medium. ~1 endpoint + 1 tiny migration + 1 Dexie version bump + tests. Fully
reversible. **Doable immediately after this design is approved.**

---

## Pillar 2 — Unify Mi onto the self-healing AI fleet  (medium)

### Today
`/api/mi/chat` picks a backend inline: Groq if `GROQ_API_KEY`, else `OPENAI_API_BASE_URL`,
else local Ollama, plus one optional `MI_FALLBACK_*`. If Groq errors mid-stream, there
is no failover to Cerebras/NVIDIA/Gemini/OpenRouter. Justice already has that resilience
in `justiceProviders()` + `justiceChat()`. Two different reliability tiers for the same
platform.

### Design
Extract the fleet pattern into a **shared provider module** both consumers use, without
disturbing Justice's separate keys/guardrails:
- New `src/lib/ai/fleet.ts` — generic `buildFleet(prefix, envKeyMap)` + `fleetChat()` +
  `fleetChatStream()` (streaming variant Mi needs). Justice keeps its `JUSTICE_AI_*`
  prefix and its citation/compliance guardrails; Mi gets a `MI_AI_*` prefix (falling
  back to the existing `GROQ_API_KEY`/`OPENAI_*`/Ollama so current envs keep working).
- `src/lib/justice/ai.ts` — refactor to call the shared fleet (behavior-preserving;
  Justice's compliance scan + verified-citation gate stay exactly where they are).
- `/api/mi/chat` — replace the inline backend pick + single fallback with
  `fleetChatStream()`, so Mi fails over across all configured providers, keyless-Ollama
  last. Tool-calling + rails + rate-limit + message persistence unchanged.

### Streaming failover detail
Failover across providers is only clean **before** the first byte streams. Once a stream
starts and dies mid-way, we can't silently swap providers without duplicating tokens.
Rule: try providers in order for the *initial* connection; if a provider returns non-OK
or fails to open the stream, advance to the next; once streaming has begun, a mid-stream
failure surfaces the existing "stream interrupted / try again" message. Document this so
it's a known, intentional boundary.

### Guardrail note
Mi and Justice stay **separate fleets with separate keys** — this pillar only shares the
*mechanism*, never the routing or the guardrails. Justice output still must pass
`complianceScan` + human-review gates; Mi still runs `checkInputRails`.

### Scope / touch list
- New `src/lib/ai/fleet.ts` (+ unit tests for ordering, key filtering, keyless-last,
  failover-before-first-byte).
- Refactor `src/lib/justice/ai.ts` to consume it (keep public API identical).
- Rewrite backend selection in `src/app/api/mi/chat/route.ts`.
- `.env.local.example` — document `MI_AI_*` names (values never committed).

### Risk / effort
Medium. Mostly a refactor of working code into a shared, tested module. Reversible.
**Doable after Pillar 1.**

---

## Pillar 3 — Mesh networking + offline-first sync  (large, NEW build)

This is the genuinely-missing pillar and the biggest. "Mesh" is advertised but there is
zero code. This section is a **design to agree on before any implementation** — the
transport, what syncs P2P, and the security model each need a decision.

### What "mesh" should mean for MiLyfe (proposed scope for v1)
Not a full internet replacement. A pragmatic **local-first + peer-assisted** layer:
1. **Local-first data** — the device is the source of truth for the user's own content;
   Supabase becomes a sync peer, not the only home. (Closes the "CRDT gap" noted in
   `03-STORAGE-AND-SECURITY.md`.)
2. **Peer sync when there's no server** — two nearby/reachable devices can exchange
   updates directly (e.g. resource lists, Know-Your-Rights content, a message) so the
   platform keeps working in a connectivity dead zone or during a shutdown.
3. **Store-and-forward** — a peer that later regains internet flushes queued updates
   upstream on behalf of peers it synced with.

### Transport options
- **A. WebRTC data channels** (via `simple-peer` or raw `RTCPeerConnection`).
  Browser-native, encrypted (DTLS) transport, works today in a PWA. **Needs a signaling
  server** for the initial handshake (a tiny WS service; can be the same host). True
  offline-with-no-infra only works if signaling was pre-exchanged (QR/local network).
- **B. libp2p (js-libp2p)** — real mesh stack (peer discovery, DHT, relays). Powerful
  but heavy for a browser PWA; larger bundle, more moving parts.
- **C. Bluetooth / Web Bluetooth / Nearby** — the only truly-no-internet path, but Web
  Bluetooth is narrow, permission-heavy, and not a general data-sync transport. Realistic
  only inside a future native app (ties into the stubbed native-app track).

### CRDT layer (the sync correctness core)
Peer sync without conflict resolution corrupts data. Use a CRDT:
- **Yjs** (`yjs` + `y-indexeddb` + a custom provider over the chosen transport) — mature,
  compact, great for text/state; pairs naturally with the existing Dexie/IndexedDB layer.
- **Automerge** — richer document model, heavier.
Recommendation: **Yjs**, syncing a bounded set of document types first.

### What syncs P2P in v1 (bounded, safety-aware)
- ✅ Public/community read data: Know-Your-Rights content, community resource lists,
  cached constitution content — high value offline, low risk.
- ✅ A user's own queued outbox intent (store-and-forward upstream).
- ⚠️ 1:1 messages — only **after** Pillar 4 (E2EE); never sync plaintext over peers.
- ❌ Never P2P: wallet/$MLY balances (money stays server-authoritative via atomic RPC —
  hard rule), standing, votes (governance integrity), anything in `safety_*` (a peer
  must never see another user's safety actions/contacts/journal).

### Security model (must decide before code)
- Every device gets a keypair; peers authenticate by signed challenge tied to the user's
  account (bind mesh identity to Supabase identity so a peer can't impersonate).
- All peer payloads signed + (for anything user-private) encrypted with Pillar 4 keys.
- Treat every inbound peer update as **untrusted**: validate schema, verify signature,
  enforce the "what syncs" allowlist server-side too on upstream flush.
- Rate/size limits on peer channels; no code/agent instructions ever executed from peer
  data.

### Recommendation (phased)
- **Phase 3a**: Yjs + `y-indexeddb` local-first for **public read content only**
  (resources, KYR). No peers yet — just makes content robust offline and sets the CRDT
  foundation. Low risk, high user value.
- **Phase 3b**: WebRTC (Option A) + a minimal signaling service; peer sync of the
  Phase-3a public content between devices; store-and-forward of outbox intent.
- **Phase 3c** (later, likely native-app): Bluetooth/Nearby for true no-internet.
Each phase is its own design + review checkpoint. **No implementation until 3a is signed
off.** New deps (`yjs`, `y-indexeddb`, `simple-peer`) will be pinned and flagged.

### Risk / effort
High. New transport + CRDT + signaling infra + a security model touching safety. Staged
so each phase is shippable and reversible on its own.

---

## Pillar 4 — End-to-end encrypted messaging  (medium-large, security-critical)

### Today
`messages.body` is plaintext `TEXT`; the server (and anyone with DB access) can read all
DMs. Privacy copy implies encryption. For a platform used by people in abuse/legal/ICE
situations, this is a real exposure — and it gates safe P2P messaging in Pillar 3.

### Options
- **A. libsignal (Signal protocol)** — gold standard: forward secrecy, deniability,
  async prekeys. Heaviest to implement correctly in a web/PWA; key management + multi-
  device are hard.
- **B. MLS (Messaging Layer Security)** — modern, group-friendly standard; libraries are
  young in JS.
- **C. Pragmatic libsodium (`tweetnacl`/`libsodium-wrappers`) sealed-box / X25519+XSalsa20**
  — per-user keypair, encrypt to recipient's public key. Simpler, well-understood, no
  forward secrecy by default (can add a ratchet later). Good "real E2EE now" step.

### Recommendation: **Option C first, designed so a ratchet (→A) can be added later.**
Rationale: gets true E2EE (server stores only ciphertext) with a small, auditable
surface, without betting the safety of at-risk users on a from-scratch Signal port.
Revisit forward secrecy as a follow-up once the key/identity plumbing is proven.

### Design sketch
- **Keys**: each device generates an X25519 keypair. Public key published to a new
  `user_keys` table (server stores public keys only). Private key stored in the browser
  (IndexedDB, non-extractable WebCrypto where possible); export/backup flow needed
  (ties to the "key recovery" gap in `03-STORAGE-AND-SECURITY.md`).
- **Send**: client encrypts to the recipient's public key; server stores ciphertext +
  nonce in `messages` (add `ciphertext`, `nonce`, `sender_pubkey`, `scheme` columns;
  keep `body` nullable for a transition, then drop plaintext).
- **Read**: recipient decrypts client-side. Server never sees plaintext.
- **Multi-device / recovery**: v1 = one device key + an explicit encrypted backup the
  user can restore with a passphrase. Full multi-device is a follow-up.
- **Metadata honesty**: this hides message *content*, not *who-talks-to-whom* or timing.
  Say so plainly in the privacy copy — do not overclaim (the current copy already
  overclaims; fixing the copy is part of this pillar).

### Interaction with other pillars
- Pillar 1: the offline outbox `message.send` payload becomes ciphertext; replay stays
  the same (server just stores bytes).
- Pillar 3: only encrypted messages may ever traverse peers.
- Mi chat "messages" (which reuse the `messages` table as a scratch log) must be kept on
  a **separate path** so we don't accidentally encrypt/relay AI logs as user DMs — or
  moved to their own table. Decide during design.

### Scope / touch list (when approved)
- New dep: `libsodium-wrappers` (pinned).
- Migration: `user_keys` table (+RLS: public keys readable by connections, private never
  stored) and `messages` ciphertext columns.
- `src/lib/crypto/*` — key gen/store/backup, encrypt/decrypt.
- Rewrite `sendMessage` + the connect chat thread read path for ciphertext.
- Fix privacy/security copy to state exactly what is and isn't protected.

### Risk / effort
Medium-large, security-critical. Reversible at the schema level (transition columns).
**No implementation until this design is signed off** — a wrong key/recovery model is
worse than plaintext because it gives false confidence.

---

## Suggested sequence
1. **Pillar 1** (offline replay + idempotency) — closes real silent-data-loss bug. Small.
2. **Pillar 2** (Mi fleet unification) — resilience, mostly refactor. Medium.
3. **Pillar 4 Phase 1** (libsodium E2EE) — unlocks safe messaging + gates mesh DMs.
4. **Pillar 3** phased (3a local-first CRDT → 3b WebRTC peer sync → 3c Bluetooth).

Pillars 1 and 2 are code-ready now on approval. Pillars 3 and 4 each get their own
detailed design + review checkpoint before any code, per the security concerns above.

## Open decisions I need from you
- P1: OK with the single `/api/outbox/replay` endpoint + idempotency table (Option C)?
- P2: OK giving Mi its own `MI_AI_*` fleet keys (fallback to existing keys), separate
  from Justice?
- P3: transport preference — WebRTC-first (Option A) as I recommend, or do you want
  libp2p? And is v1 mesh scope "public content + store-and-forward" (my proposal) or
  something broader?
- P4: OK starting with pragmatic libsodium E2EE (no forward secrecy yet), or do you want
  full Signal/MLS from the start?
- P4: key **recovery** model — passphrase-encrypted backup acceptable for v1?
