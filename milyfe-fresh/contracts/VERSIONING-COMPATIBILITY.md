# Versioning & Compatibility — Phase 3

**Status:** `READY_FOR_REVIEW`.

- Contracts/APIs/events versioned (`name/major`; minor additive-only). Breaking major = new name version + migration guide + dual-run window + sunset notice + tombstone.
- Event consumers pin family+major; producers may emit multiple majors during windows.
- Capability flags (MiScale) gate activation per version; locked stays locked offline.
- Forks inherit registry + lineage; divergence recorded explicitly, never silent.
- Deprecation: announce → migrate → dual-run → sunset → tombstone, each step receipted.
- Compatibility tests required per contract before release (Phase 11 evidence).
