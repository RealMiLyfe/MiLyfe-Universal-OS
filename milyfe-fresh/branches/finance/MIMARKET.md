# MiMarket — Finance Branch (Phase 6)

**Status:** `READY_FOR_REVIEW`. **Plain value:** buy and sell with neighbors — food, services, rides, goods, gigs — local first, honest reviews, refunds that work.
**Sources:** Finance design §3 · Manual marketplace (Food/Services/Rides/Goods/Education/Housing/Jobs), shops, Dex helper, complaint SLA.

- **Purpose:** listings, goods, services, orders, bookings, classifieds, jobs/gigs, rides+delivery profiles, reviews, refunds, disputes, merchant tools, marketplace fees.
- **Users:** buyers, sellers/shops, couriers/drivers, moderators, support.
- **Owns:** listing lifecycle (draft→published→ordered→fulfilled→reviewed); order state machine (placed→accepted→in-progress→delivered→complete/disputed/refunded); bookings; ride/delivery profiles (peer-coordinated, no surge pricing); reviews (verified-purchase-weighted, no fake-review market); refunds (policy + instant where policy allows); merchant tools (till, dual pricing, surplus, hire board, community-day toggle, tax export); fee schedule (visible, change needs H if material).
- **Does not own:** the ledger (settlement via MiMoney), regulated professional authority, legal verdicts (disputes → MiResolve).
- **Entities + data:** `listings` (seller, terms, freshness) · `orders` · `bookings` · `ride_profiles` · `reviews` · `refunds` · `fee_rules`. Fees visible pre-purchase, always; no hidden fees ever.
- **Permissions:** list/sell per shop + place policy; fee changes = MiMarket E + cell A (+H if material); takedowns via due process (notice + appeal), never silent except imminent-harm quarantine.
- **Contracts:** `market.list/order/book/review/refund/dispute-open/fee-change` + handoffs to money (holds/capture/release/refund settlement), resolve (disputes), place (local discovery), work (gig fulfillment), legal (regulated categories default-deny).
- **Receipts:** listings, orders, payments (via MiMoney), deliveries, reviews, refunds, fee changes, takedowns.
- **Offline:** listings + orders cached; order placement queues; fulfillment confirmations store-carry-forward; disputes file offline.
- **Security:** seller verification tiers; escrow-ish holds for high-risk categories (policy-defined); review fraud detection; marketplace concentration monitoring.
- **Accessibility:** voice/photo-first listing; plain order tracking; human merchant support; languages.
- **Support:** merchant + buyer support desks; complaint button (answered ≤7 days or "doesn't answer" note); dispute entry one-tap.
- **Legal:** regulated goods/services default-deny per jurisdiction profiles; tax export; consumer terms; business/campaign data separation enforced.
- **Metrics:** GMV (settled only — projected never counted), order success/refund/dispute rates, review integrity, fee revenue, merchant retention.
- **Failure recovery:** failed fulfillment → refund + rebook + remedy; payment capture failure → honest pending + retry; listing errors → correction + notice.
- **Export:** full order/review/fee history exportable by both sides, even during dispute.
- **Removal:** listings retired with notice; orders archived; seller exit with obligations checklist (open orders honored or refunded).
- **Fork behavior:** markets stay in cell; cross-cell orders via explicit bridge + consent + settled transfers.
- **Activation gate:** synthetic sellers/buyers run list→order→fulfill→review→refund→dispute→export incl. offline order + fee-change vote; gates 1,2,4,5,6,7,8 pass.
