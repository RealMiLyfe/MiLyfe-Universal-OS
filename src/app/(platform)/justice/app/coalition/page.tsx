'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Handshake, ExternalLink, BadgeCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LegalDisclaimer } from '@/components/justice/legal-disclaimer';
import { justiceBrowserDb } from '@/lib/justice/db';
import type { JusticePartner } from '@/lib/justice/types';

const TYPE_LABEL: Record<string, string> = {
  legal: 'Legal', reentry: 'Reentry', immigrant: 'Immigrant Defense',
  media: 'Media', tech: 'Technology', tribal: 'Tribal', disability: 'Disability',
};

export default function CoalitionPage() {
  const [partners, setPartners] = useState<JusticePartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const db = justiceBrowserDb();
      const { data } = await db.from('justice_partners').select('*').order('name', { ascending: true });
      setPartners(data ?? []);
      setLoading(false);
    })();
  }, []);

  const byType = partners.reduce<Record<string, JusticePartner[]>>((acc, p) => {
    (acc[p.type] ??= []).push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/justice/app/home" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> MiJustice
      </Link>

      <div>
        <div className="flex items-center gap-2">
          <Handshake className="h-6 w-6 text-harbor-800" />
          <h1 className="text-2xl font-bold text-harbor-800">Coalition Engine</h1>
        </div>
        <p className="text-gray-500">United we are unstoppable. One hub, many allies.</p>
      </div>

      <LegalDisclaimer />

      {loading ? (
        <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
      ) : partners.length === 0 ? (
        <p className="text-center text-sm text-gray-500">Partners are being onboarded.</p>
      ) : (
        Object.entries(byType).map(([type, list]) => (
          <section key={type}>
            <h2 className="mb-3 font-semibold text-harbor-800">{TYPE_LABEL[type] ?? type}</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {list.map((p) => (
                <div key={p.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="mb-1 flex items-center gap-2">
                    <p className="font-bold text-harbor-800">{p.name}</p>
                    {p.verified && <BadgeCheck className="h-4 w-4 text-teal-600" aria-label="Verified" />}
                  </div>
                  {p.coverage_area && <Badge variant="secondary" className="text-[10px]">{p.coverage_area}</Badge>}
                  {p.services && <p className="mt-2 text-sm text-gray-600">{p.services}</p>}
                  {p.website && (
                    <a href={p.website} target="_blank" rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
                      Visit <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))
      )}

      <p className="text-xs text-gray-400">
        Partners are listed with consent. Verification against The Florida Bar and
        organizational confirmation happens before routing anyone to them.
      </p>
    </div>
  );
}
