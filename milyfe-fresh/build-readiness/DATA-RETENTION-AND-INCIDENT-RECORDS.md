# Data Retention, Export, Deletion + Incident Records

**Status:** mechanics tested; retention windows are PROVISIONAL defaults pending counsel.
Nothing here is legal advice. Deletion honors retention + youth rules + law, in that order of strictness.

## Provisional retention defaults (TODO-counsel to confirm or replace)

| Data | Default | Notes |
|---|---|---|
| Care/health/education records | until deletion request + 30-day grace | youth: guardian approval required |
| Financial postings + receipts | 7 years | corrections append, never overwrite |
| Support tickets + disputes | case close + 1 year | exportable during dispute |
| Access logs (who saw what) | 2 years | member-visible always |
| Incident/quarantine records | 3 years | sealed, access-logged |
| Bus events (device store) | 90 days rolling | receipts outlive events |

## Tested mechanics (pointers)

- Export: every record-holding OS exports whole histories (`isolation-recovery.test.ts`).
- Deletion: care (youth-guardian), health (human owner + approval), treasury correction, credential dispute path.
- Revocation: consent revoke immediate; grant revoke → epoch expiry → deny.
- Incidents: quarantine/release/panic/audit (`support-incident.test.ts`, `recovery-drill.test.ts`).

## Incident record format (required fields)

`id · at · reporter · severity · scope · facts · actions · receipts · reviewer · status · follow-up`.
Every incident leaves this record; sealed where youth/safety requires.
