<div align="center">

<img src="public/icon-192.png" alt="MiLyfe" width="96" height="96" />

# MiLyfe Universal OS

### *We the People. Anyone. Anywhere. From Day One.*

**A civic platform where people earn weekly credits, govern together, learn for free, trade locally, and keep the power — owned by the people who run it.**

[![Live Platform](https://img.shields.io/badge/🌐_Live-milyfe.fun-00C1AE?style=for-the-badge)](https://milyfe.fun)
[![Campaign](https://img.shields.io/badge/🗳️_Campaign-mijaxx.fun-1e3a6e?style=for-the-badge)](https://mijaxx.fun)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-brightgreen?style=for-the-badge)](LICENSE)
[![Built with Next.js](https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-teal?style=for-the-badge)](CONTRIBUTING.md)

[![CI](https://github.com/RealMiLyfe/MiLyfe-Universal-OS/actions/workflows/ci.yml/badge.svg)](https://github.com/RealMiLyfe/MiLyfe-Universal-OS/actions/workflows/ci.yml)
[![Languages](https://img.shields.io/badge/🌍_Languages-14-1e3a6e)](src/lib/i18n/languages.ts)
[![Free Forever](https://img.shields.io/badge/💛_Free-Forever-f5c518)](https://milyfe.fun)

</div>

---

## What is MiLyfe?

MiLyfe is civic infrastructure — not a social network, not a campaign app. It is a full-stack platform that gives communities the tools to self-govern, build shared wealth, and support each other without intermediaries.

One account. Your whole civic life. **Free forever.**

> "The Constitution as something you live. A system that still works after anyone leaves."

---

## The Proof

Built with **$0 in outside capital** over **11 years** of independent work. Not a pitch deck. Not a prototype. A running, auditable platform anyone can inspect, fork, and run.

| What | Detail |
|---|---|
| **Cost to build** | $0 (every tool is free and open source) |
| **Time** | 11 years |
| **Routes** | 35 production routes |
| **Database** | 25 tables · 106 Row-Level Security policies |
| **Corporate equivalent** | ~$3M+ |
| **Live at** | [milyfe.fun](https://milyfe.fun) |

---

## What it does

```
Pocket     →  $MLY weekly UBI · transactions · community treasury
Learn      →  Free education paths · offline-capable
Street     →  Quests · local marketplace · surplus exchange
Voice      →  Proposals · direct democracy · standing votes
You        →  Profile · health · safety · connections · wiki
Mi         →  Local AI assistant (no cloud required)
```

Every feature works offline. Every vote is public. No ads. No data extraction. No permanent power.

---

## 👋 New here? Start with this

- **Just want to see it?** → [milyfe.fun](https://milyfe.fun) — sign up free, you'll have $MLY in your wallet in 30 seconds.
- **Want to understand the idea?** → read the [Whitepaper](WHITEPAPER.md) (10 min) or the [Founder Story](docs/planning/MiLyfe_Founder_Story.md) (5 min).
- **Want to build?** → jump to [Get started](#get-started-in-3-steps), then grab a task from the [bounty board](https://milyfe.fun/bounties).
- **Want the whole picture?** → the [Ultimate Manual](docs/planning/MiLyfe_Ultimate_Manual.md) is the complete reference.

Everyone is welcome — anyone, anywhere, from day one. That's not a slogan, it's the license.

---

## The Oath — 24 Immutable Principles

> *"We the People of the United States... do ordain and establish this Constitution."*
> — Preamble to the U.S. Constitution

MiLyfe begins where the American promise begins — **We the People** — and treats it as universal. Anyone, anywhere can join from day one.

**Principle 1: We the People.** Power belongs to the people and stays with them — everywhere, from day one. This is the whole play.

The other 23 principles include: free forever for rights, learning, and emergencies · no permanent power · open source forever · freedom to exit with your data · children first · truth in claims · not a state.

[Read the full Oath →](docs/planning/MiLyfe_Ultimate_Manual.md)

---

## $MLY — Community Credit

`$MLY` is a community credit issued by public, transparent rules. Not an investment. Not a token sale. Not a financial product.

- **Earn it** — weekly UBI to every verified member, quests, community contributions
- **Spend it** — marketplace, local shops, thanking neighbors
- **Trade it** — voluntarily, peer-to-peer, with anyone who consents
- **Save it** — personal jars, household pots, community treasury

No founder mint. No pre-mine. No APY. No "investment in our team."

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| **App** | Next.js 14 (App Router) + React 18 + TypeScript | Production-ready, self-hostable |
| **Database** | PostgreSQL via Supabase | RLS at the DB, not the app layer |
| **Auth** | Supabase Auth | Open source, no vendor lock-in |
| **Styling** | Tailwind CSS + custom design tokens | Fast, consistent, accessible |
| **Security** | Zod + DOMPurify + RLS + client-side encryption | Defense in depth |
| **i18n** | Translated message catalogs + language selectors (14 languages, RTL-aware) | Universal from day one |
| **License** | AGPL-3.0 | Public code, stays public |

Full architecture: [ARCHITECTURE.md](ARCHITECTURE.md)

---

## Get started in 3 steps

```bash
# 1. Clone
git clone https://github.com/RealMiLyfe/MiLyfe-Universal-OS
cd MiLyfe-Universal-OS

# 2. Configure
cp .env.local.example .env.local
# Fill in your Supabase credentials

# 3. Run
npm install && npm run dev
```

**Database setup:** copy the contents of `scripts/new-project-setup.sql` into your Supabase SQL Editor and run it. It creates all 25 tables, RLS policies, triggers, and seeds the treasury.

Full setup: [CONTRIBUTING.md](CONTRIBUTING.md)

---

## The story behind it

The founder was arrested 11 times in Jacksonville, harassed hundreds more. Ate from trash cans. Bathed with a water hose. Couldn't pay child support. Built this for 11 years with $0. Nearly ended it all twice. Kept going.

His daughter stopped asking if it was done. The silence was the weight.

It's done. It runs. The code is public. Now he's running for mayor to prove it works.

> *"You can't attack a man who already told you everything and built something beautiful anyway."*

[The full story →](docs/planning/MiLyfe_Founder_Story.md)

---

## Documents

| Document | What it is |
|---|---|
| [WHITEPAPER.md](WHITEPAPER.md) | The case for MiLyfe — problem, solution, economics, architecture |
| [ARCHITECTURE.md](ARCHITECTURE.md) | How the three systems fit together |
| [PRIVACY.md](PRIVACY.md) | What data is collected and how it's protected |
| [TERMS.md](TERMS.md) | Terms of use — plain language, including `$MLY` |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to run, contribute, and claim bounties |
| [SECURITY.md](SECURITY.md) | How to report vulnerabilities |
| [LICENSE](LICENSE) | AGPL-3.0 |

---

## Contributing

MiLyfe belongs to humanity. If you build on it, your changes stay public (AGPL-3.0). There is a [developer bounty board](https://milyfe.fun/bounties) with 160+ tasks across 15 domains — standing earned by action, not titles.

[CONTRIBUTING.md](CONTRIBUTING.md) · [Discord](https://discord.gg/b4hkHUqU6N) · [Bounties](https://milyfe.fun/bounties)

---

## Links

| | |
|---|---|
| 🌐 Platform | [milyfe.fun](https://milyfe.fun) |
| 🗳️ Campaign | [mijaxx.fun](https://mijaxx.fun) |
| 📋 Get on the list | [get.milyfe.fun](https://get.milyfe.fun) |
| 📬 Contact | [contact@milyfe.fun](mailto:contact@milyfe.fun) |
| 💬 Discord | [discord.gg/b4hkHUqU6N](https://discord.gg/b4hkHUqU6N) |

---

<div align="center">

**MiLyfe belongs to humanity.**
**Governance belongs to the people where they live.**

*Public code. Public votes. If it isn't here, it isn't the proof.*

</div>
