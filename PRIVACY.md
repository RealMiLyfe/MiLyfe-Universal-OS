# MiLyfe Privacy Policy

**Last updated: 2026 · Version 1.0**

> **Plain-language summary:** MiLyfe collects only what it needs to run the platform for you. We do not sell your data, we do not run ads, and we are not an engagement or data-extraction business. Your most sensitive information (like your safety journal) is encrypted so even we cannot read it. You can export your data and delete your account at any time.
>
> This document is provided in good faith and describes how the platform actually works. It is not a substitute for legal advice. Because MiLyfe is used by people in many places, your local privacy laws may give you additional rights.

---

## 1. Who this covers

This policy applies to the MiLyfe platform (the web application and its services). MiLyfe is a voluntary commons, open to anyone, anywhere, from day one. It is **not** a government, a company selling your data, or an advertising business.

## 2. What we collect

We collect only the data required to provide the features you choose to use.

**Account & profile**
- Email address (for sign-in and account recovery)
- Username and display name
- Optional: bio, neighborhood, avatar image, preferred language

**Economy (`$MLY`)**
- Wallet balances, transactions, quests you post or complete, rewards, and standing. These records exist so the credit system works and can be audited.

**Participation**
- Governance proposals and votes (votes on sensitive matters are kept private), forum posts, wiki edits, messages, connections, and attestations you give or receive.

**Optional, sensitive features you opt into**
- **Health check-ins:** mood, energy, sleep, and personal notes you choose to log.
- **Safety tools:** trusted emergency contacts (name, optional phone), and a **safety journal that is encrypted on your device — the server stores only ciphertext and cannot read it.**
- **Location:** approximate coordinates only when you attach a location to a listing, quest, or resource. You are never required to share location to use core features.
- **Voter status:** if you choose to record it, it is **private by default** and visible only to you.

**Technical**
- Standard security and operational data (e.g., authentication cookies, a language-preference cookie, and server logs needed to run and secure the service).

## 3. What we do NOT do

- We do **not** sell or rent your personal data.
- We do **not** run advertising or ad-tracking.
- We do **not** build engagement profiles to manipulate your attention.
- We do **not** require location, health, or voter data to use rights, learning, messaging, or emergency features.
- `$MLY` is a community credit, not a financial product; we do not custody outside money or operate an exchange.

## 4. How your data is protected

- **Row-Level Security (RLS)** is enforced at the database on every table, so your records are only accessible to you and the people you explicitly share with.
- **Client-side encryption** for the safety journal — decryption keys stay with you.
- **Privileged keys are server-only**; the browser only ever receives keys that are safe to be public.
- **Least-visibility defaults:** sensitive fields (voter status, private votes, safety data) default to private.

No system is perfectly secure, and we describe our safeguards honestly rather than promising the impossible.

## 5. Sharing

We share data only in these limited cases:
- **With people you choose** — e.g., a public profile, a listing, a proposal, or a message recipient.
- **Service providers** that host and run the platform (for example, our database/auth host and our deployment host), strictly to operate the service.
- **Legal requirements** — if compelled by valid legal process under applicable law. We aim to disclose the minimum necessary.

We do not share your data with advertisers or data brokers, because there are none.

## 6. Your rights and controls

- **Access & export:** you can take your data with you. Freedom to exit with your data is one of the platform's immutable principles.
- **Correction:** edit your profile and content at any time.
- **Deletion:** delete your account; personal records tied to your account are removed (`ON DELETE CASCADE`). Some ledger entries may be retained in de-identified form where required for the integrity of the shared economy.
- **Language & visibility:** control your language and the visibility of sensitive fields from your profile.

Depending on where you live, you may have additional rights (for example under GDPR, CCPA/CPRA, or local law). We honor applicable rights requests.

## 7. Children

Children's safety is a core principle. Features involving minors are gated, and the platform is designed "children first." We do not knowingly collect data from children in violation of applicable law. If you believe a child's data has been collected improperly, contact us and we will address it.

## 8. Openness

MiLyfe is open source (AGPL-3.0). You do not have to take our word for how data is handled — you can read the code, including the database rules that enforce access. Public code, public rules.

## 9. Changes

We may update this policy as the platform evolves. Material changes will be noted in the repository history and, where significant, surfaced in the app.

## 10. Contact

Questions or requests: **contact@milyfe.fun**

---

*This policy reflects the platform's design and intent as of the version above. It is informational and not legal advice. For a deployment serving a specific jurisdiction, have counsel review this document against local requirements.*
