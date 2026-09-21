# MiLyfe Finance Branch Design

**Status:** Focused design phase
**Primary OSes:** MiForge, MiMarket, MiMoney, MiWork · V2-aligned 2026-09-21
**Binding rail spec:** `FINANCE-BRANCH-CRYPTO-RAIL-V2.md` — No GoCardless, no Whop, no Stripe, no Visa/MC rails for $MLY. Crypto (USDC/USDT/SOL/BTC/ETH/XRP) + cash via trusted nodes in, $MLY sole ledger, swap out via community nodes P2P, own cards (digital NFC phone-first MiPay BLE/NFC/QR offline store-carry-forward; plastic later on own network).

## 1. Branch purpose

The Finance Branch helps people and organizations learn, work, create, exchange, earn, settle, protect, and reinvest real value.

## 2. MiForge

Owns venture, business, service, product, agent, workflow, and first-income creation.

It does not create money merely because a venture is proposed or a user signs up.

## 3. MiMarket

Owns listings, goods, services, orders, bookings, classifieds, jobs, rides and delivery profiles, reviews, refunds, disputes, merchant tools, and marketplace fees.

It does not own the authoritative ledger or regulated professional authority.

## 4. MiMoney

Owns one authoritative MLY ledger, pending and settled states, verified contributions, rewards, treasury interfaces, reserves, refunds, reversals, reconciliation, and financial receipts. (Balances/postings/settlement wording in detailed specs = same meaning; see MIMONEY.md.)

It does not automatically authorize USD conversion, redemption, custody, or regulated financial activity.

## 5. MiWork

Owns work opportunities, contributions, skills, jobs, gigs, apprenticeships, service work, contributor records, work agreements, and livelihood paths.

It does not use recruitment alone as earned work or create hidden employment claims.

## 6. Branch contracts

Finance receives identity, business nodes, permissions, data spaces, device capacity, security, legal status, and support from the trunk. It returns offers, work records, orders, settlements, rewards, reserves, risks, and receipts.

## 7. Branch risks

- Financial overclaim
- Fraud and reward farming
- Hidden fees
- Negative balances
- Unverified work
- Worker exploitation
- Customer harm
- Tax and accounting failure
- Unlicensed money activity
- Marketplace concentration

## 8. Design gates

- Value states are explicit
- No negative balances
- Ledger invariants are tested
- Business and campaign data are separated
- Merchant and provider terms exist
- Refunds and disputes work
- Reserves and reconciliation exist
- USD-facing rails remain locked until risk/disclosure/partner review + evidence + human approval (outside touchpoints only)
- Contributors receive verified receipts
