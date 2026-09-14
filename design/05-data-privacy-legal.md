# 05 — Data, Privacy & Legal Separation

This is the document that decides whether the launch is professional or merely functional. It
is also where the project's largest unpriced risk lives.

*Structural analysis, not legal advice. Every item marked ⚖️ needs sign-off from the campaign
treasurer and a Florida election attorney before build.*

---

## 5.1 Three data domains that must never meet

| Domain | Collected on | Contains | Governing regime | Sensitivity |
|---|---|---|---|---|
| **A. Campaign contact** | `mijaxx.fun` | Name, email, ZIP, neighbourhood, registered-voter flag, volunteer role | **Fla. Stat. Ch. 106**; Florida public-records and voter-privacy law | **Highest.** Political affiliation is inferable from the act of signing. |
| **B. Commercial lead** | MiForge | Business name, owner contact, tier, payment record | CAN-SPAM; ordinary B2B contract | Medium |
| **C. Platform user** | `milyfe.fun` | Account credentials, profile, in-product activity | Product ToS; CCPA-class expectations | High — authentication data |

### The firewall

**Rule 1 — No shared PII keys.** No table, view, index or export may join across domains. Not
by email, not by phone, not by hashed email, not by name. Hashed-email matching is still
matching and it is still the thing that gets reported as *"campaign used its voter file to
sell software."*

**Rule 2 — Separate stores.** Domain A does not live in the platform's Supabase instance. The
campaign site is static (§ 07) and its form posts to a store the platform application cannot
query. This is a deliberate architectural constraint, and it is why § 04 rejects folding the
campaign into the platform repo.

**Rule 3 — Separate consent, separately worded.** Three opt-ins, three purposes, three
unsubscribe paths. Consent given on `mijaxx.fun` authorises campaign contact and **nothing
else**. The `get.milyfe.fun` form states explicitly: *"No campaign messages, no resale."*

**Rule 4 — No cross-domain messaging, ever.** A MiForge customer is never emailed about the
campaign. A campaign volunteer is never emailed about MiForge. The only permitted cross-surface
movement is the **forward-only, user-initiated link** in § 01 — a person clicks, on their own
initiative, and re-consents on arrival.

### Why this is the top reputational risk

`vault/mijaxx/writing/the-numbers.md` builds a central attack line on
*"REV grants to developers: $15–40 Million/year"* with a *"Donor-incentive correlation:
documented in public records."*

MiForge sells 1,200 founding seats to Jacksonville businesses. If a seat-holder later seeks a
city incentive, and if the campaign's contact data was ever commingled with the business list,
the campaign is running the precise pattern it is attacking — and the evidence is in its own
database. There is no recovery from that story.

**Mitigation, designed in rather than bolted on:**

- MiForge's FAQ carries an explicit line (§ 3.3): *"Your seat is not a donation and buys no
  political access."*
- Founding-seat holders are recorded in a public register — the seat list itself is the
  disclosure. Transparency is cheaper than denial and it is consistent with the platform's
  whole premise.
- ⚖️ The treasurer confirms in writing whether MiForge revenue creates any reportable
  relationship with the committee. It should not, if the firewall holds.

---

## 5.2 Campaign finance constraints on the build ⚖️

Verified against Fla. Stat. Ch. 106 and the Florida Division of Elections FAQ.

| Constraint | Authority | Consequence for this design |
|---|---|---|
| **$1,000 per election** to a countywide candidate | § 106.08(1)(a)3 | Jacksonville's consolidated mayor is countywide |
| **Primary and general are separate elections** | § 106.08(1)(c) | $1,000 each, $2,000 per contributor per cycle |
| **In-kind contributions count at fair market value** | § 106.011(5), § 106.055 | Free software, hosting and seats from the company are contributions |
| **Corporations are "persons" and may contribute** | FL DOS Campaign Finance FAQ | MiLyfe LLC *can* give — capped at $1,000/election |
| **Volunteer services by individuals are NOT contributions** | § 106.011(5), express carve-out | **The founder's own unpaid labour is exempt** |
| **Cash / cashier's cheque capped at $50** | § 106.09(1) | No cash handling in the field without receipts |
| **DS-DE 9 before any contribution or expenditure** | Ch. 106 | Marked **OVERDUE** in `the-dates.md` — § 02 G0 |
| **Knowing/willful violation: 1st-degree misdemeanor**; corporation fined $1,000–$10,000; two or more = **3rd-degree felony**, corporation fined $10,000–$50,000 | § 106.08 | This is criminal exposure, not a bookkeeping error |

### The design rule that follows

> **The campaign surface is built and hosted by the founder as an individual volunteer.**
> **The company does not fund, host, or donate to it.**

That single sentence keeps the campaign site inside § 106.011(5)'s carve-out and away from the
$1,000 cap entirely. It has three practical consequences:

1. **Hosting must be free-tier or personally paid.** A static site on a free tier costs
   nothing; the founder's time is exempt volunteer labour. A Vercel Pro seat or a paid add-on
   billed to the company is an in-kind contribution at fair market value.
2. **No paid platform services.** If the form posts to the company's Supabase, that is
   donated infrastructure at fair market value.
3. **Keep a contemporaneous record.** A dated note of who did what, unpaid, is what
   substantiates the volunteer characterisation if it is ever questioned.

⚖️ **This needs attorney confirmation before the site goes live.** It is the difference between
a lawful volunteer arrangement and a misdemeanor, and it is not a call to make on a design
document.

### What the company *can* do

- Sell MiForge seats at market price. Ordinary commercial activity.
- Contribute up to **$1,000 per election** from corporate funds, reported by the treasurer.
- The founder may contribute **unlimited personal funds to their own campaign** —
  § 106.08(1)(b) exempts amounts a candidate contributes to their own campaign. ⚖️ But personal
  funds must be genuinely personal, and moving MiForge revenue out of the LLC into personal
  funds for that purpose raises separate questions about source disclosure. **Ask before doing
  it.**

---

## 5.3 Retention and minimisation

| Domain | Collect | Retain | Delete |
|---|---|---|---|
| A. Campaign | Name, email, ZIP, neighbourhood, voter flag, role | Through the 2027 cycle + the Ch. 106 record-retention period | **Street address is not collected at all** — the original collected `address`; a petition packet needs a ZIP, and a street address is an unnecessary liability |
| B. MiForge | Business, owner contact, tier, payment | Life of account + statutory financial retention | On request, after financial obligations close |
| C. Platform | Credentials, profile, activity | Life of account | On request |

**Explicitly not collected anywhere:** date of birth, party registration, race, exact
geolocation, payment card data on any first-party server.

**Every form displays a one-line privacy note** (§ 3.5) stating what is collected and what
happens to it. On `mijaxx.fun` that note must say the data is used for campaign contact —
because a voter who signs a political petition and is then emailed a software offer has been
deceived, and will say so publicly.

---

## 5.4 Known exposure in the existing estate

These are open today, independent of this design.

| Exposure | Detail | Status |
|---|---|---|
| **`milyfebackup` is public** | Contains `05_agent_knowledge/data/campaign.db` — whose `contacts` table holds **24 rows with phone and email** — plus `Campaign_Private/{Strategy.md,Titan_Agent_System.md}` and `knowledge/external/{opposition-file-legacy.md,the-opponent.md}` | **Live exposure.** Opposition research on a private individual and 24 citizens' contact details, both publicly readable. § 08 R8, highest urgency. |
| **Hardcoded credential in git history** | `MATTERMOST_PASSWORD:-VentureTitan2026` in commits `d5047f7`, `036841c`, `68bac81`. Purged from HEAD on 2026-09-03 but **permanent in history** | Assume compromised. Rotate the service, not just the string. |
| **27 production secrets** | `.env.production.template` lists Supabase URL/anon/service-role, `GROQ_API_KEY`, five `JUSTICE_AI_*` keys, Upstash, QStash, Resend, VAPID ×2, Sentry ×3, PostHog ×2, LiveKit ×3, `CRON_SECRET` | Rotation sequence in § 07. Plus `CAMPAIGN_API_KEY`, Listmonk super-admin, Cloudflare API token, and Hostinger SPF/DKIM/DMARC, which are **not** in the template. |
| **`MANIFEST.sha256` records 61 stripped files** | 8 secrets/env + 53 database-state | The 8 env files may survive on the exFAT backup drive — § 08 D6 |

The `campaign.db` schema is preserved at `vault/mijaxx/campaign_schema.sql` (24 objects).
**Its data was deliberately not copied into this repo.** Row counts of note: `activity_log`
4,093, `media_mentions` 100, `contacts` 24, `compliance_filings` 16, `petition_signatures` 1.
