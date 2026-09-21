# MiPlace — Lifestyle Branch (Phase 5)

**Status:** `READY_FOR_REVIEW`. **Plain value:** your street, alive — food, rides, repairs, resources, and neighbors who show up. Local first, never surveillance.
**Sources:** Lifestyle design §4 · Manual Street tab (marketplace/quests/surplus/resources/shops/rides/pulse/counters), Place profile, MiPulse, shops first-class.

- **Purpose:** local life coordination — housing, food, energy, water, transportation, repair, emergency resources, community projects, local services, neighborhood participation.
- **Owns:** place charters + pots + hello-day calendars + languages + child policy (never weaker than MiChildGate); resource directory (shelters, food banks, legal aid, clinics — with freshness dates); surplus flows (food-that-will-spoil → neighbors); quest boards (real tasks); ride shares ("going to X at T, room for 2"); repair crews; shop pins (hours, accessibility, $MLY/cash/card, surplus, hire board, complaint button answered ≤7 days, community-day toggle, staff cards, simple till + tax export); community projects; MiPulse inputs; live counters.
- **Does not own:** government, emergency authorities, utilities, courts, licensed providers, money ledger, identity.
- **Entities + data:** `places` (charter, pot, calendar, radios, on-call) · `resources` (MiSource freshness) · `surplus_pins` · `quests` · `rides` · `shops` · `projects`. Location approximate; no public live map of bodies; no face-hunt.
- **Permissions:** place roles (keeper, on-call, steward); shop staff roles; project treasuries; announcements scoped; cameras only if street votes (event-only, stranger-ID off).
- **Contracts:** `place.charter/resource/surplus/quest/ride/shop/project/announce` + handoffs to market (shop commerce), money (pots/settlement), work (hire boards/gigs), care (place-based care), justice (emergency/defense circles).
- **Receipts:** pot spends, quest completion, surplus claims, ride shares, shop complaints/responses, project milestones.
- **Offline:** street bundles cached (resources, pins, quests, shop cards); claims queue; mesh sync; freshness dates always shown.
- **Security:** resource freshness enforcement (stale = labeled, then hidden); shop complaint SLA tracked ("doesn't answer" standing note); anti-scam pins.
- **Accessibility:** resource access for no-address members (library/kiosk OK); languages; audio; human place greeters.
- **Support:** place keepers; "resource was wrong" correction flow; project coaching.
- **Legal:** not a government; emergency escalation to real authorities (defined, never replaced); shop compliance via MiLegal profiles.
- **Metrics:** resource freshness, surplus rescue volume, quest completion, ride shares, shop response SLA, project outcomes, pulse accuracy.
- **Failure recovery:** stale/closed resource → delist + correction + receipt; failed quest → re-post + remedy; pot misuse → freeze + gov review.
- **Export:** place records + member's place history exportable.
- **Removal:** resources delisted with reason; shops close with notice + books export; projects sunset with accounting.
- **Fork behavior:** places fork with charter lineage + pot split rules (pre-agreed, receipted); shared resources re-consented.
- **Activation gate:** synthetic street runs surplus→quest→ride→shop-complaint→project→export incl. offline freshness drill; gates 1,2,4,5,6,7,8 pass.
