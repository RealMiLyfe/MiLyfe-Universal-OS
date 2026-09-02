'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Result { id: string; type: string; title: string; subtitle: string; href: string; icon: string; }

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  const run = useCallback(async (query: string) => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) { const data = await res.json(); setResults(data.results ?? []); }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => run(q), 200);
    return () => clearTimeout(t);
  }, [q, run]);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-harbor-800">Search</h1>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="People, media, courses, shops, cases…" className="pl-9" autoFocus />
      </div>

      {loading && <p className="text-sm text-gray-500">Searching…</p>}
      {!loading && q && results.length === 0 && (
        <p className="text-sm text-gray-500">No results for &ldquo;{q}&rdquo;.</p>
      )}
      <div className="space-y-2">
        {results.map((r) => (
          <Link key={`${r.type}-${r.id}`} href={r.href}
            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 transition-shadow hover:shadow-md">
            <span className="text-lg">{r.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-harbor-800">{r.title}</p>
              <p className="truncate text-xs text-gray-500">{r.subtitle}</p>
            </div>
            <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] capitalize text-gray-500">{r.type}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
