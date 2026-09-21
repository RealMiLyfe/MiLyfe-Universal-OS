## What does this PR do?

<!-- Brief description of the change -->

## Related Issues

<!-- Link issues: Fixes #123, Relates to #456 -->

## Security Checklist

- [ ] No secrets, keys, or credentials in this PR
- [ ] New API routes have rate limiting applied
- [ ] User inputs are validated with Zod
- [ ] Rich text is sanitized before storage
- [ ] RLS policies cover any new database operations

## Testing

- [ ] `npm run build` passes
- [ ] `npx tsc --noEmit` passes
- [ ] Tested on mobile viewport
- [ ] Dark mode verified

## Tree V1 additions (for milyfe-fresh/implementation PRs)

- [ ] `npm run rails-gate` passes from milyfe-fresh/implementation (no forbidden payment rails)
- [ ] Contract ref noted (C1–C12) or explained why none
- [ ] Rollback plan included
- [ ] Locked capabilities untouched (or unlock evidence linked)
- [ ] No claim that tests/approval replace security, legal, or pilot evidence
