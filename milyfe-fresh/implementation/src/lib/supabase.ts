// Supabase clients. Service role is SERVER-ONLY (never imported by browser code).
// Browser uses the anon key; user identity on the server comes from the
// Authorization: Bearer <access-token> header (no cookie-jar complexity).

import { createBrowserClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function browserClient(): SupabaseClient {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  );
}

/** Server-only. Throws in the browser. */
export function serviceClient(): SupabaseClient {
  if (typeof window !== 'undefined') throw new Error('SERVICE_ROLE_NEVER_IN_BROWSER');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!url || !key) throw new Error('SUPABASE_SERVER_ENV_MISSING');
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function userIdFromAuthHeader(req: Request): Promise<string | null> {
  const token = req.headers.get('authorization')?.replace(/^Bearer /i, '');
  if (!token) return null;
  const svc = serviceClient();
  const { data, error } = await svc.auth.getUser(token);
  if (error) return null;
  return data.user.id;
}
