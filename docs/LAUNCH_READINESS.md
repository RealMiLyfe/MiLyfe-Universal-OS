# MiLyfe — Launch Readiness

Snapshot of what is verified working for launch. Kept honest: only items
confirmed against the live system are marked ✅.

## Platform (milyfe.fun — Vercel)

| Area | Status | Evidence |
|---|---|---|
| Production build | ✅ | `npm run build` — 56 routes compiled |
| Full E2E (every table + flow) | ✅ | 60/60 passing; test users auto-deleted |
| Schema complete | ✅ | All tables/columns present; `new-project-setup.sql` reproduces it |
| Treasury reconciled | ✅ | Genesis $5.3B − real grants; only real transactions |
| Single real account | ✅ | mi@milyfe.fun (test users purged) |
| Light theme only | ✅ | dark mode fully removed |
| Legal pages | ✅ | /privacy, /terms, /security (public) |
| Multi-language | ✅ | EN/ES/HT translated + 11 fallback; selectors mounted |
| Photo upload | ✅ | quests (`image_urls`) + surplus (`images`) wired |

## Wallet / Economy

| Item | Status | Notes |
|---|---|---|
| Weekly UBI (100 $MLY, Mondays 06:00 UTC) | ✅ | `execute_weekly_ubi` RPC + `vercel.json` cron + `CRON_SECRET` set |
| Welcome grant (50 $MLY on signup) | ✅ | `handle_new_user` trigger |
| Atomic transfers | ✅ | `transfer_mly` RPC (row-locked, race-safe) — deployed |
| Reward claims | ✅ | `claim_reward_atomic` RPC |
| All cron endpoints protected | ✅ | 401 without `CRON_SECRET` (verified live) |

## Cron schedule (vercel.json)

| Job | Schedule | Purpose |
|---|---|---|
| `/api/cron/ubi` | `0 6 * * 1` | Weekly UBI, Mondays 06:00 UTC |
| `/api/cron/decay` | `0 3 * * *` | Standing decay |
| `/api/cron/freshness` | `0 4 * * *` | Resource freshness |
| `/api/cron/proposals` | `0 5 * * *` | Close expired proposals |
| `/api/cron/timers` | `0 8 * * *` | Safety timers |

## Infrastructure (Cloudflare + Time Chamber)

| Item | Status | Notes |
|---|---|---|
| Named tunnel `milyfe-campaign` | ✅ | Running (config/cloudflared/config.yml), creds present |
| Public domains resolve + 200 | ✅ | milyfe.fun, mijaxx.fun, get.milyfe.fun, campaign-api.milyfe.fun, analytics.milyfe.fun |
| Time chamber locked | ✅ | Mattermost single-owner (mi@milyfe.fun), no public signup |
| All HTC ports localhost-only | ✅ | 127.0.0.1-bound; internet only via tunnel |
| Repo secret protection | ✅ | pre-commit hook + CI scan; history purged of dead keys |

Housekeeping (non-blocking): 4 legacy quick tunnels (`cloudflared --url ...`) run
alongside the named tunnel and can be stopped since the named tunnel now serves
all custom domains.

## Campaign engine (campaign-api.milyfe.fun)

| Endpoint | Status | Notes |
|---|---|---|
| `/health` | ✅ | healthy |
| `/petition/status` | ✅ | Live scoreboard: target 1000, deadline 2026-12-14 |
| `/petition/add`, `/add-batch`, `/by-collector`, `/by-neighborhood`, `/daily` | ✅ | Petition tracking |
| `/intake/volunteer`, `/intake/external`, `/intake/platform` | ✅ | Public intake forms |
| `/volunteers/*` | ✅ | Assignment + hours + signature logging |
| `/metrics/scoreboard` | ✅ | Countdown to all milestones |

## Election timeline (canonical)

| Date | Event |
|---|---|
| 2026-12-14 | Petition signature deadline (target: 1000 verified) |
| 2027-01-11 – 15 | Qualifying window |
| 2027-03-09 | Primary election |
| 2027-05-18 | General election (if runoff) |
| 2027-07-01 | Mayor takes office |

## Scaling model

The device-as-node architecture (website = routing layer, people's devices do
the lifting) is documented in [DEVICE_AS_NODE.md](DEVICE_AS_NODE.md). Service
worker + PWA are live; local-first data, WebRTC P2P, and on-device Mi AI are the
documented next milestones.

---

*Every ✅ here was checked against the running system, not assumed.*
