# Release Checklist — Tree V1 (every release, no exceptions)

## Must be true before any release

- [ ] `npm run typecheck` clean (linked log)
- [ ] `npm test` green (linked report) — proves tested scope only
- [ ] `npm run rails-gate` PASS (no GoCardless/Whop/Stripe/Visa-MC code)
- [ ] `npm run build` green
- [ ] Locked capabilities still locked (L1–L10 verified in flags/bundles)
- [ ] No synthetic code paths reachable from real money/market/treasury flows
- [ ] Export + leave paths tested on the release candidate
- [ ] Accessibility spot-check (keyboard, screen reader, 200% text, reduced motion)
- [ ] Human steward sign-off recorded with receipt

## Must NEVER be claimed

- Tests passing = platform complete (false — proves tested scope only)
- Design approval = legal clearance (false — reviews pending, see LEGAL-REVIEW-REQUESTS.md)
- Design approval = production-ready (false — security/pilot evidence pending)
- Constitutional principle = authorization for regulated activity (false — gates stay)

## After release

- [ ] Evidence filed (logs, reports, receipts linked from Evidence Register)
- [ ] Rollback plan attached + drill date set
- [ ] Postmortem scheduled if any auto-halt fired
