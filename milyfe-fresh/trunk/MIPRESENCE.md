# MiPresence — Trunk Component 05

**Status:** `READY_FOR_REVIEW` (Phase 2).
**Sources:** Trunk design · Identity §4 · Manual "You" tab (privacy live display), safety (leave-now), MiPulse, shared-device safety.

- **Purpose:** live continuity — who/what is present, where, on which device, in which cell — with honest visibility. Members always see what is visible about them.
- **Users:** members (availability, safety), households (check-ins THEY set), shops (open/on-call), helpers (reachability), community (ambient pulse, never surveillance).
- **Owns:** sessions (device, cell, context, expiry); presence states (available/busy/hidden/offline/emergency); visibility rules per surface; live displays ("right now, 0 people can see your location"); check-in schedules (elder-set, never silent tracking); walking-home timers; MiPulse ambient inputs (dark radios, missed check-ins, empty pins — weather, not wanted board).
- **Does not own:** identity, message content, location history storage (MiData), surveillance or tracking features (explicitly out of scope).
- **Entities + data:** `sessions` · `presence_states` · `visibility_rules` · `checkins` · `timers`. Location approximate + opt-in only; youth: no public location ever; no public live map of bodies; no stranger face-ID.
- **Permissions:** presence visible only per MiScope grants; hidden/offline always available; emergency mode (leave-now) hides location + freezes jars + kills sessions in one tap.
- **Contracts:** `mipresence.set-state/start-session/end-session/checkin/timer/pulse-input` (Phase 3); state changes emit privacy-aware events.
- **Receipts:** session grants/revocations, visibility changes, timer outcomes, emergency activations receipted to the member.
- **Offline:** presence degrades honestly ("last seen …", staleness labeled); timers run on-device; check-ins queue; mesh relays presence without content.
- **Security:** session invalidation on panic freeze; kiosk timeout/handoff; neutral lock-screen notifications; cached-location removal on logout.
- **Accessibility:** one-tap safety (leave-now, walking-home, freeze) from any screen; haptic + audio confirmation; status in plain words.
- **Support:** "someone can see me and I don't know why" inspector + instant hide + human help.
- **Legal:** presence data minimized; no retention beyond policy; lawful requests follow Phase 8/9 process.
- **Metrics:** session counts, safety-activation outcomes, timer completions, pulse accuracy (false-calm/false-alarm review).
- **Failure recovery:** expired sessions auto-close; stuck "visible" states fail to hidden; timers fail-safe (alert on expiry without arrival).
- **Export:** session/visibility history in identity export.
- **Removal:** sessions purged on logout/leave; presence history follows retention schedule.
- **Fork behavior:** presence never crosses forks; each cell has independent presence; no cross-cell tracking.
- **Activation gate:** set-state→timer→leave-now→export drill incl. offline; gates 1,2,4,6,7,8 pass.
