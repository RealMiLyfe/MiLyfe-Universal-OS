# MiLyfe Launch — Design Set

**Status:** Design only. No implementation in this directory.
**Date:** 2026-09-14
**Scope:** Four surfaces — `mijaxx.fun`, `get.milyfe.fun`, `milyfe.fun`, MiForge.
**Companion docs:** `NARRATIVE.md` (linkage spec), `vault/00-INDEX.md` (provenance), `MASTER_BUILD_PLAN.md`.

---

## Reading order

| # | Document | What it settles |
|---|---|---|
| 01 | `01-positioning.md` | Who each surface is for, the one message each carries, what each must never say |
| 02 | `02-launch-gates.md` | The statutory spine, the four gates, entry/exit criteria, failure paths |
| 03 | `03-page-specifications.md` | Page-by-page specs and copy for the three landing pages plus the closed-signup state |
| 04 | `04-design-system.md` | Tokens, type, colour, components, accessibility target — one system across four surfaces |
| 05 | `05-data-privacy-legal.md` | The three data domains, the firewall between them, campaign-finance constraints |
| 06 | `06-measurement.md` | What we measure, the number that decides each gate, what failure looks like |
| 07 | `07-operations.md` | Domains, deploy topology, environments, key rotation, rollback, backup |
| 08 | `08-risks-and-decisions.md` | Ranked risk register and the decisions that are still open |

---

## The three findings that changed this design

These came out of verifying assumptions against primary sources rather than accepting the brief.

### 1. An online petition cannot legally qualify a candidate in Florida

Florida qualification requires **DS-DE 104 paper forms** submitted to the Duval County
Supervisor of Elections. Per the SOE's own *2027 Mayor Information Sheet*: **7,417 valid
petitions**, due **December 14, 2026 before noon**, with **$0.10 per signature** paid to the
SOE in advance for verification ($741.70).

The original `campaign.js` posts `signer_name, address, neighborhood, email,
registered_voter` to `/petition/add`. That endpoint never produced a legal signature. It
produced **a canvassing list**. The website's job is to recruit people who will sign a paper
form and volunteers who will carry clipboards — not to be the petition.

**Design consequence:** the mijaxx form is specced as *"Get a petition packet / Volunteer to
canvas"*, not *"Sign the petition"*. Calling it a signature would mislead signers, inflate a
counter that means nothing legally, and burn the campaign's credibility on its single
highest-stakes call to action.

### 2. Free software from the company is a regulated campaign contribution

Fla. Stat. § 106.011(5) defines a contribution to include *"contributions in kind having an
attributable monetary value in any form."* § 106.08 caps contributions to a **countywide**
candidate — which Jacksonville's consolidated mayor is — at **$1,000 per election**, with the
primary and general counted as separate elections. The Florida Division of Elections confirms
in-kind contributions are *"subject to the same limitations set for monetary contributions"*
and that value is **fair market value at the time given** (§ 106.055).

The same section contains the escape hatch: *"the term may not be construed to include
services, including, but not limited to, legal and accounting services, provided without
compensation by **individuals volunteering** a portion or all of their time."*

So the line is **who provides it**:

| Provider | Treatment |
|---|---|
| You, personally, writing code and design for free | **Not a contribution.** Volunteer services by an individual. |
| MiLyfe LLC donating hosting, seats, dev hours, or the platform | **In-kind contribution at fair market value**, counting against $1,000/election |

Penalties for a knowing and willful violation run to a **first-degree misdemeanor**, with a
corporate fine of $1,000–$10,000; two or more violations is a **third-degree felony** with a
corporate fine of $10,000–$50,000.

**Design consequence:** § 05 draws a hard boundary between volunteer-labour surfaces and
company-funded surfaces, and specifies that the campaign site be buildable and hostable
without company resources. *This is a structural finding, not legal advice — confirm with the
campaign treasurer and a Florida election attorney before build.*

### 3. MiForge's founding economics do not survive contact with its own benefits list

From `vault/miforge/app/page.jsx`, verified:

| Tier | Seats | Price | Revenue |
|---|---|---|---|
| Daily | 1,000 | $39/yr | $39,000 |
| Pro | 200 | $99/yr, *locked forever* (next cohort $199/yr) | $19,800 |
| **Total founding cohort** | **1,200** | | **$58,800** |

But the Pro listing also promises **"Partner Starter Tier Included ($299/month fee waived)."**
At 200 Pro seats that is **$717,600/yr of waived service delivery** against $19,800 of
revenue. Even at a 10% marginal delivery cost that is a $71,760 annual hole.

**Design consequence:** § 08 ranks this as a top-five financial risk and § 06 sets a delivery-
cost guardrail that must be measured before the Pro tier is sold to seat 201.

A second-order problem sits next to it. `vault/mijaxx/writing/the-numbers.md` builds a core
attack line on *"REV grants to developers... Donor-incentive correlation: documented in public
records."* MiForge sells founding seats to Jacksonville businesses. If those businesses later
seek city incentives, the campaign is running the exact pattern it is attacking. § 08 carries
this as a reputational risk with a designed mitigation.

---

## What is settled

- Four surfaces, one narrative, forward-only movement (`NARRATIVE.md`).
- Signups on `milyfe.fun` are **closed**; login stays open. Implemented behind
  `NEXT_PUBLIC_SIGNUPS_ENABLED`, fails closed (`src/lib/launch.ts`, commit `d06fc44`).
- The 1,200 is **200 Pro + 1,000 Daily**, taken from `miforge`'s own `cohort-status` route
  rather than invented.
- One design system across all four surfaces (§ 04), anchored on the campaign original's
  **Atkinson Hyperlegible** and **#1e4a8a**.
- Statutory dates are fixed and non-negotiable; product dates bend around them (§ 02).

## What is still open

Nine decisions, ranked, in § 08. The two that block build:

1. **What is the 1,200 gate actually protecting?** The answer determines whether MiLyfe stays
   dark through the primary — the only free mass attention the platform will ever receive.
2. **Who funds the campaign site, and in whose name?** Determines the disclaimer text, the
   hosting choice, and whether the company can touch it at all.
