'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, PenSquare, Plus, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { socialDb, type BlogPost } from '@/lib/social/db';
import { rewardContribution } from '@/lib/economy/reward';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    const db = socialDb();
    const { data } = await db.from('blog_posts')
      .select('*, author:profiles!blog_posts_author_id_fkey(username, display_name)')
      .eq('published', true).order('published_at', { ascending: false }).limit(30);
    setPosts(data ?? []);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function publish() {
    if (!title.trim() || !body.trim()) { toast.error('Add a title and body.'); return; }
    setSaving(true);
    try {
      const db = socialDb();
      const { data: userData } = await db.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) { toast.error('Please sign in.'); return; }
      const slug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50) + '-' + Math.random().toString(36).slice(2, 6);
      const { error } = await db.from('blog_posts').insert({
        author_id: uid, slug, title: title.trim(), body: body.trim(), published: true, published_at: new Date().toISOString(),
      });
      if (error) throw error;
      const awarded = await rewardContribution(socialDb() as never, {
        kind: 'blog', surface: 'community', facet: 'maker', title: `Published: ${title.trim()}`, mly: 15,
      });
      setTitle(''); setBody(''); setComposing(false);
      toast.success(awarded > 0 ? `Published! +${awarded} $MLY.` : 'Published!');
      load();
    } catch { toast.error('Could not publish.'); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/community" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Community
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-harbor-800"><PenSquare className="h-6 w-6 text-mly-600" /> Blog</h1>
        <Button variant="default" size="sm" onClick={() => setComposing((c) => !c)}><Plus className="mr-1 h-4 w-4" /> Write</Button>
      </div>

      {composing && (
        <div className="rounded-xl border border-gray-100 bg-white p-4 space-y-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} placeholder="Write your story…"
            className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
          <Button variant="harbor" onClick={publish} disabled={saving} className="w-full">{saving ? 'Publishing…' : 'Publish'}</Button>
        </div>
      )}

      {loading ? <div className="h-24 animate-pulse rounded-xl bg-gray-100" /> :
        posts.length === 0 ? <p className="text-center text-sm text-gray-500">No posts yet. Write the first.</p> : (
        <div className="space-y-3">
          {posts.map((p) => (
            <article key={p.id} className="rounded-xl border border-gray-100 bg-white p-4">
              <h2 className="font-bold text-harbor-800">{p.title}</h2>
              <p className="mt-1 line-clamp-3 text-sm text-gray-600 whitespace-pre-wrap">{p.body}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                <span>{p.author?.display_name ?? 'Someone'}</span>
                <span className="inline-flex items-center gap-1"><Heart className="h-3 w-3" /> {p.like_count}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
