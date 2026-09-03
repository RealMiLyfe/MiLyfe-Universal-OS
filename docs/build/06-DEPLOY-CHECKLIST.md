# Deploy Checklist — MiLyfe / MiJustice

Operational runbook to take the platform from localhost to live. The feature build
is done; this covers the launch-ops steps from `05-WHATS-LEFT.md` and the remaining
human/legal + external-infra gates.

> Hard rules that never bend: **no payment processors ever, no ads, no dark theme.**
> Money is internal **$MLY only**, peer-to-peer via atomic DB RPC. Guardrails stay on
> anything touching law / money / safety / minors. RLS on every user table.

---

## 1. Environment variables

Set these in the host's env (Vercel Project Settings → Environment Variables, or your
self-host secret store). Values live in `.env.local` — **never commit or echo them**.
Reference by name only. See `.env.local.example` / `.env.production.template`.

**Required (core):**
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` (the live origin, e.g. the attached domain)
- `CRON_SECRET` (protects every `/api/cron/*` route — see §3)

**AI fleet (MiJustice, separate from Mi):**
- `JUSTICE_AI_GROQ_KEY`, `JUSTICE_AI_CEREBRAS_KEY`, `JUSTICE_AI_NVIDIA_KEY`,
  `JUSTICE_AI_GEMINI_KEY`, `JUSTICE_AI_OPENROUTER_KEY`, `JUSTICE_AI_ORDER`,
  `JUSTICE_AI_OLLAMA_URL`, `JUSTICE_AI_OLLAMA_MODEL`
- Mi / general: `MI_MODEL`, `GROQ_API_KEY`, `OPENAI_API_KEY`, `OPENAI_API_BASE_URL`

**Web push (built, needs keys):**
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`

**Optional (observability / infra — degrade gracefully if unset):**
- `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `LOG_LEVEL`
- `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`
- `RESEND_API_KEY` (transactional email)
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `QSTASH_TOKEN` (rate-limit / queue)
- `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` (live streaming — see §7)

**Secret hygiene:** the secret-scan hook blocks payment-processor keys and leaked
secrets on commit. Never add a Stripe/PayPal/gateway key — there is no payment path.

---

## 2. Database

Supabase project `uwozuhmiahytjwfmudia` — migrations applied through **027**, seeded.

- New migrations: `supabase db push` (CLI linked; `SUPABASE_ACCESS_TOKEN` in `.env.local`).
- Re-seed demo content if needed: `node scripts/seed-demo.mjs`.
- Confirm RLS is enabled on every user-facing table before opening signups.

---

## 3. Cron schedulers  (blocks UBI, decay, story expiry until done)

Six routes exist under `src/app/api/cron/*`, each guarded by `CRON_SECRET`
(`isAuthorizedCronRequest`). They are registered in `vercel.json`:

| Route                      | Schedule (cron)   | Purpose                                  |
|----------------------------|-------------------|------------------------------------------|
| `/api/cron/ubi`            | `0 6 * * 1`       | Weekly UBI (Mon 06:00 UTC)               |
| `/api/cron/decay`          | `0 3 * * *`       | Daily standing decay                     |
| `/api/cron/freshness`      | `0 4 * * *`       | Daily resource freshness sweep + quests  |
| `/api/cron/proposals`      | `0 * * * *`       | Hourly auto-close of expired proposals   |
| `/api/cron/stories-expire` | `0 * * * *`       | Hourly 24h story expiry                  |
| `/api/cron/timers`         | `*/5 * * * *`     | Walk-home safety escalation              |

**Vercel Cron notes:**
- Set `CRON_SECRET` in the project env; Vercel Cron sends it automatically to the routes.
- **Sub-daily schedules (`proposals`, `stories-expire`, `timers`) require a Vercel Pro
  plan.** On the Hobby plan crons run at most once/day — either upgrade, or move these
  three to an external scheduler (GitHub Actions below) that hits the routes with the
  `Authorization: Bearer $CRON_SECRET` header.

**GitHub Actions alternative** (works on any host, any cadence): a scheduled workflow
that `curl`s each route with the bearer token. Store `CRON_SECRET` and the deploy URL
as repo secrets. All routes are idempotent, so overlapping runs are safe.

**Verify after deploy:** manually hit each route once with the bearer token and confirm
a 200 + the expected JSON (e.g. `{ "distributed": N }`, `{ "expired": N }`).

---

## 4. Deploy + domain

1. Merge PR #13 (`feat/mijustice-phase1` → `main`) once reviewed. *(Do not force-merge.)*
2. Deploy from `main` (Vercel import, or self-host `npm run build` + `npm start`).
3. Set all env vars from §1 for the Production environment.
4. Attach the domain; set `NEXT_PUBLIC_APP_URL` to match.
5. Smoke test: sign up, complete onboarding, cast a vote (earns $MLY), open the Vibe Bar,
   load a MiJustice public page, trigger a web-push.

---

## 5. Search (optional)

Search works today via the Supabase text-search fallback. For fast, typo-tolerant search,
run a Meilisearch instance and index existing content, then point the search layer at it.
Non-blocking for launch.

---

## 6. Human / legal gates  (by design — not code)

- **MiJustice filing generation stays disabled** until a licensed FL attorney approves a
  template via the Advisory Review console (`justice_template_reviews`). Tables + console
  are built and waiting.
- **Onboard** advisory board, partners, attorneys, translators — directory + routing exist.
- **Human translation review** before publishing legal content in Spanish / Haitian Creole.
- AI guardrails stay on: no unverified legal citations, compliance scan runs,
  low-confidence/flagged output routes to human review, agent actions are logged.

---

## 7. External infrastructure  (stubbed at the edge)

In-app product is complete; these need real infra to scale:
- Live streaming (LiveKit / Owncast) — wire `LIVEKIT_*`.
- Media transcoding (FFmpeg pipeline / transcode farm).
- Native app binaries (app-store submission).
- Live federation peers.

---

## Bottom line
Nothing left to *build* for the scoped vision. Launch = env + DB + crons + deploy +
domain. Then the human/legal gates open features as real people sign off.
