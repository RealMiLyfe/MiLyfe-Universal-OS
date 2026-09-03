/**
 * MiLyfe economy auto-wiring — reward-on-action.
 *
 * When a member does something valuable (upload media, pass a quiz, complete a
 * quest, publish a blog, cast a vote), this records a contribution, pays $MLY,
 * and nudges the matching standing facet. $MLY only — no processors, no ads.
 *
 * Guardrail: payout only fires for verified members (verification ladder) — the
 * DB view mi_verification_status gates it. Best-effort; never blocks the action.
 */
import type { Facet } from './data';

type LooseClient = {
  from: (t: string) => any;
  auth: { getUser: () => Promise<{ data: { user: { id: string } | null } }> };
};

export interface ContributionSpec {
  kind: string;         // 'media_upload','quiz_pass','quest','blog','vote','help','case_help','translate'
  surface: string;      // 'media','learn','street','voice','justice','connect','wiki'
  facet: Facet;
  title: string;
  mly: number;
  facetPoints?: number;
  reference?: string;
}

/**
 * Record + pay a contribution. Runs client-side via the loose db client.
 * - inserts a contributions row (verified 'auto' when the member is verified)
 * - credits the member's wallet spending pot
 * - bumps the standing facet
 * Returns the awarded amount (0 if skipped).
 */
export async function rewardContribution(db: LooseClient, spec: ContributionSpec): Promise<number> {
  try {
    const { data: userData } = await db.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) return 0;

    // Eligibility: member must be at least auto-verified (Sybil guard).
    const { data: ver } = await db.from('mi_verification_status').select('level_rank').eq('user_id', uid).maybeSingle();
    const verified = (ver?.level_rank ?? 0) >= 1;
    const facetPoints = spec.facetPoints ?? 1;

    // Record the contribution (pending if unverified, so it can pay once verified).
    await db.from('contributions').insert({
      user_id: uid,
      kind: spec.kind,
      surface: spec.surface,
      facet: spec.facet,
      title: spec.title,
      mly_reward: spec.mly,
      facet_points: facetPoints,
      verification: verified ? 'auto' : 'pending',
      status: verified ? 'paid' : 'pending',
      reference: spec.reference ?? null,
      verified_at: verified ? new Date().toISOString() : null,
      paid_at: verified ? new Date().toISOString() : null,
    });

    if (!verified) return 0;

    // Credit wallet spending pot (best-effort; wallet may use an RPC in prod).
    const { data: wallet } = await db.from('wallets').select('id, spending_balance, total_earned').eq('user_id', uid).maybeSingle();
    if (wallet) {
      await db.from('wallets').update({
        spending_balance: Number(wallet.spending_balance ?? 0) + spec.mly,
        total_earned: Number(wallet.total_earned ?? 0) + spec.mly,
        updated_at: new Date().toISOString(),
      }).eq('id', wallet.id);
      await db.from('transactions').insert({
        from_user_id: null, to_user_id: uid, amount: spec.mly, type: 'contribution',
        pot: 'spending', description: spec.title,
      });
    }

    // Bump the standing facet.
    const { data: standing } = await db.from('standing').select(`id, ${spec.facet}`).eq('user_id', uid).maybeSingle();
    if (standing) {
      await db.from('standing').update({
        [spec.facet]: Number((standing as Record<string, number>)[spec.facet] ?? 0) + facetPoints,
      }).eq('id', standing.id);
    }

    return spec.mly;
  } catch {
    return 0; // never break the user's action
  }
}
