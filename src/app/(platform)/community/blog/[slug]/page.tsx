'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart } from 'lucide-react';
import { socialDb, type BlogPost } from '@/lib/social/db';
import { CommentsThread } from '@/components/social/comments-thread';

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const db = socialDb();
      const { data } = await db.from('blog_posts')
        .select('*, author:profiles!blog_posts_author_id_fkey(username, display_name)')
        .eq('slug', slug).maybeSingle();
      setPost(data ?? null);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="h-40 animate-pulse rounded-xl bg-gray-100" />;
  if (!post) return <p className="text-center text-sm text-gray-500">Post not found.</p>;

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/community/blog" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Blog
      </Link>

      <article className="rounded-xl border border-gray-100 bg-white p-5">
        <h1 className="text-2xl font-bold text-harbor-800">{post.title}</h1>
        <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
          <span>{post.author?.display_name ?? 'Someone'}</span>
          {post.published_at && <span>{new Date(post.published_at).toLocaleDateString()}</span>}
          <span className="inline-flex items-center gap-1"><Heart className="h-3 w-3" /> {post.like_count}</span>
        </div>
        <div className="prose prose-sm mt-4 max-w-none whitespace-pre-wrap text-gray-700">{post.body}</div>
      </article>

      <CommentsThread targetType="blog" targetId={post.id} />
    </div>
  );
}
