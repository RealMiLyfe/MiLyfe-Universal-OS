# 08 — Risk Register & Open Decisions

Risks are ranked by **severity × how soon it bites**, not by how alarming it sounds. Two of
these are live exposures today.

---

## Risk register

### R1 — DS-DE 9 not filed  ·  **EXISTENTIAL**  ·  *bites immediately*

`vault/mijaxx/writing/the-dates.md`, dated 2026-08-26, marks the DS-DE 9 filing **"OVERDUE."**
Under Fla. Stat. Ch. 106 no contribution may be accepted and **no expenditure made** before it
is filed. Any domain, hosting or printing already paid for needs review by the treasurer.

**Impact:** the campaign cannot lawfully raise or spend. Everything else in this plan is
downstream of it.
**Mitigation:** file before any other work item. § 02 G0.
**Owner:** founder + treasurer.

### R2 — In-kind mischaracterisation  ·  **CRITICAL**  ·  *criminal exposure*

If MiLyfe LLC provides hosting, seats, dev hours or the platform to the campaign for free,
that is an in-kind contribution at **fair market value**, counting against the **$1,000 per
election** cap for a countywide candidate (§ 106.08(1)(a)3, § 106.055). A Next.js platform with
a design system clears $1,000 in an afternoon.

**Penalties:** knowing and willful violation is a **first-degree misdemeanor**, corporate fine
$1,000–$10,000. Two or more violations: **third-degree felony**, corporate fine $10,000–$50,000.

**The carve-out:** § 106.011(5) excludes *"services... provided without compensation by
individuals volunteering a portion or all of their time."* The founder's own unpaid labour is
exempt; the company's donated product is not.

**Mitigation:** § 05.2 — campaign surface built and hosted by the founder as an individual
volunteer, on free-tier infrastructure the company does not fund. Keep a dated record of
unpaid work.
⚖️ **Attorney confirmation required before launch.** This is the one item in this document
where being wrong is a criminal matter rather than an expensive one.

### R3 — Petition falls short  ·  **CRITICAL**  ·  *2026-12-14, noon*

**7,417 valid signatures in 91 days = 82/day valid, ~130/day raw.** That is a professional
field operation, and it is the whole campaign.

**Mitigation:** the fee route. **$10,904.16 non-partisan** (SOE sheet; *"to be updated October
2026"*) buys the ballot line without a single signature. MiForge's founding cohort grosses
$58,800 — five times the fee.
**Decision date: 2026-11-30.** Fixed, because the fee is the fallback and the petition cannot
be abandoned on December 13. § 06.5.

### R4 — Voter data commingled with commercial data  ·  **CRITICAL**  ·  *reputational, unrecoverable*

The campaign's own attack line — *"REV grants to developers $15–40M/year... Donor-incentive
correlation: documented in public records"* — is the exact pattern MiForge would create if
founding-seat buyers later seek city incentives **and** the two contact lists were ever joined.

**Mitigation:** the four firewall rules in § 05.1. Separate stores, no shared PII keys,
separate consent, no cross-domain messaging. Plus the MiForge FAQ line: *"Your seat is not a
donation and buys no political access."*
**Note:** this is designed in, not added later. Once the data is joined it cannot be un-joined
credibly.

### R5 — Public backup repo exposes citizen data and opposition research  ·  **HIGH**  ·  *live now*

`milyfebackup` is **public** and contains:

- `05_agent_knowledge/data/campaign.db` — `contacts` table with **24 rows of citizen phone
  numbers and email addresses**
- `Campaign_Private/{Strategy.md, Titan_Agent_System.md}`
- `knowledge/external/{opposition-file-legacy.md, the-opponent.md}` — **research on a private
  individual**
- `root-repo-FULL.bundle` with `MATTERMOST_PASSWORD:-VentureTitan2026` in commits `d5047f7`,
  `036841c`, `68bac81` — purged from HEAD, **permanent in history**

**Mitigation:** make private or delete today. Then rotate the Mattermost credential — assume
compromised. Then § 07.5.
This is the cheapest high-severity fix in the entire plan and it takes one click.

### R6 — Signup state on production is unverified  ·  **HIGH**  ·  *live now*

The UI flag is implemented and unset (closed). **But whether Supabase's "Allow new users to
sign up" is off has not been checked.** Since `signUp()` runs in the browser, the UI gate alone
does not prevent signups — it only hides the form.

**Mitigation:** verify the Supabase toggle. Both halves are required (§ 07.4).
**Also unverified:** whether Vercel env vars and Supabase connectivity still work. Nothing has
deployed since 2026-09-03.

### R7 — Single point of failure  ·  **HIGH**  ·  *proven four times*

One founder, no second computer, working from a phone. The project has already lost a PC to
sale and three sandbox resets in the current session alone.

**Mitigation:** § 07.1 — everything recoverable lives off-device. Commit and push continuously.
§ 07.6 backup cadence. Static sites where possible, because they have no process to crash.
**The platform survived and the campaign site did not for exactly one reason: the platform's
source was committed.**

### R8 — Pro tier unit economics  ·  **HIGH**  ·  *before seat 201*

The vault copy promises *"Partner Starter Tier Included ($299/month fee waived)."* Across 200
Pro seats that is **$717,600/yr waived** against **$19,800/yr revenue**. Break-even is a
delivery cost of **$99 per seat per year**.

**Mitigation:** scope the waiver to 12 months before the first Pro seat sells (§ 3.3 option A).
A price locked "forever" cannot be re-scoped afterwards without breaking the promise the page
is built on.

### R9 — Disclaimer non-compliant  ·  **MEDIUM**  ·  *before mijaxx.fun goes live*

The surviving original's string — repeated 19 times across `vault/` — is
`Paid for by Mayor MiLyfe for Jacksonville 2027`. Against § 106.143(1)(a) it fails three ways:
*"Paid for by"* instead of **"Paid by"**; a **brand** where the statute requires the
candidate's name; and **no party affiliation**.

§ 106.143(6) separately prohibits **"re-elect"** for a non-incumbent and requires **"for"**
between name and office.

**Mitigation:** the replacement text in § 02 G0. **Blocked on D5** — the candidate's legal name
and filed affiliation. Only "Carnell" appears as a personal name anywhere in the recovered
corpus; the full name is not in the workspace.

### R10 — Generic content is the campaign's live public face  ·  **MEDIUM**  ·  *live now*

`mijaxx.fun` and `get.milyfe.fun` are serving pages the founder has rejected outright:
*"Those are generic. I don't want that generic stuff. I want my real stuff."* They carry the
correct statutory countdowns but collect `name`/`email` where the original collected
`signer_name`, `address`, `neighborhood`, `email`, `registered_voter` — the field mismatch is
proof they are not the original.

**Mitigation:** replace with § 3.1 and § 3.2. Every day they are up they are the campaign's
face.

### R11 — Platform dark through the primary  ·  **MEDIUM**  ·  *2027-03-09*

Taking the 1,200 rule literally could keep `milyfe.fun` closed through the primary — the
largest concentration of free public attention this name will ever receive.

**Mitigation:** § 08 **D1**. The capped-cohort design keeps forge-first true without going dark.

### R12 — Domain confusion  ·  **LOW**  ·  *ongoing*

`getmilyfe.com` is **not ours**. Any flyer or QR code that says "getmilyfe" without the TLD
sends traffic to someone else's property.

**Mitigation:** printed and spoken calls to action always use full URLs — `mijaxx.fun`,
`get.milyfe.fun`. Never bare brand words.

---

## Open decisions

Nine, ranked. **D1 and D2 block build.**

### D1 — What is the 1,200 gate protecting?  ·  **BLOCKS BUILD**

The stated rule is *signups open after MiForge fills 1,200.* Taken literally against the
statutory calendar, that can hold the platform closed through the primary.

| If it protects… | The gate should be… | Signups open when… |
|---|---|---|
| Revenue | A revenue threshold | $58,800 collected |
| Proof of model | 200 Pro seats | Pro full, Daily later |
| Support capacity | An ops-readiness check | Support and moderation staffed |

**Recommended: the capped opening.** MiForge founding seats sell first and stay exclusive;
`milyfe.fun` opens to a capped, waitlist-drawn, Jacksonville-residents-only founding-citizen
cohort during the campaign. Forge-first stays true, campaign traffic is not discarded, and
scarcity — which MiForge is already built on — becomes the platform's mechanism rather than a
wall.

### D2 — Who funds the campaign site, and in whose name?  ·  **BLOCKS BUILD**

Determines the hosting choice, the disclaimer text, and whether the company may touch it at
all. **Recommended:** the founder, personally, as an unpaid volunteer, on free-tier static
hosting the company does not fund (§ 05.2). ⚖️ Attorney confirmation required.

### D3 — Petition or fee?

Decided by run-rate, not preference. **Checkpoint 2026-11-30.** Fee = $10,904.16
non-partisan. § 06.5.

### D4 — Where does MiForge live?

A separate Vercel project, or folded into the platform? Folding creates one auth and one
design system but puts commercial leads inside the platform database — adjacent to, though not
joined with, platform users. **Recommended: separate project now, revisit after launch.**

### D5 — Candidate's legal name and party affiliation

Required for a compliant disclaimer (§ 106.143) and for DS-DE 84. **Not in the workspace.**
Only "Carnell" appears in the recovered corpus (8 occurrences). Blocks R9.

### D6 — Does the exFAT backup drive still exist?

`MANIFEST.sha256` records **61 stripped files — 8 secrets/env + 53 database-state.** If the
drive survives, the 8 env files are on it and the rotation in § 07.5 has a reference copy. If
it does not, every secret is reconstructed from the services themselves.

### D7 — Which self-hosted services return?

The original stack ran nginx-in-Docker behind a Cloudflare Tunnel on the sold PC.
`campaign-api.milyfe.fun` still returns *"cloudflared is not running."* **Recommended: none of
them.** Everything in this plan is static, managed, or on the platform. That tunnel is how the
campaign site was lost.

### D8 — i18n scope for auth pages

The platform supports 14 languages via `t.common.*`. `(auth)/signup` and `(auth)/login` have **zero `t.common.*` calls** — English only, where the homepage has 2. Accepted for this launch; log the debt.

### D9 — What replaces `campaign-api`?

The petition-intake endpoints (`/petition/add`, `/petition/status`, `/intake/volunteer`) and
the Listmonk list `7d05bab2-85e3-45ab-acf2-b0de27709188` are referenced by the surviving
`campaign.js`. **Recommended:** a static form endpoint writing to a store isolated from the
platform (§ 05 Rule 2, § 07.2) — not a rebuilt API.

---

## What is genuinely ready to build

Once D1, D2 and D5 are answered:

- [ ] **G0** — DS-DE 9, DS-DE 84, DS-DE 104 sheets, corrected disclaimer, funding memo
- [ ] **`mijaxx.fun`** — § 3.1, static, volunteer-built, free hosting
- [ ] **`get.milyfe.fun`** — § 3.2, static, two-field waitlist
- [ ] **MiForge** — § 3.3, after the Pro waiver is scoped
- [ ] **`tokens.css`** + Atkinson Hyperlegible self-hosted — § 4.5
- [ ] **Supabase signup toggle** — verified off (§ 07.4)
- [ ] **`milyfebackup`** — made private or deleted (R5)
- [ ] **Key rotation** — § 07.5, in order

**91 days to the petition deadline.** Everything above is in service of that number.
