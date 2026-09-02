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

### Phase 1 — Fix CI + typecheck script
- [ ] Add `typecheck` script to package.json
- [ ] Rewrite ci.yml to use npm and target milyfe-platform
- [ ] Make lint run non-interactively (committed eslint config)
- [ ] Success: `npm run typecheck && npm run lint && npm test && npm run build` all pass locally

### Phase 2 — Validation + audit logging
- [ ] Add Zod validation to state-mutating API routes lacking it
- [ ] Ensure audit logging on privileged/service-role mutations
- [ ] Success: typecheck + tests still green

### Phase 3 — Test coverage on critical paths
- [ ] Tests for cron auth, CSRF/withAuth logic, rate-limit
- [ ] Crypto roundtrip tests (encrypt/decrypt, wrong passphrase fails)
- [ ] Validation schema tests
- [ ] Success: suite green, meaningfully higher coverage on security-critical code

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
