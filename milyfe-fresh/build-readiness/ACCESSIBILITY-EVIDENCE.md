# Accessibility Evidence Packet (automated checks — human review still required)

**Date:** 2026-09-21. **Automated evidence:** `tests/integration/accessibility-brand.test.ts` (green).
This packet proves the notice contract holds in code. It does not prove humans can use the system.

## What is enforced in code (every OS notice path)

- Plain language: ≤280 chars, no INTERNAL_CODE tokens (pattern-tested).
- Audio offered on every notice (`audioOffered: true`, tested).
- Human fallback named on every notice (tested non-empty).
- Audited paths: care escalation, place announcement, education story, market support case, worker help, money settled, care approved.

## What humans must still verify (gate 2 closure needs)

- [ ] Real screen-reader pass (TODO-human: tool + date + findings).
- [ ] Low-literacy read-through of core flows (TODO-human).
- [ ] Non-English language check for at least one pilot language (TODO-human).
- [ ] Elder + child observed sessions (TODO-human).
- [ ] Audio-first path on a real device (TODO-human).
- [ ] Contrast/keyboard/motor checks on the web UI (TODO-human).

## Known limits

No UI component audit performed. No assistive-tech run. Notice tests check the data contract, not rendering.
