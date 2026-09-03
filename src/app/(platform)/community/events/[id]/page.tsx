'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, CalendarDays, MapPin, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { socialDb, type EventItem } from '@/lib/social/db';

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [event, setEvent] = useState<EventItem | null>(null);
  const [rsvp, setRsvp] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const db = socialDb();
      const { data } = await db.from('events').select('*').eq('id', id).maybeSingle();
      setEvent(data ?? null);
      const { data: userData } = await db.auth.getUser();
      if (userData.user) {
        const { data: r } = await db.from('event_rsvps').select('status').eq('event_id', id).eq('user_id', userData.user.id).maybeSingle();
        if (r) setRsvp(r.status);
      }
      setLoading(false);
    })();
  }, [id]);

  async function setStatus(status: string) {
    const db = socialDb();
    const { data: userData } = await db.auth.getUser();
    if (!userData.user) { toast.error('Please sign in.'); return; }
    await db.from('event_rsvps').upsert({ event_id: id, user_id: userData.user.id, status }, { onConflict: 'event_id,user_id' });
    setRsvp(status);
    toast.success(status === 'going' ? "You're going!" : 'RSVP updated.');
  }

  if (loading) return <div className="h-40 animate-pulse rounded-xl bg-gray-100" />;
  if (!event) return <p className="text-center text-sm text-gray-500">Event not found.</p>;

  const d = new Date(event.starts_at);

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/community/events" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Events
      </Link>

      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <div className="flex gap-4">
          <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-purple-50 text-purple-700">
            <span className="text-xl font-bold leading-none">{d.getDate()}</span>
            <span className="text-[10px] uppercase">{d.toLocaleString('en', { month: 'short' })}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-harbor-800">{event.title}</h1>
            <div className="mt-1 flex flex-wrap gap-x-3 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {d.toLocaleString('en', { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</span>
              {event.location_name && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {event.location_name}</span>}
            </div>
          </div>
        </div>
        {event.description && <p className="mt-3 text-sm text-gray-600">{event.description}</p>}

        <div className="mt-4 flex gap-2">
          <Button variant={rsvp === 'going' ? 'harbor' : 'outline'} onClick={() => setStatus('going')}>
            {rsvp === 'going' ? <><Check className="mr-1 h-4 w-4" /> Going</> : 'Going'}
          </Button>
          <Button variant={rsvp === 'interested' ? 'default' : 'outline'} onClick={() => setStatus('interested')}>Interested</Button>
        </div>
      </div>
    </div>
  );
}
