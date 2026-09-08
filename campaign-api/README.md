# MiJaxx Campaign API

FastAPI service that bridges the mayor campaign (`mijaxx.fun`) and the civic
platform (`milyfe.fun`). Rebuilt 2026-09-08 after the original host
(`milyfe-brain`) failed — this copy is now the source of truth, in version
control.

## Endpoints

### Public (allow-listed, no auth)
| Endpoint | Purpose |
|---|---|
| `GET /health` | Liveness check |
| `GET /petition/status` | Live scoreboard: target 1000, deadline 2026-12-14, days left, % |
| `POST /petition/add` | One signature: `{name, phone?, email?, neighborhood?, collector?}` |
| `POST /petition/add-batch` | Up to 500 signatures: JSON array of the same shape |
| `GET /petition/by-collector` | Signature counts per collector |
| `GET /petition/by-neighborhood` | Signature counts per neighborhood |
| `GET /petition/daily?days=30` | Signatures per day (last N days) |
| `POST /intake/volunteer` | Volunteer signup: `{name, phone?, neighborhood?, skills?, availability?}` |
| `POST /intake/external` | Generic campaign-site form intake (contact, etc.) |
| `GET /metrics/scoreboard` | Milestone countdowns + petition status + election calendar |

### Protected (`X-API-Key` header must match `CAMPAIGN_API_KEY`)
| Endpoint | Purpose |
|---|---|
| `POST /intake/platform` | Webhook from the civic platform: new citizen → auto-petition sign |
| `GET /platform/metrics` | Live citizen count + treasury balance from Supabase |
| `GET /volunteers` | Full volunteer list (war-room use) |
| `PATCH /volunteers/{id}` | Update assignment, hours, signatures logged |

> If `CAMPAIGN_API_KEY` is unset the API runs **open** (dev mode). Set it in
> production — every non-allow-listed route returns 401 without the key.

## Storage

SQLite file at `campaign-api/data/campaign.db` (created on first run).
**The DB file is the entire dataset** — copy it to back up, restore it to
recover. It is gitignored; the schema is recreated automatically.

## Run

```bash
cd campaign-api
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env        # edit as needed
.venv/bin/uvicorn app:app --host 0.0.0.0 --port 8200
```

Local smoke test:

```bash
curl localhost:8200/health
curl -X POST localhost:8200/petition/add \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test Citizen","neighborhood":"Downtown"}'
curl localhost:8200/petition/status
```

## Notes from the rebuild

- The original instance stored its petition/volunteer data on the host that
  died on 2026-09-08. This rebuild starts with an empty database; if the
  original `campaign.db` is ever recovered, copy it in and restart.
- `/platform/metrics` needs `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
  (or anon key) to return live numbers; without them it returns zeros rather
  than failing, so the campaign site degrades gracefully.
