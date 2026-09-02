'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Upload, Music, Video, Zap, Radio, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mediaDb, uploadFile } from '@/lib/media/db';
import { rewardContribution } from '@/lib/economy/reward';

const KINDS = [
  { key: 'audio', label: 'Audio', icon: Music },
  { key: 'video', label: 'Video', icon: Video },
  { key: 'short', label: 'Short', icon: Zap },
  { key: 'podcast', label: 'Podcast', icon: Radio },
] as const;

export default function MediaUploadPage() {
  const router = useRouter();
  const [kind, setKind] = useState<string>('audio');
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<'file' | 'link'>('file');
  const [sourceType, setSourceType] = useState<string>('youtube');
  const [sourceUrl, setSourceUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [premium, setPremium] = useState(false);
  const [price, setPrice] = useState('0');
  const [saving, setSaving] = useState(false);

  async function publish() {
    if (!title.trim()) { toast.error('Add a title.'); return; }
    if (mode === 'link' && !sourceUrl.trim()) { toast.error('Add a source link.'); return; }
    if (mode === 'file' && !file) { toast.error('Choose a file to upload.'); return; }
    setSaving(true);
    try {
      const db = mediaDb();
      const { data: userData } = await db.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) { toast.error('Please sign in.'); return; }

      // Resolve the media source: uploaded file OR remote link.
      let finalSourceType = sourceType;
      let finalSourceUrl = sourceUrl.trim();
      if (mode === 'file' && file) {
        toast.info('Uploading file…');
        finalSourceUrl = await uploadFile('media', file);
        finalSourceType = 'hosted';
      }

      // Ensure the creator has a channel.
      let { data: channel } = await db.from('media_channels').select('id').eq('owner_id', uid).maybeSingle();
      if (!channel) {
        const slug = `ch-${uid.slice(0, 8)}`;
        const { data: created } = await db.from('media_channels')
          .insert({ owner_id: uid, slug, name: 'My Channel' }).select('id').single();
        channel = created;
      }

      const { error } = await db.from('media_items').insert({
        channel_id: channel?.id ?? null,
        uploader_id: uid,
        kind,
        title: title.trim(),
        source_type: finalSourceType,
        source_url: finalSourceUrl,
        premium,
        price_mly: premium ? Number(price) || 0 : 0,
        visibility: 'public',
        status: 'ready',
      });
      if (error) throw error;
      // Reward the creator ($MLY + Maker standing) — auto-wired economy.
      const awarded = await rewardContribution(db as never, {
        kind: 'media_upload', surface: 'media', facet: 'maker',
        title: `Shared media: ${title.trim()}`, mly: 25,
      });
      toast.success(awarded > 0 ? `Published! +${awarded} $MLY earned.` : 'Published! The vibe is live.');
      router.push('/media');
    } catch {
      toast.error('Could not publish right now.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/media" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Media
      </Link>
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-harbor-800">
          <Upload className="h-6 w-6 text-teal-600" /> Share your media
        </h1>
        <p className="text-gray-500">Host a link (YouTube, SoundCloud, Vimeo, direct file). Earn $MLY from the community. No ads, ever.</p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-bold text-harbor-800">Type</label>
          <div className="flex flex-wrap gap-2">
            {KINDS.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setKind(key)}
                className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium ${kind === key ? 'border-teal-500 bg-teal-50 text-harbor-900' : 'border-gray-200 bg-white text-gray-600'}`}>
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-harbor-800">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Name your vibe" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-harbor-800">Source</label>
          <div className="mb-3 flex gap-2">
            <button onClick={() => setMode('file')}
              className={`inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium ${mode === 'file' ? 'border-teal-500 bg-teal-50 text-harbor-900' : 'border-gray-200 text-gray-600'}`}>
              <Upload className="h-4 w-4" /> Upload file
            </button>
            <button onClick={() => setMode('link')}
              className={`inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium ${mode === 'link' ? 'border-teal-500 bg-teal-50 text-harbor-900' : 'border-gray-200 text-gray-600'}`}>
              <Link2 className="h-4 w-4" /> Link
            </button>
          </div>

          {mode === 'file' ? (
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 p-6 text-center hover:border-teal-300">
              <Upload className="h-7 w-7 text-teal-500" />
              <span className="text-sm text-gray-600">{file ? file.name : 'Choose an audio or video file'}</span>
              <input type="file" accept="audio/*,video/*" className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
          ) : (
            <>
              <div className="mb-2 flex flex-wrap gap-2">
                {['youtube', 'soundcloud', 'vimeo', 'mp4', 'hls'].map((s) => (
                  <button key={s} onClick={() => setSourceType(s)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-medium capitalize ${sourceType === s ? 'border-teal-500 bg-teal-50 text-harbor-900' : 'border-gray-200 text-gray-600'}`}>
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 shrink-0 text-gray-400" />
                <Input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder={sourceType === 'youtube' ? 'YouTube video ID' : 'Media URL'} />
              </div>
            </>
          )}
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 text-sm text-harbor-800">
          <input type="checkbox" checked={premium} onChange={(e) => setPremium(e.target.checked)} className="h-5 w-5 accent-teal-600" />
          <span>Premium (charge $MLY to access)</span>
        </label>
        {premium && (
          <div>
            <label className="mb-1 block text-sm font-bold text-harbor-800">Price ($MLY)</label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="max-w-[140px]" />
          </div>
        )}

        <Button variant="harbor" size="lg" className="w-full" onClick={publish} disabled={saving}>
          {saving ? 'Publishing…' : 'Publish'}
        </Button>
      </div>
    </div>
  );
}
