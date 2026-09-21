# Prompt-Injection Defense — Phase 9

**Status:** `READY_FOR_REVIEW`.

1. **Authority separation:** instructions (system/lease) vs data (user content, tool output, web/mesh content) are tagged and kept separate; data never upgrades its own privilege.
2. **Least-tool:** helpers receive only the MCP tools their lease names; consequential tools need step-up (fresh lease + H where reserved).
3. **Output contracts:** tool calls emitted only in validated schemas; free-text tool-call smuggling rejected by parser.
4. **Re-vetting:** Ring-2/cloud outputs re-screened locally before action; screening verdicts logged with policy version.
5. **Provenance distrust:** pasted/shared content treated as untrusted (MiSource: source + confidence shown to member); high-impact actions from pasted instructions need re-confirmation in plain words.
6. **Canary + red-team:** injection canaries in test fixtures; red-team suite runs per release; new bypass = incident + regression test + lease tightening.
7. **Fail-closed:** ambiguous authority → stop + explain + route to human. Never "helpful override".
