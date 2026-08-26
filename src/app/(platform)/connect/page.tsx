import { createServerSupabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ConnectView } from './connect-view';

export const metadata = { title: 'Connect' };

export default async function ConnectPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Accepted connections with full profiles
  const { data: connections } = await supabase
    .from('connections')
    .select('*, requester:profiles!connections_requester_id_fkey(*), addressee:profiles!connections_addressee_id_fkey(*)')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq('status', 'accepted')
    .order('updated_at', { ascending: false });

  // Pending requests TO this user
  const { data: pendingRequests } = await supabase
    .from('connections')
    .select('*, requester:profiles!connections_requester_id_fkey(*)')
    .eq('addressee_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  // Recent messages — get last message per conversation with sender/receiver profiles
  const { data: rawMessages } = await supabase
    .from('messages')
    .select('id, sender_id, receiver_id, body, read, created_at')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .limit(50);

  // Build unique conversations with deduplicated other-user IDs
  const seen = new Set<string>();
  const conversationPartnerIds: string[] = [];
  const latestMessageByPartner: Record<string, any> = {};

  for (const msg of rawMessages || []) {
    const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
    if (!seen.has(otherId)) {
      seen.add(otherId);
      conversationPartnerIds.push(otherId);
      latestMessageByPartner[otherId] = msg;
    }
  }

  // Fetch profiles for all conversation partners
  let partnerProfiles: Record<string, any> = {};
  if (conversationPartnerIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_url')
      .in('id', conversationPartnerIds);
    for (const p of profiles || []) {
      partnerProfiles[p.id] = p;
    }
  }

  // Count total unread messages
  const { count: unreadCount } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('receiver_id', user.id)
    .eq('read', false);

  // Build enriched conversations array
  const conversations = conversationPartnerIds.map(otherId => ({
    otherId,
    otherProfile: partnerProfiles[otherId] || null,
    latestMessage: latestMessageByPartner[otherId],
  }));

  // All other citizens (for "People" tab — everyone except self)
  const { data: allPeople } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, neighborhood')
    .neq('id', user.id)
    .eq('onboarding_complete', true)
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <ConnectView
      userId={user.id}
      connections={connections || []}
      pendingRequests={pendingRequests || []}
      conversations={conversations}
      unreadCount={unreadCount || 0}
      allPeople={allPeople || []}
    />
  );
}
