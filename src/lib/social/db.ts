/** Social Supabase access (browser, loose-typed for the new social tables). */
import { createClient } from '@/lib/supabase/client';

type LooseClient = { from: (t: string) => any; auth: { getUser: () => Promise<{ data: { user: { id: string } | null } }> } };

export function socialDb(): LooseClient {
  return createClient() as unknown as LooseClient;
}

export interface Story {
  id: string; user_id: string; media_url: string | null; caption: string | null;
  kind: 'image' | 'video' | 'text'; background: string | null; created_at: string;
  author?: { username: string; display_name: string; avatar_url: string | null };
}
export interface Group {
  id: string; slug: string; name: string; description: string | null;
  privacy: 'public' | 'private' | 'hidden'; cover_url: string | null; member_count: number;
}
export interface EventItem {
  id: string; title: string; description: string | null; cover_url: string | null;
  location_name: string | null; starts_at: string; ends_at: string | null;
}
export interface BlogPost {
  id: string; slug: string; title: string; body: string; cover_url: string | null;
  series: string | null; tags: string[]; published: boolean; like_count: number;
  published_at: string | null; author_id: string;
  author?: { username: string; display_name: string };
}
