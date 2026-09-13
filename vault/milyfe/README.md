# MiLyfe — the platform

**This folder is a pointer. The platform *is* this repo.**

Nothing to copy in — `MiLyfe-Universal-OS` at `main` (`32a8089`) is the platform itself.

| | |
|---|---|
| Route pages | 91 |
| API routes | 23 |
| Components | 70 |
| Lib files | 81 |
| Supabase migrations | 28 |
| Route groups | `(auth)`, `(platform)`, `(justice-public)` |

**MiJustice is not a separate product.** It lives inside the platform — 20 justice route pages in total, of which 5 sit in the public `(justice-public)` group and the rest behind auth in `(platform)`. Plus `src/components/justice/` (2 files), `src/lib/justice/` (8 files), and migrations `015_justice_schema.sql` and `016_justice_expansion.sql`.

**Deployed:** Vercel project `milyfe-v1`, account `iamcarnells-projects`. Last production deploy `32a8089` on 2026-09-03, `state=success`. Live at `milyfe.fun`.

**Note on history:** `main` is a single squashed commit (`32a8089`, no parent). The full 75-commit development history survives on `feat/mijustice-phase1` (PR #13, open). That is fine — a squashed `main` is exactly what "fresh start" means — but the old history is on that branch if you ever need it.

See `../../NARRATIVE.md` for what this surface does in the funnel.
