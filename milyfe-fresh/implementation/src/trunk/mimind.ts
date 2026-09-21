// MiMind — one profile, one memory layer. Per TREE-LOCK: a person's
// preferences/facts live once, app-local, client-encrypted. Any OS may read
// with consent; no branch keeps a private copy that rots out of sync.
export interface ConsentScope {
  reader: string; // OS or service asking
  fields: string[]; // field names granted
  expiresAt: string; // ISO — consent always has an end
}

export interface MindRecord {
  owner: string; // MiID
  fields: Record<string, string>; // app-local, encrypted at rest by the client
  scopes: ConsentScope[];
}

export function createMind(owner: string): MindRecord {
  return { owner, fields: {}, scopes: [] };
}

/** Write is owner-only. Callers pass the authenticated owner id. */
export function setFields(mind: MindRecord, owner: string, patch: Record<string, string>): MindRecord {
  if (owner !== mind.owner) throw new Error('NOT_OWNER');
  return { ...mind, fields: { ...mind.fields, ...patch } };
}

export function grantScope(mind: MindRecord, scope: ConsentScope): MindRecord {
  return { ...mind, scopes: [...mind.scopes, scope] };
}

/** Read with consent: only granted, unexpired fields. Never the whole record. */
export function readWithConsent(mind: MindRecord, reader: string, nowIso: string): Record<string, string> {
  const live = mind.scopes.filter((s) => s.reader === reader && s.expiresAt > nowIso);
  const allowed = new Set(live.flatMap((s) => s.fields));
  return Object.fromEntries(Object.entries(mind.fields).filter(([k]) => allowed.has(k)));
}
