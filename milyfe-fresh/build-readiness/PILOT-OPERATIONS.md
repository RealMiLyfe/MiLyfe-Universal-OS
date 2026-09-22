# Pilot Rollback, Freeze, Quarantine + Exit Procedures

**Status:** procedures written against tested mechanics. No live drill yet (TODO-human).
Mechanic tests: `recovery-drill`, `isolation-recovery`, `support-incident`, `agent-device`.

## Rollback (bad data or bad action)

1. Identify scope (account/record/circle) with receipts.
2. Money: `correctTreasurySpend` (same books) or MiResolve dispute → ledger reverse/refund.
3. Records: correction appends (history never rewritten); credential revoke + reissue with appeal window.
4. Verify: conservation audit + exports re-pulled; incident record filed.

## Freeze (suspected harm, stolen device, active abuse)

1. `panicFreeze(entity)` + `endAllSessions` (sessions tombstone offline — tested).
2. Revoke device in registry (tombstone kept).
3. Human safety lead takes over within the promised window (TODO-human: name + window).
4. Unfreeze only by named human with reason + receipt.

## Quarantine (farming, fraud, malicious account)

1. `quarantine(target, reason, hours)` with expiry (tested).
2. Release only by named reviewer (tested); automatic expiry does not imply innocence — review still files findings.
3. Repeat offenders route to governance process (pause requires human-only 5-of-7 per design).

## Exit (participant leaves, pilot ends, cell closes)

1. Full export handed over (tested per OS).
2. Deletion requests honored per retention + youth + law (tested mechanics).
3. Open obligations settled or refunded (orders honored/refunded; agreements end with checklist).
4. Pilot-end report published: counts (real ones, then), learnings, incidents, corrections.

## Communications

- Who tells participants what, and when (TODO-human: names + channels).
- Honesty labels stay on: queued work, pending money, provisional rules.
