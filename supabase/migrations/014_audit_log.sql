-- ============================================================================
-- Audit Log — tamper-evident record of sensitive actions
-- Migration 014
-- ============================================================================
-- The application logs privileged/state-changing actions here via
-- src/lib/security/audit.ts (logAudit). Writes are performed with the Supabase
-- service role, which bypasses RLS. RLS below governs READ access only.
--
-- NOTE: This table was referenced in application code (audit_log) but had no
-- migration. Without it, every audit insert failed silently. This migration
-- creates it so the audit trail actually persists.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id   TEXT,
  metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Query patterns: by actor, by resource, and recent-first listing.
CREATE INDEX IF NOT EXISTS idx_audit_log_actor      ON public.audit_log (actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource   ON public.audit_log (resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action     ON public.audit_log (action);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Members may read their own audit entries.
CREATE POLICY "audit_log_select_own" ON public.audit_log
  FOR SELECT USING (actor_id = auth.uid());

-- Admins/stewards may read the full audit trail.
CREATE POLICY "audit_log_select_admin" ON public.audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'steward')
    )
  );

-- No INSERT/UPDATE/DELETE policies: only the service role (which bypasses RLS)
-- writes here, and the audit trail is append-only by design. The absence of an
-- UPDATE/DELETE policy means authenticated users can never mutate audit records.
