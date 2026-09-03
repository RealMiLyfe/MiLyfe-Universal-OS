# What's Left — Operational & Human Gates

**The feature build is done.** Everything scoped is coded, applied to the live
Supabase project (`uwozuhmiahytjwfmudia`), seeded, and green (build 120 pages,
60 tests pass). All on branch `feat/mijustice-phase1` / PR #13.

What remains is **not unbuilt features** — it's launch ops and real-world
commitments. Recorded here so nothing is lost between sessions.

## A. Operational (needed to run live — code-doable)
1. **Merge PR #13** into `main` (all work is on `feat/mijustice-phase1`).
2. **Register cron schedulers.** Routes exist but nothing calls them:
   `/api/cron/ubi`, `/api/cron/decay`, `/api/cron/stories-expire`,
   `/api/cron/proposals`, `/api/cron/timers`, `/api/cron/freshness`.
   Wire Vercel Cron (`vercel.json`) or GitHub Actions with `CRON_SECRET`.
   Without this: no UBI distribution, no standing decay, no story expiry.
3. **Deploy to a host + attach domain.** Currently localhost. Deploy (Vercel or
   self-host) with env vars; point domain.
4. **Meilisearch (optional).** Search works via Supabase text-search fallback;
   for fast/typo-tolerant search, run + index the Meilisearch instance.

## B. Human / legal gates (by design, not a gap)
5. **MiJustice filing generation** stays behind attorney sign-off (tables +
   review console built; a licensed FL attorney approves a template to enable it).
6. **Advisory board + partner/attorney onboarding** — recruit real people;
   directory + routing are built and waiting.
7. **Human translation review** before publishing legal content in
   Spanish / Haitian Creole.

## C. True external infrastructure (stubbed at the edge)
8. Live streaming servers, media transcoding (FFmpeg pipeline), native app
   binaries, live federation peers. In-app product is complete; these need real
   infra (LiveKit/Owncast, transcode farm, app stores) to scale.

## D. Nice-to-have polish (non-blocking)
9. Wire `rewardContribution` into vote + quest-complete server actions.
10. Broader automated test coverage for the new phases (quiz covered).

## Bottom line
Nothing left to *build* for the scoped vision. Remaining = merge + crons +
deploy + domain (ops) and attorney/board/translators (human gates).
