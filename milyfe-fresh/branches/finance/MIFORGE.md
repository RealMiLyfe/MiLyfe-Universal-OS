# MiForge — Finance Branch (Phase 6)

**Status:** `READY_FOR_REVIEW`. **Plain value:** turn your skill into your first income — offers, customers, and support — plus the founding-member engine (first 1,200: 200 Pro + 1,000 Daily) with $MLY welcome credits.
**Sources:** Finance design §2 · V2 §7 · Manual quests/contributions/circulation, shop product, Season Method; old-tree ref `vault/miforge/` (Whop webhook EXCLUDED — MiLyfe-native webhooks only).

- **Purpose:** venture, business, service, product, agent, workflow, and first-income creation + founding cohort operations.
- **Users:** founders, shops, creators, contributors, cohort members, stewards.
- **Owns:** venture lifecycle (idea → offer → customers → income → books); value contracts (contributor roles, splits, deliverables); offer publishing pipeline to MiMarket; founding-cohort engine: 11 tables — `cohorts, members, onboarding_flows, progress, status_snapshots, cron_jobs, key_rotations, sentinel_checks, webhooks, emails, dashboard_metrics`; stuck-member detection (stall → nudge → human support); welcome-credit disbursement (settled postings under explicit per-cohort treasury budgets, anti-farming: personhood + duplicate review + caps); dashboard metrics (activation, stuck, income-first milestones).
- **Does not own:** money creation (no $MLY merely for proposing/signing up — welcome credits are explicit budgeted treasury ops, not mint-on-signup); ledger; marketplace orders; employment claims.
- **Entities + data:** `ventures` (owner, offer, stage) · `value_contracts` · `contributor_roles` · cohort 11 tables above. Member counts/amounts: budgets locked until Phase 10 sign-off (MiScale).
- **Permissions:** publish offer = owner + place/shop policy; welcome budgets = treasury H; webhooks = MiLyfe-native signed (no Whop/Stripe/GoCardless handlers anywhere); cron/key-rotation/sentinel ops scoped + logged.
- **Contracts:** `forge.venture/contract/publish/cohort/member/nudge/welcome/disburse/snapshot` + handoffs to market (offers), money (settlement/welcome postings), work (contributor records), gov (oversight), scale (activation).
- **Receipts:** venture milestones, contracts, publications, cohort joins, welcome postings, nudges, snapshots.
- **Offline:** offer drafts + cohort progress on-device; publishing queues; welcome disbursement needs connectivity + authority check (never offline-minted).
- **Security:** anti-farming (personhood paths, duplicate-account review, device signals, caps); webhook signature verification; key rotation without downtime; sentinel anomaly checks.
- **Accessibility:** first-income flows in plain language; human founder coaches; low-tech offer paths (voice/photo-first).
- **Support:** founder support desk; stuck-member rescue; "my welcome didn't arrive" tracer.
- **Legal:** business/shop compliance via MiLegal profiles; no recruitment-as-earned-work claims; tax/registration guidance routing (not advice).
- **Metrics:** ventures launched, first-income rate/time, cohort activation/stuck/rescue, welcome budget burn, farming blocks, dashboard freshness.
- **Failure recovery:** stuck cohorts → sentinel alert + human swarm; failed disbursement → reconcile + retry + receipt; webhook outage → queue + replay.
- **Export:** venture + member + cohort history exportable.
- **Removal:** ventures close with obligations checklist; cohort exit preserves records; webhooks deregistered cleanly.
- **Fork behavior:** ventures/cohorts stay in cell; expansion to new cells is explicit launch with lineage.
- **Activation gate:** synthetic 12-member cohort (2 Pro-track + 10 Daily-track) runs join→stuck→rescue→welcome→first-income→export; gates 1,2,4,5,6,7,8 pass.
