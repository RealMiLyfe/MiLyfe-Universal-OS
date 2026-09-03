/**
 * MiJustice Supabase access (BROWSER / client components).
 *
 * The core `Database` type covers the MVP schema and does not include the
 * justice_* tables. To query them without polluting that hand-maintained type,
 * we wrap the browser client loosely typed for justice tables. Row shapes are
 * enforced at the call site via the interfaces in ./types.
 *
 * NOTE: this file must NOT import the server client (next/headers), or it would
 * pull server-only APIs into client bundles. Server access lives in ./db-server.
 */
import { createClient } from '@/lib/supabase/client';

export type LooseClient = {
  from: (table: string) => any;
  rpc: (fn: string, args?: Record<string, unknown>) => any;
  auth: { getUser: () => Promise<{ data: { user: { id: string } | null } }> };
};

export function justiceBrowserDb(): LooseClient {
  return createClient() as unknown as LooseClient;
}
