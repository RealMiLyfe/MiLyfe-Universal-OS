'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Play, Music, Video, Radio, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { mediaDb, toTrack, type MediaItem } from '@/lib/media/db';

const VERTICALS: Record<string, { label: string; kinds: string[]; icon: LucideIcon }> = {
  audio: { label: 'Audio', kinds: ['audio', 'podcast'], icon: Music },
  video: { label: 'Video', kinds: ['video'], icon: Video },
  shorts: { label: 'Shorts', kinds: ['short'], icon: Zap },
  live: { label: 'Live & Radio', kinds: ['live', 'radio'], icon: Radio },
};

export default function MediaVerticalPage({ params }: { params: Promise<{ vertical: string }> }) {
  const { vertical } = use(params);
  const config = VERTICALS[vertical];
  const { playTrack } = useAppStore();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!config) return;
    (async () => {
      const db = mediaDb();
      const { data } = await db.from('media_items')
        .select('*, media_channels(name)')
        .in('kind', config.kinds).eq('visibility', 'public')
        .order('published_at', { ascending: false }).limit(60);
      setItems((data ?? []).map((d: MediaItem & { media_channels?: { name: string } }) => ({ ...d, channelName: d.media_channels?.name })));
      setLoading(false);
    })();
  }, [config]);

  if (!config) notFound();
  const Icon = config.icon;

  function play(item: MediaItem) {
    playTrack(toTrack(item), items.map(toTrack));
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/media" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Media
      </Link>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-harbor-800">
        <Icon className="h-6 w-6 text-teal-600" /> {config.label}
      </h1>

      {loading ? (
        <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-10 text-center">
          <Icon className="mx-auto mb-2 h-8 w-8 text-gray-300" aria-hidden="true" />
          <p className="text-sm text-gray-500">Nothing here yet. <Link href="/media/upload" className="text-teal-600 hover:underline">Share the first.</Link></p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <button key={item.id} onClick={() => play(item)}
              className="group overflow-hidden rounded-xl border border-gray-100 bg-white text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-500/10">
              <div className="relative flex aspect-square items-center justify-center bg-gradient-to-br from-teal-500 to-teal-600">
                {item.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.cover_url} alt="" className="h-full w-full object-cover" />
                ) : <Icon className="h-10 w-10 text-white/80" aria-hidden="true" />}
                <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:bg-black/20 group-hover:opacity-100">
                  <Play className="h-10 w-10 text-white" />
                </span>
              </div>
              <div className="p-2.5">
                <p className="truncate text-sm font-medium text-harbor-800">{item.title}</p>
                <p className="truncate text-xs text-gray-500">{item.channelName ?? 'MiLyfe'}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
