'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Bell, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { justiceBrowserDb } from '@/lib/justice/db';
import type { JusticeRapidContact } from '@/lib/justice/types';

export default function RapidContactsPage() {
  const [contacts, setContacts] = useState<JusticeRapidContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    const db = justiceBrowserDb();
    const { data } = await db.from('justice_rapid_contacts').select('*').order('sort_order', { ascending: true });
    setContacts(data ?? []);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function add() {
    if (!name.trim()) { toast.error('Add a name.'); return; }
    setSaving(true);
    try {
      const db = justiceBrowserDb();
      const { data: userData } = await db.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) { toast.error('Please sign in.'); return; }
      const { error } = await db.from('justice_rapid_contacts').insert({
        user_id: uid, name: name.trim(), phone: phone.trim() || null,
        relationship: relationship.trim() || null, sort_order: contacts.length,
      });
      if (error) throw error;
      setName(''); setPhone(''); setRelationship('');
      toast.success('Contact added.');
      load();
    } catch {
      toast.error('Could not add contact.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    const db = justiceBrowserDb();
    const { error } = await db.from('justice_rapid_contacts').delete().eq('id', id);
    if (error) { toast.error('Could not remove.'); return; }
    setContacts((c) => c.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-6">
      <Link href="/justice/app/home" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> MiJustice
      </Link>

      <div>
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-harbor-800" />
          <h1 className="page-title">Rapid-Response Contacts</h1>
        </div>
        <p className="page-subtitle">Who gets alerted when you use Encounter Mode.</p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-teal-600" />
          <h2 className="font-bold text-harbor-800">Add a contact</h2>
        </div>
        <div className="space-y-2">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input placeholder="Relationship (optional)" value={relationship} onChange={(e) => setRelationship(e.target.value)} />
          <Button variant="default" onClick={add} disabled={saving} className="w-full">
            <Plus className="mr-2 h-4 w-4" /> {saving ? 'Adding...' : 'Add contact'}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="h-16 animate-pulse rounded-xl bg-gray-100" />
        ) : contacts.length === 0 ? (
          <p className="text-center text-sm text-gray-500">No contacts yet. Add someone you trust.</p>
        ) : contacts.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div>
              <p className="font-bold text-harbor-800">{c.name}</p>
              <p className="text-sm text-gray-500">
                {c.phone || 'no phone'}{c.relationship ? ` \u00b7 ${c.relationship}` : ''}
              </p>
            </div>
            <button onClick={() => remove(c.id)} aria-label={`Remove ${c.name}`}
              className="flex h-11 w-11 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500">
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400">
        Alerts send a prewritten message with your location to these contacts.
        Add at least one to enable the alert button in Encounter Mode.
      </p>
    </div>
  );
}
