# 06 — Measurement & Targets

A gate without a number is an opinion. This document puts a number on each one, states where
the number comes from, and defines what failure looks like — because the failure path is the
part that actually gets used.

---

## 6.1 The metric tree

```
PRIMARY (the only one that wins or loses)
└── 7,417 valid petition signatures verified by Duval SOE before noon 2026-12-14

  ├── FIELD
  │   ├── petition packets requested          ← mijaxx.fun form
  │   ├── canvass volunteers recruited        ← mijaxx.fun form, role=volunteer
  │   ├── raw signatures collected            ← offline, entered manually
  │   └── valid signatures verified           ← SOE returns, the real number
  │
  ├── COMMERCIAL
  │   ├── MiForge seat visits → reservations  ← conversion
  │   ├── Pro seats sold (of 200)             ← cohort-status
  │   ├── Daily seats sold (of 1,000)         ← cohort-status
  │   ├── founding revenue collected          ← target $58,800
  │   └── delivery cost per Pro seat          ← the guardrail
  │
  └── AUDIENCE
      ├── waitlist signups, by ZIP            ← get.milyfe.fun
      ├── Jacksonville share of waitlist      ← segmentation for § 02 D1
      └── login-active citizens               ← milyfe.fun
```

**Only the top line is a win condition.** Everything below it is either an input to it or a
leading indicator of something that is not yet a commitment.

---

## 6.2 Targets, with the arithmetic shown

### Petition

| Quantity | Value | Derivation |
|---|---|---|
| Valid signatures required | **7,417** | Duval SOE, *2027 Mayor Information Sheet* |
| Days available from 2026-09-14 | **91** | to 2026-12-14 noon |
| Required valid rate | **81.5 / day** (round to 82) | 7,417 ÷ 91 |
| Raw-to-valid buffer | **1.6×** | standard for petition drives — invalid registrations, duplicates, out-of-district |
| Required raw rate | **~130 / day** | 81.5 × 1.6 |
| Raw collection target | **~11,867** | 7,417 × 1.6 |
| Verification fee, paid in advance | **$741.70** | 7,417 × $0.10 (SOE schedule) |

**Weekly checkpoint: 570 valid signatures.** Any week that misses it triggers the § 6.5 review.

**The number the website shows is *not* this one.** Per § 00 finding 1, `mijaxx.fun` displays
*petition packets requested* — a recruitment count. The valid-signature count is tracked
offline from SOE returns and published only when verified. Publishing an unverified number as
progress on a page soliciting political support is a credibility risk and a possible
misrepresentation.

### MiForge

| Quantity | Value | Derivation |
|---|---|---|
| Seats | **1,200** (200 Pro + 1,000 Daily) | `miforge/app/api/cohort-status/route.js` |
| Gross founding revenue | **$58,800** | (200 × $99) + (1,000 × $39), per `vault/miforge/app/page.jsx` |
| Days to primary | **176** | 2026-09-14 → 2027-03-09 |
| Required rate | **6.8 seats / day** | 1,200 ÷ 176 |
| **Monthly checkpoint** | **205 seats** | 6.8 × 30 |

The revenue figure is the interesting one. **$58,800 funds the $10,904.16 non-partisan
qualifying fee five times over.** That is the real strategic argument for the forge-first
sequence — not "revenue before scale" in the abstract, but *this cohort can buy the ballot
line*. § 08 D1 should be read in that light.

⚖️ Moving money from MiForge to the committee is capped at **$1,000 per election** as a
corporate contribution (§ 05.2). The founder's personal contribution to their own campaign is
unlimited under § 106.08(1)(b) — but the path from LLC revenue to personal funds is a question
for the treasurer, not a design decision.

### The Pro tier guardrail — measure this before seat 201

| Quantity | Threshold | Rationale |
|---|---|---|
| Waived value per Pro seat | **$3,588/yr** if the $299/month waiver is open-ended | $299 × 12, per `vault/miforge/app/page.jsx` |
| Total waived across 200 Pro seats | **$717,600/yr** | 200 × $3,588 |
| Pro revenue against it | **$19,800/yr** | 200 × $99 |
| **Break-even delivery cost** | **≤ $99 per Pro seat per year** | Beyond this the Pro tier loses money on every seat |

**At a 10% marginal delivery cost on the waived tier the Pro line loses $51,960/yr.** The
tier as written is not a discount, it is a liability.

Resolution options are in § 3.3. **Recommendation: scope the waiver to 12 months**, which
bounds exposure at one year and makes the promise honest. Whatever is chosen must be decided
**before the first Pro seat sells**, because a price locked "forever" cannot be re-scoped
afterwards without breaking the promise the page is built on.

### Landing-page conversion

Benchmarks, to be replaced by observed numbers after week one:

| Page | Cold traffic | Warm / referred |
|---|---|---|
| `mijaxx.fun` packet request | 2–4% | 8–15% |
| `get.milyfe.fun` waitlist | 3–5% | 10–20% |
| MiForge seat reservation | 1–2% | 5–8% |

Below the cold floor for two consecutive weeks means the **offer** is wrong, not the traffic.
Do not fix it by buying more traffic.

---

## 6.3 Instrumentation

| Surface | Instrument | Notes |
|---|---|---|
| All four | **PostHog** | Already provisioned — key and host are in `.env.production.template` |
| All four | Server-side form events | The conversion event fires on **successful write**, not on submit click |
| MiForge | `cohort-status` endpoint | Existing; supplies the live seat counters |
| `mijaxx.fun` | **Deliberately minimal** | A political site does not need behavioural analytics on its visitors. Pageviews and form completions only. This is both a privacy position and consistent with § 05. |

**Do not add a third-party tracker to the campaign site.** Beyond the privacy argument, a
third-party script on a political page is a supply-chain exposure and, under § 05.2, a paid
service that would need to be characterised.

---

## 6.4 The counter that must never lie

`miforge`'s `cohort-status` route has a `catch` block that returns **`{147, 873}`** when the
query fails. If that fallback renders, the site displays invented availability — on a page
whose entire pitch is scarcity and a locked price.

**Specified behaviour:** on endpoint failure the `SeatCounter` component renders
**`counting…`** and retries. It never renders a fallback figure. This is a one-line rule with
disproportionate consequences: a visitor who spots a seat count that does not move, or that
resets, concludes the scarcity is fabricated — and they would be right.

---

## 6.5 Failure paths

Each gate has a pre-committed response. Deciding under pressure is how launches die.

| Trigger | Review by | Response |
|---|---|---|
| Petition below **570 valid / week** | Every Sunday | Escalate canvass hours. Reassess at two consecutive misses. |
| Petition below **60% of cumulative target** | **2026-11-30** | **Switch to the qualifying fee** — $10,904.16 non-partisan. This date is fixed: the fee is the fallback and the petition cannot be abandoned on December 13. |
| MiForge below **205 seats / month** | Monthly | Reprice, re-scope the Pro tier, or invoke § 08 D1 and open the platform anyway |
| Pro delivery cost above **$99/seat/yr** | Before seat 201 | Scope the waiver to 12 months (§ 3.3 option A) |
| Waitlist below **500 by 2026-11-01** | Once | The `get.milyfe` message is wrong. Rewrite the H1 before spending on traffic. |
| Platform-opening gate unmet by **2027-02-01** | Once | Invoke § 08 D1. Do not stay dark through the primary by default. |

**The single most important line in this document is the 2026-11-30 petition decision date.**
It is the only place in the plan where a hard statutory deadline meets a soft commercial one,
and it has to be decided in advance.
