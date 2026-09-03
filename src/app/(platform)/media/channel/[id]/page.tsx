'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Music, BadgeCheck, UserPlus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mediaDb, type MediaItem } from '@/lib/media/db';

export default function ChannelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [channel, setChannel] = useState<{ id: string; name: string; bio: string | null; verified: boolean; subscriber_count: number } | null>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const db = mediaDb();
      const { data: ch } = await db.from('media_channels').select('*').eq('id', id).maybeSingle();
      setChannel(ch ?? null);
      const { data: it } = await db.from('media_items').select('*').eq('channel_id', id).eq('visibility', 'public').order('published_at', { ascending: false });
      setItems(it ?? []);
      const { data: userData } = await db.auth.getUser();
      if (userData.user) {
        const { data: sub } = await db.from('media_subscriptions').select('id').eq('channel_id', id).eq('user_id', userData.user.id).maybeSingle();
        if (sub) setSubscribed(true);
      }
      setLoading(false);
    })();
  }, [id]);

  async function subscribe() {
    const db = mediaDb();
    const { data: userData } = await db.auth.getUser();
    if (!userData.user) { toast.error('Please sign in.'); return; }
    await db.from('media_subscriptions').upsert({ channel_id: id, user_id: userData.user.id }, { onConflict: 'channel_id,user_id' });
    setSubscribed(true);
    toast.success('Subscribed!');
  }

  if (loading) return <div className="h-40 animate-pulse rounded-xl bg-gray-100" />;
  if (!channel) return <p className="text-center text-sm text-gray-500">Channel not found.</p>;

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/media" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Media
      </Link>

      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-lg font-bold text-white">
            {channel.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="flex items-center gap-1 text-xl font-bold text-harbor-800">
              {channel.name} {channel.verified && <BadgeCheck className="h-5 w-5 text-teal-600" />}
            </h1>
            <p className="text-xs text-gray-500">{channel.subscriber_count} subscribers</p>
          </div>
          <Button variant={subscribed ? 'outline' : 'harbor'} onClick={subscribe} disabled={subscribed}>
            {subscribed ? <><Check className="mr-1 h-4 w-4" /> Subscribed</> : <><UserPlus className="mr-1 h-4 w-4" /> Subscribe</>}
          </Button>
        </div>
        {channel.bio && <p className="mt-3 text-sm text-gray-600">{channel.bio}</p>}
      </div>

      <section>
        <h2 className="mb-3 font-semibold text-harbor-800">Uploads</h2>
        {items.length === 0 ? <p className="text-sm text-gray-500">No uploads yet.</p> : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((it) => (
              <Link key={it.id} href={`/media/item/${it.id}`} className="overflow-hidden rounded-xl border border-gray-100 bg-white transition-transform hover:-translate-y-0.5">
                <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-teal-500 to-teal-600"><Music className="h-8 w-8 text-white/80" /></div>
                <div className="p-2"><p className="truncate text-sm font-medium text-harbor-800">{it.title}</p></div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
