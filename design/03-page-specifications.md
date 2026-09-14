# 03 — Page Specifications

Four pages. Each is **one screen of intent plus one form** — the brief was *simple*, and simple
is the right call for a 91-day runway. What follows specifies them properly: purpose, content,
copy, states, accessibility, and what is deliberately absent.

Shared across all four: header, footer, tokens and components per § 04. One design system,
four surfaces.

---

## 3.1 `mijaxx.fun` — the campaign landing

**Audience:** Jacksonville voter, sceptical.
**Job:** prove competence with numbers, then recruit a canvasser.
**Primary action:** *Request a petition packet* / *Volunteer to canvas*.
**Length:** one screen + four short sections.

### Above the fold

- **Kicker:** `Jacksonville, Florida — The Entire City`  *(carried from the surviving original)*
- **H1:** `Jacksonville spends $5.3 billion a year. 70 cents of every dollar is spoken for before the budget starts.`
- **Sub:** `I'm [CANDIDATE NAME], and I'm running for Mayor. Not on vibes — on the numbers.`
- **Primary CTA:** `Request a petition packet`
- **Secondary CTA:** `See the numbers`
- **Brand lockup:** `Mayor MiLyfe` / `We The People` / `Jacksonville 2027`
  *(brand, kept separate from the legal disclaimer — see § 02 G0)*

The H1 is a fact from `the-numbers.md` (`Total city budget: ~$5.3 Billion/year`;
`Pre-committed spending ~70 cents of every dollar`). Every figure on this page traces to a
line in that document or to a cited source in it. Nothing invented.

### Section 1 — The Numbers

Four to six stat cards, each with a figure and a one-line source. Drawn from
`the-numbers.md`, all already sourced there:

| Figure | Source line |
|---|---|
| `+80%` median home price 2015–2024 vs `+32%` wages | Chapter 3 |
| `47–52%` of renters cost-burdened | Chapter 3 |
| `1.7–1.8` JSO officers per 1,000 (national target 2.2+) | Chapter 4 |
| `55,000–65,000` active septic tanks; 50+ years at current pace | Chapter 5 |
| `$2.9–3.2B` pension unfunded liability | Chapter 2 |
| `11–13` JTA trips per capita per year | Chapter 7 |

Each card links to a full explainer. The explainer pages are out of scope for this launch; the
cards are not, and they are the page's main persuasive load.

### Section 2 — Concede, then contrast

One short paragraph acknowledging what the current administration has genuinely done, from the
*Deegan Administration Claims* block of `the-numbers.md` — zero draws from reserves two years
running, new fire stations, permitting reform funded. Then the contrast.

This is the single highest-leverage paragraph on the site. § 01 voice rule 4 exists because the
corpus already does it, and it is what separates this from a generic attack page.

### Section 3 — The petition, honestly

**H2:** `7,417 signatures. 91 days.`

Plain-language explanation that Florida petitions are signed **on paper, in person**, that the
Supervisor of Elections verifies every one, and that the deadline is **noon, December 14,
2026**.

**The form asks for:** name, email, ZIP code, neighbourhood, and *"Are you a registered Duval
County voter?"* — the same fields the original `campaign.js` collected (`signer_name`,
`address`, `neighborhood`, `email`, `registered_voter`), minus the street address, which is not
needed to mail a packet and is a data liability (§ 05).

**The form's stated purpose is explicit:** *"We'll mail you the petition form, or connect you
with a volunteer canvasser near you. Florida law requires signatures on paper — this form gets
you the paper."*

**Progress indicator:** labelled **`Petition packets requested`**. Never "Signatures."
See § 00 finding 1 — an online form cannot produce a legal Florida petition signature.

**Secondary CTA:** `Volunteer to canvas` → same form, `role: volunteer`.

### Section 4 — Footer

Compliant disclaimer (§ 02 G0), treasurer attribution, contact address, privacy link, and the
required *"Paid for by"* line in its corrected statutory form.

### Deliberately absent

- Any MiForge or MiLyfe product content (§ 01 boundary rule)
- A donate button until G0 is complete — accepting a contribution before DS-DE 9 is filed
  violates Ch. 106
- Any counter labelled "signatures"

---

## 3.2 `get.milyfe.fun` — the explainer

**Audience:** someone who has never heard of MiLyfe. Press. A future citizen who arrived by
accident.
**Job:** explain what this is in 30 seconds, then capture the email.
**Primary action:** *Join the waitlist.*
**Length:** one screen + three short sections.

### Above the fold

- **H1:** `Infrastructure for civic life.`
- **Sub:** `MiLyfe is the operating system for a city that wants to run itself. Built in Jacksonville first.`
- **CTA:** `Join the waitlist`
- **Status line:** `Launching in Jacksonville. Public signups open after our first 1,200 founding businesses commit.`

The status line is doing real work: it explains the closure, states the reason, and forwards
the visitor toward MiForge without ever showing them a product tour.

### Section 1 — What it does, in four lines

Not a feature grid. Four plain sentences in the order a person would care:

1. Your street gets a say in what happens to it.
2. Public money is traceable from budget to block.
3. Local businesses get customers without giving a platform a third of the sale.
4. When someone leaves — a mayor, a founder, a vendor — the system keeps working.

Line 4 is the through-line clause from `NARRATIVE.md` and it belongs on the public page. It is
the differentiator, and it is a promise this design has to keep (§ 07).

### Section 2 — Why Jacksonville

Three sentences. Consolidated government covering 874 square miles. A $5.3B budget with 70
cents pre-committed. A mayoral race in 2027. Then: *we are building it here because the people
who live with the decisions should make them.*

### Section 3 — Waitlist form

**Email + ZIP code.** Two fields. Nothing else.

ZIP code is not decoration: § 06 segments the waitlist by Jacksonville vs. elsewhere, and § 02
D1's capped-cohort design admits **Jacksonville residents first**. Capturing ZIP now avoids
asking again later and avoids a re-permission email.

Consent copy must be specific — *"Emails about the MiLyfe launch. No campaign messages, no
resale. Unsubscribe in one click."* The "no campaign messages" clause is a legal boundary, not
politeness. See § 05.

**Success state:** *"You're on the list. We'll write when signups open."* Plus one forward-only
link: *Own a Jacksonville business? MiForge founding seats are open now.*

### Deliberately absent

- Roadmap, tech stack, architecture, pricing (§ 01)
- Any link back to `mijaxx.fun` — a visitor who came for product should not be routed into a
  political context uninvited. Movement is `get.milyfe → MiForge → milyfe`, never into the
  campaign from here.

---

## 3.3 MiForge — the founding offer

**Audience:** Jacksonville business owner.
**Job:** make the seat feel scarce and the price feel like a mistake to pass up.
**Primary action:** *Reserve a founding seat.*
**Length:** one screen + pricing + one FAQ block.

### Above the fold

- **H1:** `1,200 founding seats. Then the price doubles.`
- **Sub:** `MiForge is built inside MiLyfe — starting in Jacksonville. Founding members lock their price for life.`
- **Seat counter:** `Pro 47 of 200 remaining` · `Daily 873 of 1,000 remaining`
  *(live from the existing `cohort-status` endpoint; its catch-block fallback of `{147, 873}`
  must never render — show "counting…" instead. See § 06.)*

### Pricing — as specified in the vault

| | **Daily** | **Pro** |
|---|---|---|
| Seats | 1,000 | 200 |
| Price | **$39/yr** | **$99/yr, locked forever** |
| Next cohort | — | **$199/yr** |
| Includes | Core listing + discovery | Everything in Daily, plus **Partner Starter Tier** |

**The Pro tier has an unresolved liability.** The vault copy promises
*"Partner Starter Tier Included ($299/month fee waived)."* At 200 seats that is $717,600/yr of
waived service against $19,800 of revenue (§ 00 finding 3). **This must be scoped before the
first Pro seat is sold** — what the tier delivers, what it costs to deliver, and what happens
at seat 201.

Three resolutions, and the page copy differs for each:

| Resolution | Copy |
|---|---|
| **A. Scope the waiver narrowly** | *"Partner Starter Tier included for 12 months."* — bounded liability |
| **B. Convert to a service credit** | *"Includes $X in platform credits."* — capped and measurable |
| **C. Keep it open-ended** | Requires a funded delivery budget and § 06 guardrail. Not recommended. |

**Recommendation: A.** It preserves the promise, states a term, and makes the liability
countable.

### FAQ block

Four questions, answered in two sentences each: *What is MiForge? Who can join? What happens
when the 1,200 fill? Is this a political thing?*

The last answer is the boundary rule from § 01 made explicit: *MiForge is a business product
built by the same people. Your seat is not a donation and buys no political access.* That
sentence is load-bearing — see § 08 R4.

### Deliberately absent

- Governance mechanics, UBI, policy (§ 01)
- Any implication that a seat buys influence with the campaign — the opposite is stated
  explicitly

---

## 3.4 `milyfe.fun` — the closed-signup state

Already implemented (`src/app/(auth)/signup/page.tsx`, commit `d06fc44`). This is the
specification it should be held to.

**Verified behaviour:** flag unset → HTTP 200 rendering "Coming soon", "MiLyfe is coming to
Jacksonville", "1,200", "Already a citizen? Sign in"; **no form fields and no `signUp()` call
path**. Flag set to `"true"` → full form ("Join MiLyfe", Username, "Create Account"). Login
renders its password field in both states.

### Specified content

- **H1:** `MiLyfe is coming to Jacksonville.`
- **Body:** the closure is explained, not apologised for. *"We're opening to 1,200 founding
  Jacksonville businesses first, so the platform has a base when it opens to everyone. When
  those seats fill, signups open."*
- **Seat progress:** same `cohort-status` figures as MiForge. Consistency across surfaces is
  what makes four properties read as one system.
- **Primary CTA:** `Claim a founding business seat` → MiForge
- **Secondary CTA:** `Join the waitlist` → `get.milyfe.fun`
- **Persistent link:** `Already a citizen? Sign in` → `/login`

### Login page

Unchanged and working. One conditional: the footer link reads *"Signups are opening soon"*
while the flag is closed and *"Create an account"* when open. Verified both ways.

### Deliberately absent

- Campaign fundraising or partisan content (§ 01)
- Any self-service path to an account. The gate is deliberate.

---

## 3.5 Shared components

Built once, used on all four surfaces (§ 04):

| Component | Used on | Notes |
|---|---|---|
| `SiteHeader` | all | Forward-only nav; no surface links backward |
| `SiteFooter` | all | Carries the compliant disclaimer on campaign surfaces only |
| `StatCard` | mijaxx, get.milyfe | Figure + source line; figure required, source required |
| `SeatCounter` | MiForge, milyfe | Live; renders `counting…` when the endpoint is unreachable — never a fallback number |
| `CaptureForm` | all four | Inline validation, labelled fields, explicit success and error states |
| `PrivacyNote` | all | One line, plain language, next to every form |

**Form states that must all exist** — the gap most amateur builds leave:

`idle` → `validating` → `submitting` → `success` | `error` (with a real message and a retry)
| `duplicate` ("You're already on the list — thank you.") | `offline` (queued, honest about
it).

Every form is keyboard-operable end to end, every field has a visible `<label>`, and no state
is communicated by colour alone (§ 04).
