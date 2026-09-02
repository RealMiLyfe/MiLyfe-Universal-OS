'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, MapPin, Clock } from 'lucide-react';
import { socialDb, type EventItem } from '@/lib/social/db';

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const db = socialDb();
      const { data } = await db.from('events').select('*').gte('starts_at', new Date().toISOString()).order('starts_at', { ascending: true }).limit(50);
      setEvents(data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/community" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Community
      </Link>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-harbor-800"><CalendarDays className="h-6 w-6 text-purple-600" /> Events</h1>

      {loading ? <div className="h-24 animate-pulse rounded-xl bg-gray-100" /> :
        events.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-10 text-center">
            <CalendarDays className="mx-auto mb-2 h-8 w-8 text-gray-300" aria-hidden="true" />
            <p className="text-sm text-gray-500">No upcoming events. Community gatherings will show here.</p>
          </div>
        ) : (
        <div className="space-y-3">
          {events.map((e) => {
            const d = new Date(e.starts_at);
            return (
              <Link key={e.id} href={`/community/events/${e.id}`} className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4 transition-transform hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-purple-50 text-purple-700">
                  <span className="text-lg font-bold leading-none">{d.getDate()}</span>
                  <span className="text-[10px] uppercase">{d.toLocaleString('en', { month: 'short' })}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-harbor-800">{e.title}</p>
                  {e.description && <p className="line-clamp-1 text-sm text-gray-600">{e.description}</p>}
                  <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}</span>
                    {e.location_name && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.location_name}</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
