import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { justiceProviderHealth, justiceProviders } from '@/lib/justice/ai';

/**
 * MiJustice AI health probe. Auth-gated (no anonymous provider enumeration).
 * Reports which providers in the dedicated MiJustice fleet are configured and
 * how many are usable in the failover chain. Never exposes key values.
 */
export async function GET() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const health = justiceProviderHealth();
  const usable = justiceProviders().map((p) => p.id);

  return NextResponse.json({
    fleet: health,
    usableInOrder: usable,
    selfHealing: usable.length > 1,
    // Local keyless fallback guarantees the chain is never empty when Ollama runs.
    keylessFallback: 'ollama',
  });
}
