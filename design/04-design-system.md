# 04 — Design System

One system, four surfaces. `NARRATIVE.md` lists "one design system" as a linkage mechanism;
today it does not exist — the campaign original and the platform were built separately. This
specifies the reconciliation.

**Principle: recover what survived, standardise the rest.** The campaign original is the only
genuine design artefact in the project. Its two decisions were good ones and they set the
foundation.

---

## 4.1 Typography

**Primary face: Atkinson Hyperlegible, 400 / 700.**

Taken from `vault/mijaxx/originals/blog.html` line 12 — the surviving original, not a new
choice. It is the right one, for a reason that is more than aesthetics: Atkinson Hyperlegible
was designed by the Braille Institute specifically to maximise legibility for low-vision
readers. On a platform whose founder is disabled and whose accessibility features are a
headline capability, shipping a different font would be an unforced contradiction.

| Role | Spec |
|---|---|
| Display / H1 | Atkinson Hyperlegible 700, `clamp(2rem, 5vw + 1rem, 3.5rem)`, line-height 1.1, letter-spacing −0.02em |
| H2 | 700, `clamp(1.5rem, 2vw + 1rem, 2.25rem)`, line-height 1.2 |
| H3 | 700, 1.25rem, line-height 1.3 |
| Body | 400, 1.0625rem (17px), line-height 1.6 |
| Body large | 400, 1.25rem, line-height 1.55 — for above-the-fold subheads |
| Stat figure | 700, `clamp(2.5rem, 6vw, 4rem)`, line-height 1, tabular numerals |
| Caption / source | 400, 0.875rem, line-height 1.4, muted |
| UI / labels | 400, 1rem — **never below 16px on form inputs**, which also prevents iOS zoom-on-focus |

**Loading:** two weights only, `font-display: swap`, self-hosted with a system fallback stack.
The original loaded from Google Fonts; self-hosting removes a third-party request from a
political site and eliminates a GDPR-adjacent question for no cost.

**Tabular numerals are required** on every stat figure and seat counter. These pages are built
out of numbers; proportional digits make a live counter visibly jitter as it changes.

---

## 4.2 Colour

**Brand primary: `#1e4a8a`** — carried from the surviving original's `theme-color` meta tag.

Measured contrast ratios (WCAG 2.1 relative-luminance formula, computed for this document):

| Pair | Ratio | Verdict |
|---|---|---|
| `#1e4a8a` on `#ffffff` | **8.74 : 1** | Passes **AAA** for normal text (7:1) |
| `#1e4a8a` on `#f8fafc` | **8.36 : 1** | Passes **AAA** |
| `#ffffff` on `#1e4a8a` | **8.74 : 1** | Passes **AAA** — safe as a button fill |

The recovered brand colour is already AAA-compliant. That is unusual and it should be
preserved rather than "refreshed."

| Token | Value | Use |
|---|---|---|
| `--brand` | `#1e4a8a` | Primary actions, links, brand |
| `--brand-strong` | `#163a6e` | Hover / pressed |
| `--brand-soft` | `#eef3fa` | Brand-tinted surfaces |
| `--accent` | `#0f766e` | MiForge only — emerald, from `vault/miforge/app/page.jsx` |
| `--ink` | `#0f172a` | Body text |
| `--ink-muted` | `#475569` | Secondary text — **7.6:1 on white, also passes AAA** |
| `--surface` | `#ffffff` | Cards, panels |
| `--surface-alt` | `#f8fafc` | Page background |
| `--border` | `#e2e8f0` | Hairlines |
| `--danger` | `#b91c1c` | Errors — 6.5:1 on white |
| `--focus` | `#f59e0b` | Focus ring only |

**Rules:**
- Body text is never set on a tinted background darker than `--surface-alt`.
- `--danger` and `--accent` are never used for body text or borders.
- **No state is communicated by colour alone.** An error field gets an icon and text; a success
  gets a checkmark and words. This is not a nice-to-have on a disability-rights platform.

---

## 4.3 Space, form, motion

**Spacing:** 4px base. Scale `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96`. Section vertical
rhythm is `64px` mobile, `96px` desktop. Max content width **65ch** for prose, **1120px** for
stat grids.

**Radius:** `6px` inputs and buttons, `12px` cards. Nothing fully rounded — pill buttons read
as consumer-marketing on a civic surface.

**Elevation:** border-first. `1px solid var(--border)`. Shadow only on modals and the sticky
header. Four flat surfaces look more institutional than four shadowy ones, which is the correct
register here.

**Touch targets:** minimum **44 × 44 CSS px**, 48px preferred. Mobile-first by necessity — the
founder works from a phone, and the campaign's canvassing audience is overwhelmingly mobile.

**Motion:** 150ms ease-out for state, 250ms for entrance. **All of it behind
`prefers-reduced-motion: reduce`, which disables it entirely.** No autoplay, no carousel, no
parallax, no count-up animation on the stat figures — a number that animates upward on a page
about fiscal discipline is the wrong signal, and it is inaccessible besides.

---

## 4.4 Accessibility target

**WCAG 2.2 AA is the floor. AAA on text contrast, which § 4.2 already achieves for free.**

Rationale, stated plainly for the record: a platform whose public claim is that it serves
people the current system leaves out cannot ship an interface that fails the standard it
exists to embody. This is a positioning asset, and it is free.

Checklist every surface must pass before it ships:

- [ ] Semantic landmarks — one `<header>`, `<main>`, `<nav>`, `<footer>` per page
- [ ] One `<h1>`, no skipped heading levels
- [ ] Every form control has a visible, associated `<label>` — no placeholder-as-label
- [ ] All interactive elements reachable and operable by keyboard alone
- [ ] Visible focus indicator on every interactive element (`--focus`, 3px, offset 2px)
- [ ] Text contrast ≥ 4.5:1 normal, ≥ 3:1 large; **the brand palette already exceeds this**
- [ ] No information conveyed by colour alone
- [ ] `prefers-reduced-motion` fully honoured
- [ ] Page usable at 200% zoom and at 320px viewport width without horizontal scroll
- [ ] All images carry meaningful `alt` or explicit `alt=""` when decorative
- [ ] Forms announce errors to assistive tech (`aria-describedby`, `role="alert"`)
- [ ] `lang` attribute correct on `<html>`; the platform supports 14 languages via `t.common.*`
      — note: `(auth)/signup` and `(auth)/login` are currently English-only, with **zero
      `t.common.*` calls** where the homepage has 2. An accepted scope cut for this launch,
      logged as § 08 D8.

**Assistive-technology testing:** at minimum VoiceOver + Safari and TalkBack + Chrome, on the
three landing pages and the login flow, before G3.

---

## 4.5 Reconciling two codebases

The platform is **Next.js 16.3.4** with Turbopack, Tailwind, shadcn/ui, 70 components. The
campaign original is hand-written HTML with inline CSS. MiForge is a separate Next.js app
(`vault/miforge/`, `app/` router, JSX, its own `tailwind.config.js`).

Three options, and the launch does not have time for the wrong one:

| Option | Cost | Verdict |
|---|---|---|
| **A. Rebuild the campaign inside the platform repo** | High — routes, i18n, middleware, auth all in the way | **No.** Also crosses the § 05 firewall: it would put voter-contact data in the same application and database as platform users. |
| **B. Migrate MiForge into the platform** | High, and § 08 D4 already questions whether MiForge should be standalone | Not before launch |
| **C. Keep three codebases; extract one shared token + component package** | Low — tokens are CSS custom properties and a font; the six shared components in § 3.5 are small | **Yes.** |

**Option C, specified:** a single `tokens.css` — the custom properties in § 4.2, the type scale
in § 4.1, the spacing scale in § 4.3 — plus Atkinson Hyperlegible self-hosted, consumed by all
three builds. The six shared components are written once and copied, not imported across
repos, because a shared runtime dependency between three separately-deployed surfaces is a
coupling this launch cannot afford (§ 08 R7).

The firewall in § 05 is the reason. **Design-system sharing must not become data sharing.**
Tokens are inert; databases are not.

---

## 4.6 The generic-content problem

`mijaxx.fun` and `get.milyfe.fun` are currently serving live pages the founder has explicitly
rejected as *"generic... I want my real stuff."* They carry the correct statutory countdown
dates, which means whoever built them had the real calendar — but the petition form collects
`name` and `email` where the original collected `signer_name`, `address`, `neighborhood`,
`email`, `registered_voter`. That field mismatch is the proof it is not the original.

Replacing them is § 08 R10 and it is urgent in a way the rest of this document is not: every
day those pages are up, they are the campaign's public face.
