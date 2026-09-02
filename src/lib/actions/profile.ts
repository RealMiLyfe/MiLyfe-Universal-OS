'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// ─── Update Profile ──────────────────────────────────────────────────────────
const updateProfileSchema = z.object({
  display_name: z.string().min(1).max(50),
  bio: z.string().max(500).optional(),
  neighborhood: z.string().max(100).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export async function updateProfile(input: UpdateProfileInput) {
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues.map(i => i.message).join(', ') };
  }

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: parsed.data.display_name,
      bio: parsed.data.bio || '',
      neighborhood: parsed.data.neighborhood || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/profile');
  return { success: true };
}

// ─── Update Preferred Language ───────────────────────────────────────────────
import { isSupportedLanguage } from '@/lib/i18n/languages';

export async function updateLanguage(code: string) {
  if (!isSupportedLanguage(code)) {
    return { error: 'Unsupported language' };
  }

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Always set the cookie so the choice drives the whole experience immediately,
  // even before/if the profile column write succeeds.
  const { setLanguage } = await import('@/lib/i18n/set-language');
  await setLanguage(code);

  const { error } = await supabase
    .from('profiles')
    .update({ preferred_language: code, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (error && !/column .*preferred_language.* does not exist/i.test(error.message)) {
    return { error: error.message };
  }

  revalidatePath('/profile');
  return { success: true };
}

// ─── Upload Avatar ───────────────────────────────────────────────────────────
export async function uploadAvatar(formData: FormData) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const file = formData.get('avatar') as File;
  if (!file) return { error: 'No file provided' };

  // Validate file
  if (file.size > 2 * 1024 * 1024) return { error: 'File too large (max 2MB)' };
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return { error: 'Invalid file type. Use JPG, PNG, or WebP.' };
  }

  const ext = file.type.split('/')[1];
  const filePath = `avatars/${user.id}.${ext}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('public')
    .upload(filePath, file, { upsert: true, contentType: file.type });

  if (uploadError) return { error: uploadError.message };

  // Get public URL
  const { data: urlData } = supabase.storage.from('public').getPublicUrl(filePath);

  // Update profile
  await supabase
    .from('profiles')
    .update({ avatar_url: urlData.publicUrl })
    .eq('id', user.id);

  revalidatePath('/profile');
  return { success: true, url: urlData.publicUrl };
}

// ─── Give Attestation ────────────────────────────────────────────────────────
const giveAttestationSchema = z.object({
  to_user_id: z.string().uuid(),
  facet: z.enum(['neighbor', 'carer', 'maker', 'teacher', 'keeper', 'voice', 'shop', 'helper']),
  reason: z.string().min(5).max(200),
  weight: z.number().min(0.1).max(5).default(1),
});

export type GiveAttestationInput = z.infer<typeof giveAttestationSchema>;

export async function giveAttestation(input: GiveAttestationInput) {
  const parsed = giveAttestationSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  if (parsed.data.to_user_id === user.id) {
    return { error: 'Cannot attest yourself' };
  }

  // Check daily limit (max 5 attestations per day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data: todayAttestations } = await supabase
    .from('attestations')
    .select('id')
    .eq('from_user_id', user.id)
    .gte('created_at', today.toISOString());

  if (todayAttestations && todayAttestations.length >= 5) {
    return { error: 'Daily attestation limit reached (5 per day)' };
  }

  // Insert attestation
  const { error: insertError } = await supabase
    .from('attestations')
    .insert({
      from_user_id: user.id,
      to_user_id: parsed.data.to_user_id,
      facet: parsed.data.facet,
      weight: parsed.data.weight,
      reason: parsed.data.reason,
    });

  if (insertError) return { error: insertError.message };

  // Check if this is the user's first attestation for a reward
  const { count: attestationCount, error: countError } = await supabase
    .from('attestations')
    .select('id', { count: 'exact', head: true })
    .eq('from_user_id', user.id);

  if (!countError && attestationCount === 1) {
    // This is the user's first attestation - give first-attestation reward
    await supabase.from('rewards').insert({
      user_id: user.id,
      type: 'attestation',
      amount: 10,
      title: 'First Attestation',
      description: 'You\'ve earned your first recognition reward for recognizing others!',
      claimed: false
    });
  }

  // Update recipient's standing facet
  const { data: recipientStanding } = await supabase
    .from('standing')
    .select('*')
    .eq('user_id', parsed.data.to_user_id)
    .single();

  if (recipientStanding) {
    const facet = parsed.data.facet;
    const currentValue = (recipientStanding as any)[facet] || 0;
    const newValue = Math.min(100, currentValue + parsed.data.weight);

    await supabase
      .from('standing')
      .update({ [facet]: Math.round(newValue * 100) / 100 })
      .eq('user_id', parsed.data.to_user_id);
  }

  // Notify recipient
  const { data: senderProfile } = await supabase
    .from('profiles')
    .select('display_name, username')
    .eq('id', user.id)
    .single();

  await supabase.from('notifications').insert({
    user_id: parsed.data.to_user_id,
    type: 'social',
    title: `${senderProfile?.display_name || 'Someone'} recognized you`,
    body: `For ${parsed.data.facet}: "${parsed.data.reason}"`,
    link: '/standing',
  });

  revalidatePath('/profile');
  revalidatePath('/standing');
  return { success: true };
}

// ─── Manage Connections ──────────────────────────────────────────────────────
export async function sendConnectionRequest(toUserId: string) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  if (toUserId === user.id) return { error: 'Cannot connect to yourself' };

  const { error } = await supabase
    .from('connections')
    .insert({
      requester_id: user.id,
      addressee_id: toUserId,
      status: 'pending',
    });

  if (error) {
    if (error.code === '23505') return { error: 'Connection request already sent' };
    return { error: error.message };
  }

  // Notify
  await supabase.from('notifications').insert({
    user_id: toUserId,
    type: 'social',
    title: 'New connection request',
    body: 'Someone wants to connect with you',
    link: '/connect',
  });

  return { success: true };
}

export async function respondToConnection(connectionId: string, accept: boolean) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('connections')
    .update({
      status: accept ? 'accepted' : 'blocked',
      updated_at: new Date().toISOString(),
    })
    .eq('id', connectionId)
    .eq('addressee_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/connect');
  return { success: true };
}

// ─── Complete Onboarding ─────────────────────────────────────────────────────
const onboardingSchema = z.object({
  display_name: z.string().min(1).max(50),
  bio: z.string().max(500).optional(),
  neighborhood: z.string().max(100).optional(),
  interests: z.array(z.string()).max(5).optional(),
  voter_status: z.enum(['registered', 'not_registered', 'unsure', 'prefer_not_to_say', 'unknown']).optional(),
});

export async function completeOnboarding(input: z.infer<typeof onboardingSchema>) {
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      display_name: parsed.data.display_name,
      bio: parsed.data.bio || '',
      neighborhood: parsed.data.neighborhood || null,
      voter_status: parsed.data.voter_status || 'unknown',
      onboarding_complete: true,
      metadata: { interests: parsed.data.interests || [] },
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (updateError) return { error: updateError.message };

  // Claim welcome reward if not already claimed
  const { data: welcomeReward } = await supabase
    .from('rewards')
    .select('id')
    .eq('user_id', user.id)
    .eq('type', 'welcome')
    .eq('claimed', false)
    .single();

  if (welcomeReward) {
    const { data: wallet } = await supabase
      .from('wallets')
      .select('spending_balance, total_earned')
      .eq('user_id', user.id)
      .single();

    if (wallet) {
      // The wallet already has 50 MLY from signup trigger — just mark reward claimed
      // (don't double-credit; the trigger already deposited the funds)
      await supabase.from('rewards').update({
        claimed: true,
        claimed_at: new Date().toISOString(),
      }).eq('id', welcomeReward.id);

      // Debit treasury for the welcome grant
      const { data: treasury } = await supabase
        .from('community_treasury')
        .select('id, balance, total_distributed')
        .order('snapshot_at', { ascending: false })
        .limit(1)
        .single();

      if (treasury?.id) {
        await supabase
          .from('community_treasury')
          .update({
            balance: Math.max(0, (treasury.balance || 0) - 50),
            total_distributed: (treasury.total_distributed || 0) + 50,
            snapshot_at: new Date().toISOString(),
          })
          .eq('id', treasury.id);
      }
    }
  }

  // Update active citizen count in community_treasury
  const { count: citizenCount } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('onboarding_complete', true);

  const { data: treasury } = await supabase
    .from('community_treasury')
    .select('id')
    .order('snapshot_at', { ascending: false })
    .limit(1)
    .single();

  if (treasury?.id && typeof citizenCount === 'number') {
    await supabase
      .from('community_treasury')
      .update({
        citizen_count: citizenCount,
        snapshot_at: new Date().toISOString(),
      })
      .eq('id', treasury.id);
  }

  revalidatePath('/');
  revalidatePath('/home');
  revalidatePath('/treasury');
  revalidatePath('/profile');

  // Notify war room of new citizen (fire and forget — never blocks onboarding)
  try {
    const warRoomUrl = process.env.WAR_ROOM_INTAKE_URL;
    const intakeSecret = process.env.WAR_ROOM_INTAKE_SECRET;
    if (warRoomUrl) {
      fetch(warRoomUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-intake-secret': intakeSecret || '',
        },
        body: JSON.stringify({
          user_id: user.id,
          display_name: parsed.data.display_name,
          neighborhood: parsed.data.neighborhood || null,
          voter_status: parsed.data.voter_status || 'unknown',
          source: 'platform',
        }),
      }).catch(() => {}); // Never fail onboarding because of war room
    }
  } catch {}

  return { success: true };
}
