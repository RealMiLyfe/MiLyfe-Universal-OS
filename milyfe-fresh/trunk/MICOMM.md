# MiComm — Trunk Component 15

**Status:** `READY_FOR_REVIEW` (Phase 2).
**Sources:** Trunk design · Manual MiChat/MiLetter/MiReach, messages (You tab), youth safety (no adult DMs), MiVoiceMail, notification strategy.

- **Purpose:** human communication — messages, calls, email, notifications — private by default, safe for youth, honest about delivery.
- **Users:** members, households, shops (customer threads), places (announcements), helpers (labeled participation).
- **Owns:** threads (Matrix-backed, federated when needed); delivery states; email (MiLetter, encrypted, no ads/scan); notifications (MiReach — default-on only for safety/money-governance-critical, everything else default-off, no engagement manipulation); async voice (MiVoiceMail DTN); announcement channels (place/circle).
- **Does not own:** transports (MiNet), content moderation verdicts (MiResolve + safety team), message content ownership (MiData private spaces).
- **Entities + data:** `threads` · `messages` (E2E where 1:1/sensitive) · `delivery_states` · `notification_prefs` · `announcements`. Youth: NO adult DMs ever; kid-safe surfaces (Kim desk); public rooms illegal-hash matched; private messages stay private.
- **Permissions:** contact requires consent/friending rules; youth contact = grown-up-approved only; announcements need role + scope; helper participation labeled.
- **Contracts:** `micomm.send/call/announce/notify/moderate-flag` (Phase 3); flag-not-censor pipeline to safety/MiResolve.
- **Receipts:** delivery/read states are member-visible receipts; announcement publications + moderation flags receipted.
- **Offline:** outbox + DTN async; voice notes over narrowband; delivery states sync honestly ("sent → carried → delivered").
- **Security:** E2E for private; no content on lock screen (neutral notifications); kiosk session clearing; abuse → quarantine + MiResolve.
- **Accessibility:** captions, screen-reader order, plain-language notifications, 10+ languages, audio-first modes.
- **Support:** harassment blocking/reporting in-thread; "make it stop" one-tap (block + hide + report + human review).
- **Legal:** youth privacy (COPPA-class) compliance; lawful-process handling per Phase 8/9; no forced disclosure of sources (press protections via Pia flows).
- **Metrics:** delivery success/latency, report volume/resolution, notification opt-out rates (health signal), abuse recurrence.
- **Failure recovery:** failed sends retry with honesty; lost threads restored from twin backups; moderation errors correctable + receipted.
- **Export:** full thread + notification history exportable, even during dispute.
- **Removal:** message deletion per thread policy + retention law; account leave purges per MiData rules.
- **Fork behavior:** threads don't cross forks; announcements scoped to cell; federation only via explicit bridges.
- **Activation gate:** send→deliver→report→block→export drill incl. youth-guardRails + offline; gates 1,2,4,6,7,8 pass.
