# 02 — Launch Gates & Sequence

## The statutory spine

These dates are not chosen. They are set by Florida law and the Duval County Supervisor of
Elections, and the product schedule bends around them.

Verified against the SOE's *2027 Mayor Information Sheet* (duvalelections.gov) and the
campaign's own `vault/mijaxx/writing/the-dates.md`.

| Date | Event | Days from 2026-09-14 | Source |
|---|---|---|---|
| — | **DS-DE 9** filed (treasurer + depository) | **Prerequisite, marked OVERDUE** | `the-dates.md`; DOS candidate handbook |
| **2026-12-14, before noon** | **DS-DE 104 petitions due at Duval SOE — 7,417 valid** | **91** | SOE 2027 Mayor Information Sheet |
| 2027-01-11 → 01-15 | Qualifying window | 119 | `the-dates.md` |
| 2027-03-09 | Primary | 176 | `the-dates.md` |
| 2027-05-18 | General (if needed) | 246 | `the-dates.md` |
| 2027-07-01 | Term begins | 290 | `the-dates.md` |

Two numbers that follow from this and must be designed against:

- **7,417 valid signatures in 91 days = 82 valid/day.** At the 1.6× raw-to-valid buffer normal
  for petition drives, that is **~130 raw signatures per day, every day, for 13 weeks.**
- **Verification fee: 7,417 × $0.10 = $741.70**, payable to the SOE **in advance**.
- **Alternative to petitioning:** pay the qualifying fee — **$10,904.16 non-partisan** or
  **$16,356.24 partisan** (SOE sheet; marked "to be updated October 2026").

That last line matters more than it looks. § 08 carries *"pay the fee instead"* as the primary
contingency for the petition gate, and it costs roughly one fifth of the MiForge founding
cohort's gross revenue ($58,800, per § 00 finding 3).

---

## The gate model

Four gates. Each has an **entry condition** (what must be true to start), an **exit condition**
(the measurable thing that means it passed), and a **failure path** (what happens if it does
not).

```
G0  COMPLIANCE          G1  PETITION              G2  FORGE               G3  PLATFORM OPEN
    DS-DE 9 filed    →      7,417 valid        →      1,200 seats      →     signups enabled
    treasurer named         or fee paid               funded + served         Supabase toggle on
    disclaimer fixed                                   unit econ. sound
```

**G0 and G1 run in parallel with G2.** They are not sequential — the campaign calendar does not
wait for software, and software sales do not wait for the campaign. What is sequential is the
*public opening* of the platform, which is gated on G2 and should be gated on G0.

### G0 — Compliance  *(owner: founder + campaign treasurer)*

**Entry:** DS-DE 9 not yet filed per `the-dates.md` (flagged OVERDUE on 2026-08-26).

**Exit:**
- [ ] DS-DE 9 filed with Duval SOE; treasurer and depository named
- [ ] DS-DE 84 Statement of Candidate prepared
- [ ] DS-DE 104 petition sheets ordered
- [ ] Disclaimer text on every campaign asset corrected to § 106.143 form (see below)
- [ ] Funding structure for the campaign site decided in writing (§ 05, § 08 D2)
- [ ] Reporting calendar loaded: monthly CTR until qualifying, weekly after, **daily for the
      last 5 days** before each election

**Blocking rule:** under Ch. 106 no contribution may be accepted and no expenditure made before
DS-DE 9 is filed. Domain registrations, hosting and printing already incurred need to be
reviewed by the treasurer. **Nothing on `mijaxx.fun` should go live until this gate's first
three boxes are ticked.**

**Disclaimer correction.** The string in the surviving original — and repeated 19 times across
`vault/` — is:

> `Paid for by Mayor MiLyfe for Jacksonville 2027`

That is non-compliant on three counts against § 106.143(1)(a), which requires either
*"Political advertisement paid for and approved by (name of candidate), (party affiliation) for
(office sought)"* or *"Paid by (name of candidate), (party affiliation), for (office sought)"*:

1. **"Paid for by"** is not the statutory form. The statute says **"Paid by."**
2. **"Mayor MiLyfe"** is a brand, not the candidate's name. The statute requires the
   candidate's name.
3. **No party affiliation** is stated. § 106.143 requires it, and requires an explicit
   statement if the candidate has none.

§ 106.143(6) adds a trap for a non-incumbent: the word **"re-elect" is prohibited**, and the
word **"for" must appear between the candidate's name and the office** so incumbency is not
implied. The existing brand string satisfies that one by accident.

**Specified replacement** (final text blocked on § 08 D5 — the candidate's legal name and
party affiliation as they will appear on DS-DE 84):

> `Political advertisement paid for and approved by [LEGAL NAME], [PARTY AFFILIATION], for Mayor of Jacksonville.`

Only "Carnell" appears as a personal name anywhere in the recovered corpus (8 occurrences).
The full legal name and the filed affiliation are **not in the workspace** and must come from
the founder.

### G1 — Petition  *(owner: field operation)*

**Entry:** G0 boxes 1–3 complete.

**Exit:** 7,417 valid signatures verified by the SOE before noon 2026-12-14, **or** the
qualifying fee lodged.

**Instrument:** the website does **not** count signatures. It counts *packet requests* and
*volunteer sign-ups* — see § 00 finding 1. A progress bar on `mijaxx.fun` must be labelled
**"Petition packets requested"**, never "Signatures." Publishing a number that implies legal
progress the campaign does not have is both a credibility risk and, on a page that solicits
political support, a possible misrepresentation.

**Failure path:** at any weekly checkpoint below the required run-rate (§ 06), trigger the fee
route. Decision must be made by **2026-11-30** — two weeks of slack before the deadline,
because the fee is the fallback and the petition cannot be abandoned on December 13.

### G2 — Forge  *(owner: founder)*

**Entry:** MiForge live on a canonical host (§ 08 D4), payment collection working, and the
**$299/month Partner Starter Tier waiver scoped in writing** with a stated delivery cost.

**Exit:** 1,200 paid founding seats — 200 Pro, 1,000 Daily — **and** the § 06 delivery-cost
guardrail met.

The second condition is not optional padding. Selling 200 Pro seats while the waiver is
undefined converts a $58,800 cohort into a service liability (§ 00 finding 3). Reaching 1,200
is a vanity metric if each seat costs more to serve than it pays.

**Failure path:** § 08 D1. If the cohort is not filling at the § 06 rate, the platform opening
must **not** be held hostage indefinitely. See the decoupling recommendation below.

### G3 — Platform open  *(owner: founder)*

**Entry:** G2 exit met, plus G0 complete.

**Exit:** `NEXT_PUBLIC_SIGNUPS_ENABLED=true` deployed **and** Supabase
*Authentication → Sign In / Providers → Email → Allow new users to sign up* re-enabled.

Both switches. The application flag closes the UI; the Supabase toggle is what actually makes
signup impossible, because `signUp()` is called from the browser and can be invoked directly.
Today the flag is unset — closed — and the Supabase state is **unverified** (§ 08 R6).

---

## The sequencing question this design cannot settle for you

The stated rule is: *signups open after MiForge fills 1,200.*

Taken literally against the statutory spine, if the cohort fills slowly the platform stays
closed through **March 9, 2027** — the primary. That is the single largest concentration of
free public attention Jacksonville will ever direct at this name, and the platform would be
dark for all of it.

Three readings of the intent, three different designs:

| If the 1,200 protects… | Then the gate should be… | And signups open when… |
|---|---|---|
| **Revenue** — don't scale before you're funded | A revenue threshold, not a headcount | $58,800 collected, or enough to fund the qualifying fee |
| **Proof** — don't open until the model works | 200 Pro seats only | Pro tier full; Daily opens later |
| **Support load** — don't admit users you can't serve | An operations-readiness check | Support, onboarding and moderation are staffed |

Only the third is about the users. The first two are about the business, and neither requires
the public door to stay shut during a campaign.

**Recommended design — a capped opening.** MiForge founding seats go on sale first and stay
exclusive. `milyfe.fun` opens to a **capped Jacksonville-residents-only cohort** drawn from the
waitlist during the campaign — a few hundred seats, explicitly framed as a founding-citizen
cohort that closes when full. Businesses still get in first, which is the intent. The platform
still captures campaign traffic instead of turning it away. And scarcity, which MiForge is
already built on, becomes the platform's mechanism too rather than a wall.

This is § 08 **D1** and it needs a decision before build.

---

## Timeline as designed

```
2026-09-14  ── G0 opens. DS-DE 9 filed. Disclaimer fixed. Site funding decided in writing.
      │        G1 field op begins. G2 MiForge design finalised.
      │
2026-10    ── mijaxx.fun live (real campaign content, replaces generic).
      │        MiForge live. Founding seat sales open.
      │        get.milyfe.fun live. Waitlist opens.
      │
2026-11-30 ── G1 CHECKPOINT. Petition run-rate decision: continue or pay the fee.
      │
2026-12-14 ── G1 closes, noon. Petitions delivered or fee lodged.
      │
2027-01-11 ── Qualifying window opens.
      │
2027-02    ── G3 REVIEW. If D1 = capped opening, founding-citizen cohort opens here.
      │
2027-03-09 ── Primary.
2027-05-18 ── General, if needed.
2027-07-01 ── Term begins.
```

**92 days from today to the petition deadline.** That is the number everything else is
subordinate to.
