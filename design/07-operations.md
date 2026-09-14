# 07 — Operations & Security

## 7.1 The operating constraint this design is built for

One founder. No second computer — the PC is sold. Working from a phone. This project has
already lost a working tree to a sold drive and three separate sandbox resets.

So the operational design goal is not "robust." It is:

> **Everything needed to recover must live somewhere other than a device the founder is
> holding.**

This is not a theoretical concern. It has happened four times in this project.

---

## 7.2 Deploy topology

Four surfaces, **three codebases, four origins.** No shared runtime.

| Surface | Content | Stack | Host | Cost |
|---|---|---|---|---|
| `milyfe.fun` | Platform | Next.js 16.3.4 | **Vercel**, project `milyfe-v1`, account `iamcarnells-projects` — verified live | Paid plan (exists) |
| `mijaxx.fun` | Campaign landing | **Static HTML** | Free static tier | **$0** |
| `get.milyfe.fun` | Explainer | **Static HTML** | Free static tier | **$0** |
| MiForge | Founding offer | Next.js (`vault/miforge/`, `app/` router) | Separate Vercel project — § 08 D4 | Free tier if traffic allows |

### Why the campaign site is static

Three reasons, in order of weight:

1. **§ 05.2 — campaign finance.** A static site on a free tier involves no company-funded
   infrastructure. It keeps the whole surface inside the volunteer-services carve-out. A
   database, an API and a paid host are all fair-market-value in-kind contributions.
2. **The original API is dead and was never recoverable.** `campaign-api.milyfe.fun` returns
   a Cloudflare Tunnel error — *"cloudflared is not running."* It was nginx-in-Docker on the
   sold PC, behind a tunnel, with no Git and no CI. Rebuilding it would recreate the exact
   fragility that lost it.
3. **Resilience.** A static page survives the founder being unavailable. It has no process to
   crash, no certificate to renew inside a container, and no tunnel to drop.

**Form handling on a static site:** post to a form endpoint that writes to a store the platform
application cannot query (§ 05 Rule 2). A form service or a separate free-tier function —
**not** the platform's Supabase. Whatever it is, it must not be a company-paid resource
(§ 05.2) and it must not share credentials with `milyfe.fun`.

### The Vercel account is verified reachable

Production deployments on `RealMiLyfe/MiLyfe-Universal-OS` by `vercel[bot]`; newest
`sha=32a8089`, `2026-09-03T07:01:59Z`, `state=success`. The `milyfe.fun` deploy path **works**.
`vercel.json` runs six crons — `/api/cron/{ubi,decay,freshness,proposals,stories-expire,timers}`.

⚠️ **Unverified:** whether the current Vercel environment variables and Supabase connectivity
still function. Nothing has been deployed since 2026-09-03 and no production deploy has been
attempted in this work. Test on a preview deployment before promoting anything.

---

## 7.3 Environments

| | Local | Preview | Production |
|---|---|---|---|
| Purpose | Develop | Verify | Serve |
| Supabase | Absent — `middleware` logs *"Skipping auth checks"* and continues | Separate project | Production project |
| Signups flag | Unset (closed) | Unset (closed) | Unset until G3 |
| Data | None | Synthetic only | Real |

**Every change goes through preview before production.** There is one founder and no reviewer;
the preview environment *is* the reviewer.

Verified locally this session: with the flag unset, `/signup` returns HTTP 200 rendering the
coming-soon screen with no form fields; with `NEXT_PUBLIC_SIGNUPS_ENABLED=true` it renders the
full form. `/login` renders its password field in both states. `tsc --noEmit` clean, 60/60
vitest passing.

---

## 7.4 The signup switch — both halves

| Layer | Control | Effect | Status |
|---|---|---|---|
| **UI** | `NEXT_PUBLIC_SIGNUPS_ENABLED` | Renders coming-soon instead of the form | Implemented, commit `d06fc44`, **unset = closed** |
| **Backend** | Supabase → Authentication → Sign In / Providers → Email → *Allow new users to sign up* | Makes signup actually impossible | **Unverified — § 08 R6** |

Both are required. `supabase.auth.signUp()` is called from the browser, so the UI gate can be
bypassed by anyone who reads the bundle. The Supabase toggle is the real control.

**`NEXT_PUBLIC_` variables are inlined at build time.** Flipping the flag requires a redeploy,
not a restart. Budget for that at G3 — it is not an instant switch.

---

## 7.5 Key rotation sequence

`.env.production.template` lists **27 variables**. Plus four that are **not** in the template
and are easy to miss.

Ordered by exposure. Do them in this order, because the first two are the ones already known
to be compromised.

| # | Secret | Why first |
|---|---|---|
| 1 | **`MATTERMOST_PASSWORD`** (`VentureTitan2026`) | **Hardcoded in git history** — commits `d5047f7`, `036841c`, `68bac81` in `root-repo-FULL.bundle`. Purged from HEAD 2026-09-03 but **permanent in history**. Rotate the *service*, not just the string. |
| 2 | **Supabase service-role key** | Full database bypass. Highest blast radius of anything live. |
| 3 | Supabase anon key + URL | Paired with the above |
| 4 | `CAMPAIGN_API_KEY` | **Not in the template** |
| 5 | Listmonk super-admin | **Not in the template** — mailing-list control |
| 6 | Cloudflare API token | **Not in the template** — DNS control across every domain in this plan |
| 7 | Hostinger SPF / DKIM / DMARC | **Not in the template** — email spoofing surface |
| 8 | `CRON_SECRET` | Protects six public endpoints |
| 9 | `GROQ_API_KEY`, `JUSTICE_AI_{GROQ,CEREBRAS,NVIDIA,GEMINI,OPENROUTER}_KEY` | Six model keys; billing exposure |
| 10 | Upstash Redis URL + token, `QSTASH_TOKEN` | Queue and rate-limit integrity |
| 11 | `RESEND_API_KEY`, VAPID pub + priv | Transactional email and push |
| 12 | LiveKit URL + key + secret | Real-time media |
| 13 | Sentry DSN ×2 + token, PostHog key + host | Lower severity, do anyway |

Also: `JUSTICE_AI_ORDER` and `JUSTICE_AI_OLLAMA_{URL,MODEL}` are configuration, not secrets,
but they belong in the same review.

**After rotation:** re-verify each service, then take a fresh backup. Fresh-ness is posture,
not new code — the founder's own formulation, and it is the right one.

---

## 7.6 Backup discipline

The lesson this project has already paid for four times:

> **The difference between the platform that survived and the campaign site that did not was
> whether the source was committed.** Same founder, same week, opposite outcomes.

| Rule | Cadence |
|---|---|
| **Commit and push every unit of work.** Uncommitted work does not survive a reset — proven three times this session. | Continuous |
| Repo pushed to GitHub | Every session |
| Supabase `pg_dump` | Weekly, and before every migration |
| `.env` — encrypted, off-device | On every rotation |
| Media and uploads | With each `pg_dump` |

**Next migration is `028`.** Twenty-seven exist; `027_storage_buckets.sql` is the newest.

**Never commit:** `.env*`, `*.db`, `*.key`, `*.pem`, dumps, `node_modules`, build output.
`.gitignore` already covers most; verify before every commit that touches data.

**Provenance discipline:** anything reconstructed is labelled reconstructed. The vault does
this at `vault/00-INDEX.md` — 88 files, each with its origin. Rebuilt pages are never presented
as recovered originals.

---

## 7.7 Monitoring and rollback

**Monitor:**
- Vercel deployment state — a failed production deploy is the loudest failure mode here
- The six cron endpoints — a silently failing cron corrupts state slowly
- `cohort-status` availability — it drives live counters on two surfaces (§ 06.4)
- Uptime on all four origins

**Rollback:**
- **Platform:** Vercel instant rollback to the previous deployment. This is the recovery path
  and it should be rehearsed once, on a preview, before it is needed.
- **Static sites:** redeploy the previous artefact. Keep the last three builds.
- **Database:** restore from the most recent `pg_dump`. Migrations are forward-only; a bad
  migration is a restore, not a repair.

**The `milyfebackup` repo is not a backup.** It is public, it contains `campaign.db` with 24
rows of citizen phone numbers and email addresses, and it carries the hardcoded Mattermost
password in history. It needs to be made private or deleted — § 08 R8.
