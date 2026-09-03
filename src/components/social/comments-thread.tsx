'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { MessageCircle, Send, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { socialDb } from '@/lib/social/db';

/**
 * Universal comments thread — works on any target (media, blog, post, product).
 * Reads/writes the `comments` table. Light MiLyfe styling.
 */
interface Comment {
  id: string; user_id: string; body: string; parent_id: string | null; like_count: number; created_at: string;
  author?: { username: string; display_name: string };
}

export function CommentsThread({ targetType, targetId }: { targetType: string; targetId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  async function load() {
    const db = socialDb();
    const { data } = await db.from('comments')
      .select('*, author:profiles!comments_user_id_fkey(username, display_name)')
      .eq('target_type', targetType).eq('target_id', targetId)
      .order('created_at', { ascending: true });
    setComments(data ?? []);
    setLoading(false);
  }
  useEffect(() => { void load(); }, [targetType, targetId]);

  async function post() {
    if (!body.trim()) return;
    setPosting(true);
    try {
      const db = socialDb();
      const { data: userData } = await db.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) { toast.error('Please sign in.'); return; }
      const { error } = await db.from('comments').insert({ user_id: uid, target_type: targetType, target_id: targetId, body: body.trim() });
      if (error) throw error;
      setBody('');
      load();
    } catch { toast.error('Could not post comment.'); }
    finally { setPosting(false); }
  }

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-4">
      <h2 className="mb-3 flex items-center gap-2 font-semibold text-harbor-800">
        <MessageCircle className="h-4 w-4 text-teal-600" /> Comments {comments.length > 0 && `(${comments.length})`}
      </h2>

      <div className="mb-4 flex gap-2">
        <input
          value={body} onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') post(); }}
          placeholder="Add a comment…"
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        />
        <Button variant="default" size="sm" onClick={post} disabled={posting || !body.trim()}>
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>

      {loading ? (
        <div className="h-12 animate-pulse rounded-lg bg-gray-50" />
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400">Be the first to comment.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                {(c.author?.display_name ?? '?').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-semibold text-harbor-800">{c.author?.display_name ?? 'Someone'}</span>{' '}
                  <span className="text-gray-700">{c.body}</span>
                </p>
                <p className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
                  {new Date(c.created_at).toLocaleDateString()}
                  {c.like_count > 0 && <span className="inline-flex items-center gap-0.5"><Heart className="h-3 w-3" /> {c.like_count}</span>}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
