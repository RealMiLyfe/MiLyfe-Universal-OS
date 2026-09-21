# MiLyfe Architecture Source of Truth

**Status:** Build authority

## Authority order

1. Adopted MiLyfe Constitution and Commons Charter
2. Root `AGENTS.md` and security rules
3. Approved ADRs
4. Versioned contracts
5. OS manifests and data boundaries
6. Roadmaps and release gates
7. Issue specifications
8. Agent assumptions

## System definition

MiLyfe is a people-owned network of bounded OSes operating inside recursive cells. Kernel provides shared authority primitives; OSes own domain responsibilities; MiScale controls staged growth; MiSecurity controls security assurance; MiDev controls building and publishing; humans approve reserved actions.

## Architecture invariants

- One authoritative `$MLY` ledger
- No hidden central custody
- No negative balances
- No authority without scope
- No consequential action without a receipt
- No public claim without evidence
- No agent self-authorization
- No OS duplicate source of truth
- No campaign, election, public-office, legal, health, or justice collapse
- No implementation without contract, test, security, support, and rollback design

## Change rule

Any change to an invariant, authority boundary, contract family, or high-impact OS requires an ADR and human approval.
