/**
 * Media Supabase access (browser, loose-typed) + item→track mapping for the
 * global Vibe Bar player.
 */
import { createClient } from '@/lib/supabase/client';
import type { PlayerTrack } from '@/lib/store';

type LooseClient = { from: (t: string) => any; auth: { getUser: () => Promise<{ data: { user: { id: string } | null } }> } };

export function mediaDb(): LooseClient {
  return createClient() as unknown as LooseClient;
}

export interface MediaItem {
  id: string;
  channel_id: string | null;
  kind: PlayerTrack['kind'];
  title: string;
  description: string | null;
  cover_url: string | null;
  source_type: PlayerTrack['sourceType'];
  source_url: string | null;
  duration_seconds: number | null;
  genres: string[];
  tags: string[];
  visibility: string;
  premium: boolean;
  price_mly: number;
  play_count: number;
  like_count: number;
  status: string;
  channelName?: string;
}

/** Map a media item to a player track for the Vibe Bar. */
export function toTrack(item: MediaItem): PlayerTrack {
  return {
    id: item.id,
    kind: item.kind,
    title: item.title,
    channelName: item.channelName,
    coverUrl: item.cover_url,
    sourceType: item.source_type,
    sourceUrl: item.source_url,
    durationSeconds: item.duration_seconds,
  };
}
