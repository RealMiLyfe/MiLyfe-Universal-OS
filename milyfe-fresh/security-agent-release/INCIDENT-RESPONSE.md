# Incident Response — Phase 9

**Status:** `READY_FOR_REVIEW`.

- **Severities:** SEV1 (money/identity/safety-critical) → SEV4 (minor). SEV1/2 page incident commander + MiSecurity + affected OS owner + comms lead.
- **Loop:** detect (MiWatch/sentinel/reports) → triage → contain (quarantine/freeze/re-lock; pause 5-of-7 available for money+machines, human-only, 30-day death) → communicate (plain-language status, cadence by severity, multi-channel incl. SMS/voice for critical) → remediate → postmortem (blameless, public, privacy-scrubbed) → regression tests + control updates.
- **Money incidents:** freeze affected slices (narrow), preserve ledger truth (correcting entries, never edits), reconcile to zero breaks, notify with receipts.
- **Safety incidents:** survivor-first; sealed handling; no forced tables; retaliation guard.
- **Evidence:** timelines, receipts, comms log retained per schedule; postmortems feed threat-model updates.
