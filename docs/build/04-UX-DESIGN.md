# UX Design — Surfacing the Architecture, Uniform with the Platform

> How the four strengths (local-first, secure, provable, sovereign) become **felt** in the interface.
> Companion to `00-BUILD-DESIGN.md`.
>
> **Guiding rule: stay uniform with the existing platform.** No new visual language, no new design
> system. Reuse the shell, the components, the vocabulary (Pocket / Learn / Street / Connect / Voice),
> the teal accent, and the existing patterns already in `src/components`. Every item below is an
> *addition inside the current design*, not a redesign.

---

## 1. Design principle

**Show state, don't lecture.** The platform already does this well — the offline indicator only
appears when there's something to say. Everything below follows that same "ambient, honest, disappears
when irrelevant" pattern and reuses existing primitives.

Each of the four architecture strengths is currently **invisible** to users even though the code is
real. The UX job is to surface them — uniformly.

---

## 2. Local-first — make "it's on your device" visible

**Reuses:** `OfflineIndicator`, `DataCacher`, the outbox, the `sonner` toasts, the `/offline` page,
the TopBar / DesktopHeader.

- **Honest action toasts.** Reuse the existing toast component. Two states, same style:
  - Online: "Done. Synced." (small cloud-check)
  - Offline: "Saved on your device. Will sync when you're back." (device icon)
- **Sync-status chip** in the header next to the avatar, matching existing header styling. Three
  states: green "All synced" / amber "N waiting" (tap → sheet listing queued items) / spinner "Syncing…".
- **Upgrade the `/offline` page** in the current visual style — frame it as strength, keep the honest
  "what still works" checklist that's already there.

---

## 3. Security — make "only you can read this" a visible seal

**Reuses:** existing chip / badge styles, the `Audience` type already in `src/lib/trust/types.ts`,
existing settings pages.

- **Lock chip** ("Encrypted on your device — even we can't read this") using the existing chip style,
  shown on the safety journal, private-by-default fields, and a privacy settings list.
- **Consistent audience picker** (`public / community / friends / private / custom`) — one reused
  control everywhere, same icons, least-visible default, current choice shown as a small pill.
- **Recovery-contacts onboarding step**, styled like the existing onboarding steps: "Pick 3 people you
  trust. Any 2 can help you recover your vault. We can't — that's the point."

---

## 4. Provable — make every action provable in one tap

**Reuses:** the `MiReceipt` object already generated, the existing sheet/drawer component, the public
`/receipts` route styling.

- **Universal "View receipt"** link in each action's toast and history row (existing list styling).
- **Receipt sheet** (reuse the current sheet component) shows, in plain language: what / when / who
  (you or which AI helper), reversible? (+ reverse button), the rule that allowed it (from MiScope),
  and a verifiable ID.
- **AI actions carry the same receipt + a "why"** — render the `explanation` field already in the
  MiAction schema, plus a small badge for which ring answered (on-device / community / cloud).

---

## 5. Sovereign — make "this instance is yours" legible

**Reuses:** the sidebar header, account/settings pages, the existing `rewards` / `contributions`
routes.

- **Instance identity badge** in the sidebar header, matching current header treatment — flagship
  reads "MiLyfe"; a download reads e.g. "Riverside Mutual Aid — your own instance".
- **"This is yours" settings panel** (existing settings layout): export all my data, the AGPL
  "read the code" link, services this instance runs, federation status (later).
- **"Strengthen the network" card** — reframe the existing `rewards` / `contributions` routes as the
  home for the future device-contribution layer (`02-DEVICE-CONTRIBUTION-SPEC.md`), shipped in v1 as an
  honest "coming soon" card with an interest toggle. Styled like existing cards.

---

## 6. Mapping to existing surfaces (nothing new invented)

| Pillar | UI home (existing) | Status |
|---|---|---|
| Local-first | Sync chip in TopBar, "Saved on device" toasts, `/offline` | Plumbing exists — surface it |
| Security | Lock chips, audience picker, recovery-contacts onboarding | Crypto exists — surface it |
| Provable | "View receipt" sheet from toasts + history | MiReceipt exists — surface it |
| Sovereign | Instance badge in sidebar, "This is yours" panel | Shell exists — add identity |
| Device rewards | Reframe `rewards` / `contributions` as "Strengthen the network" (stub) | Route exists — design intent only |

---

## 7. UX cut-line

**Ship in v1** (all surface existing real code, all uniform with the current design):
- Sync-status chip + honest "saved on device / synced" toasts
- Lock chips + consistent audience picker + recovery-contacts onboarding
- Universal receipt sheet (incl. AI "why" + ring badge)
- Instance identity badge + "This is yours" data-ownership panel

**Defer** (design the empty state now, in the same style):
- Federation / network-map UI
- Live device-contribution dashboard with real $MLY flow
- Mesh / peer status visualizations

---

## 8. The through-line

Every v1 UX item **renders code that already exists but is currently invisible**, using **only the
components and visual language the platform already has**. This is not a redesign — it's making a
secure, local-first, provable, sovereign architecture *felt* within the uniform look the platform
already ships.
