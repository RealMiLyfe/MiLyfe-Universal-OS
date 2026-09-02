# MiLyfe + MiJustice — API Keys & Config

Straight answer on what needs a key, what's already wired, what self-heals, and
what needs no key at all. Real free-tier sources only — no leaked/borrowed keys.

> Secrets live in `.env.local` (gitignored). Never commit real keys. The
> `*.example` / `*.template` files hold placeholders only.

---

## What the code actually reads (these matter now)

| Env var | Used for | Required? | Free source |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | DB + auth | **Yes** | supabase.com → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | DB + auth | **Yes** | same |
| `SUPABASE_SERVICE_ROLE_KEY` | server/cron writes | **Yes** | same (keep server-only) |
| `CRON_SECRET` | protect cron routes | Yes for cron | you generate: `openssl rand -hex 32` |
| `GROQ_API_KEY` | Mi chat (platform assistant) | Optional | console.groq.com (free) |
| `OPENAI_API_KEY` / `OPENAI_API_BASE_URL` / `MI_MODEL` | Mi chat alt/fallback | Optional | platform.openai.com or point base_url at any OpenAI-compatible host |
| `MI_FALLBACK_API_KEY` / `_BASE_URL` / `_MODEL` | Mi chat second backend | Optional | any provider |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | rate limiting | Optional (in-memory fallback) | upstash.com (free) |
| `WAR_ROOM_INTAKE_URL` / `_SECRET` | campaign intake hook | Optional | your own endpoint |

In the production template but **not read by code yet** (skip until the feature
ships): `RESEND_API_KEY`, `LIVEKIT_*`, `POSTHOG_*`/`UMAMI_*`, `SENTRY_DSN`,
`QSTASH_TOKEN`, `VAPID_*`, `MEILISEARCH_*`.

---

## MiJustice — its own dedicated, self-healing AI fleet

MiJustice does **not** share the Mi chat backend. It has its own key set
(`JUSTICE_AI_*`) and its own failover chain in `src/lib/justice/ai.ts`. Tune or
break one without touching Mi or the time chamber.

**Order (configurable via `JUSTICE_AI_ORDER`):**
`groq → cerebras → nvidia → gemini → openrouter → ollama`

Each provider is tried in turn. On a missing key, error, rate-limit, or timeout,
it self-heals to the next. **Local Ollama is keyless and last**, so the chain
never hard-fails to "AI down" as long as any backend is reachable.

| Provider | Env var | Free tier signup |
|---|---|---|
| Groq | `JUSTICE_AI_GROQ_KEY` | console.groq.com |
| Cerebras | `JUSTICE_AI_CEREBRAS_KEY` | cloud.cerebras.ai |
| NVIDIA NIM | `JUSTICE_AI_NVIDIA_KEY` | build.nvidia.com |
| Google Gemini | `JUSTICE_AI_GEMINI_KEY` | aistudio.google.com |
| OpenRouter | `JUSTICE_AI_OPENROUTER_KEY` | openrouter.ai (has `:free` models) |
| Local Ollama | *(none)* | install Ollama, `ollama pull llama3.2:3b` |

**Current status in this workspace:** all five provider keys are already
populated in `.env.local` (copied from your existing time-chamber config — your
own keys, not shared with the chamber's runtime). MiJustice will use them in the
order above and self-heal between them. If you later want fully isolated keys,
just replace the `JUSTICE_AI_*` values with fresh ones from the links above; the
code prefers `JUSTICE_AI_*` over any shared key name.

**Check it live (signed in):** `GET /api/justice/ai-health` reports which
providers are configured and confirms self-healing is on.

---

## The keyless / no-signup path (nothing to buy)

If you want MiJustice AI enrichment with **zero** external keys:
1. Install Ollama (ollama.com) and run `ollama pull llama3.2:3b`.
2. Leave the `JUSTICE_AI_*` cloud keys blank.
3. The fleet falls straight through to local Ollama.

Everything else in MiJustice that does **not** need any key already works:
Know Your Rights, Encounter Mode, the Constitution, the Defender's rules-grounded
scan (its citations come from a verified set, not a model), petitions, the
directory, and all the module pages.

---

## Generate-your-own secrets (no signup, run locally)

```bash
# Cron protection
openssl rand -hex 32          # CRON_SECRET

# Web push (only when you enable notifications)
npx web-push generate-vapid-keys
```

---

## What I did NOT do (and why)

I did not pull keys from GitHub/OSINT scrapers. Any key found "already out there"
in a public repo or scanner is a leaked credential — using it is theft, gets
auto-revoked by provider scanners, and would expose users' legal/immigration
data. Every key above comes from a legitimate free tier you control, or needs no
key at all. That's the only path that survives contact with reality.
