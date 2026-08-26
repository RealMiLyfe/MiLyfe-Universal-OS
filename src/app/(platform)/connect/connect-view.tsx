'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, MessageCircle, UserPlus, Check, X, Search, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils/cn';

interface Conversation {
  otherId: string;
  otherProfile: { id: string; display_name: string; username: string; avatar_url: string | null } | null;
  latestMessage: { id: string; sender_id: string; receiver_id: string; body: string; read: boolean; created_at: string };
}

interface Props {
  userId: string;
  connections: any[];
  pendingRequests: any[];
  conversations: Conversation[];
  unreadCount: number;
  allPeople: any[];
}

export function ConnectView({ userId, connections, pendingRequests, conversations: initialConversations, unreadCount: initialUnread, allPeople }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [conversations, setConversations] = useState(initialConversations);
  const [unreadCount, setUnreadCount] = useState(initialUnread);
  const [pendingList, setPendingList] = useState(pendingRequests);

  // Real-time: watch for new incoming messages to update conversation list
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('connect-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`,
      }, async (payload) => {
        const newMsg = payload.new as any;
        setUnreadCount(c => c + 1);
        // Update or prepend conversation
        setConversations(prev => {
          const existing = prev.findIndex(c => c.otherId === newMsg.sender_id);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = { ...updated[existing], latestMessage: newMsg };
            // Move to top
            const [item] = updated.splice(existing, 1);
            return [item, ...updated];
          }
          // New conversation — fetch profile for sender
          supabase.from('profiles').select('id, display_name, username, avatar_url').eq('id', newMsg.sender_id).single()
            .then(({ data }) => {
              if (data) {
                setConversations(p => [{
                  otherId: newMsg.sender_id,
                  otherProfile: data,
                  latestMessage: newMsg,
                }, ...p]);
              }
            });
          return prev;
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, neighborhood')
      .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
      .neq('id', userId)
      .limit(10);
    setSearchResults(data || []);
    setSearching(false);
  }

  async function sendRequest(toUserId: string) {
    const supabase = createClient();
    const { error } = await supabase.from('connections').insert({
      requester_id: userId,
      addressee_id: toUserId,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Connection request sent!');
      setSearchResults(prev => prev.filter(p => p.id !== toUserId));
    }
  }

  async function respondToRequest(connectionId: string, accept: boolean) {
    const supabase = createClient();
    if (accept) {
      await supabase.from('connections').update({ status: 'accepted' }).eq('id', connectionId);
      toast.success('Connection accepted!');
    } else {
      await supabase.from('connections').delete().eq('id', connectionId);
      toast.info('Request declined');
    }
    setPendingList(prev => prev.filter(r => r.id !== connectionId));
  }

  // Which people aren't connected or pending yet
  const connectedIds = new Set([
    ...connections.map(c => c.requester_id === userId ? c.addressee_id : c.requester_id),
    ...pendingList.map(r => r.requester_id),
  ]);
  const notConnectedPeople = allPeople.filter(p => !connectedIds.has(p.id));

  return (
    <div className="space-y-0 animate-fade-in pb-2">
      <div className="px-0 pt-0 pb-4">
        <h1 className="page-title">Connect</h1>
        <p className="page-subtitle">Your people, your conversations</p>
      </div>

      <Tabs defaultValue="messages">
        <TabsList className="w-full">
          <TabsTrigger value="messages" className="flex-1 gap-1.5">
            Messages
            {unreadCount > 0 && (
              <Badge variant="pulse" className="ml-1 h-5 min-w-[20px] px-1.5 text-[10px]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="connections" className="flex-1">
            People {connections.length > 0 && <Badge variant="secondary" className="ml-1">{connections.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="find" className="flex-1">
            Find
          </TabsTrigger>
        </TabsList>

        {/* ── Messages Tab ── */}
        <TabsContent value="messages" className="mt-3">
          {conversations.length === 0 ? (
            <EmptyState
              icon={MessageCircle}
              title="No messages yet"
              description="Connect with someone and start a conversation."
              variant="connect"
              action={
                <p className="text-xs text-gray-400 mt-2">Go to Find to discover people</p>
              }
            />
          ) : (
            <div className="space-y-0 -mx-4 md:mx-0">
              {conversations.map(({ otherId, otherProfile, latestMessage }) => {
                const name = otherProfile?.display_name || otherProfile?.username || 'Unknown';
                const isUnread = !latestMessage.read && latestMessage.receiver_id === userId;
                const isFromMe = latestMessage.sender_id === userId;
                const preview = isFromMe ? `You: ${latestMessage.body}` : latestMessage.body;
                const timeAgo = formatDistanceToNow(new Date(latestMessage.created_at), { addSuffix: false })
                  .replace('about ', '').replace(' minutes', 'm').replace(' minute', 'm')
                  .replace(' hours', 'h').replace(' hour', 'h').replace(' days', 'd').replace(' day', 'd');

                return (
                  <Link
                    key={otherId}
                    href={`/connect/${otherId}`}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-gray-100 dark:active:bg-harbor-800',
                      isUnread ? 'bg-teal-50/50 dark:bg-teal-900/10' : 'bg-white dark:bg-transparent',
                      'border-b border-gray-100 dark:border-harbor-800/50 last:border-0'
                    )}
                    aria-label={`Conversation with ${name}`}
                  >
                    {/* Avatar with online indicator slot */}
                    <div className="relative shrink-0">
                      <Avatar
                        name={name}
                        src={otherProfile?.avatar_url}
                        size="md"
                      />
                      {isUnread && (
                        <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-teal-500 border-2 border-white dark:border-harbor-950" aria-hidden="true" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn('text-sm truncate', isUnread ? 'font-semibold text-harbor-800 dark:text-white' : 'font-medium text-harbor-800 dark:text-white')}>
                          {name}
                        </p>
                        <span className="text-[11px] text-gray-400 shrink-0">{timeAgo}</span>
                      </div>
                      <p className={cn('text-xs truncate mt-0.5', isUnread ? 'text-harbor-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400')}>
                        {preview}
                      </p>
                    </div>

                    <ChevronRight className="h-4 w-4 text-gray-300 dark:text-harbor-700 shrink-0" aria-hidden="true" />
                  </Link>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── People / Connections Tab ── */}
        <TabsContent value="connections" className="mt-3">
          {/* Pending requests banner */}
          {pendingList.length > 0 && (
            <div className="rounded-xl border border-mly-200 dark:border-mly-800/50 bg-mly-50/50 dark:bg-mly-900/10 p-4 mb-4">
              <p className="text-sm font-semibold text-harbor-800 dark:text-white mb-3 flex items-center gap-2">
                Pending Requests
                <Badge variant="mly">{pendingList.length}</Badge>
              </p>
              <ul className="space-y-3">
                {pendingList.map((req) => (
                  <li key={req.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={req.requester?.display_name || 'U'} src={req.requester?.avatar_url} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-harbor-800 dark:text-white truncate">{req.requester?.display_name}</p>
                        <p className="text-xs text-gray-500">@{req.requester?.username}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="default" onClick={() => respondToRequest(req.id, true)} aria-label="Accept">
                        <Check className="h-3.5 w-3.5 mr-1" /> Accept
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => respondToRequest(req.id, false)} aria-label="Decline">
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {connections.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No connections yet"
              description="Find people in your community and send a connection request."
              variant="community"
            />
          ) : (
            <div className="space-y-2">
              {connections.map((conn) => {
                const other = conn.requester_id === userId ? conn.addressee : conn.requester;
                return (
                  <div key={conn.id} className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-harbor-800 bg-white dark:bg-harbor-950/50 px-4 py-3">
                    <Avatar name={other?.display_name || 'U'} src={other?.avatar_url} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-harbor-800 dark:text-white truncate">{other?.display_name}</p>
                      <p className="text-xs text-gray-500">@{other?.username}{other?.neighborhood ? ` · ${other.neighborhood}` : ''}</p>
                    </div>
                    <Link href={`/connect/${other?.id}`}>
                      <Button size="sm" variant="ghost" className="text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20" aria-label={`Message ${other?.display_name}`}>
                        <MessageCircle className="h-4 w-4 mr-1.5" aria-hidden="true" />
                        Message
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Find People Tab ── */}
        <TabsContent value="find" className="mt-3">
          <div className="space-y-4">
            {/* Search bar */}
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or username..."
                aria-label="Search for people"
                inputMode="search"
              />
              <Button type="submit" disabled={searching} variant="harbor" size="default" className="shrink-0">
                <Search className="h-4 w-4" aria-hidden="true" />
              </Button>
            </form>

            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((person) => (
                  <div key={person.id} className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-harbor-800 bg-white dark:bg-harbor-950/50 px-4 py-3">
                    <Avatar name={person.display_name || 'U'} src={person.avatar_url} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-harbor-800 dark:text-white truncate">{person.display_name}</p>
                      <p className="text-xs text-gray-500">@{person.username}{person.neighborhood ? ` · ${person.neighborhood}` : ''}</p>
                    </div>
                    <Button size="sm" onClick={() => sendRequest(person.id)} variant="harbor">
                      <UserPlus className="h-3 w-3 mr-1" aria-hidden="true" />
                      Connect
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {searchResults.length === 0 && searchQuery && !searching && (
              <p className="text-center text-sm text-gray-500 py-6">No people found for &quot;{searchQuery}&quot;</p>
            )}

            {/* People you may know — all citizens */}
            {!searchQuery && notConnectedPeople.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">People on MiLyfe</p>
                <div className="space-y-2">
                  {notConnectedPeople.map((person) => (
                    <div key={person.id} className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-harbor-800 bg-white dark:bg-harbor-950/50 px-4 py-3">
                      <Avatar name={person.display_name || 'U'} src={person.avatar_url} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-harbor-800 dark:text-white truncate">{person.display_name}</p>
                        <p className="text-xs text-gray-500">@{person.username}{person.neighborhood ? ` · ${person.neighborhood}` : ''}</p>
                      </div>
                      <Button size="sm" onClick={() => sendRequest(person.id)} variant="outline" className="shrink-0">
                        <UserPlus className="h-3 w-3 mr-1" aria-hidden="true" />
                        Connect
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!searchQuery && notConnectedPeople.length === 0 && connections.length > 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">You&apos;re connected with everyone on MiLyfe!</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
