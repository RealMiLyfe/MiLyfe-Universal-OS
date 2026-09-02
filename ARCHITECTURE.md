# MiLyfe — Architecture

This document describes how the platform is built, why those choices were made, and how the three systems (the civic platform, the campaign site, and the operations infrastructure) fit together. It is written for developers, contributors, and anyone who wants to understand the technical proof behind the claims.

---

## Guiding principle

> "Don't trust a speech — read the code."

Every architectural decision is subordinate to openness, resilience, and the people owning the system. Public code. Public votes. If it isn't here, it isn't the proof.

---

## System overview

```
┌─────────────────────────────┐  ┌──────────────────────┐  ┌──────────────────────────┐
│  milyfe.fun                 │  │  mijaxx.fun           │  │  campaign-api.milyfe.fun │
│  Civic Platform             │  │  Mayor Campaign Site  │  │  War Room API            │
│  Next.js 16 + Supabase      │  │  Static HTML/CSS/JS   │  │  FastAPI + Python        │
│  Vercel (global edge)       │  │  Cloudflare Tunnel    │  │  Cloudflare Tunnel       │
└─────────────────────────────┘  └──────────────────────┘  └──────────────────────────┘
              │                              │                           │
              └──────────────────────────────┴───────────────┐          │
                                                              │          │
                                                   ┌──────────▼──────────▼──────┐
                                                   │  Supabase (PostgreSQL)      │
                                                   │  uwozuhmiahytjwfmudia       │
                                                   │  48 tables, 108 RLS policies│
                                                   └────────────────────────────┘
```

---

## 1. Civic Platform (`milyfe.fun`)

**Framework:** Next.js 16 (App Router) + React 19 + TypeScript  
**Hosting:** Vercel (global edge deployment)  
**Database/Auth:** Supabase (PostgreSQL + Row-Level Security + Supabase Auth)

### Routes (35 total)

| Route | Feature |
|---|---|
| `/` | Public landing page |
| `/login`, `/signup`, `/onboarding` | Auth + onboarding |
| `/home` | Personal dashboard |
| `/wallet` | `$MLY` pocket — balances, transactions |
| `/treasury` | Community treasury ($5.3B Jacksonville baseline) |
| `/rewards` | Reward claims, badges |
| `/street` | Marketplace, quests, surplus items |
| `/governance` | Proposals, voting |
| `/forum` | Community discussion |
| `/learn`, `/learn/[slug]/[module]` | Free education paths |
| `/health` | Health check-ins (self-only, private) |
| `/safety`, `/safety/journal` | Safety tools, encrypted journal |
| `/mi` | Mi AI assistant |
| `/news` | Community news feed |
| `/profile`, `/profile/[username]` | Profile, settings, language |
| `/standing` | Civic standing score |
| `/connections`, `/messages` | Social graph, messaging |
| `/wiki` | Community wiki |
| `/transparency` | Public governance record |
| `/voter-journey` | Voter registration guide |
| `/bounties` | Developer bounty board |
| `/offline` | Offline-first fallback page |

### Database

- **48 tables** covering profiles, wallets, transactions, governance, forum, learning, quests, marketplace, safety, health, news, connections, audit log, and more.
- **108 Row-Level Security policies** — access is enforced at the database, not just the application layer. User data is only accessible to the user and people they explicitly share with.
- **14 migrations** — schema is versioned, reproducible, and idempotent.
- **Client-side encryption** for the safety journal — the server stores only ciphertext. The private key never leaves the user's device.

### Security posture

- **Server-only privileged keys** — `SUPABASE_SERVICE_ROLE_KEY` is never exposed to the browser.
- **Zod validation** on all server actions — input is validated before touching the database.
- **DOMPurify sanitization** on all rich-text content — XSS is stopped at write time.
- **Auth middleware** — protects all platform routes; fails safe if misconfigured.
- **AGPL-3.0 license** — the code is public and any deployed fork must also be public.

---

## 2. Campaign Site (`mijaxx.fun`)

**Type:** Static HTML/CSS/JS (no framework dependency)  
**Served by:** nginx inside Docker, exposed via Cloudflare named tunnel  
**Pages:** 9 pages — homepage, about (founder story), platform, promise, blog, contact, get-involved, illuminate (accountability dashboard), get-milyfe landing

The mayor campaign site is intentionally lightweight. No build step, no framework, no vendor lock-in. It runs on one machine and survives outages because there's nothing to crash.

**Integration with the platform:**
- The "Join MiLyfe" / "Get MiLyfe" CTAs link to `milyfe.fun` and `get.milyfe.fun`.
- The petition form, volunteer intake, and live citizen counter call `campaign-api.milyfe.fun` (a stable named-tunnel endpoint, not an ephemeral URL).

---

## 3. Operations Infrastructure (Hyperbolic Time Chamber)

**Type:** Self-hosted Docker Compose stack  
**Location:** One machine (`milyfe-brain`) — i9-10900F, 64GB RAM  
**Tunnel:** Cloudflare named tunnel `milyfe-campaign` (persistent systemd service, lingering enabled)

### Stable public subdomains via the named tunnel

| Subdomain | Service | Port |
|---|---|---|
| `mijaxx.fun` | nginx (campaign site) | 8180 |
| `www.mijaxx.fun` | nginx (campaign site) | 8180 |
| `get.milyfe.fun` | nginx (Get MiLyfe landing) | 8180 |
| `campaign-api.milyfe.fun` | FastAPI campaign API | 8200 |
| `analytics.milyfe.fun` | Umami analytics | 3001 |

### Campaign API (`campaign-api.milyfe.fun`)

FastAPI service that bridges the mayor campaign and the civic platform:
- **`/platform/metrics`** — pulls live citizen count and treasury balance from the Supabase platform database.
- **`/intake/external`** — public form submissions from the campaign site (petition signatures, volunteer sign-ups).
- **`/intake/platform`** — webhook from the civic platform when a new citizen joins (auto-petition sign).
- All non-public endpoints are protected by an auth middleware allowlist.

### Other services in the stack

Mastodon (federated social), Ghost (blog/email), Mattermost (internal comms), n8n (automation), Listmonk (email campaigns), Uptime Kuma (monitoring), SearXNG (private search), and more — all self-hosted, all open source.

---

## 4. DNS architecture (milyfe.fun zone)

| Record | Target | Purpose |
|---|---|---|
| `milyfe.fun` (CNAME, DNS-only) | Vercel | Platform |
| `www.milyfe.fun` (CNAME, DNS-only) | Vercel | Platform www |
| `get.milyfe.fun` (CNAME, proxied) | Tunnel | Landing page |
| `campaign-api.milyfe.fun` (CNAME, proxied) | Tunnel | Campaign API |
| `analytics.milyfe.fun` (CNAME, proxied) | Tunnel | Analytics |
| Mail records (MX, SPF, DKIM, DMARC) | Hostinger | Email — DNS-only |

---

## 5. The $0 proof

The entire stack was built with $0 in outside capital. Every tool is free and open source. The machine it runs on was paid for by selling personal property. This is documented not as a boast but as proof of the argument: the barrier to civic infrastructure was never money — it was will.

Corporate-equivalent build cost: **~$3M+**  
Actual cost: **$0 + 11 years**

---

## Running it yourself

```bash
git clone https://github.com/RealMiLyfe/MiLyfe-Universal-OS
cd MiLyfe-Universal-OS
cp .env.local.example .env.local
# fill in your Supabase credentials
npm install
npm run dev
```

For the database: run the SQL in `scripts/new-project-setup.sql` in your Supabase SQL Editor (creates all tables, RLS, triggers, and seeds the treasury). See [CONTRIBUTING.md](CONTRIBUTING.md) for the full setup guide.

---

*Public code. Public votes. If it isn't here, it isn't the proof.*
