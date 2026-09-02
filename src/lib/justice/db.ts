/**
 * MiJustice Supabase access.
 *
 * The core `Database` type covers the MVP schema and does not include the
 * justice_* tables. To query them without polluting that hand-maintained type,
 * we wrap the existing clients and expose them loosely typed for justice tables.
 * Row shapes are enforced at the call site via the interfaces in ./types.
 */
import { createClient } from '@/lib/supabase/client';
import { createServerSupabase } from '@/lib/supabase/server';

// A minimal structural type for the query surface we use. This intentionally
// bypasses the generated Database typing for the justice_* namespace.
type LooseClient = {
  from: (table: string) => any;
  rpc: (fn: string, args?: Record<string, unknown>) => any;
  auth: { getUser: () => Promise<{ data: { user: { id: string } | null } }> };
};

export function justiceBrowserDb(): LooseClient {
  return createClient() as unknown as LooseClient;
}

export async function justiceServerDb(): Promise<LooseClient> {
  const supabase = await createServerSupabase();
  return supabase as unknown as LooseClient;
}
