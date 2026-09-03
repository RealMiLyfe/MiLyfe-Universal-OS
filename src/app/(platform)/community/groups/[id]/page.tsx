'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Users, Globe, Lock, UserPlus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { socialDb, type Group } from '@/lib/social/db';
import { CommentsThread } from '@/components/social/comments-thread';

export default function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [group, setGroup] = useState<Group | null>(null);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const db = socialDb();
      const { data } = await db.from('groups').select('*').eq('id', id).maybeSingle();
      setGroup(data ?? null);
      const { data: userData } = await db.auth.getUser();
      if (userData.user) {
        const { data: m } = await db.from('group_members').select('id').eq('group_id', id).eq('user_id', userData.user.id).maybeSingle();
        if (m) setJoined(true);
      }
      setLoading(false);
    })();
  }, [id]);

  async function join() {
    const db = socialDb();
    const { data: userData } = await db.auth.getUser();
    if (!userData.user) { toast.error('Please sign in.'); return; }
    await db.from('group_members').upsert({ group_id: id, user_id: userData.user.id, role: 'member' }, { onConflict: 'group_id,user_id' });
    setJoined(true);
    toast.success('Joined the group!');
  }

  if (loading) return <div className="h-40 animate-pulse rounded-xl bg-gray-100" />;
  if (!group) return <p className="text-center text-sm text-gray-500">Group not found.</p>;

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/community/groups" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Groups
      </Link>

      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <div className="mb-1 flex items-center gap-2">
          {group.privacy === 'public' ? <Globe className="h-4 w-4 text-teal-600" /> : <Lock className="h-4 w-4 text-gray-400" />}
          <h1 className="text-xl font-bold text-harbor-800">{group.name}</h1>
        </div>
        {group.description && <p className="text-sm text-gray-600">{group.description}</p>}
        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-xs text-gray-500"><Users className="h-3.5 w-3.5" /> {group.member_count} members</span>
          <Button variant={joined ? 'outline' : 'harbor'} size="sm" onClick={join} disabled={joined}>
            {joined ? <><Check className="mr-1 h-4 w-4" /> Joined</> : <><UserPlus className="mr-1 h-4 w-4" /> Join</>}
          </Button>
        </div>
      </div>

      {/* Group discussion */}
      <CommentsThread targetType="group" targetId={id} />
    </div>
  );
}
