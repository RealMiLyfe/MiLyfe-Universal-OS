/**
 * MiJustice Supabase access (SERVER components / route handlers only).
 * Imports next/headers via the server client — never import this from a
 * client component.
 */
import { createServerSupabase } from '@/lib/supabase/server';
import type { LooseClient } from './db';

export async function justiceServerDb(): Promise<LooseClient> {
  const supabase = await createServerSupabase();
  return supabase as unknown as LooseClient;
}
