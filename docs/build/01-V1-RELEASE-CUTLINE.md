# v1 Release Cut-Line — "The Sovereign Single Instance"

> ⚠️ **Snapshot note:** Original design from an earlier session; direction holds.
> Some items marked "ship in v1" / "cut the cord" are **already done** in the later
> build (Stripe/processor traces removed, app is sovereign, receipts/encryption
> shipped). Verify against `SESSION-RECAP.md` before treating anything here as
> outstanding work.

> The exact ship/defer list for the first public release, plus the file-by-file work to decouple the
> downloadable platform from the private Hyperbolic Time Chamber. Companion to `00-BUILD-DESIGN.md`.

---

## 1. The v1 goal

Release the **maximum value out the door**: a downloadable, self-hostable, local-first,
client-encrypted single-community instance with the full civic platform and graceful-degrading AI.

Success criteria for v1:
1. A community can `git clone`, point at their **own** Supabase, and run — with **zero** dependency on
   the Chamber or any private endpoint.
2. Core features work **offline** and sync on reconnect.
3. Sensitive data is **client-encrypted**; the server stores ciphertext only.
4. Every state-changing action produces a **receipt**.
5. The AI (Mi) functions with **no cloud key** (local/community fallback).

---

## 2. SHIP in v1

All of these **surface code that already exists** — they are not new systems.

- **The civic platform (already built):** Pocket ($MLY UBI / thank / transfer), Learn, Street
  (marketplace / quests / resources), Voice (governance), Safety, Mi, MiJustice, and the 10 population
  flows (reentry, shelter, DV-safety, elders, youth, recovery, veterans, access, immigrant, parents).
- **Local-first promoted to headline:** sync-status chip + honest "Saved on your device / Synced"
  toasts (see `04-UX-DESIGN.md`).
- **Security surfaced:** lock chips, consistent audience picker, recovery-contacts onboarding step.
- **Receipts surfaced:** universal receipt sheet, including the AI "why" + which ring answered.
- **Instance identity:** "this is your instance" badge + "This is yours" data-ownership panel.
- **Downloadable package:** Chamber cord cut (Section 4), one-command install pointing at the
  community's own Supabase, AGPL-3.0.
- **AI degrades gracefully:** Mi runs the existing provider fallback chain; no cloud key required.

---

## 3. DEFER (design the empty state now, build later)

| Deferred | Why safe to defer | Target |
|---|---|---|
| Federation / network map UI | Needs stable device + instance layers first | v2 |
| CRDT multi-device merge | Single-device-per-user is fine at launch; first/last-write-wins acceptable | v2 |
| Vault key recovery (2-of-3) built | Onboarding step ships; full recovery flow later | v2 |
| Self-hosted infra (K3s/MinIO/OpenBao) | v1 rides cloud Supabase | v2 |
| Live device-contribution dashboard + $MLY flow | Needs the reward engine (`02-...`) | v3 |
| Mesh / peer visualizations | Needs MiDTN / MiMesh | v3 |
| On-chain $MLY | Gated behind 1,000 members + 180-day testnet | v3 |

---

## 4. Chamber decoupling — file-by-file

**Key finding from the audit:** the platform `src/` is **already clean**. The campaign / Chamber
coupling lives almost entirely in **documentation and the separate static mayor site**, not in the
app's runtime code. The work is smaller than expected.

### 4.1 Confirmed couplings

| Coupling | Where it lives | Runtime impact | Action |
|---|---|---|---|
| `campaign-api.milyfe.fun` (petition, volunteer intake, live citizen counter) | `ARCHITECTURE.md` only; the actual callers are the **static mayor site** (`mijaxx.fun`), **not** this Next.js app | **None** on the app | Documentation edit only |
| "Citizen count" | `src/app/page.tsx`, `src/app/(platform)/home/*`, `src/app/(platform)/treasury/*` | Reads the app's **own** Supabase `community_treasury` table — **not** campaign-api | **No change needed** (already sovereign) |
| Meilisearch | `CommandSearch` component + `/api/search` | **Already falls back to Supabase text search when not configured** | Verify fallback; make Meilisearch fully optional |
| Hardcoded `milyfe.fun` domains | `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `ARCHITECTURE.md`, legal content | Cosmetic / contact info | Make instance-configurable or genericize |

### 4.2 Concrete tasks

1. **Verify no runtime call to `campaign-api`.** Audit confirms callers are the static mayor site, not
   `src/`. Add a guard/test asserting the app makes no request to `campaign-api.*` or any
   `*.milyfe.fun` private endpoint.
2. **Make Meilisearch strictly optional.** Confirm `CommandSearch` and `/api/search` degrade to
   Supabase full-text search when `MEILISEARCH_*` is unset. Document as an optional enhancement.
3. **Genericize domains.** Replace hardcoded `milyfe.fun` references with an instance-configurable
   value (env var / instance config) for contact email, governance URL, forum URL, and legal contact.
   Flagship keeps `milyfe.fun`; a download shows its own.
4. **Split docs.** Move Chamber/campaign specifics (petition, mayor site, campaign-api, DNS tunnels)
   **out** of the shipped `ARCHITECTURE.md` into a private, non-distributed doc. The public
   `ARCHITECTURE.md` should describe only the civic platform.
5. **Strip campaign env from `.env.example`.** Ensure the download's example env contains only what a
   generic community needs (Supabase + optional AI keys). Remove any campaign/Chamber secrets.
6. **Instance identity config.** Add a single instance-config surface (name, contact, governance URL,
   optional AI keys) that the setup step writes — so nobody hand-edits scattered files.

### 4.3 What does NOT need cutting (good news)

- Wallet, UBI, treasury, standing, governance, learn, street, safety, justice, Mi — all run on the
  app's own Supabase. **Sovereign already.**
- The offline/outbox/sync layer and the encryption layer — **portable as-is.**
- The AI fallback chain — already provider-agnostic and cloud-optional.

---

## 5. The one-command install target

An end-user's entire experience should be:

```
git clone <repo>
cd milyfe-platform
cp .env.local.example .env.local   # then fill in their own Supabase keys
npm install
npm run db:migrate                  # existing script
npm run db:seed                     # existing script
npm run dev
```

The only unavoidable manual step is creating a free Supabase project and pasting three keys.
Everything else is already scripted. A future setup wizard (v2) removes even that.

---

## 6. v1 exit checklist

- [ ] App makes zero requests to any private `*.milyfe.fun` endpoint (guard/test in place)
- [ ] Search works with Meilisearch **unset** (Supabase fallback verified)
- [ ] Domains/contacts are instance-configurable; nothing hardcoded to the flagship
- [ ] Public `ARCHITECTURE.md` contains no Chamber/campaign material
- [ ] `.env.local.example` contains only generic-community keys
- [ ] Offline: thank / vote / claim queue and replay correctly
- [ ] Safety journal encrypts client-side; server row is ciphertext
- [ ] Every state-changing action yields a viewable receipt
- [ ] Mi answers with no cloud key configured
- [ ] Fresh clone → own Supabase → running app, with no private dependencies
