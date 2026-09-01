# MiLyfe — Device-as-Node Architecture

## The Core Principle

> "The website acts as a routing layer. The people and their devices do the lifting."

MiLyfe is not designed to scale by buying more servers. It is designed to scale the way a community actually works: **by growing the number of people and devices participating.** Every new member brings a new node. The platform routes; the people compute, store, and serve.

This is not idealism — it is the technical architecture. Here is how it works.

---

## The Three Layers

```
┌────────────────────────────────────────────────────────────────┐
│  LAYER 1: Routing Layer  (milyfe.fun — Vercel edge)           │
│  Stateless Next.js app. Routes requests. Issues auth tokens.  │
│  Validates. Coordinates. Scales to zero when idle.            │
└────────────────────────┬───────────────────────────────────────┘
                         │
┌────────────────────────▼───────────────────────────────────────┐
│  LAYER 2: Data Layer  (Supabase / PostgreSQL)                 │
│  Source of truth: wallets, governance, identity, standing.    │
│  RLS enforced — users only access their own data.             │
│  Designed to migrate to self-hosted as the community grows.   │
└────────────────────────┬───────────────────────────────────────┘
                         │
┌────────────────────────▼───────────────────────────────────────┐
│  LAYER 3: Node Layer  (People's Devices)                      │
│  P2P mesh: neighbors share content, cache resources,          │
│  relay messages, and run local AI — no server required.       │
│  This layer grows automatically as people join.               │
└────────────────────────────────────────────────────────────────┘
```

---

## How the Node Layer Works

### 1. Service Worker (already in production)
Every device that visits `milyfe.fun` installs a **Progressive Web App service worker**. This immediately makes that device:
- A **cache node** — stores pages, assets, and data locally
- An **offline-capable endpoint** — works without internet after first load
- A **background sync agent** — queues actions when offline, syncs on reconnect

### 2. Local-First Data (next milestone)
Key user data (wallet, profile, notifications, messages) gets written locally first via **IndexedDB / SQLite WASM**, then synced to the Supabase source of truth. This means:
- The app works on 2G or no connection
- The device holds a copy — reducing DB load proportionally to user count
- Users own their data physically, not just in policy

### 3. P2P Mesh (Oath Principle 4: "Every device is a node")
Neighbors within range can communicate **without the internet** using:
- **WebRTC DataChannels** — direct browser-to-browser connections for messages and coordination
- **BLE/WiFi mesh** (via the MiLyfe mobile app) — device-to-device in areas with no connectivity
- **Content addressing** — community resources identified by hash, served by whoever has them

### 4. Local AI (Mi runs on-device)
The Mi AI assistant is designed to run **locally on the user's device** via:
- **WebLLM / WASM** — quantized models that run in the browser
- **On-device Ollama** (for users who install it) — full model, no API key
- The Vercel routing layer calls a remote LLM only as fallback

This means Mi scales with the community, not with API bills.

### 5. Packaging (the distribution strategy)
Rather than depending on users to visit a website, MiLyfe is distributed as:
- **Progressive Web App (PWA)** — installable from any browser, runs like a native app
- **Android/iOS app** — via the `milyfe-app` Expo/React Native package
- **Desktop app** — via Electron wrapper (planned), for communities running local nodes
- **Bootable image** — for community centers and mesh-network hardware (planned)

The website (`milyfe.fun`) is the routing and sync layer — it keeps everyone coordinated. But once the app is installed, the device is a participant, not just a consumer.

---

## Scaling Model

| Traditional SaaS | MiLyfe |
|---|---|
| More users = more server costs | More users = more capacity |
| Centralized data = single point of failure | Distributed data = resilient by default |
| App depends on internet | App works offline |
| AI costs scale with usage | AI runs locally on device |
| Company owns the infrastructure | People own the infrastructure |

---

## Current State vs Roadmap

| Feature | Status | Notes |
|---|---|---|
| Service worker (offline cache) | ✅ Live | `/offline` route, Next.js PWA setup |
| PWA installable | ✅ Live | `manifest.json`, icons |
| Local-first data (IndexedDB) | 🔲 Next | Primary target for milestone 2 |
| WebRTC P2P messages | 🔲 Next | Replace server-routed messages |
| On-device Mi AI (WebLLM) | 🔲 Planned | Fallback to remote if device too weak |
| BLE/WiFi mesh | 🔲 Planned | Part of milyfe-app mobile |
| Bootable node image | 🔲 Future | For community hardware |

---

## Technical Implementation Notes

### Service Worker
Lives at `public/sw.js`. Intercepts fetch events. Caches:
- App shell (HTML, CSS, JS chunks) — permanent
- API responses — stale-while-revalidate with 5min TTL
- Images and assets — cache-first with version invalidation

### PWA Manifest
`public/manifest.json` — defines app name, icons, start URL, display mode. The routing layer (`milyfe.fun`) is the start URL; everything else is local after first install.

### Offline Action Queue
When a user is offline, actions (posting to forum, voting, sending $MLY) are stored in IndexedDB and synced in order when connectivity returns. The queue is visible to the user — no silent drops.

### Identity Without a Server
User identity is cryptographically signed via Supabase JWTs. The public key is derivable from the JWT. This means identity verification works offline for P2P interactions.

### $MLY Without a Server (local-first)
For peer-to-peer $MLY transfers between two devices in the same physical space (no internet):
1. Alice signs a transfer intent with her JWT private key
2. Bob's device verifies the signature against Alice's public key
3. Both devices record the transfer locally
4. The next time either device reconnects, the transfer syncs to Supabase

The Supabase source of truth handles conflicts via RLS-protected server-side reconciliation.

---

## The Bigger Picture

Every person who installs MiLyfe on their phone is not just a user — they are infrastructure. In Jacksonville, if 10,000 people install the app, there are 10,000 nodes. Blackout, network failure, government shutdown of the internet — the community still has a working civic layer because it lives on the people's devices.

This is what "the people own it by running it" means in practice. Not as a governance metaphor. As a literal technical truth.

**We the People. Anyone. Anywhere. From Day One.**
