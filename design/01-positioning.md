# 01 — Positioning & Messaging

Four surfaces. Four audiences. Four different jobs. None of them may compete with another.

---

## The audience ladder

| Surface | Audience | Their starting state | Job of the page | Primary action | Distance travelled |
|---|---|---|---|---|---|
| `mijaxx.fun` | Jacksonville voter | **Sceptic.** Has heard promises before | Prove competence with numbers | Request a petition packet / volunteer to canvas | Stranger → signer |
| `get.milyfe.fun` | Curious outsider, press, future citizen | **Unaware.** Has never heard of MiLyfe | Explain what MiLyfe is in 30 seconds | Join the waitlist | Unaware → interested |
| `milyfe.fun` | Existing citizen + founder | **Committed.** Already inside | Serve login; explain the closure honestly | Sign in | Citizen → active |
| **MiForge** | Jacksonville business owner | **Opportunistic.** Wants customers, not civics | Show a scarce seat with a locked price | Reserve a founding seat | Business → partner |

### Movement is forward-only

`get.milyfe` → `mijaxx` → `MiForge` → `milyfe`. A visitor never moves backwards down the
ladder, and no page offers a route to a surface earlier than itself. This is the mechanism that
stops four properties from cannibalising each other.

---

## One message per surface

Each surface gets exactly one sentence it is allowed to make. Everything on the page supports
that sentence or is cut.

**mijaxx.fun**
> Jacksonville spends $5.3 billion a year and 70 cents of every dollar is already committed
> before the budget starts. Here are the numbers, and here is the plan.

**get.milyfe.fun**
> MiLyfe is infrastructure for civic life — built in Jacksonville first, so the people who
> live with the decisions make them.

**milyfe.fun** *(closed state)*
> MiLyfe opens to the public after 1,200 Jacksonville businesses commit to building it with
> us. If you are already a citizen, sign in.

**MiForge**
> 1,200 founding seats. 200 at Pro pricing locked for life. When they are gone, the price
> doubles.

---

## Voice rules

Derived from the existing corpus (`vault/mijaxx/writing/`, 22 documents, 1,025 lines), which is
already better than most political writing. Codified so it survives contact with new authors.

1. **Every claim carries a number or a source.** The corpus does this already — `$2.03 Billion
   General Fund`, `1.7–1.8 JSO officers per 1,000`, `47–52% cost-burdened renters`. Amateur
   copy uses adjectives; professional copy uses figures with provenance.
2. **No unquantified superlatives.** "Revolutionary," "world-class," "cutting-edge" are banned
   across all four surfaces. If it cannot be measured it does not go on the page.
3. **Second person, present tense.** "You live here" not "Residents will benefit."
4. **Name the tradeoff.** The corpus already admits difficulty (`the-numbers.md` lists the
   incumbent's genuine accomplishments). Credibility comes from conceding real points.
5. **Plain words over product names.** Say "the platform," not "the MiLyfe Universal Operating
   System." The `Mi*` family is internal vocabulary; the corpus itself uses MiLyfe 28 times
   but MiVoice, MiLearn and MiCircle twice each. Do not make visitors learn a taxonomy.
6. **Never promise a date you do not control.** Statutory dates may be stated. Product dates
   may not, until § 06 shows the gate is on track.

---

## Boundary rules — what each surface must never say

These are the failure modes that make multi-surface launches look amateur.

| Surface | Forbidden | Why |
|---|---|---|
| `get.milyfe.fun` | Roadmaps, tech stack, architecture, pricing | It serves people who have not decided to care. Complexity is a cost, not a credential. |
| `mijaxx.fun` | Feature tours, product marketing, MiForge seats | A campaign site that sells software converts a voter question into a sales objection. |
| `milyfe.fun` | Campaign fundraising, partisan content | Platform users are residents, not a donor list. Commingling them is § 05's central risk. |
| **MiForge** | Governance mechanics, UBI, policy | A business owner wants customers. Civics is the reason it exists, not the pitch. |

**Cross-cutting prohibition:** no surface may use voter-contact data collected on `mijaxx.fun`
to market MiForge or MiLyfe. See § 05 — this is the single highest-severity reputational risk
in the launch.

---

## Naming and the domain problem

| Asset | Status | Decision required |
|---|---|---|
| `milyfe.fun` | Real platform, live on Vercel | Keep |
| `mijaxx.fun` | Live, currently serving generic non-campaign content | Replace (§ 08 R10) |
| `get.milyfe.fun` | Live, currently serving generic content | Replace (§ 08 R10) |
| MiForge | Vault copy at `vault/miforge/` | Needs a canonical host — § 08 D4 |
| `getmilyfe.com` | **Not ours.** Different owner | **Never link, never reference.** Confusion risk on every printed asset. |

`getmilyfe.com` deserves specific attention. Every flyer, business card and QR code that says
"getmilyfe" sends traffic to someone else's property. § 03 specifies that printed and spoken
calls to action use full URLs — `mijaxx.fun`, `get.milyfe.fun` — never bare brand words.

---

## The through-line

From `NARRATIVE.md`, unchanged and still correct:

> **Add value. Get your share. Govern your street. And the system still works after anyone
> leaves.**

Each surface owns one clause:

- `get.milyfe.fun` — *what it is*
- `mijaxx.fun` — *govern your street*
- **MiForge** — *add value*
- `milyfe.fun` — *get your share*

The fourth clause — *the system still works after anyone leaves* — is not a page. It is an
architecture requirement, and it is what § 07 and § 08 are actually about. This project has
already lost a PC, a working tree and three sandbox resets. The design has to assume the
founder is unavailable and still be recoverable.
