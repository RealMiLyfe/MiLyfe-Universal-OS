/**
 * Trust-layer Supabase access (browser). Loose-typed for the mi_* tables the
 * core Database type doesn't include (same pattern as the justice feature).
 */
import { createClient } from '@/lib/supabase/client';

type LooseClient = {
  from: (table: string) => any;
  rpc: (fn: string, args?: Record<string, unknown>) => any;
  auth: { getUser: () => Promise<{ data: { user: { id: string } | null } }> };
};

export function trustDb(): LooseClient {
  return createClient() as unknown as LooseClient;
}

/**
 * Build a MiReceipt payload from an action. Pure helper — the human-readable
 * proof format. Never store secret ballot choices or private message content.
 */
export function buildReceipt(input: {
  title: string;
  whatHappened: string;
  whatDidNot?: string;
  whoCanSee?: string;
  reversible?: boolean;
  appealPath?: string;
}): {
  title: string; what_happened: string; what_did_not: string | null;
  who_can_see: string; reversible: boolean; appeal_path: string | null;
} {
  return {
    title: input.title,
    what_happened: input.whatHappened,
    what_did_not: input.whatDidNot ?? null,
    who_can_see: input.whoCanSee ?? 'Only you',
    reversible: input.reversible ?? true,
    appeal_path: input.appealPath ?? null,
  };
}
