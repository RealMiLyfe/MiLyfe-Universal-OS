# MiLyfe — One Narrative, Four Surfaces

**Written:** 2026-09-13 · **Scope:** `milyfe.fun`, `mijaxx.fun`, `get.milyfe.fun`, MiForge. Nothing else for now.

---

## The one sentence

> **Add value. Get your share. Govern your street. And the system still works after anyone leaves.**

Every page on every one of the four surfaces either proves that sentence or asks the reader to take one step toward it. If a page does neither, it doesn't ship.

---

## Why four surfaces and not four products

They are not four products. They are **one thing seen from four distances.** Same story, same voice, same design, same `Mi` family. A visitor should be able to land on any one of them and feel they walked into the same room.

The only thing that changes is **how close they're standing.**

```
      far ───────────────────────────────────────────────► close

  get.milyfe.fun      mijaxx.fun         milyfe.fun          MiForge
  ──────────────      ──────────         ──────────          ───────
  "What is this?"     "Who is behind     "I'll live it."     "I'll build
                       this, and why                           with it."
                       should I trust
                       him?"

     stranger            skeptic            citizen            partner
```

---

## Each surface: one job, one exit

| Surface | Audience | The one job | The one exit |
|---|---|---|---|
| **get.milyfe.fun** | Stranger. Heard the name somewhere. | Explain it in 30 seconds. No jargon, no crypto talk, no roadmap. | → `mijaxx.fun` (who) or `milyfe.fun` (join) |
| **mijaxx.fun** | Skeptic. Wants the man and the receipts. | Tell the whole story first — the record, the numbers, the argument. Then ask for a signature. | → sign the petition, or → `milyfe.fun` (join) |
| **milyfe.fun** | Citizen. Ready to participate. | Be the actual platform. Earn, learn, vote, connect. MiJustice lives inside it. | → `miforge` (build a business) |
| **MiForge** | Partner. Runs a business. | Bookkeeping, daily reports, matched community credits. The economy arm. | → `milyfe.fun` (the platform it lives inside) |

**The rule:** every exit points *forward* — closer in. Never sideways, never backward. Nobody loops.

---

## The funnel, concretely

```
                        ┌──────────────────┐
                        │  get.milyfe.fun  │  what is this
                        └────┬────────┬────┘
              who's behind it│        │just let me in
                             ▼        │
                   ┌──────────────┐   │
                   │  mijaxx.fun  │   │  the man, the record, the argument
                   └──────┬───────┘   │
                  sign ───┤           │
                          ▼           ▼
                     ┌────────────────────┐
                     │     milyfe.fun     │  join as a citizen — the platform
                     └─────────┬──────────┘
                    run a      │
                    business   ▼
                        ┌──────────┐
                        │ MiForge  │  the economy arm
                        └────┬─────┘
                             │  "built inside MiLyfe"
                             └────────► back to milyfe.fun
```

One door, one proof, one platform, one economy. That's the whole machine.

---

## Shared identity — taken from your real site, not invented

These come from the genuine `public_html/blog.html` recovered from the PC backup (`vault/mijaxx/originals/`):

| Element | Value | Source |
|---|---|---|
| Primary color | `#1e4a8a` | `theme-color` meta, real `blog.html` |
| Type | **Atkinson Hyperlegible** 400/700 | real `blog.html`, line 12 |
| Standing line | **We The People** | real `brand-slogan` |
| Topbar left | `Jacksonville, Florida — The Entire City` | real `blog.html` |
| Topbar right | `Paid for by Mayor MiLyfe for Jacksonville 2027` | real `blog.html` |
| Campaign nav | Home · Journey · Platform · Our Promise · Get Involved · News · Contact | real `blog.html` |
| Brand stack | `Mayor` / `Jacksonville 2027` / `We The People` | real `brand-name` / `brand-tag` / `brand-slogan` |

**Use these everywhere.** The accessibility font is not an accident — Atkinson Hyperlegible is designed for low-vision readers. That's a values signal, keep it.

### Naming: one family, one prefix

From your own writing, the `Mi` system already exists: **MiLyfe · MiJaxx · MiForge · MiCity · MiStory · MiSafety · MiMarket · MiConstitution · MiVault · MiGlass · MiCircle · MiVoice · MiLearn.**

`MiJaxx` is not a second brand. It is **MiLyfe's Jacksonville campaign face.** Same for MiForge — its own copy already says it: *"MiForge is built inside MiLyfe — starting in Jacksonville, FL through the MiJaxx mayoral initiative."* That sentence is the whole relationship, already written.

---

## One voice — five rules, all from your own writing

1. **Plain speech.** No "blockchain-enabled decentralized governance." Say "help a neighbor, it counts."
2. **Disclose first.** *"You can't attack a man who told you everything."* The record goes up front, not buried.
3. **Numbers over adjectives.** ~$5.3B a year. 52–55% on reaction, 3–4% on prevention. 11 years. $0. 1,000 signatures by Dec 14.
4. **No party line.** *"Willing people from any party can help in office."* Anyone who wants to help is welcome; the office executes, the people keep the power.
5. **The exit line.** *"A system that still works after anyone leaves."* It closes pages. It's the promise and the proof in one sentence.

---

## What each surface must NOT do

Boundaries matter more than features. This is how four surfaces stay one thing:

- **get.milyfe.fun** — no roadmap, no tech, no token economics. Thirty seconds, then out.
- **mijaxx.fun** — no platform feature tour. It's the *argument* and the *man*. The platform is the proof, linked, not described.
- **milyfe.fun** — no campaign fundraising. It's the civic platform. The ballot lives at mijaxx.
- **MiForge** — no civic governance. It's commerce. The governance lives at milyfe.

---

## The state of each surface right now

| Surface | Live? | Source in Git? | Reality |
|---|---|---|---|
| `milyfe.fun` | **Yes** — Vercel, deployed from `main` @ `32a8089` on 2026-09-03, `state=success` | **Yes** — 91 route pages, 23 API routes, 28 migrations | **Healthy. This is the anchor.** |
| `mijaxx.fun` | Yes — but a reconstruction, on Vercel | Only 1 of 9 original pages survived | Real template recovered, 8 pages need your words |
| `get.milyfe.fun` | Yes — reconstruction, on Vercel | No originals | Needs rebuild |
| MiForge | Not on a domain | Yes — `miforge-app`, 25 source files | Built, not launched |

**One pipeline, one host.** The lesson from losing mijaxx: the platform survived because its source was in Git and Vercel deployed it. The campaign site died because it lived in an untracked folder on a PC. So all four surfaces end up deploying from **one repo through one pipeline** — the one that already works.

---

## What "linked" means in practice

Not a logo swap. Five concrete things:

1. **Shared header and footer** across all four — same brand stack, same nav logic, same topbar.
2. **Forward-only CTAs** — every surface has exactly one primary action, and it points closer in.
3. **One design system** — `#1e4a8a`, Atkinson Hyperlegible, the real class vocabulary from `blog.html`.
4. **One auth** — a MiLyfe citizen is already a MiLyfe citizen on MiForge. No second signup.
5. **One deploy** — the trunk repo, Vercel, one pipeline.

---

## Order of work

1. **`mijaxx.fun`** — furthest gone, and the petition deadline is **2026-12-14 (92 days out)**.
2. **The campaign API** — the signature counter is dead. It folds into the platform so signatures land in the same durable database as everything else.
3. **`get.milyfe.fun`** — one page, after the design system is settled.
4. **MiForge** — fold in or link, then launch.

Fresh database, kept code, rotated keys — see `MASTER_BUILD_PLAN.md`.

---

*Every identity value above was read from `vault/mijaxx/originals/blog.html`, the genuine page recovered from `root-repo-FULL.bundle`. Deployment facts from `gh api` records on `RealMiLyfe/MiLyfe-Universal-OS`. Voice quotes from `vault/mijaxx/writing/`.*
