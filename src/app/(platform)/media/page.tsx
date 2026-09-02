'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Music, Video, Radio, Play, Upload, Zap, Disc3, Mic2, Clapperboard, ArrowRight,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { mediaDb, toTrack, type MediaItem } from '@/lib/media/db';

const GENRES = ['Pop', 'Hip-Hop', 'R&B', 'Gospel', 'Jazz', 'Rock', 'Electronic', 'Podcast', 'Talk'];

/**
 * Built-in demo media so the Media page and the global Vibe Bar are visible
 * before any real content exists (or before migrations run). Real, freely
 * hosted samples. Replaced by real DB media once creators upload.
 */
const DEMO_MEDIA: MediaItem[] = [
  {
    id: 'demo-audio-1', channel_id: null, kind: 'audio', title: 'Sample Vibe (Demo)',
    description: null, cover_url: null, source_type: 'mp4',
    source_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration_seconds: 372, genres: ['Demo'], tags: [], visibility: 'public',
    premium: false, price_mly: 0, play_count: 0, like_count: 0, status: 'ready', channelName: 'MiLyfe Radio',
  },
  {
    id: 'demo-audio-2', channel_id: null, kind: 'audio', title: 'Evening Set (Demo)',
    description: null, cover_url: null, source_type: 'mp4',
    source_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration_seconds: 425, genres: ['Demo'], tags: [], visibility: 'public',
    premium: false, price_mly: 0, play_count: 0, like_count: 0, status: 'ready', channelName: 'MiLyfe Radio',
  },
  {
    id: 'demo-video-1', channel_id: null, kind: 'video', title: 'Welcome to MiLyfe (Demo)',
    description: null, cover_url: null, source_type: 'youtube', source_url: 'aqz-KE-bpKQ',
    duration_seconds: 60, genres: ['Demo'], tags: [], visibility: 'public',
    premium: false, price_mly: 0, play_count: 0, like_count: 0, status: 'ready', channelName: 'MiLyfe Radio',
  },
];

export default function MediaHomePage() {
  const { playTrack } = useAppStore();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const db = mediaDb();
      const { data } = await db.from('media_items')
        .select('*, media_channels(name)')
        .eq('visibility', 'public').eq('status', 'ready')
        .order('published_at', { ascending: false }).limit(24);
      const mapped: MediaItem[] = (data ?? []).map((d: MediaItem & { media_channels?: { name: string } }) => ({
        ...d, channelName: d.media_channels?.name,
      }));
      // Fall back to built-in demo media so the page + Vibe Bar are never empty.
      setItems(mapped.length > 0 ? mapped : DEMO_MEDIA);
      setLoading(false);
    })();
  }, []);

  const audio = items.filter((i) => i.kind === 'audio' || i.kind === 'podcast');
  const video = items.filter((i) => i.kind === 'video' || i.kind === 'short');
  const live = items.filter((i) => i.kind === 'live' || i.kind === 'radio');

  function play(item: MediaItem) {
    const queue = items.filter((i) => i.kind === item.kind).map(toTrack);
    playTrack(toTrack(item), queue);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-harbor-800">Media 🎧</h1>
          <p className="text-gray-500">Audio, video, live &amp; radio — the vibe follows you everywhere.</p>
        </div>
        <Link href="/media/upload">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-harbor-800 px-3 py-2 text-sm font-medium text-white hover:bg-harbor-900">
            <Upload className="h-4 w-4" /> Share
          </span>
        </Link>
      </div>

      {/* Quick verticals */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Vertical href="/media/audio" icon={Disc3} label="Audio" tint="from-teal-50/80 to-teal-100/40 border-teal-200/50" ic="text-teal-600" />
        <Vertical href="/media/video" icon={Clapperboard} label="Video" tint="from-purple-50/80 to-purple-100/40 border-purple-200/50" ic="text-purple-600" />
        <Vertical href="/media/live" icon={Radio} label="Live &amp; Radio" tint="from-rose-50/80 to-rose-100/40 border-rose-200/50" ic="text-rose-600" />
        <Vertical href="/media/shorts" icon={Zap} label="Shorts" tint="from-mly-50/80 to-mly-100/40 border-mly-200/50" ic="text-mly-600" />
      </div>

      {/* Genre chips */}
      <div className="flex flex-wrap gap-2">
        {GENRES.map((g) => (
          <span key={g} className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600">{g}</span>
        ))}
      </div>

      {loading ? (
        <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-10 text-center">
          <Music className="mx-auto mb-3 h-10 w-10 text-gray-300" aria-hidden="true" />
          <p className="font-bold text-harbor-800">No media yet — be the first</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
            Share a track, video, or go live. Earn $MLY from the community that vibes with you. No ads, ever.
          </p>
          <Link href="/media/upload" className="mt-4 inline-block">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-harbor-800 px-4 py-2.5 text-sm font-medium text-white">
              <Upload className="h-4 w-4" /> Share your first
            </span>
          </Link>
        </div>
      ) : (
        <>
          <Row title="Trending audio" icon={Music} items={audio} onPlay={play} />
          <Row title="New videos" icon={Video} items={video} onPlay={play} />
          <Row title="Live &amp; radio" icon={Mic2} items={live} onPlay={play} />
        </>
      )}
    </div>
  );
}

function Vertical({ href, icon: Icon, label, tint, ic }: { href: string; icon: typeof Music; label: string; tint: string; ic: string }) {
  return (
    <Link href={href} className={`rounded-xl border bg-gradient-to-br ${tint} p-4 text-center backdrop-blur-sm transition-transform hover:-translate-y-0.5`}>
      <Icon className={`mx-auto mb-1.5 h-6 w-6 ${ic}`} aria-hidden="true" />
      <span className="text-sm font-semibold text-harbor-800" dangerouslySetInnerHTML={{ __html: label }} />
    </Link>
  );
}

function Row({ title, icon: Icon, items, onPlay }: { title: string; icon: typeof Music; items: MediaItem[]; onPlay: (i: MediaItem) => void }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 font-semibold text-harbor-800">
        <Icon className="h-4 w-4 text-teal-600" /> <span dangerouslySetInnerHTML={{ __html: title }} />
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <button key={item.id} onClick={() => onPlay(item)}
            className="group overflow-hidden rounded-xl border border-gray-100 bg-white text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-500/10">
            <div className="relative flex aspect-square items-center justify-center bg-gradient-to-br from-teal-500 to-teal-600">
              {item.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.cover_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <Icon className="h-10 w-10 text-white/80" aria-hidden="true" />
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/20 group-hover:opacity-100">
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
    </section>
  );
}
