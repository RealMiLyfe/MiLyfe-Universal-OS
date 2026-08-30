'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// ─── Create Marketplace Listing ──────────────────────────────────────────────
const createListingSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  category: z.enum(['food', 'services', 'rides', 'goods', 'education', 'housing', 'jobs']),
  price_mly: z.number().min(0).max(100000),
  price_type: z.enum(['fixed', 'negotiable', 'free', 'trade']),
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'parts']).optional(),
  location_text: z.string().max(200).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  images: z.array(z.string().url()).max(5).default([]),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;

export async function createListing(input: CreateListingInput) {
  const parsed = createListingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues.map(i => i.message).join(', ') };
  }

  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('marketplace_listings')
    .insert({
      seller_id: user.id,
      ...parsed.data,
      status: 'active',
      expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    })
    .select('id')
    .single();

  if (error) return { error: error.message };

  revalidatePath('/street');
  return { success: true, id: data.id };
}

// ─── Update Listing Status ───────────────────────────────────────────────────
export async function updateListingStatus(listingId: string, status: 'active' | 'sold' | 'removed') {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('marketplace_listings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', listingId)
    .eq('seller_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/street');
  return { success: true };
}

// ─── Create Quest ────────────────────────────────────────────────────────────
const createQuestSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),
  category: z.enum([
    'community', 'cleanup', 'repair', 'delivery', 'teaching',
    'caregiving', 'verification', 'safety', 'gardening', 'tech_support',
  ]),
  reward_mly: z.number().positive().max(500),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  time_estimate_minutes: z.number().positive().max(480).optional(),
  location_text: z.string().max(200).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  max_completions: z.number().int().positive().max(20).default(1),
  expires_days: z.number().int().positive().max(30).default(7),
});

export type CreateQuestInput = z.infer<typeof createQuestSchema>;

export async function createQuest(input: CreateQuestInput) {
  const parsed = createQuestSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues.map(i => i.message).join(', ') };
  }

  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Verify creator has enough $MLY to fund the reward
  const { data: wallet } = await supabase
    .from('wallets')
    .select('spending_balance')
    .eq('user_id', user.id)
    .single();

  const totalReward = parsed.data.reward_mly * parsed.data.max_completions;
  if (!wallet || wallet.spending_balance < totalReward) {
    return { error: `Insufficient balance. Need ${totalReward} $MLY to fund this quest.` };
  }

  const { data, error } = await supabase
    .from('quests')
    .insert({
      creator_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      reward_mly: parsed.data.reward_mly,
      reward_source: 'creator',
      difficulty: parsed.data.difficulty,
      time_estimate_minutes: parsed.data.time_estimate_minutes || null,
      location_text: parsed.data.location_text || null,
      latitude: parsed.data.latitude || null,
      longitude: parsed.data.longitude || null,
      max_completions: parsed.data.max_completions,
      status: 'open',
      requires_verification: true,
      expires_at: new Date(Date.now() + parsed.data.expires_days * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select('id')
    .single();

  if (error) return { error: error.message };

  // Reserve reward amount from creator's wallet
  await supabase
    .from('wallets')
    .update({ spending_balance: wallet.spending_balance - totalReward })
    .eq('user_id', user.id);

  revalidatePath('/street');
  return { success: true, id: data.id };
}

// ─── Cancel / Remove Quest (creator only) + refund unclaimed escrow ──────────
export async function cancelQuest(questId: string) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Load the quest and confirm ownership
  const { data: quest } = await supabase
    .from('quests')
    .select('id, creator_id, reward_mly, reward_source, max_completions, current_completions, status')
    .eq('id', questId)
    .single();

  if (!quest) return { error: 'Quest not found' };
  if (quest.creator_id !== user.id) return { error: 'You can only remove quests you posted' };
  if (quest.status === 'cancelled') return { error: 'Quest is already removed' };
  if (quest.status === 'completed') return { error: 'Completed quests cannot be removed' };

  // Block removal if a claim is mid-flight (claimed/submitted) so we never
  // yank a reward out from under someone actively doing the work.
  const { count: activeClaims } = await supabase
    .from('quest_claims')
    .select('id', { count: 'exact', head: true })
    .eq('quest_id', questId)
    .in('status', ['claimed', 'submitted']);

  if ((activeClaims ?? 0) > 0) {
    return { error: 'This quest has active claims in progress. Resolve or reject them before removing it.' };
  }

  // Refund only the UNCLAIMED remaining escrow (creator-funded quests only).
  // Escrowed at creation = reward_mly * max_completions; already paid out =
  // reward_mly * current_completions; so remaining = reward_mly * (max - current).
  const remaining = Math.max(0, quest.max_completions - quest.current_completions);
  const refund = quest.reward_source === 'creator' ? Number(quest.reward_mly) * remaining : 0;

  // Mark the quest cancelled first (guard against double-refund via status check)
  const { error: cancelErr } = await supabase
    .from('quests')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', questId)
    .eq('creator_id', user.id)
    .neq('status', 'cancelled');

  if (cancelErr) return { error: cancelErr.message };

  if (refund > 0) {
    const { data: wallet } = await supabase
      .from('wallets')
      .select('spending_balance')
      .eq('user_id', user.id)
      .single();

    if (wallet) {
      await supabase
        .from('wallets')
        .update({
          spending_balance: Number(wallet.spending_balance) + refund,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      // Record the refund transaction for the ledger
      await supabase.from('transactions').insert({
        from_user_id: null,
        to_user_id: user.id,
        amount: refund,
        type: 'quest_refund',
        pot: 'spending',
        description: 'Refund of unclaimed reward from removed quest',
      });
    }
  }

  revalidatePath('/street');
  return { success: true, refunded: refund };
}

// ─── Claim Quest ─────────────────────────────────────────────────────────────
export async function claimQuest(questId: string) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Check quest is open and has spots
  const { data: quest } = await supabase
    .from('quests')
    .select('id, status, max_completions, current_completions, creator_id')
    .eq('id', questId)
    .single();

  if (!quest) return { error: 'Quest not found' };
  if (quest.status !== 'open') return { error: 'Quest is no longer open' };
  if (quest.current_completions >= quest.max_completions) return { error: 'No spots left' };
  if (quest.creator_id === user.id) return { error: 'Cannot claim your own quest' };

  // Check not already claimed
  const { data: existing } = await supabase
    .from('quest_claims')
    .select('id')
    .eq('quest_id', questId)
    .eq('claimer_id', user.id)
    .single();

  if (existing) return { error: 'You already claimed this quest' };

  const { error } = await supabase
    .from('quest_claims')
    .insert({
      quest_id: questId,
      claimer_id: user.id,
      status: 'claimed',
    });

  if (error) return { error: error.message };

  revalidatePath('/street');
  return { success: true };
}

// ─── Submit Quest Evidence ───────────────────────────────────────────────────
const submitEvidenceSchema = z.object({
  quest_id: z.string().uuid(),
  evidence_text: z.string().min(10).max(2000),
  evidence_images: z.array(z.string().url()).max(5).default([]),
});

export async function submitQuestEvidence(input: z.infer<typeof submitEvidenceSchema>) {
  const parsed = submitEvidenceSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('quest_claims')
    .update({
      status: 'submitted',
      evidence_text: parsed.data.evidence_text,
      evidence_images: parsed.data.evidence_images,
      submitted_at: new Date().toISOString(),
    })
    .eq('quest_id', parsed.data.quest_id)
    .eq('claimer_id', user.id)
    .eq('status', 'claimed');

  if (error) return { error: error.message };

  revalidatePath('/street');
  return { success: true };
}

// ─── Verify Quest (Creator approves/rejects) ─────────────────────────────────
export async function verifyQuestClaim(claimId: string, approved: boolean, reason?: string) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Get claim + quest
  const { data: claim } = await supabase
    .from('quest_claims')
    .select('*, quests!inner(creator_id, reward_mly, reward_source)')
    .eq('id', claimId)
    .single();

  if (!claim) return { error: 'Claim not found' };
  if ((claim as any).quests.creator_id !== user.id) return { error: 'Not the quest creator' };
  if (claim.status !== 'submitted') return { error: 'Claim not in submitted state' };

  if (approved) {
    // Mark verified
    await supabase
      .from('quest_claims')
      .update({
        status: 'verified',
        verified_at: new Date().toISOString(),
        verified_by: user.id,
      })
      .eq('id', claimId);

    // Pay the claimer
    const reward = (claim as any).quests.reward_mly;
    const isTreasuryFunded = (claim as any).quests.reward_source === 'treasury';

    const { data: claimerWallet } = await supabase
      .from('wallets')
      .select('spending_balance, total_earned')
      .eq('user_id', claim.claimer_id)
      .single();

    if (claimerWallet) {
      await supabase
        .from('wallets')
        .update({
          spending_balance: claimerWallet.spending_balance + reward,
          total_earned: (claimerWallet.total_earned || 0) + reward,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', claim.claimer_id);

      // Record transaction
      await supabase.from('transactions').insert({
        from_user_id: isTreasuryFunded ? null : user.id,
        to_user_id: claim.claimer_id,
        amount: reward,
        type: 'quest_reward',
        pot: 'spending',
        description: 'Quest completion reward',
      });

      // Debit treasury only if community quest / treasury-funded
      if (isTreasuryFunded) {
        const { data: treasuryData } = await supabase
          .from('community_treasury')
          .select('id, balance, total_distributed')
          .order('snapshot_at', { ascending: false })
          .limit(1)
          .single();

        if (treasuryData?.id) {
          await supabase
            .from('community_treasury')
            .update({
              balance: (treasuryData.balance || 0) - reward,
              total_distributed: (treasuryData.total_distributed || 0) + reward,
              snapshot_at: new Date().toISOString(),
            })
            .eq('id', treasuryData.id);
        }
      }
    }

    // Update quest completion count
    const { data: questData } = await supabase
      .from('quests')
      .select('current_completions')
      .eq('id', claim.quest_id)
      .single();

    if (questData) {
      await supabase
        .from('quests')
        .update({ current_completions: questData.current_completions + 1 })
        .eq('id', claim.quest_id);
    }
  } else {
    await supabase
      .from('quest_claims')
      .update({ status: 'rejected' })
      .eq('id', claimId);
  }

  revalidatePath('/street');
  return { success: true };
}

// ─── Create Surplus Item ─────────────────────────────────────────────────────
const createSurplusSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  category: z.enum(['food', 'goods', 'clothing', 'furniture', 'other']),
  quantity: z.string().min(1).max(50),
  pickup_location: z.string().min(3).max(200),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  available_hours: z.number().positive().max(72).default(24),
});

export type CreateSurplusInput = z.infer<typeof createSurplusSchema>;

export async function createSurplus(input: CreateSurplusInput) {
  const parsed = createSurplusSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('surplus_items')
    .insert({
      donor_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description || '',
      category: parsed.data.category,
      quantity: parsed.data.quantity,
      pickup_location: parsed.data.pickup_location,
      latitude: parsed.data.latitude || null,
      longitude: parsed.data.longitude || null,
      available_until: new Date(Date.now() + parsed.data.available_hours * 60 * 60 * 1000).toISOString(),
      status: 'available',
    })
    .select('id')
    .single();

  if (error) return { error: error.message };

  revalidatePath('/street');
  return { success: true, id: data.id };
}

// ─── Claim Surplus Item ──────────────────────────────────────────────────────
export async function claimSurplus(surplusId: string) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: item } = await supabase
    .from('surplus_items')
    .select('id, status, donor_id, available_until')
    .eq('id', surplusId)
    .single();

  if (!item) return { error: 'Item not found' };
  if (item.status !== 'available') return { error: 'Item already claimed' };
  if (item.donor_id === user.id) return { error: 'Cannot claim your own item' };
  if (new Date(item.available_until) < new Date()) return { error: 'Item has expired' };

  const { error } = await supabase
    .from('surplus_items')
    .update({ status: 'claimed', claimed_by: user.id })
    .eq('id', surplusId)
    .eq('status', 'available');

  if (error) return { error: error.message };

  revalidatePath('/street');
  return { success: true };
}
