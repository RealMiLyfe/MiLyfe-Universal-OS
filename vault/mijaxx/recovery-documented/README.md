# recovery/ — restoring the real campaign site

## What this folder is

A rebuild of `mijaxx.fun` and `get.milyfe.fun` using **only text that already exists in
your own committed documents** — no invented marketing copy. See `PROVENANCE.md` for the
line-by-line source map, including a list of lines on the live site that have **no
source in any repo** and were therefore left out.

This lives in the `MiLyfe-Platform-OS` workspace because that is the session I have write
access to. **It belongs in `RealMiLyfe/MiLyfe-Universal-OS`**, replacing
`campaign-site/` from PR #27.

## The situation, precisely

Three different campaign sites exist. Two of them are in no version control at all.

| # | Site | Where it lives | In Git? |
|---|---|---|---|
| 1 | **The original** (pre-2026-09-08) | only the disk of `milyfe-brain` | ❌ **never committed** |
| 2 | The Sep-8 reconstruction (PR #27) | branch `arena/01a07f3f-milyfe-universal-os` | ✅ git only — never deployed |
| 3 | The generic one you built later | **live on both domains right now** | ❌ **not in any repo** |

Verified: `campaign-site/` appears in exactly 3 commits, all on 2026-09-08. Every PR ref
(`refs/pull/1..30`), every branch of all three repos, the orphan commit Vercel still
references, GitHub code search, Wayback Machine (0 captures) and archive.today (no
results) contain **nothing** of site #1 or site #3. GitHub Pages returns 404 on all three
repos, so nothing of yours has ever been served from GitHub.

## Recovering #1 or #3 — Cloudflare Pages deployment history (your chosen path)

Cloudflare keeps every Pages deployment, and each one has a **permanent** snapshot URL.
If a deployment predates 2026-09-08, that is a byte-exact copy of your real site.

1. Cloudflare dashboard → **Workers & Pages** → look for a Pages project (may be named
   `mijaxx`, `campaign`, `get-milyfe`, `milyfe`…). Also check
   **Workers & Pages → Overview** for *Workers*, since a tunnel+worker setup would show there.
2. Open it → **Deployments** tab. Read the dates. Anything before **Sep 7, 2026** is yours.
3. Click that deployment → **Versions / files** → open its preview URL, which looks like
   `https://<40-char-hash>.<project-name>.<your-subdomain>.pages.dev`
4. **Send me those URLs** — one per page, or just the root. I can fetch them from this
   workspace and rebuild `campaign-site/` from the actual files instead of from docs.
5. In that same deployment, **Actions → "Rollback"** instantly re-points `mijaxx.fun` at
   the old version, with no rebuild. That is the fastest route back to your real site.

Two other places worth 60 seconds:

- Cloudflare → your zone → **Caching → Cache Reserve / Always Online** — if either was on,
  Cloudflare holds its own copies of your pages.
- The `milyfe-brain` disk, when you can reach it. nginx served from a mounted folder on port
  8180; `docker inspect` on the nginx container shows the host path in its `Mounts`, and that
  path is your real site folder. Docs put your tree at `/home/milyfe/Documents/MiLyfe/`.

## Making it permanent so a dead PC can't take it down again

The original failure was architectural, not a code bug: those domains were served by nginx
**on your desktop**, with Cloudflare Tunnel only as a door. A tunnel hosts nothing. PC off =
site off.

Do this once the copy is settled:

1. Put `campaign-site/` on `main` of `MiLyfe-Universal-OS` (replacing PR #27's version).
2. Host the static site on **Cloudflare Pages or GitHub Pages** — real origin, free, no PC.
3. Cloudflare DNS: `mijaxx.fun`, `www.mijaxx.fun`, `get.milyfe.fun` → CNAME to that host.
   Remove the tunnel records. No ingress path may depend on `milyfe-brain` being awake.
4. Petition data cannot live in a SQLite file on a desktop again — it must be Cloudflare D1
   or Supabase, or it will be lost the next time hardware dies.

## Before any of this is published

- ⚠️ **Add a paid-for disclaimer.** Florida law requires proper "paid for by" attribution on
  campaign material. I did not write one because I cannot verify your committee name.
- The `— PAID-FOR DISCLAIMER NOT YET ADDED —` marker is in every footer here so this cannot
  be shipped by accident. Delete the marker only after you add the real line.
- Petition signatures collected before 2026-09-08 are **gone** unless `campaign.db` is
  recovered from the old disk. Counter starts at zero.
