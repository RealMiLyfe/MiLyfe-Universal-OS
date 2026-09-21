// Kernel: scope — MiScope grant evaluation. Pure functions (no I/O).
// Source: PERMISSION-CONTRACTS.md. Anything not granted remains unavailable.

export interface Grant {
  id: string;
  issuer: string;
  subject: string;
  target: string;
  purpose: string;
  scope: string[];
  expires: string;
  roles?: string[];
  youthAssent?: boolean;
  guardianPermission?: string;
  emergency?: boolean;
  hopsLeft?: number;
  approval: string;
}

export interface Check {
  subject: string;
  target: string;
  action: string;
  purpose: string;
  now?: string;
  emergency?: boolean;
}

export interface Verdict {
  ok: boolean;
  reason: string;
  grantId?: string;
}

function matchSlot(pattern: string, value: string): boolean {
  if (pattern === '*') return true;
  if (pattern.endsWith(':*')) return value === pattern.slice(0, -2) || value.startsWith(pattern.slice(0, -1));
  return pattern === value;
}

export function can(grants: Grant[], check: Check): Verdict {
  const now = check.now ?? new Date().toISOString();
  const candidates = grants.filter(
    (g) => g.subject === check.subject && matchSlot(g.target, check.target),
  );
  if (candidates.length === 0) return { ok: false, reason: 'NO_GRANT' };
  for (const g of candidates) {
    if (!g.scope.includes(check.action)) continue;
    if (g.purpose !== '*' && g.purpose !== check.purpose) continue;
    if (g.expires <= now) continue;
    if (g.emergency && !check.emergency) continue; // emergency grants need emergency context
    if (g.roles?.includes('child') && !(g.youthAssent && g.guardianPermission)) continue;
    return { ok: true, reason: 'GRANTED', grantId: g.id };
  }
  return { ok: false, reason: 'NO_MATCHING_GRANT' };
}

/** Delegation check: only delegable grants with hops left may extend. */
export function canDelegate(grant: Grant, hops: number): Verdict {
  if ((grant.hopsLeft ?? 0) < hops) return { ok: false, reason: 'NO_HOPS_LEFT' };
  if (hops > 3) return { ok: false, reason: 'MAX_3_HOPS' };
  return { ok: true, reason: 'DELEGABLE', grantId: grant.id };
}
