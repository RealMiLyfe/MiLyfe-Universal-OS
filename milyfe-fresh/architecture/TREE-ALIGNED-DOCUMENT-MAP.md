# MiLyfe Tree-Aligned Document Map

**Status:** Design-phase source of truth
**Purpose:** Connect every design document to MiLyfe roots, trunk, Governance Branch, Lifestyle Branch, or Finance Branch without duplicating authority.

## 1. Authority

The governing structure is defined by:

- `docs/design/32-MILYFE-ROOTS-TRUNK-THREE-BRANCH-FOUNDATION.md`
- `docs/architecture/ARCHITECTURE-SOURCE-OF-TRUTH.md`
- `docs/constitution/MILYFE-CONSTITUTION.md`
- `docs/BUILD-DOCUMENT-REGISTER.md`

No document may introduce a new primary branch or move an OS without an approved architecture decision.

## 2. Roots documents

| Root concern | Connected documents |
|---|---|
| Constitution | `docs/constitution/MILYFE-CONSTITUTION.md` |
| Commons | `docs/constitution/COMMONS-CHARTER.md` |
| Digital-being ethics | `docs/constitution/MI-BEING-CHARTER.md` |
| Ratification | `docs/constitution/RATIFICATION-AND-AMENDMENT-PROCEDURE.md` |
| Data ownership | `docs/design/04-MILYFE-DATA-OWNERSHIP-AND-PRIVACY.md` |
| Governance principles | `docs/design/05-MILYFE-GOVERNANCE-CHARTER.md` |
| Money invariants | `docs/design/06-MILYFE-MIMONEY-ECONOMIC-ARCHITECTURE.md` |
| Human/AI boundary | `docs/decisions/ADR-0003-HUMAN-APPROVAL-AND-AI-BOUNDARIES.md` |
| Security foundation | `docs/security/THREAT-MODEL.md` |
| Public truth | `docs/legal/PUBLIC-DOCUMENT-CLAIMS-REVIEW.md` |

## 3. Trunk documents

| Trunk capability | Connected documents |
|---|---|
| Kernel | `docs/design/03-MILYFE-KERNEL-AUTHORITY-DESIGN.md`, `docs/os/kernel/README.md` |
| Naming and discovery | `docs/design/02-MILYFE-OS-CATALOG.md`, `docs/os/kernel/README.md` |
| Onboarding | `docs/design/24-MI-ONBOARDING-RUNTIME-PRESENCE-DESIGN.md`, `docs/os/onboard/README.md` |
| Data | `docs/design/04-MILYFE-DATA-OWNERSHIP-AND-PRIVACY.md` |
| Presence | `docs/design/24-MI-ONBOARDING-RUNTIME-PRESENCE-DESIGN.md` |
| MiPsyche | `docs/design/28-MI-PSYCHE-DIGITAL-BEING-DESIGN.md`, `docs/os/psyche/README.md` |
| MiMind and agents | `docs/design/09-MILYFE-DEVICE-AI-AGENT-ARCHITECTURE.md`, `docs/os/agent/README.md` |
| Devices | `docs/os/device/README.md` |
| Security | `docs/design/25-MI-SECURITY-DEV-PUBLISHING-OS.md`, `docs/os/security/README.md` |
| Development | `docs/design/30-MILYFE-AGENT-ORCHESTRATION-AND-REPO-STEERING.md`, `docs/os/dev/README.md` |
| Operations and infrastructure | `docs/operations/`, `docs/backend/` where applicable, `docs/os/security/README.md` |
| Communication and network | `docs/design/24-MI-ONBOARDING-RUNTIME-PRESENCE-DESIGN.md`, `docs/design/21-FRONTEND-OPEN-SOURCE-STACK.md` |
| Growth and capacity | `docs/design/19-MISCALE-GROWTH-EVOLUTION-OS.md`, `docs/os/scale/README.md` |

## 4. Governance Branch documents

| Primary OS | Connected documents | Remaining design brief |
|---|---|---|
| Governance OS | `docs/design/05-MILYFE-GOVERNANCE-CHARTER.md`, `docs/constitution/` | Branch brief and governance workflows |
| MiLegal | `docs/design/11-MILYFE-LEGAL-JUSTICE-DISPUTE-ARCHITECTURE.md`, `docs/legal/` | Legal-source and professional-routing contract |
| MiResolve | `docs/design/11-MILYFE-LEGAL-JUSTICE-DISPUTE-ARCHITECTURE.md` | Case lifecycle and appeal contract |
| MiJustice | `docs/design/11-MILYFE-LEGAL-JUSTICE-DISPUTE-ARCHITECTURE.md` | Rights, evidence, redress, and restitution contract |

Supporting systems:

- MiElection
- Campaign OS
- MiJaxx
- MiPublic Office
- MiCivic profile
- MiRecords subsystem

## 5. Lifestyle Branch documents

| Primary OS | Connected documents | Remaining design brief |
|---|---|---|
| MiCare | `docs/design/16-FRACTAL-INTEGRATION-ARCHITECTURE.md` | Care network and supported-decision contract |
| MiHealth | `docs/design/16-FRACTAL-INTEGRATION-ARCHITECTURE.md`, `docs/legal/` | Health boundary and professional-service contract |
| MiPlace | `docs/design/17-FRACTAL-BUILD-ROADMAP.md` | Local service and place-cell contract |
| MiEducation | `docs/design/17-FRACTAL-BUILD-ROADMAP.md` | Learning, skills, and credential contract |

Supporting systems:

- MiFamily
- MiBelong
- MiTime
- MiHome
- MiPurpose
- MiKnowledge
- MiMedia
- MiComm
- MiWork as the Finance/Lifestyle bridge
- Mobility, emergency, energy, water, food, repair, and climate profiles

## 6. Finance Branch documents

| Primary OS | Connected documents | Remaining design brief |
|---|---|---|
| MiForge | `docs/design/07-MILYFE-MIFORGE-VALUE-FLYWHEEL.md` | Venture and value-contract brief |
| MiMarket | `docs/design/27-MILYFE-ECONOMY-MARKETPLACE-AND-SCALE-STRATEGY.md` | Marketplace lifecycle and merchant brief |
| MiMoney | `docs/design/06-MILYFE-MIMONEY-ECONOMIC-ARCHITECTURE.md` | Ledger and settlement brief |
| MiWork | `docs/design/14-MILYFE-PEOPLE-AI-OPERATING-MODEL.md` | Work, contribution, and livelihood brief |

Supporting systems:

- MiMutual
- MiScale
- MiClear
- MiBank
- MiCredit
- MiCapital
- MiCover
- MiTax
- MiBooks
- MiTreasury
- MiFinance
- MiWealth
- MiManufacture
- MiSupply
- MiLogistics
- MiAdSpace

## 7. Document completion rule

A branch document is complete only when it defines:

- Purpose
- Users
- Owns
- Does not own
- Entities and data
- Permissions
- Contracts
- Receipts
- Offline behavior
- Security
- Accessibility
- Support
- Legal review
- Metrics
- Failure recovery
- Export
- Removal
- Fork behavior
- Activation gate

## 8. Alignment rule

The map is a routing system, not permission to build every connected OS immediately. The next design phase completes the roots, trunk, three branch charters, and cross-branch contracts before specialized supporting OSes are expanded.
