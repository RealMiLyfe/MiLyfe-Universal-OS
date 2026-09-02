'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Users, Plus, Lock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { socialDb, type Group } from '@/lib/social/db';

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');

  async function load() {
    const db = socialDb();
    const { data } = await db.from('groups').select('*').in('privacy', ['public', 'private']).order('member_count', { ascending: false }).limit(50);
    setGroups(data ?? []);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function create() {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const db = socialDb();
      const { data: userData } = await db.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) { toast.error('Please sign in.'); return; }
      const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) + '-' + Math.random().toString(36).slice(2, 6);
      const { data: g, error } = await db.from('groups').insert({ owner_id: uid, slug, name: name.trim() }).select('id').single();
      if (error) throw error;
      await db.from('group_members').insert({ group_id: g.id, user_id: uid, role: 'owner' });
      setName('');
      toast.success('Group created!');
      load();
    } catch { toast.error('Could not create group.'); }
    finally { setCreating(false); }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/community" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Community
      </Link>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-harbor-800"><Users className="h-6 w-6 text-teal-600" /> Groups</h1>

      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <div className="flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name a new group" />
          <Button variant="default" onClick={create} disabled={creating}><Plus className="mr-1 h-4 w-4" /> Create</Button>
        </div>
      </div>

      {loading ? <div className="h-24 animate-pulse rounded-xl bg-gray-100" /> :
        groups.length === 0 ? <p className="text-center text-sm text-gray-500">No groups yet. Start one above.</p> : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {groups.map((g) => (
            <div key={g.id} className="rounded-xl border border-gray-100 bg-white p-4">
              <div className="mb-1 flex items-center gap-2">
                {g.privacy === 'public' ? <Globe className="h-4 w-4 text-teal-600" /> : <Lock className="h-4 w-4 text-gray-400" />}
                <p className="font-bold text-harbor-800">{g.name}</p>
              </div>
              {g.description && <p className="text-sm text-gray-600">{g.description}</p>}
              <p className="mt-1 text-xs text-gray-500">{g.member_count} member{g.member_count === 1 ? '' : 's'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
