import { createServerSupabase } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { ForumPostDetail } from './forum-post-detail';

interface PageProps {
  params: Promise<{ postId: string }>;
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const supabase = await createServerSupabase();
  const { data } = await supabase.from('forum_posts').select('title').eq('id', params.postId).single();
  return { title: data?.title || 'Forum Post' };
}

export default async function ForumPostPage(props: PageProps) {
  const params = await props.params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: post } = await supabase
    .from('forum_posts')
    .select('*, profiles!author_id(id, username, display_name, avatar_url), forum_spaces!space_id(name, icon, slug)')
    .eq('id', params.postId)
    .single();

  if (!post) notFound();

  const { data: replies } = await supabase
    .from('forum_replies')
    .select('*, profiles!author_id(id, username, display_name, avatar_url)')
    .eq('post_id', params.postId)
    .order('created_at', { ascending: true });

  return (
    <ForumPostDetail
      post={post}
      replies={replies || []}
      userId={user.id}
    />
  );
}
