# Handoffs, Permissions, Receipts, Failure & Rollback — Phase 7

**Status:** `READY_FOR_REVIEW`.

## Registered handoffs (all nine fields per Branch Handoff Contract)

| ID | From → To | Purpose | Data scope | Authority scope | Failure behavior | Reversal path |
|---|---|---|---|---|---|---|
| H1 | MiOnboard → MiID | identity create/claim | proofs | Kernel E | queue + retry | retire path |
| H2 | MiForge → MiMarket | publish offer | offer + terms | owner + place policy | draft preserved | unpublish |
| H3 | MiMarket → MiMoney | hold/capture/refund | order refs | policy + dual consent | honest pending | reverse via process |
| H4 | MiWork → MiMoney | payout claim | verification refs | verified + approved rules | claim queued | claim enforcement |
| H5 | MiEducation → MiWork | credential verify | badge refs | issuer signature | manual review | re-verify |
| H6 | MiCare → MiHealth | slice grant | health slice | consent + expiry | deny-on-doubt | instant revoke |
| H7 | Market/Care/Work → MiResolve | open case | case refs | affected party | accept + queue | withdraw |
| H8 | MiResolve → MiJustice | escalate | case file | rights/serious-harm test | stays in resolve | de-escalate + receipt |
| H9 | Gov → MiLegal | proposal review | proposal text | screening trigger | block + route human | re-review |
| H10 | Gov/Justice → MiMoney | treasury/restitution | ops refs | H + rules | fail-closed | reverse via process |
| H11 | Any → MiData | grant/revoke | space refs | MiScope | deny-on-doubt | revoke + audit |
| H12 | Care → MiPlace | rides/resources | need refs | place roles | rebook | cancel + receipt |

## Cross-branch permissions

All handoffs ride MiScope grants (purpose-bound, expiring, previewable, revocable) + data contracts (Phase 3). Youth data never crosses without grown-up; health never without slice consent; money never without human signature; sealed never without H + access log.

## Cross-branch receipts

Every handoff emits receipts on both sides (sender + receiver) linked by handoff id; member-visible chain: tap any receipt → full journey trace (action → approval → policy → appeal).

## Failure & rollback laws

1. Partial journeys always resumable (progress + receipts preserved); never silent-drop.
2. Money legs fail to `pending` with honest labels, never to fake `settled`.
3. Reversals preserve originals (correcting entries, not edits) via due process.
4. Escalation never loses the case file (H8 keeps full lineage).
5. Export works at every step, even mid-dispute, mid-case, mid-handoff.
