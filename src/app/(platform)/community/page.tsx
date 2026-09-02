'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Plus, Users, CalendarDays, PenSquare, ImagePlus, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { socialDb, type Story } from '@/lib/social/db';

export default function CommunityPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [post, setPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const db = socialDb();
      const { data } = await db.from('stories')
        .select('*, author:profiles!stories_user_id_fkey(username, display_name, avatar_url)')
        .order('created_at', { ascending: false }).limit(20);
      setStories(data ?? []);
      setLoading(false);
    })();
  }, []);

  async function quickPost() {
    if (!post.trim()) return;
    setPosting(true);
    try {
      const db = socialDb();
      const { data: userData } = await db.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) { toast.error('Please sign in.'); return; }
      // Quick post -> a text story (10-second content).
      const { error } = await db.from('stories').insert({ user_id: uid, kind: 'text', caption: post.trim() });
      if (error) throw error;
      setPost('');
      toast.success('Posted!');
      const { data } = await db.from('stories')
        .select('*, author:profiles!stories_user_id_fkey(username, display_name, avatar_url)')
        .order('created_at', { ascending: false }).limit(20);
      setStories(data ?? []);
    } catch {
      toast.error('Could not post right now.');
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-harbor-800">Community 👋</h1>
        <p className="text-gray-500">Stories, groups, events, and the people around you.</p>
      </div>

      {/* Stories strip */}
      <section>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {/* Add your story */}
          <Link href="/community?story=1" className="flex w-16 shrink-0 flex-col items-center gap-1">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-teal-300 bg-teal-50">
              <Plus className="h-6 w-6 text-teal-600" />
            </div>
            <span className="truncate text-[11px] text-gray-500">Add yours</span>
          </Link>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-gray-100" />
            ))
          ) : stories.map((s) => (
            <div key={s.id} className="flex w-16 shrink-0 flex-col items-center gap-1">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-mly-400 p-0.5">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-xs font-bold text-harbor-700">
                  {(s.author?.display_name ?? '?').slice(0, 2).toUpperCase()}
                </div>
              </div>
              <span className="truncate text-[11px] text-gray-500">{s.author?.display_name?.split(' ')[0] ?? 'You'}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Quick post composer */}
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <textarea
          value={post} onChange={(e) => setPost(e.target.value)}
          placeholder="Share something with your community…"
          rows={2}
          className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        />
        <div className="mt-2 flex items-center justify-between">
          <button className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600">
            <ImagePlus className="h-4 w-4" /> Photo
          </button>
          <Button variant="default" size="sm" onClick={quickPost} disabled={posting || !post.trim()}>
            <Send className="mr-1.5 h-3.5 w-3.5" /> {posting ? 'Posting…' : 'Post'}
          </Button>
        </div>
      </div>

      {/* Nav tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Tile href="/community/groups" icon={Users} label="Groups" tint="from-teal-50/80 to-teal-100/40 border-teal-200/50" ic="text-teal-600" />
        <Tile href="/community/events" icon={CalendarDays} label="Events" tint="from-purple-50/80 to-purple-100/40 border-purple-200/50" ic="text-purple-600" />
        <Tile href="/community/blog" icon={PenSquare} label="Blog" tint="from-mly-50/80 to-mly-100/40 border-mly-200/50" ic="text-mly-600" />
      </div>

      {/* Recent posts (from stories text feed) */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-harbor-800">
          <Sparkles className="h-4 w-4 text-teal-600" /> Latest
        </h2>
        {loading ? (
          <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
        ) : (
          <div className="space-y-2">
            {stories.filter((s) => s.caption).map((s) => (
              <div key={s.id} className="rounded-xl border border-gray-100 bg-white p-4">
                <p className="mb-1 text-sm font-semibold text-harbor-800">{s.author?.display_name ?? 'Someone'}</p>
                <p className="text-sm text-gray-700">{s.caption}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Tile({ href, icon: Icon, label, tint, ic }: { href: string; icon: typeof Users; label: string; tint: string; ic: string }) {
  return (
    <Link href={href} className={`rounded-xl border bg-gradient-to-br ${tint} p-4 text-center backdrop-blur-sm transition-transform hover:-translate-y-0.5`}>
      <Icon className={`mx-auto mb-1.5 h-6 w-6 ${ic}`} aria-hidden="true" />
      <span className="text-sm font-semibold text-harbor-800">{label}</span>
    </Link>
  );
}
