# Recovery, Restore + Continuity Exercise

**Date:** 2026-09-21. **Executable drill:** `tests/integration/recovery-drill.test.ts` (green).
Design source: `security-agent-release/BACKUP-DISASTER-RECOVERY.md`.

## What the drill proves (synthetic store)

1. Backup: all device docs + outbox snapshot.
2. Wipe: stores cleared; reads return empty.
3. Restore: docs + outbox re-imported; entity status, space list, psyche continuity, onboarding progress all verified back.
4. Reconnect: outbox syncs to full ack, zero failures.
5. Incident freeze: quarantine + panic freeze + session tombstones leave the entity safe and offline.

## What is NOT proven (gate 4 closure needs)

- [ ] Same drill on real devices + real browsers (TODO-human).
- [ ] Vault/key recovery path (social recovery is design-only).
- [ ] Declared RPO/RTO (TODO-human: numbers + sign-off).
- [ ] Multi-device conflict walkthrough (TODO-human).

## Continuity notes

- Psyche continuity lineage survives restore (tested).
- Bus replay rebuilds consumers idempotently (tested in isolation-recovery).
- Money is never auto-resolved on conflict — human review (MiWalk rule, enforced by design; settlement conflicts route to review).
