# MiLyfe Platform — Enterprise Readiness Roadmap

Status tracking for closing the verified gaps between "works" and "enterprise-ready".
This document is grounded in what was actually verified against the codebase, not design docs.

## Baseline (verified 2026-09-02)

Passing today:
- `tsc --noEmit` — clean
- `next build` — completes, 40+ routes
- `vitest run` — 30/30 tests pass (2 test files)
- Supabase: 47 tables, RLS enabled on all 47, 106 policies
- Real auth wrapper (`withAuth`) with CSRF origin validation
- Tiered rate limiting (Upstash + in-memory fallback)
- Cron routes protected by `CRON_SECRET`
- Client-side AES-256-GCM safety journal encryption (PBKDF2 100k → AES-GCM)
- Active pre-commit secret hook (`core.hooksPath=.githooks`)
- TypeScript `strict: true`

Verified gaps (the actual blockers):
1. **CI is broken** — `.github/workflows/ci.yml` uses `pnpm` + a `typecheck` script that does not exist; app uses npm. Pipeline enforces nothing.
2. **Thin tests** — only 2 test files for 19 API routes incl. money movement (UBI, wallet).
3. **Inconsistent validation** — only 4 of 19 API routes use Zod.
4. **Audit logging gap** — audit helper called in only 1 route; 5 service-role cron jobs don't log.
5. **No observability** — no error capture / structured logging / alerting.
6. **Docs contradict reality** — wrong table counts (25 vs 47), references to non-existent files/versions.

## Phases

### Phase 0 — Roadmap + baseline (this doc)
- [x] Capture verified findings and success criteria

### Phase 1 — Fix CI + typecheck script (DONE)
- [x] Add `typecheck` script to package.json
- [x] Rewrite ci.yml to use npm and target milyfe-platform
- [x] Make lint run non-interactively (committed .eslintrc.json)
- [x] Success: typecheck + lint (0 errors) + test (30/30) + build all pass locally
- Note: platform CI also upgraded (added lint+test steps, pinned actions to v4)

### Phase 2 — Validation + audit logging (DONE)
- [x] **Fixed latent bug**: `audit_log` table was referenced by code but had NO migration — every audit insert was silently failing. Added migration `014_audit_log.sql` (append-only, RLS: own + admin read, service-role write).
- [x] Added Zod validation + rate limiting to `safety/contacts` (POST/DELETE) and `safety/timer/start`
- [x] Added audit logging to all 5 cron routes (ubi, decay, proposals, freshness, timers) and safety leave-now / deactivate
- [x] Success: typecheck 0, lint 0 errors, tests 30/30

### Phase 3 — Test coverage on critical paths (DONE)
- [x] cron auth tests (valid bearer/header, wrong token, missing, malformed, fail-closed when unset) — 7 tests
- [x] crypto roundtrip tests (encrypt/decrypt, random salt/IV, wrong-passphrase rejection, unicode, empty) — 6 tests
- [x] rate-limit tests (under/over limit, 429, identifier isolation, IP extraction) — 7 tests
- [x] Suite grew 30 -> 50 tests, all green
- Note: withAuth not unit-tested here because it imports next/headers (needs route-level/integration harness); its CSRF + auth logic is covered indirectly and remains a Phase-4+ integration candidate.

### Phase 4 — Observability + operational hardening (DONE)
- [x] `src/lib/observability/logger.ts`: structured single-line JSON logger + `captureError` with pluggable, Sentry-ready `registerErrorSink` (no hard dependency). LOG_LEVEL aware.
- [x] Wired `captureError`/`log` into cron routes (ubi RPC-fallback + 500 paths, decay, proposals) — previously errors were swallowed silently.
- [x] `GET /api/health` — unauthenticated up/down probe with DB connectivity check (200 ok / 503 degraded).
- [x] Documented LOG_LEVEL + Sentry sink in .env.local.example.
- [x] Added logger tests (5). Success: typecheck 0, lint 0, tests 55/55, build 0.

### Phase 5 — Reconcile docs + final verification (DONE)
- [x] Corrected README.md + ARCHITECTURE.md: "25 tables / 106 policies / 35 routes" -> accurate **48 tables · 108 RLS policies · 38 pages · 20 API routes · 14 migrations**.
- [x] Clarified DB setup: migrations are the source of truth (new-project-setup.sql was a stale 42-table snapshot).
- [x] Correction to my own earlier critique: **Next.js 16 DOES exist** (latest 16.3.4). POST_AUDIT_ACTIONS.md was accurate; left unchanged.
- [x] Final verification: typecheck 0, lint 0 errors, tests 55/55, build 0.

## Final Status: 100% — all phases complete

Numbers now reproducible from the repo:
- Tests: 55 passing (was 30)
- API routes: 20; pages: 38
- DB: 48 tables, 108 RLS policies, 14 migrations (added audit_log)
- CI: both workflows enforce typecheck + lint + test + build (were broken/partial)

## Progress Log
- 2026-09-02: Phase 0 started. Baseline captured.
- 2026-09-02: Phase 1 complete. Both CI workflows fixed; full pipeline green locally. Committed.
- 2026-09-02: Phase 2 complete. audit_log migration added (fixed silent-failure bug), validation + audit logging expanded. Committed.
- 2026-09-02: Phase 3 complete. Added 20 tests for crypto, cron auth, rate limiting (30 -> 50). Committed.
- 2026-09-02: Phase 4 complete. Structured logger + error capture + /api/health. Tests 50 -> 55. Committed.
- 2026-09-02: Phase 5 complete. Docs reconciled to real counts; final verify green. Roadmap 100%.

## Phase 6 — Dependency security + Next.js 16 upgrade (DONE, 2026-09-02)

Goal: make it work, secure, and optimal — not just "builds".

- Dependency vulnerabilities: **13 (1 critical, 6 high) -> 4 low**.
  - vitest 2 -> 4 removed the critical + dev-only vite/esbuild advisories.
  - Next.js 14 -> 16 + React 18 -> 19 removed the shipped-code Next/postcss highs.
  - Remaining 4 low are the `cookie` transitive dep under supabase; the only fix
    upgrades supabase to a version that reintroduces `never` type regressions, so
    supabase is pinned at the known-good 2.45.4 / 0.5.1.
- Breaking changes handled: async `cookies()` (createServerSupabase now async;
  await added at all 94 call sites / 52 files), `next lint` removal (moved to
  eslint 9 flat config), framer-motion bumped for React 19 peer support.
- Runtime verified against a running production server (Next 16.3.4):
  - `/` -> 200; `/api/health` -> 503 "degraded" with placeholder DB (probe works);
  - protected API -> 401; cron without/with-wrong secret -> 401; correct secret
    passes auth (500 only due to placeholder DB); CSRF/unauth POST rejected;
    security headers (HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy) present.
- Final gate (fresh `npm ci`): typecheck 0, lint 0 errors, tests 55/55, build 0.

Note/correction: Next.js 16 DOES exist (16.3.4 installed). My first-message claim
that "there is no Next.js 16" was based on stale knowledge and was wrong.
