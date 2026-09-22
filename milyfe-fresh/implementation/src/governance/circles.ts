// Governance OS — circles. Neighborhood-scale groups (500 max) with a
// rotating steward. Small enough to know each other, big enough to matter.
export const CIRCLE_CAP = 500;

export interface Circle {
  id: string;
  name: string;
  members: string[]; // MiIDs
  steward: string; // current steward MiID
  stewardSince: string; // ISO — rotation is visible
}

export function createCircle(id: string, name: string, founder: string, nowIso: string): Circle {
  return { id, name, members: [founder], steward: founder, stewardSince: nowIso };
}

export function joinCircle(c: Circle, member: string): Circle {
  if (c.members.includes(member)) throw new Error('ALREADY_MEMBER');
  if (c.members.length >= CIRCLE_CAP) throw new Error('CIRCLE_FULL');
  return { ...c, members: [...c.members, member] };
}

export function leaveCircle(c: Circle, member: string): Circle {
  if (!c.members.includes(member)) throw new Error('NOT_A_MEMBER');
  if (member === c.steward) throw new Error('STEWARD_MUST_ROTATE_FIRST');
  return { ...c, members: c.members.filter((m) => m !== member) };
}

/** Stewardship rotates to another member — nobody holds it forever. */
export function rotateSteward(c: Circle, next: string, nowIso: string): Circle {
  if (!c.members.includes(next)) throw new Error('NOT_A_MEMBER');
  if (next === c.steward) throw new Error('ALREADY_STEWARD');
  return { ...c, steward: next, stewardSince: nowIso };
}
