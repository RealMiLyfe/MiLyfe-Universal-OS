# Next-Session Prompt + Generic Build Spec

Two things in here:
1. A **paste-ready prompt** to continue this work in a new session.
2. A **generic build spec** (tech + components) so a *different* agent can build a
   generic version, configure what it can, and leave workspace-specific wiring to
   the agent working in this repo.

================================================================================
## 1. PROMPT — continue in a new session (paste this)
================================================================================

> You're continuing work on **MiLyfe** + **MiJustice**, a people-owned, free,
> open-source life OS. Repo: `milyfe-platform` (Next.js 16 / React 19 / Supabase /
> Tailwind), branch `feat/mijustice-phase1` (PR #13). Read
> `docs/build/SESSION-RECAP.md` and `docs/build/05-WHATS-LEFT.md` first — the full
> feature build is DONE (migrations through 027 applied to the live Supabase
> project, seeded, build green at 120 pages, 60 tests pass).
>
> **Absolute rules (never violate):** no payment processors ever (no Stripe/PayPal/
> any gateway — money is internal $MLY only), no ads ever, no dark theme, keep the
> light MiLyfe design (glass cards, teal `#00C1AE` / harbor `#1e3a6e` / gold `mly
> #FFC107`, Atkinson Hyperlegible, animate-fade-in), guardrails on anything touching
> law/money/safety/minors, commit + push after each working chunk, keep typecheck +
> build green.
>
> **What's left is ops + human gates, not features:** (A) merge PR #13; (B) register
> cron schedulers for `/api/cron/*` with `CRON_SECRET`; (C) deploy + domain;
> (D) MiJustice filing generation stays behind attorney sign-off; (E) onboard
> advisory board / partners / translators. Pick from `05-WHATS-LEFT.md` and confirm
> scope before large changes.
>
> Patterns to reuse: loose-typed Supabase clients (`trustDb`/`mediaDb`/`shopDb`/
> `socialDb`) for tables not in the core `Database` type; `rewardContribution()` for
> economy payouts; `CommentsThread` for comments on any object; `uploadFile()` for
> Storage; the Vibe Bar (`src/components/media/vibe-bar.tsx`) is the global player.

================================================================================
## 2. GENERIC BUILD SPEC — for another agent to build generically
================================================================================

Goal: build a **generic, configurable "community life OS + justice toolkit"**
platform. Build the generic skeleton and configure everything that is NOT
environment-specific. Leave the workspace-specific values (real keys, domain,
Supabase project, provider tokens) as clearly-marked placeholders — the agent in
the target workspace will wire those.

### Core tech stack (build with these)
- **Framework:** Next.js (App Router, latest) + React 19 + TypeScript.
- **Styling:** Tailwind CSS. Light theme only. Tokens: primary teal `#00C1AE`,
  deep blue "harbor" `#1e3a6e`, gold "mly" `#FFC107`. Font: Atkinson Hyperlegible
  (accessibility-first). Rounded-xl cards, glass gradients, `animate-fade-in`.
- **Backend/DB:** Supabase (Postgres + Auth + Storage + Realtime). Row-Level
  Security on every table. Migrations as ordered SQL files in `supabase/migrations`.
- **State:** Zustand (global store incl. a media-player slice).
- **Rate limiting:** Upstash Redis (with in-memory fallback).
- **Search:** Meilisearch (with Supabase text-search fallback).
- **AI:** provider-agnostic, OpenAI-compatible `/chat/completions`. Multi-provider
  self-healing failover chain (Groq, Cerebras, NVIDIA NIM, Gemini, OpenRouter,
  local Ollama). NO hardcoded provider — read from env, ordered list.
- **Media:** HTML5 audio + iframe/video embed for remote sources; Supabase Storage
  for uploads. (Live/transcode via LiveKit/Owncast + FFmpeg = later infra.)
- **Push:** web-push (VAPID) + service worker.
- **PDF:** react-pdf / pdf-lib (certificates, receipts, legal packets).
- **Maps:** MapLibre GL + OpenStreetMap (no Google).
- **Tests:** Vitest.
- **Icons:** lucide-react.

### Components/modules to build (generic)
- **Shell:** left sidebar (grouped nav), desktop header (search pill, balance chip,
  quick-create menu, assistant button, notifications, avatar), contextual right rail,
  mobile top bar + bottom nav, global persistent media player ("Vibe Bar" — collapses
  to a bar, expands to a small floating window, never full-screen takeover).
- **Economy:** internal token wallet (multi-pot), peer-to-peer transfers via atomic
  DB RPC (NO external processor), UBI/decay/rewards crons, a contributions primitive
  that pays token + reputation on verified actions, a "reputation/standing" facet
  system, treasury with a public ledger + runway/health gauge, milestones/streaks.
- **Trust layer:** an action-envelope table (actor/audience/purpose/reversibility/
  expiry/appeal), a consent/relationship graph, human-readable receipts, a
  Sybil-resistant verification ladder (auto/peer-attested/steward-reviewed) that
  gates payouts.
- **Verticals (each: list + detail + create, RLS, comments, token-only monetization):**
  Media (audio/video/shorts/live/radio + channels + playlists + tips),
  Learn/LMS (paths→modules, quizzes with 8 question types + auto-grader, assignments,
  certificates with validation codes, cohorts),
  Commerce (vendors, products+variants, cart, token checkout, orders + delivery
  tracking, service bookings),
  Social (stories + viewer + expiry, groups, events, long-form blog, universal
  reactions + comments + blocks),
  Governance (proposals, votes, petitions, liquid-democracy delegation).
- **Justice toolkit (jurisdiction-configurable):** rights education (public, offline),
  an encounter/panic mode, a rules-grounded "constitutional scanner" that emits ONLY
  verified citations (no hallucinated law), case workspace, class-action matching,
  record-clearing flow, coalition directory, political-pressure engine. Document
  generation MUST be gated behind a human attorney-review table before it turns on.
- **Cross-cutting:** granular notification prefs + web push, unified moderation queue
  (child-safety/threat priority), universal search across all verticals, PWA
  (installable, offline, shortcuts), appeals/help-handoff/household-care surfaces.

### Guardrails to bake in (non-negotiable)
- No payment processor integration anywhere. Internal token only. Add a secret-scan
  that BLOCKS payment-processor keys from being committed.
- No advertising systems of any kind.
- No dark theme.
- AI: never emit an unverified legal citation; run a compliance scan (UPL language,
  crisis signals) on user-facing output; route low-confidence/flagged output to human
  review; log every AI action for audit.
- RLS on every user-data table; owner-scoped by default; explicit revocable shares.

### What to leave as placeholders (target-workspace agent configures)
- Supabase project URL / anon key / service-role key / access token / DB password.
- AI provider API keys (all of them) + provider order.
- VAPID keys, Upstash creds, Meilisearch creds, domain, deploy target.
- Jurisdiction data (statutes/courts/agencies) — ship the schema + a seed template,
  leave real jurisdiction data to be filled per launch region.
- Any real partner/attorney/media contacts.

### Deliverable shape
A running generic build: migrations + RLS, the shell + Vibe Bar, all verticals with
list/detail/create, the economy + trust layer, the justice toolkit (gated), tests,
and a `.env.example` enumerating every placeholder above. Build must pass typecheck
+ production build with placeholder env (features degrade gracefully without creds).
