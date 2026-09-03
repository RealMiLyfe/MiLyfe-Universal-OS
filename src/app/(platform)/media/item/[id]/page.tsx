'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Play, Heart, Coins, Music, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/lib/store';
import { mediaDb, toTrack, type MediaItem } from '@/lib/media/db';
import { CommentsThread } from '@/components/social/comments-thread';

export default function MediaItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { playTrack } = useAppStore();
  const [item, setItem] = useState<(MediaItem & { channel_id: string | null }) | null>(null);
  const [related, setRelated] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [tip, setTip] = useState('10');

  useEffect(() => {
    (async () => {
      const db = mediaDb();
      const { data } = await db.from('media_items').select('*, media_channels(name, id)').eq('id', id).maybeSingle();
      if (data) {
        setItem({ ...data, channelName: data.media_channels?.name });
        const { data: rel } = await db.from('media_items').select('*, media_channels(name)')
          .eq('kind', data.kind).eq('visibility', 'public').neq('id', id).limit(6);
        setRelated((rel ?? []).map((r: MediaItem & { media_channels?: { name: string } }) => ({ ...r, channelName: r.media_channels?.name })));
      }
      setLoading(false);
    })();
  }, [id]);

  async function like() {
    const db = mediaDb();
    const { data: userData } = await db.auth.getUser();
    if (!userData.user) { toast.error('Please sign in.'); return; }
    await db.from('media_likes').upsert({ media_id: id, user_id: userData.user.id }, { onConflict: 'media_id,user_id' });
    setLiked(true);
    toast.success('Liked.');
  }

  async function sendTip() {
    const db = mediaDb();
    const { data: userData } = await db.auth.getUser();
    if (!userData.user || !item) { toast.error('Please sign in.'); return; }
    const { error } = await db.from('media_tips').insert({
      media_id: id, channel_id: item.channel_id, from_user_id: userData.user.id, amount_mly: Number(tip) || 0,
    });
    if (error) { toast.error('Could not tip.'); return; }
    toast.success(`Tipped ${tip} $MLY to the creator!`);
  }

  if (loading) return <div className="h-40 animate-pulse rounded-xl bg-gray-100" />;
  if (!item) return <p className="text-center text-sm text-gray-500">Not found.</p>;

  const isVideo = item.kind === 'video' || item.kind === 'short' || item.kind === 'live';

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/media" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Media
      </Link>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-teal-500 to-teal-600">
          {isVideo ? <Video className="h-14 w-14 text-white/80" /> : <Music className="h-14 w-14 text-white/80" />}
        </div>
        <div className="p-4">
          <h1 className="text-xl font-bold text-harbor-800">{item.title}</h1>
          {item.channelName && (
            <Link href={item.channel_id ? `/media/channel/${item.channel_id}` : '/media'} className="text-sm text-teal-600 hover:underline">
              {item.channelName}
            </Link>
          )}
          {item.description && <p className="mt-2 text-sm text-gray-600">{item.description}</p>}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button variant="harbor" onClick={() => playTrack(toTrack(item))}><Play className="mr-2 h-4 w-4" /> Play</Button>
            <Button variant="outline" onClick={like} disabled={liked}><Heart className={`mr-2 h-4 w-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} /> {liked ? 'Liked' : 'Like'}</Button>
          </div>

          {/* Tip creator ($MLY, no ads) */}
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-teal-100 bg-teal-50 p-3">
            <Coins className="h-5 w-5 shrink-0 text-teal-600" />
            <span className="text-sm text-harbor-800">Support the creator</span>
            <Input type="number" value={tip} onChange={(e) => setTip(e.target.value)} className="ml-auto max-w-[90px]" />
            <Button variant="default" size="sm" onClick={sendTip}>Tip $MLY</Button>
          </div>
        </div>
      </div>

      {/* Comments */}
      <CommentsThread targetType="media" targetId={id} />

      {/* Related */}
      {related.length > 0 && (
        <section>
          <h2 className="mb-3 font-semibold text-harbor-800">More like this</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {related.map((r) => (
              <Link key={r.id} href={`/media/item/${r.id}`} className="overflow-hidden rounded-xl border border-gray-100 bg-white transition-transform hover:-translate-y-0.5">
                <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-teal-500 to-teal-600">
                  <Music className="h-8 w-8 text-white/80" />
                </div>
                <div className="p-2"><p className="truncate text-sm font-medium text-harbor-800">{r.title}</p></div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
