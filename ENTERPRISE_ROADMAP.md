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

### Phase 4 — Observability + operational hardening
- [ ] Pluggable structured logger + error capture used by API/cron
- [ ] Health check endpoint
- [ ] Document required env vars
- [ ] Success: typecheck + tests green

### Phase 5 — Reconcile docs + final verification
- [ ] Fix incorrect status docs (table counts, bad versions, missing file refs)
- [ ] Full build + typecheck + lint + test
- [ ] Mark roadmap 100%

## Progress Log
- 2026-09-02: Phase 0 started. Baseline captured.
- 2026-09-02: Phase 1 complete. Both CI workflows fixed; full pipeline green locally. Committed.
- 2026-09-02: Phase 2 complete. audit_log migration added (fixed silent-failure bug), validation + audit logging expanded. Committed.
- 2026-09-02: Phase 3 complete. Added 20 tests for crypto, cron auth, rate limiting (30 -> 50). Committed.
