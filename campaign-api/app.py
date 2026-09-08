"""MiJaxx campaign API — FastAPI.

Bridges the mayor campaign (mijaxx.fun) and the civic platform (milyfe.fun).
Rebuilt 2026-09-08 after the original host (milyfe-brain) failed.

Public, unauthenticated (allow-listed):
  GET  /health
  GET  /petition/status
  POST /petition/add
  POST /petition/add-batch
  GET  /petition/by-collector
  GET  /petition/by-neighborhood
  GET  /petition/daily
  POST /intake/volunteer
  POST /intake/external
  GET  /metrics/scoreboard

Protected (require X-API-Key == CAMPAIGN_API_KEY):
  POST /intake/platform        — webhook from the civic platform (auto-petition)
  GET  /platform/metrics       — live citizen count + treasury balance
  GET  /volunteers
  PATCH /volunteers/{id}       — assignment / hours / signatures
"""
from __future__ import annotations

import os
from datetime import date, datetime, timezone

from fastapi import Body, FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import db

app = FastAPI(title="MiJaxx campaign API", version="1.1.0")

# CORS — the static campaign site is a different origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

PETITION_TARGET = int(os.environ.get("PETITION_TARGET", "1000"))
PETITION_DEADLINE = os.environ.get("PETITION_DEADLINE", "2026-12-14")
API_KEY = os.environ.get("CAMPAIGN_API_KEY", "")

# Milestones from the canonical election timeline (LAUNCH_READINESS.md).
MILESTONES = [
    {"label": "Dec 14, 2026", "date": "2026-12-14", "description": "Petition signature deadline (target: 1,000 verified)"},
    {"label": "Jan 11–15, 2027", "date": "2027-01-11", "description": "Qualifying window"},
    {"label": "Mar 9, 2027", "date": "2027-03-09", "description": "Primary election"},
    {"label": "May 18, 2027", "date": "2027-05-18", "description": "General election (if runoff)"},
    {"label": "Jul 1, 2027", "date": "2027-07-01", "description": "Mayor takes office"},
]

# Endpoints reachable without an API key.
PUBLIC_PATHS = {
    "/health", "/petition/status", "/petition/add", "/petition/add-batch",
    "/petition/by-collector", "/petition/by-neighborhood", "/petition/daily",
    "/intake/volunteer", "/intake/external", "/metrics/scoreboard",
}


class Signature(BaseModel):
    name: str = Field(min_length=1)
    phone: str | None = None
    email: str | None = None
    neighborhood: str | None = None
    collector: str | None = None


class Volunteer(BaseModel):
    name: str = Field(min_length=1)
    phone: str | None = None
    neighborhood: str | None = None
    skills: list[str] | str | None = None
    availability: str | None = None


class ExternalIntake(BaseModel):
    form: str = "external"
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    topic: str | None = None
    message: str | None = None


class PlatformWebhook(BaseModel):
    type: str = "new_citizen"
    username: str | None = None
    payload: dict | None = None


class VolunteerUpdate(BaseModel):
    assigned_to: str | None = None
    hours: float | None = None
    signatures: int | None = None


def _parse_date(s: str) -> date:
    return datetime.strptime(s, "%Y-%m-%d").date()


def _days_left(target: date) -> int:
    return (target - date.today()).days


def _normalize_skills(skills) -> str | None:
    if skills is None:
        return None
    if isinstance(skills, list):
        return ", ".join(str(s) for s in skills if str(s).strip())
    return skills


def _require_key(x_api_key: str | None):
    if not API_KEY:
        # No key configured → open mode (development only). Log a warning once.
        return
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Missing or invalid X-API-Key")


def _petition_status() -> dict:
    with db.get_db() as conn:
        row = conn.execute("SELECT COUNT(*) AS n FROM petitions").fetchone()
        collected = row["n"]
    remaining = max(0, PETITION_TARGET - collected)
    pct = round((collected / PETITION_TARGET) * 100, 1) if PETITION_TARGET else 0.0
    return {
        "target": PETITION_TARGET,
        "collected": collected,
        "remaining": remaining,
        "pct": pct,
        "deadline": PETITION_DEADLINE,
        "days_left": max(0, _days_left(_parse_date(PETITION_DEADLINE))),
        "complete": collected >= PETITION_TARGET,
        "as_of": db._now(),
    }


# ── Public ──────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "healthy", "service": "mijaxx-campaign-api", "ts": db._now()}


@app.get("/petition/status")
def petition_status():
    return _petition_status()


@app.post("/petition/add")
def petition_add(sig: Signature):
    with db.get_db() as conn:
        cur = conn.execute(
            "INSERT INTO petitions (name, phone, email, neighborhood, collector, created_at) "
            "VALUES (?,?,?,?,?,?)",
            (sig.name.strip(), sig.phone, sig.email, sig.neighborhood, sig.collector, db._now()),
        )
        total = conn.execute("SELECT COUNT(*) AS n FROM petitions").fetchone()["n"]
    return {"ok": True, "id": cur.lastrowid, "total": total}


@app.post("/petition/add-batch")
def petition_add_batch(signatures: list[Signature] = Body(..., max_length=500)):
    with db.get_db() as conn:
        rows = [
            (s.name.strip(), s.phone, s.email, s.neighborhood, s.collector, db._now())
            for s in signatures
        ]
        conn.executemany(
            "INSERT INTO petitions (name, phone, email, neighborhood, collector, created_at) "
            "VALUES (?,?,?,?,?,?)",
            rows,
        )
        total = conn.execute("SELECT COUNT(*) AS n FROM petitions").fetchone()["n"]
    return {"ok": True, "added": len(rows), "total": total}


@app.get("/petition/by-collector")
def petition_by_collector():
    with db.get_db() as conn:
        rows = conn.execute(
            "SELECT COALESCE(collector,'(self)') AS collector, COUNT(*) AS n "
            "FROM petitions GROUP BY collector ORDER BY n DESC"
        ).fetchall()
    return {"by_collector": [db.row_to_dict(r) for r in rows]}


@app.get("/petition/by-neighborhood")
def petition_by_neighborhood():
    with db.get_db() as conn:
        rows = conn.execute(
            "SELECT COALESCE(neighborhood,'(unspecified)') AS neighborhood, COUNT(*) AS n "
            "FROM petitions GROUP BY neighborhood ORDER BY n DESC"
        ).fetchall()
    return {"by_neighborhood": [db.row_to_dict(r) for r in rows]}


@app.get("/petition/daily")
def petition_daily(days: int = 30):
    with db.get_db() as conn:
        rows = conn.execute(
            "SELECT substr(created_at,1,10) AS day, COUNT(*) AS n "
            "FROM petitions WHERE created_at >= date('now', ?) "
            "GROUP BY day ORDER BY day",
            (f"-{max(1, days)} days",),
        ).fetchall()
    return {"daily": [db.row_to_dict(r) for r in rows]}


@app.post("/intake/volunteer")
def intake_volunteer(v: Volunteer):
    with db.get_db() as conn:
        cur = conn.execute(
            "INSERT INTO volunteers (name, phone, neighborhood, skills, availability, created_at) "
            "VALUES (?,?,?,?,?,?)",
            (v.name.strip(), v.phone, v.neighborhood, _normalize_skills(v.skills), v.availability, db._now()),
        )
        total = conn.execute("SELECT COUNT(*) AS n FROM volunteers").fetchone()["n"]
    return {"ok": True, "id": cur.lastrowid, "total_volunteers": total}


@app.post("/intake/external")
def intake_external(form: ExternalIntake):
    with db.get_db() as conn:
        cur = conn.execute(
            "INSERT INTO external_intake (form, name, email, phone, topic, message, created_at) "
            "VALUES (?,?,?,?,?,?,?)",
            (form.form, form.name, form.email, form.phone, form.topic, form.message, db._now()),
        )
    return {"ok": True, "id": cur.lastrowid}


@app.get("/metrics/scoreboard")
def metrics_scoreboard():
    status = _petition_status()
    today = date.today()
    miles = []
    for m in MILESTONES:
        d = _parse_date(m["date"])
        miles.append({
            **m,
            "days_left": (d - today).days,
            "done": d < today,
        })
    return {
        "petition": status,
        "milestones": miles,
        "election": {
            "Petition deadline": "2026-12-14",
            "Qualifying window": "2027-01-11 to 2027-01-15",
            "Primary": "2027-03-09",
            "General (if runoff)": "2027-05-18",
            "Inauguration": "2027-07-01",
        },
        "as_of": db._now(),
    }


# ── Protected ──────────────────────────────────────────────

@app.post("/intake/platform")
def intake_platform(webhook: PlatformWebhook, x_api_key: str | None = Header(default=None)):
    """Webhook from the civic platform: a new citizen joined → auto-petition sign."""
    _require_key(x_api_key)
    with db.get_db() as conn:
        if webhook.type == "new_citizen" and webhook.username:
            conn.execute(
                "INSERT INTO petitions (name, email, collector, source, created_at) VALUES (?,?,?,?,?)",
                (webhook.username, None, "platform-auto", "platform", db._now()),
            )
        cur = conn.execute(
            "INSERT INTO external_intake (form, name, payload, created_at) VALUES (?,?,?,?)",
            ("platform", webhook.username,
             str(webhook.payload or ""), db._now()),
        )
    return {"ok": True, "id": cur.lastrowid}


@app.get("/platform/metrics")
def platform_metrics(x_api_key: str | None = Header(default=None)):
    """Live citizen count + treasury balance from the Supabase platform database.

    Falls back to safe zeroed values when Supabase credentials are not
    configured, so the campaign site never shows broken numbers.
    """
    _require_key(x_api_key)
    citizens = 0
    treasury = 0.0
    try:
        import httpx
        supa_url = os.environ.get("SUPABASE_URL", "")
        supa_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "") or os.environ.get("SUPABASE_ANON_KEY", "")
        if supa_url and supa_key:
            with httpx.Client(timeout=8) as client:
                c = client.get(
                    f"{supa_url.rstrip('/')}/rest/v1/profiles",
                    params={"select": "id", "limit": "1000"},
                    headers={"apikey": supa_key, "Authorization": f"Bearer {supa_key}"},
                )
                if c.status_code == 200:
                    citizens = len(c.json())
                t = client.get(
                    f"{supa_url.rstrip('/')}/rest/v1/community_treasury?select=balance&limit=1",
                    headers={"apikey": supa_key, "Authorization": f"Bearer {supa_key}"},
                )
                if t.status_code == 200 and t.json():
                    treasury = float(t.json()[0].get("balance", 0))
    except Exception:
        pass
    return {"citizens": citizens, "treasury_balance": treasury, "ts": db._now()}


@app.get("/volunteers")
def list_volunteers(x_api_key: str | None = Header(default=None)):
    _require_key(x_api_key)
    with db.get_db() as conn:
        rows = conn.execute("SELECT * FROM volunteers ORDER BY id").fetchall()
    return {"volunteers": [db.row_to_dict(r) for r in rows]}


@app.patch("/volunteers/{vid}")
def update_volunteer(vid: int, update: VolunteerUpdate, x_api_key: str | None = Header(default=None)):
    _require_key(x_api_key)
    fields = {k: v for k, v in update.model_dump().items() if v is not None}
    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    sets = ", ".join(f"{k}=?" for k in fields)
    with db.get_db() as conn:
        cur = conn.execute(
            f"UPDATE volunteers SET {sets} WHERE id=?",
            (*fields.values(), vid),
        )
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Volunteer not found")
        row = conn.execute("SELECT * FROM volunteers WHERE id=?", (vid,)).fetchone()
    return {"ok": True, "volunteer": db.row_to_dict(row)}
