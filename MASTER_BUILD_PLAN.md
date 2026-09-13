# MiLyfe — Master Build Plan

**Written:** 2026-09-13 · **Status:** proposed, awaiting decisions
**Replaces:** the plans scattered across `docs/build/`, `docs/planning/`, `milyfebackup/RESCUE_ESSENTIALS/04_manuals_docs/`, PR #27 `RECOVERY.md`, and the `arena/01a09420` branch's `recovery/PROVENANCE.md`. This file is now the single source. Those stay as archive, not as instructions.

---

## The one finding that sets the order

`RealMiLyfe/milyfebackup` was made **public** on 2026-09-12 to let me search it. It is still public. It contains:

| Item | Verified contents |
|---|---|
| `RESCUE_ESSENTIALS/05_agent_knowledge/data/campaign.db` | `contacts`: **24 rows** with columns `name, neighborhood, phone, email, support_level, notes`. `petition_signatures`: 1 row with `signer_name`. |
| `04_manuals_docs/Campaign_Private/` | `Strategy.md`, `Titan_Agent_System.md` |
| `05_agent_knowledge/knowledge/external/` | `opposition-file-legacy.md`, `the-opponent.md` — opposition research |
| `01_git_history/root-repo-FULL.bundle` | Full history of the root repo. Commits `d5047f7`, `036841c`, `68bac81` contain a hardcoded default password (`MATTERMOST_PASSWORD:-VentureTitan2026`). It was purged from the working tree on 09-03, but **git history is permanent** and the bundle is downloadable by anyone. |

Voter contact data with phone numbers and emails, opposition research, and a live credential are all publicly readable right now.

**Phase 0 is not optional and comes before anything else.**

---

## Phase 0 — Stop the bleeding (today, ~10 minutes, phone-only)

1. **Make `milyfebackup` private.** GitHub → repo → Settings → scroll to Danger Zone → Change visibility → Private.
2. Treat the Mattermost password as burned. If any Mattermost instance is reachable from the internet, change it. (Likely moot — it was on the sold PC — but assume not.)
3. Note for later: making the repo private does **not** remove it from anyone's clone. Anything pulled in the last day is already out. Rotation in Phase 2 is what actually fixes it.

---

## Phase 1 — Freeze and archive (one cold copy, done once)

Goal: one backup, in one place, that is complete and verified — instead of 4 repos, 1 backup repo, 4 git bundles, and a sold PC.

**Keep:**
- `MiLyfe-Universal-OS` → **the trunk.** The only asset with a working Git→Vercel pipeline.
- `milyfebackup` → **cold storage**, private, never deployed from.

**Archive into `milyfebackup` (private), then stop touching:**
- `miforge-app` (7 commits, node_modules committed — 13,785 blobs of noise) → archive the repo, keep source only
- `MiLyfe-Platform-OS` → duplicate of the trunk at an older commit. Archive it. Today's `arena/01a09420` branch has a useful `PROVENANCE.md`; salvage that file, archive the rest.
- Close PR #27 (`campaign-site/` reconstruction) — superseded by Phase 4. Salvage `RECOVERY.md` first.

**Deliverable:** two live repos (`MiLyfe-Universal-OS`, `milyfebackup`), everything else archived with a pointer in this file.

---

## Phase 2 — Rotate everything (the "fresh keys" ask)

`.env.production.template` at `main` declares **27 variables**. Every one gets a new value. Nothing carries over.

| Group | Variables | Where to rotate |
|---|---|---|
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → reset anon + service role |
| AI providers | `GROQ_API_KEY`, `JUSTICE_AI_GROQ_KEY`, `JUSTICE_AI_CEREBRAS_KEY`, `JUSTICE_AI_NVIDIA_KEY`, `JUSTICE_AI_GEMINI_KEY`, `JUSTICE_AI_OPENROUTER_KEY` | each provider's console |
| Infra | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `QSTASH_TOKEN` | Upstash console |
| Email | `RESEND_API_KEY` | Resend console |
| Push | `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | regenerate the keypair |
| Errors/analytics | `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `NEXT_PUBLIC_POSTHOG_KEY` | Sentry / PostHog |
| Live | `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` | LiveKit console |
| Internal | `CRON_SECRET` | generate fresh |

**Campaign-side, not in that template** — also rotate:
- `CAMPAIGN_API_KEY` (campaign API)
- Listmonk super-admin credentials (the leaked-password lineage)
- Cloudflare: retire the dead `milyfe-campaign` tunnel entirely; issue a new API token scoped to DNS only
- Hostinger mail: review SPF/DKIM/DMARC for `milyfe.fun`

**Rule going forward:** secrets live only in Vercel env vars and Supabase. Never in Git, never in a bundle, never in chat. `.env.production.template` keeps names, never values.

**Unverified, and it matters:** I could not confirm the current Vercel env vars are intact. The live homepage renders numbers, which hints Supabase connects — but I never authenticated. **First action in Phase 3 is to confirm the platform's DB actually works**, because if the keys are already gone, rotation and recovery are the same task.

**Where the old values might be:** `02_secrets_env/` was deliberately stripped from the GitHub copy of `milyfebackup`. `MANIFEST.sha256` lists **8** secrets/env files (`.env.local`, `.env`, nginx `localhost.key`/`.crt`, templates) and **53** database-state files — 61 entries total — **none of which are in the repo.** If the exFAT backup drive still exists, those 8 files are on it, and Phase 2 becomes "rotate from known values" instead of "rotate blind."

### A hard constraint discovered while writing this

Artifacts written outside the git checkout are wiped between work sessions. The recovered originals (`blog.html`, `campaign.js`, the 22 writing documents) had to be re-extracted twice already. **Anything worth keeping goes in the repo, committed, in Phase 1.** Not a folder next to it.

---

## Phase 3 — Fresh baseline on the existing trunk

The platform is not the mess. Verified at `main` (`32a8089`, the exact commit Vercel deployed successfully on 2026-09-03):

**91 route pages · 23 API routes · 70 components · 81 lib files · 28 Supabase migrations · 7 test files · 352 source files · route groups `(auth)`, `(platform)`, `(justice-public)`**

So "fresh" here means **fresh posture, not fresh code**:

1. Confirm DB connectivity and that migrations 001–028 are applied.
2. Rotate per Phase 2. Deploy. Confirm still green.
3. Dependency and framework security pass. There are **12 open Dependabot PRs** on this repo (`ai`, `postcss`, `react-hook-form`, `react-markdown`, `vitest`, `@tiptap/pm`, `@assistant-ui/react-ai-sdk`, `@types/node`, `@types/react-dom`, `@tailwindcss/typography`, `actions/checkout`, `actions/setup-node`). Triage, don't blanket-merge — several are major versions.
4. Cut a tagged release. That tag is the "fresh start" line. Everything after it is the new build.

---

## Phase 4 — Build order (one narrative, one funnel)

Each product has exactly one job in the funnel. Nothing competes.

```
get.milyfe.fun        mijaxx.fun              milyfe.fun              miforge
"What is this?"   →   "Who's running &    →   "Join as a        →   "Run your business
 top of funnel         why — sign"             citizen"              inside it"
 static, cheap         static, cheap           the platform          the economy arm
```

**Order, and why:**

**1. mijaxx.fun** — it's the furthest gone and the most time-sensitive (petition deadline **2026-12-14**, 92 days out). Build as a route group inside the trunk so it deploys on the pipeline that already works. What we have:
- Genuine original `blog.html` (10,231 B) → the real template, class names, nav, `#1e4a8a`, Atkinson Hyperlegible
- Genuine original `campaign.js` (12,628 B) → real contract: `campaign-api.milyfe.fun`, `/petition/add`, `/petition/status`, `/intake/volunteer`, field names `signer_name / address / neighborhood / email / registered_voter / skills`, Listmonk list `7d05bab2-85e3-45ab-acf2-b0de27709188`
- 22 writing documents, 1,025 lines — your actual copy source
- **Missing and not recoverable:** 8 of 9 pages, the real `css/style.css`, `js/main.js`, all images. You're supplying images.

**2. The campaign API** — the petition counter is dead. As of 2026-09-12 `campaign-api.milyfe.fun/health` returned Cloudflare's own *"Cloudflare Tunnel error … Ensure that cloudflared is running"* page — still pointed at the sold PC. (Not re-verified today; the fetch tool would not resolve. Assume still down until checked.) It cannot go back to a tunnel. Two options, decision needed:
- **Fold into the trunk** as `/api/campaign/*` with Supabase tables. No new infra, same deploy, durable data. ← recommended
- Separate Cloudflare Worker + D1. More moving parts.

**3. get.milyfe.fun** — one landing page, top of funnel, points at mijaxx and milyfe. Small. Do it after mijaxx so the design system is settled.

**4. miforge** — currently `miforge-app`, a standalone Next.js app with Whop webhooks, Groq daily briefs, key rotation, onboarding. Its own copy says: *"MiForge is built inside MiLyfe — starting in Jacksonville through the MiJaxx mayoral initiative"* and *"Jacksonville pilot businesses receive double bonus + seat on the MiJaxx Business Advisory Council."* Decision needed: **fold into the trunk as a route group, or keep separate and link?** Folding gives one deploy and one auth; separate keeps its Whop integration isolated.

**5. The rest** — Ghost (blog/email), Listmonk (email campaigns), Umami (analytics), Mastodon, Mattermost, n8n. All were self-hosted on the sold PC. Decision needed: which come back at all, and each needs a host that isn't a laptop. Recommendation: don't rebuild the stack. Use managed equivalents or drop them until there's a reason.

---

## Phase 5 — Launch as one thing

Single narrative, in order: **get.milyfe.fun** (what) → **mijaxx.fun** (who/why, sign) → **milyfe.fun** (join) → **miforge** (build). Every CTA points one step forward, never sideways.

Gates before launch:
- [ ] `milyfebackup` private
- [ ] All 27 env vars + campaign keys rotated
- [ ] Petition signatures writing to a durable store (not SQLite on a machine)
- [ ] All four domains on one host, one deploy pipeline
- [ ] Tagged release on the trunk
- [ ] **A backup that is tested** — the whole failure that started this was an untracked `public_html/` and a backup nobody verified. The rule: nothing ships unless it is committed, and the backup is restore-tested.

---

## Decisions I need from you

1. **Campaign API** — fold into the trunk on Supabase, or separate Worker + D1?
2. **miforge** — fold into the trunk, or keep as its own app?
3. **The self-hosted stack** (Ghost, Listmonk, Umami, Mastodon, Mattermost, n8n) — which come back?
4. **Do you still have the exFAT backup drive?** The 8 stripped secrets/env files (see Phase 2) are the difference between rotating from known values and rotating blind.
5. **Vercel** — can you log into the `iamcarnells-projects` account? That determines whether Phase 2 is something I can walk you through or something you do alone.

---

*Verified against: `gh api` deployment records on `RealMiLyfe-Universal-OS` (Production `32a8089`, `state=success`, target `milyfe-v1-idhf5urzl-iamcarnells-projects.vercel.app`), `origin/main` tree at `32a8089`, `.env.production.template`, `vercel.json`, `milyfebackup` contents including a `sqlite3` read of `campaign.db`, and a full-history secret scan of `root-repo-FULL.bundle`.*
