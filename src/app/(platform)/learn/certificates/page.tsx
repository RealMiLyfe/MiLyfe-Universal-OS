'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Award, ShieldCheck } from 'lucide-react';
import { socialDb } from '@/lib/social/db';

interface Cert { id: string; title: string; validation_code: string; issued_at: string; }

export default function CertificatesPage() {
  const [certs, setCerts] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const db = socialDb();
      const { data } = await db.from('learn_certificates').select('*').order('issued_at', { ascending: false });
      setCerts(data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/learn" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Learn
      </Link>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-harbor-800"><Award className="h-6 w-6 text-mly-600" /> Certificates</h1>

      {loading ? <div className="h-24 animate-pulse rounded-xl bg-gray-100" /> :
        certs.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-10 text-center">
            <Award className="mx-auto mb-2 h-8 w-8 text-gray-300" aria-hidden="true" />
            <p className="text-sm text-gray-500">Complete a learning path to earn your first certificate.</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {certs.map((c) => (
            <div key={c.id} className="rounded-xl border-2 border-mly-200 bg-gradient-to-br from-mly-50/80 to-white p-5">
              <Award className="mb-2 h-8 w-8 text-mly-600" aria-hidden="true" />
              <p className="font-bold text-harbor-800">{c.title}</p>
              <p className="text-xs text-gray-500">Issued {new Date(c.issued_at).toLocaleDateString()}</p>
              <p className="mt-2 inline-flex items-center gap-1 rounded bg-white px-2 py-1 font-mono text-xs text-harbor-700">
                <ShieldCheck className="h-3 w-3 text-teal-600" /> {c.validation_code}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
