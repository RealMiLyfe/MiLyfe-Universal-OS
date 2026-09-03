'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Users2, Plus, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trustDb } from '@/lib/trust/db';

interface Kin { id: string; relation: string; person_id: string; }

export default function HouseholdPage() {
  const [household, setHousehold] = useState<{ id: string; name: string } | null>(null);
  const [members, setMembers] = useState<Kin[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    const db = trustDb();
    const { data: userData } = await db.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) { setLoading(false); return; }
    const { data: kin } = await db.from('mi_kinship').select('household_id').eq('person_id', uid).maybeSingle();
    if (kin?.household_id) {
      const { data: hh } = await db.from('mi_households').select('id, name').eq('id', kin.household_id).maybeSingle();
      setHousehold(hh ?? null);
      if (hh) {
        const { data: mem } = await db.from('mi_kinship').select('*').eq('household_id', hh.id);
        setMembers(mem ?? []);
      }
    }
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function create() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const db = trustDb();
      const { data: userData } = await db.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) { toast.error('Please sign in.'); return; }
      const { data: hh, error } = await db.from('mi_households').insert({ name: name.trim(), created_by: uid }).select('id').single();
      if (error) throw error;
      await db.from('mi_kinship').insert({ household_id: hh.id, person_id: uid, relation: 'member' });
      toast.success('Household created.');
      load();
    } catch { toast.error('Could not create household.'); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/profile" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Profile
      </Link>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-harbor-800"><Users2 className="h-6 w-6 text-teal-600" /> Household &amp; Care</h1>
      <p className="text-gray-500">Guardians, care relationships, and shared jars — with youth assent and abuse-safe separation. No &ldquo;head of household&rdquo; superuser.</p>

      {loading ? <div className="h-24 animate-pulse rounded-xl bg-gray-100" /> :
        !household ? (
          <div className="rounded-xl border border-gray-100 bg-white p-5 space-y-3">
            <h2 className="font-semibold text-harbor-800">Create a household</h2>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Household name" />
            <Button variant="harbor" onClick={create} disabled={saving} className="w-full"><Plus className="mr-2 h-4 w-4" /> Create</Button>
          </div>
        ) : (
        <>
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <p className="font-bold text-harbor-800">{household.name}</p>
            <p className="text-xs text-gray-500">{members.length} member{members.length === 1 ? '' : 's'}</p>
          </div>
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3">
                <span className="text-sm capitalize text-harbor-800">{m.relation}</span>
                <Shield className="h-4 w-4 text-teal-600" aria-hidden="true" />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
