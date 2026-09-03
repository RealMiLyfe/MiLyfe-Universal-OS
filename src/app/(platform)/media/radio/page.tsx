'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Radio, Dot } from 'lucide-react';
import { mediaDb } from '@/lib/media/db';

interface Show { id: string; title: string; description: string | null; host: string | null; day_of_week: number | null; start_minute: number | null; end_minute: number | null; }
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function fmtMin(m: number | null): string {
  if (m == null) return '';
  const h = Math.floor(m / 60); const min = m % 60;
  const ampm = h >= 12 ? 'PM' : 'AM'; const h12 = h % 12 || 12;
  return `${h12}:${min.toString().padStart(2, '0')} ${ampm}`;
}

export default function RadioSchedulePage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().getDay();
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();

  useEffect(() => {
    (async () => {
      const db = mediaDb();
      const { data } = await db.from('radio_shows').select('*').order('day_of_week', { ascending: true }).order('start_minute', { ascending: true });
      setShows(data ?? []);
      setLoading(false);
    })();
  }, []);

  const onAir = shows.find((s) => s.day_of_week === today && s.start_minute != null && s.end_minute != null && nowMin >= s.start_minute && nowMin < s.end_minute);
  const byDay = (d: number) => shows.filter((s) => s.day_of_week === d);

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/media" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Media
      </Link>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-harbor-800"><Radio className="h-6 w-6 text-rose-600" /> Radio Schedule</h1>

      {/* Now on air */}
      <div className="rounded-xl border border-rose-200/50 bg-gradient-to-br from-rose-50/80 to-rose-100/40 p-4 backdrop-blur-sm">
        <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-rose-700">
          <Dot className="h-5 w-5 animate-pulse-soft" /> Now on air
        </p>
        {onAir ? (
          <>
            <p className="mt-1 font-bold text-harbor-800">{onAir.title}</p>
            {onAir.host && <p className="text-sm text-gray-600">with {onAir.host}</p>}
          </>
        ) : (
          <p className="mt-1 text-sm text-gray-600">No live show right now — check the schedule below.</p>
        )}
      </div>

      {loading ? <div className="h-24 animate-pulse rounded-xl bg-gray-100" /> :
        shows.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500">
            No shows scheduled yet.
          </div>
        ) : (
        <div className="space-y-4">
          {DAYS.map((day, i) => {
            const dayShows = byDay(i);
            if (dayShows.length === 0) return null;
            return (
              <div key={day}>
                <h2 className={`mb-2 text-sm font-semibold ${i === today ? 'text-teal-600' : 'text-harbor-800'}`}>{day}{i === today ? ' · Today' : ''}</h2>
                <div className="space-y-2">
                  {dayShows.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3">
                      <span className="w-24 shrink-0 text-xs text-gray-500">{fmtMin(s.start_minute)}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-harbor-800">{s.title}</p>
                        {s.host && <p className="text-xs text-gray-500">{s.host}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
