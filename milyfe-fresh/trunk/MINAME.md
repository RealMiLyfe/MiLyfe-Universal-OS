# MiName — Trunk Component 02

**Status:** `READY_FOR_REVIEW` (Phase 2).
**Sources:** Trunk design · Identity §4 (stack) · Manual MiDNS (P2), profiles (Part Thirteen).

- **Purpose:** human-readable names, aliases, and place/shop addressing that work offline without ICANN. Names are separate from identity, roles, permissions, data, reputation.
- **Users:** members (choose/change names), shops/places (pins), builders (addressing).
- **Owns:** name registry (unique within scope), aliases, reserved-word list, dispute queue (impersonation/squatting), offline name bundles (MiDNS), pronunciation + language metadata.
- **Does not own:** identity (MiID), reputation, balances, legal business-name registration.
- **Entities + data:** `names` (label, scope, entity ref, status, history) · `aliases` · `disputes`. Name change preserves permitted history + receipt; underlying stable ID never changes.
- **Permissions:** entity owner or delegate may claim/change within policy; disputes resolved by MiResolve with anti-impersonation priority (public figures, shops, helpers).
- **Contracts:** `miname.claim/release/change/lookup/dispute` (Phase 3). Offline lookup served from signed bundles with freshness dates.
- **Receipts:** every claim/change/release/dispute decision receipted.
- **Offline:** signed name bundles cached per place; lookups work offline with staleness labels; claims queue for sync (first-verified-wins with dispute path).
- **Security:** anti-homoglyph + anti-squatting rules; helper/shop impersonation fast-track to MiSecurity quarantine + MiResolve.
- **Accessibility:** pronunciation field, transliteration, RTL/CJK-safe rendering, screen-reader labels.
- **Support:** "someone took my name" flow with human review; youth names guardian-managed.
- **Legal:** names are not trademarks; legal business identity stays with MiLegal/MiForge records; takedown only via due process.
- **Metrics:** claim volume, dispute rate/resolution time, offline-hit rate.
- **Failure recovery:** disputed names freeze to prior holder pending review; no silent reassignment.
- **Export:** name history included in identity export.
- **Removal:** released names quarantine before reuse (anti-impersonation window); tombstone preserved.
- **Fork behavior:** forked cells keep name lineage; collisions resolved with suffix + receipt, never silent rename.
- **Activation gate:** claim→change→dispute→export cycle on test cell; gates 1,4,7,8 pass.
