# RECOVERY — bringing the campaign domains back online (2026-09-08)

The host that ran the campaign infrastructure (`milyfe-brain`, your PC) failed.
Everything that only existed on that machine is affected:

| Domain | What it was | Status now |
|---|---|---|
| `milyfe.fun` / `www.milyfe.fun` | Next.js platform on **Vercel** | Not affected by the PC (verify: https://milyfe.fun) |
| `mijaxx.fun` / `www.mijaxx.fun` | Static campaign site via Cloudflare tunnel | **Rebuilt + in this repo** — needs new origin |
| `get.milyfe.fun` | Get MiLyfe landing via Cloudflare tunnel | **Rebuilt + in this repo** — needs new origin |
| `campaign-api.milyfe.fun` | FastAPI campaign API | **Rebuilt + in this repo** — needs new origin + **data note below** |
| `analytics.milyfe.fun` | Umami analytics | Not rebuilt yet (fresh start if wanted) |

**Good news first:** all the code is safe on GitHub. This repo now contains the
rebuilt campaign site (`campaign-site/`) and campaign API (`campaign-api/`) —
version-controlled for the first time, so they can never again be lost with a
dead PC.

**Data note (important):** the petition signatures and volunteer signups
collected before the PC died lived in a SQLite file *on the PC*
(`campaign.db`). That data does not exist in any repo. If the PC's disk is
ever recovered, copy that file in and restart the API — the schema is
unchanged. Until then, the counter starts at 0.

---

## Phase 1 — See it live right now (no action needed)

The rebuilt stack is running in this workspace with live previews:

| Service | Preview |
|---|---|
| Campaign site (mijaxx) | port **8180** preview |
| Get MiLyfe landing (get.milyfe) | port **8181** preview |
| Campaign API | port **8200** preview (or try `https://<8180-preview-host>/api/health` — same-origin proxy) |

Sign a test petition on the 8180 preview's "Get Involved" page to watch the
counter tick.

## Phase 2 — Make it permanent + free (two phone tasks, ~5 min)

### 2a. Enable GitHub Pages for the campaign site

1. GitHub → **RealMiLyfe / MiLyfe-Universal-OS** → **Settings** → **Pages**
2. Build and deployment → **Deploy from a branch** → branch `main`, folder **`/campaign-site`** → Save
3. Wait ~1 min. The site is at **`https://realmilyfe.github.io/MiLyfe-Universal-OS/`**
   (that subfolder is the site root — the `CNAME` file inside `campaign-site/`
   already declares `mijaxx.fun`, so once the DNS record exists, `mijaxx.fun`
   serves the same root).

   > If Pages is enabled on a branch other than `main`, that branch must
   > contain `campaign-site/` — merge the open PR first.

### 2b. Point Cloudflare at GitHub Pages

Cloudflare dashboard (works on the phone app) → **DNS** → zone `milyfe.fun`
(or `mijaxx.fun` if it's a separate zone) → edit these records:

| Hostname | Type | Target | Proxy |
|---|---|---|---|
| `mijaxx.fun` | CNAME | `realmilyfe.github.io` | Proxied (orange) ✅ |
| `www.mijaxx.fun` | CNAME | `realmilyfe.github.io` | Proxied (orange) ✅ |
| `get.milyfe.fun` | CNAME | `realmilyfe.github.io` | Proxied (orange) ✅ |
| `campaign-api.milyfe.fun` | CNAME | *(see Phase 3)* | Proxied (orange) |

Then, for `get.milyfe.fun` only, add a **Transform Rule** (dashboard →
**Rules → Transform Rules → Path Rewrite** → Create):

| Field | Value |
|---|---|
| Expression | `host eq "get.milyfe.fun"` |
| Rewrite path type | **Custom** |
| Expression (rewrite) | `"/MiLyfe-Universal-OS/campaign-site/get-root" + (if (uri.path ne "/") then uri.path else "/")` |

That makes `get.milyfe.fun/` serve the Get MiLyfe landing (whose files live
at `campaign-site/get-root/` on GitHub) while `mijaxx.fun/` serves the
campaign homepage.

> `www.mijaxx.fun` serves the same content as `mijaxx.fun` (both resolve to
> the site root). If you'd rather have www 301 → apex, use a Cloudflare
> Redirect Rule instead of the CNAME.

Result: **mijaxx.fun, www.mijaxx.fun, and get.milyfe.fun are live forever on
free GitHub Pages — zero servers, zero PC, zero dollars.**

## Phase 3 — The campaign API (pick one)

The API is stateful (petition signatures, volunteers), so it can't live on
GitHub Pages. Three options, in order of preference:

1. **Cloudflare Worker + D1** (recommended) — same account you already use,
   free tier is plenty, data in Cloudflare D1 (persistent). I can write and
   deploy the whole thing once you create an API token in the Cloudflare
   dashboard (Workers & Cloudflare One → API Tokens) and hand it to this
   workspace. As a bonus, with that token I can also update the DNS records
   for you in Phase 2b.
2. **Vercel + Supabase** — fold the campaign API into the platform as
   `/api/campaign/*` routes (milyfe.fun already runs on Vercel, Supabase is
   already your database). Petition data lives in Supabase (durable), no new
   infrastructure. Needs the Supabase tables created (one SQL script, I'll
   write it) and the Vercel project's GitHub connection to pick up the PR.
3. **Temporary: this workspace** — point `campaign-api.milyfe.fun` at the
   port-8200 preview host as a stopgap while 1 or 2 is set up. Works, but
   the counter data resets if this sandbox is recycled.

Either way, once the API origin is chosen, the campaign site's JS already
tries `https://campaign-api.milyfe.fun` first and falls back gracefully —
no site changes needed.

## Phase 4 — Analytics (optional)

`analytics.milyfe.fun` (Umami) was on the PC too. If you want it back, the
cleanest home is the same place as the API (Worker can't run Umami; Vercel +
Supabase can, or just start Umami fresh wherever the API lands). Old
analytics history was in the PC's database — same data note as above.

---

*Rebuild performed 2026-09-08 in the Arena workspace, branch
`arena/01a07f3f-milyfe-universal-os`. Site copy reconstructed from
`docs/planning/MiLyfe_Founder_Story.md`, `docs/planning/MiLyfe_Ultimate_Manual.md`,
`docs/LAUNCH_READINESS.md`, and `ARCHITECTURE.md` — verify the wording against
your memory of the live site and edit `campaign-site/*.html` directly; it's
plain HTML, no build step.*
