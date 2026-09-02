# Device Contribution & Auto-Provisioning — Design Spec

> ⚠️ **Snapshot note:** Original design from an earlier session. This is v3
> design-only and does not conflict with the built platform — it layers on top.
> Current build state: `SESSION-RECAP.md` / `05-WHATS-LEFT.md`.

> The one layer whose ingredients were scattered across the architecture with no unified spec. This
> document unifies them. It turns "everyone downloads an isolated island" into "everyone's device
> strengthens a shared mesh — and gets paid for it." Companion to `00-BUILD-DESIGN.md`.
>
> **Status:** design-only. Target: **v3** (depends on federation + mesh + reward engine).

---

## 1. The problem this solves

Today's scattered pieces:
- **MiTURN** (OS 4): members opt in to relay traffic, earn a small $MLY quest reward for uptime.
- **MiESP nodes** / **Hybrid Node** (bounty P12-10): "run a node from home — contribute storage,
  compute, relay."
- **Validator compensation** (OS 6): fixed $MLY per block.
- **Coordinape guild economics** (OS 9): peer-allocated points → proportional $MLY, 5% floor / 25% cap.
- **Hardware auto-detect** (Mesh-in-a-Box installer): detects CPU / RAM / storage / GPU.
- **MiStage + opt-out zones**: consent and community-vote gating.

**The gap:** no single flow that says *device joins → detect capability → propose contribution → owner
chooses → contribution is measured → $MLY flows at a defined rate.* This spec is that flow.

---

## 2. Principles

1. **Auto-detect, never auto-enroll.** The system proposes; the owner always decides.
2. **Consent is explicit and revocable.** Any contribution can be paused or stopped instantly.
3. **Reward usefulness, not just presence.** Payout tracks *measured, verified* contribution.
4. **Fairness caps.** No device or operator can dominate rewards (floor + cap, per Coordinape model).
5. **Privacy first.** Contributing relay/storage/compute never exposes member data; contributed
   storage holds only **encrypted, sharded** blocks the host cannot read.
6. **Local sovereignty.** A community can disable contribution entirely (opt-out zone) by MiStage vote.

---

## 3. The four contribution types

| Type | What the device gives | Measured by | Example hardware |
|---|---|---|---|
| **Relay** | Forwards traffic for peers (TURN / mesh hop) | Verified relay-seconds + bytes relayed | Any always-on device |
| **Storage** | Holds encrypted, sharded blocks for the network | Verified stored-GB-hours + retrieval success | NAS, spare disk, Pi + SSD |
| **Compute** | Runs inference (Ring 1) or background jobs | Verified job-seconds (by class) | GPU box, spare desktop |
| **Bandwidth** | Serves cached content / media to nearby peers | Verified served-bytes to distinct peers | Home fiber node |

A device may contribute **any combination**. The proposed profile depends on detected capability.

---

## 4. The flow (device lifecycle)

```
1. JOIN            Device joins an instance (MiBoot / NFC tap / install).
2. DETECT          Auto-detect capability: CPU arch, cores, RAM, free storage, GPU,
                   power profile (battery vs. plugged), uptime pattern, bandwidth.
3. PROPOSE         Generate a suggested Contribution Profile from capability + community need.
4. CHOOSE          Owner reviews the proposal and: Accept as-is | Tune sliders | Decline.
                   Nothing runs until the owner confirms.
5. PROVISION       Configure only the accepted contributions. Auto-config the technical
                   details; the owner controls the *what* and *how much*.
6. MEASURE         Continuously measure verified contribution (Section 5).
7. REWARD          Convert measured contribution → $MLY at the defined rate (Section 6).
8. ADJUST / STOP   Owner can retune or stop any time; instantly reflected.
```

### Auto-detect → proposal logic (illustrative)

- Battery device, intermittent uptime → propose **Relay (light)** only; never storage.
- Always-on Pi + SSD → propose **Storage** + **Relay**.
- Desktop with GPU, plugged in → propose **Compute (Ring 1)** + **Relay**.
- Fiber + always-on → add **Bandwidth**.

The proposal always includes an **estimated $MLY/week** range and an **estimated resource cost**
(power, data cap impact) so the owner makes an informed choice.

---

## 5. Measurement (anti-gaming)

Contribution must be **verified**, not self-reported:

- **Relay:** peers sign receipts for hops actually forwarded (MiReceipt at the transport layer).
  Payout uses corroborated relay-seconds, not claimed uptime.
- **Storage:** periodic **proof-of-retrievability** challenges — the network asks the host to return a
  random shard; failures reduce the trust score and pause payout.
- **Compute:** jobs return signed completion receipts; results spot-checked against redundant runs.
- **Bandwidth:** distinct-peer served-bytes, deduplicated to prevent self-dealing.

Each device carries a **contribution trust score** that rises with verified delivery and drops on
failed challenges. Payout rate scales with trust score.

---

## 6. Reward model ($MLY)

Contribution feeds the existing **Coordinape-style distribution**:

- Each epoch, verified contribution is normalized into contribution points by type and trust score.
- Points convert to $MLY from a **contribution reward pool** (funded per OS 6 economics).
- **Floor:** any verified contributor earns at least a minimum (prevents winner-take-all starvation).
- **Cap:** no single operator exceeds a maximum share per epoch (prevents centralization; mirrors the
  5% floor / 25% cap principle).
- Rewards are **$MLY quests/receipts** in v3 SQL-ledger form; migrate to on-chain when OS 6 gates open.

**Rate definition (to be finalized by governance):** a published `contribution_rate` table mapping
each verified unit (relay-second, stored-GB-hour, compute-job-second, served-MB) to base points,
multiplied by trust score, subject to floor/cap. Governance can adjust via proposal.

---

## 7. Auto-provisioning with choice (the UX contract)

- **Detect silently, propose visibly.** The owner sees a single "Strengthen the network" card.
- **One-tap accept** of the recommended profile, or **expand to tune** per-type sliders (e.g. "cap
  storage at 20 GB", "relay only on Wi-Fi", "compute only when plugged in & idle").
- **Guardrails the owner sets:** metered-connection limits, battery floor, quiet hours, storage cap.
- **Always-visible status:** what's contributing right now, this epoch's earned $MLY, and a big
  **Pause / Stop** control.
- **Community layer (MiStage):** a community can vote to enable/disable contribution, set opt-out
  zones, or require minimum guardrails. Consent is layered: **community allows → owner opts in**.

(UI placement: reuse the existing `rewards` / `contributions` routes — see `04-UX-DESIGN.md`.)

---

## 8. Safety & privacy rules (non-negotiable)

- Contributed **storage holds only encrypted, sharded** data; the host can never read it.
- Contributed **compute never processes** safety, identity, or child data.
- **Relay** sees only routing metadata, never plaintext payloads (E2EE end-to-end).
- Contribution **never runs without explicit owner opt-in**, and stops instantly on request.
- **Child devices** are never enrolled.

---

## 9. Dependencies & sequencing

Cannot ship before its foundations:

1. Federation protocol (peers to relay/serve between) — v2
2. Mesh transport (MiTURN / MiDTN) — v3
3. Reward engine + $MLY pool (OS 6 / OS 9 Coordinape) — v3
4. Proof-of-retrievability + signed transport receipts — v3

**v1/v2 stub:** ship only the "Strengthen the network — coming soon" card with an interest toggle
(honest, no overpromise). Build the real engine in v3.

---

## 10. Open questions for governance

- Final `contribution_rate` values and epoch length.
- Reward-pool funding source and sustainability model.
- Trust-score curve (how fast it rises/falls; failure penalties).
- Whether compute contribution to Ring 1 is community-scoped only, or cross-instance.
