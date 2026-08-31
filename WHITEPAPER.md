# MiLyfe — Whitepaper

**A digital voluntary commons owned by the people who run it.**
Version 1.0 · 2026 · License: AGPL-3.0 · The code is public. The votes are public.

---

## Abstract

MiLyfe is civic infrastructure: one account that carries a person's whole civic life — a weekly-credit economy, direct democracy, community safety, free education, a local marketplace, and messaging — owned by the people who use it rather than by a company, a state, or investors. It is **universal from day one**: anyone, anywhere can sign up immediately. The United States (beginning in Jacksonville, Florida) is where it is being *proven* first, not a gate on who may join. This paper explains what MiLyfe is, the rules of its `$MLY` community credit, how it is built and governed, and why it starts with three words from the American founding promise that belong to everyone: **We the People.**

---

## 1. The Problem

Government spends most where it reacts and least where it prevents. Jacksonville, the launch city, directs roughly 55% of its budget to public safety and about 3.5% to human development. The result is the most expensive possible approach to community: cages over people, reaction over prevention.

At the same time, the digital platforms people live on are extractive by design. Their product is engagement, advertising, and data. The people who generate the value do not own the system, cannot see its rules, and cannot leave with what they built.

MiLyfe inverts both. Human development is the product. Prevention pays more than punishment. And the people own the platform by running it.

---

## 2. What MiLyfe Is

A **digital voluntary commons** where:

- **One account does everything** — money, learning, marketplace, governance, safety, messaging, media, work.
- **People own it by running it** — holding their own keys, voting where they live, and forking the open-source code if it is ever captured.
- **It degrades gracefully** — designed to keep working when the internet or cell network fails.
- **Human development is the product** — not engagement metrics, not advertising, not data extraction.

### What it is **not**

Not a government, state, or nation. Not a company, nonprofit, or equity. Not a bank, exchange, or financial institution. Not a court, land registry, hospital, or police force. MiLyfe provides open tools; it does not claim authority over anyone.

---

## 3. We the People — The Anchor

> "We the People of the United States, in Order to form a more perfect Union... do ordain and establish this Constitution."
> — Preamble to the U.S. Constitution (public domain)

MiLyfe begins where the American promise begins — **We the People** — and treats those three words as universal. Power belongs to the people and stays with them, in every place the commons takes root. The U.S. is the proving ground; the principle belongs to everyone. As other communities and nations adopt MiLyfe, it evolves to honor *their* founding promises and *their* law of the land — but no one, anywhere, waits to begin.

This is codified in **The Oath**: 24 immutable principles that no vote of any size can amend. Principle 1 is "We the People." The rest include: free forever for rights, learning, and emergencies; no permanent power; open source forever; freedom to exit with your data; children first; truth in claims; and "not a state."

---

## 4. `$MLY` — The Community Credit

`$MLY` is a **community credit issued by public rules** inside the platform. It is real from day one. There is no CEO, no founder mint, no token sale, no APY, and no "investment in our team."

**Earn it** — a weekly universal basic income to every verified human member; completing real community quests (teaching, cleanup, care, verifying resources); and small, capped bonuses for accepting and spending locally.

**Spend it** — marketplace goods and services, any shop that chooses to accept it, thanking neighbors, and funding community projects.

**Trade it** — voluntarily and legally, peer-to-peer with anyone who consents (for cash, goods, food, or labor). The protocol does not gate a consensual peer payment.

**Save it** — personal jars, household shared jars, and community treasuries.

### What MiLyfe does **not** do with `$MLY`

It does not run an exchange, does not custody other people's money, does not sell `$MLY`, and does not pitch it as an investment. Anyone who chooses to operate a public cash-out or custody service is a separate business and follows their own jurisdiction's money-services rules (MSB / MiCA / local). MiLyfe does not run that booth.

**Safeguards against capture:** issuance is UBI-driven (no pre-mine beyond UBI); weekly earning caps prevent whales from eating the UBI pool; and rights, messaging, emergencies, learning, and health are never gated behind `$MLY`.

---

## 5. Architecture

MiLyfe is a modern, auditable web platform built entirely on open tooling:

- **Application:** Next.js (App Router) + React + TypeScript.
- **Data & auth:** PostgreSQL via Supabase, with Row-Level Security enforced across every table (dozens of tables, 100+ RLS policies) so data access is governed at the database, not just the app.
- **Security posture:** server-only privileged keys, browser-safe public keys, rich-text sanitized against XSS on write, and middleware that fails safe rather than exposing protected routes.
- **Resilience:** offline-first patterns so core functions survive network loss.
- **Openness:** the entire codebase is public under **AGPL-3.0** — anyone can inspect it, run it, and fork it. Public code, public votes. If it isn't in the open, it isn't the proof.

The platform was built with **$0 in outside capital over more than a decade of independent work** — proof that the barrier to civic infrastructure was never money.

---

## 6. Governance

- **Direct democracy:** members propose and vote where they live. Proposals and votes are public; sensitive ballots are private.
- **No founder keys on live systems.** Bootstrap stewards have sunset dates; provisional roles expire unless renewed by the community.
- **The Oath cannot be amended** by any vote — it is the floor beneath governance, not a subject of it.
- **Freedom to fork:** because the code is OSI-licensed, if a community believes governance is captured, it can fork the platform and take its people with it. The Oath travels with every fork.
- **Humans over helpers:** AI ("Mi") assists but never holds binding power over spending, child protection, or peace processes; humans can always override.

---

## 7. Why It Starts Here, For Everyone

MiLyfe launches in Jacksonville because that is where it can be proven in the hardest real-world conditions — and because the person building it lived those conditions. But the design target is universal: a commons any people, in any nation, can adopt and shape to their own law and their own founding promise.

Anyone, anywhere can sign up today. The platform is live, free, and open source. It works whether or not any election is won, because it does not depend on winning anything.

**We the People.**

---

*MiLyfe belongs to humanity. Governance belongs to the people where they live. This document describes the platform's design and intent; it is not legal, financial, or investment advice, and `$MLY` is not an investment.*
