# Vault — everything recovered, in one place

**Gathered:** 2026-09-13 · **88 files, ~987 KB** · **Scope:** the four surfaces only.

Committed to the repo on purpose. Artifacts written outside the git checkout get wiped between work sessions — the recovered originals had to be re-extracted twice before landing here. **Nothing worth keeping lives outside Git again.**

---

## What's here

### `milyfe/` — pointer only
The platform *is* this repo (`MiLyfe-Universal-OS`, `main` @ `32a8089`). Nothing to copy in. 91 route pages, 23 API routes, 70 components, 81 lib files, 28 Supabase migrations. MiJustice lives inside it — 20 justice route pages, 5 of them public in `(justice-public)` — not as a separate product.

### `mijaxx/` — 53 files
| Path | What it is | Provenance |
|---|---|---|
| `originals/blog.html` | **Genuine original.** 10,231 B. Your real News page — real nav, topbar, footer, class names, `#1e4a8a`, Atkinson Hyperlegible. | `root-repo-FULL.bundle` → `public_html/blog.html` |
| `originals/campaign.js` | **Genuine original.** 12,628 B. The real integration layer: `campaign-api.milyfe.fun`, `/petition/add`, `/petition/status`, `/intake/volunteer`, field names `signer_name`/`address`/`neighborhood`/`email`/`registered_voter`/`skills`, Listmonk list `7d05bab2-85e3-45ab-acf2-b0de27709188`. | same bundle → `public_html/js/campaign.js` |
| `live-rebuild/` | 18 files. What is actually serving on `mijaxx.fun` today — wget-mirrored 2026-09-09. Reconstruction, not original. | `milyfebackup` branch `arena/01a07f01-milyfebackup` → `sites/mijaxx/` |
| `recovery-documented/` | 9 files. A later reconstruction with line-by-line sourcing in `PROVENANCE.md`. | `MiLyfe-Platform-OS` branch `arena/01a09420-milyfe-platform-os` → `recovery/` |
| `writing/` | **22 documents, 1,025 lines. Your actual campaign copy source.** 11 chapters, `the-argument`, `the-numbers`, `the-human-story-full`, `the-platform-human`, `founding-ten`, `the-dates`, `zero-dollar-proof`, `the-story`. | `milyfebackup` → `RESCUE_ESSENTIALS/05_agent_knowledge/knowledge/external/` |
| `infra/mayor-site.conf` | The real nginx config that served both domains. Documents the docroot and host routing. | same bundle → `hyperbolic-time-chamber/config/nginx/` |
| `campaign_schema.sql` | **Schema only, 24 objects. No data.** | `campaign.db` |

### `getmilyfe/` — 8 files
The landing page as currently live. Reconstruction. No originals survived.

### `miforge/` — 25 files
MiForge source, `node_modules` excluded. Next.js app: Whop webhooks, Groq daily briefs, key rotation, onboarding, dashboard, status page.

---

## What was deliberately left out

| Item | Why | Where it still lives |
|---|---|---|
| `campaign.db` data | 24 `contacts` rows with **phone and email**; 1 petition signature with `signer_name`. Voter PII does not go in a public repo. Schema is in `mijaxx/campaign_schema.sql`. | `milyfebackup` (make it private) |
| `Campaign_Private/Strategy.md`, `Titan_Agent_System.md` | Private campaign strategy. | `milyfebackup` |
| `opposition-file-legacy.md`, `the-opponent.md` | Opposition research. Publishing this hands it to opponents. | `milyfebackup` |
| Time Chamber (217 files, 18 agents) | Out of scope for now. Not lost. | `root-repo-FULL.bundle` on GitHub — 842,702 bytes, sha `5303383`, 32 commits. Verified present. |
| Mastodon / Umami / Listmonk configs | Out of scope for now. | same bundle |

**If `milyfebackup` is still public, all of that is publicly readable.** Making it private is Phase 0 of `MASTER_BUILD_PLAN.md`.

---

## The three versions of mijaxx, and which is which

This is the thing that kept getting confused. They are not the same:

1. **`originals/`** — genuinely yours. 1 page. Use as the template.
2. **`live-rebuild/`** — what visitors see today. Someone else's words, your design.
3. **`recovery-documented/`** — another reconstruction, better sourced, still not yours.

The rebuild target is: **template from (1), copy from `writing/`, structure from (2).** Not any of them as-is.

---

*Verified: `git archive` from `root-repo-FULL.bundle`; `git ls-tree` on both `arena/*` branches; `sqlite3` schema dump of `campaign.db`; `gh api` confirmation that the bundle is intact on GitHub. File and byte counts re-checked after each move.*
