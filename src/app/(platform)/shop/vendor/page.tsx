'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Store, Plus, Package, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { shopDb, SECTIONS, type Product, type Order } from '@/lib/shop/db';

export default function VendorDashboardPage() {
  const [vendor, setVendor] = useState<{ id: string; name: string; section: string } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  // create-store form
  const [storeName, setStoreName] = useState('');
  const [storeSection, setStoreSection] = useState('goods');
  // add-product form
  const [pTitle, setPTitle] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    const db = shopDb();
    const { data: userData } = await db.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) { setLoading(false); return; }
    const { data: v } = await db.from('shop_vendors').select('id, name, section').eq('owner_id', uid).maybeSingle();
    setVendor(v ?? null);
    if (v) {
      const [{ data: prods }, { data: ords }] = await Promise.all([
        db.from('shop_products').select('*').eq('vendor_id', v.id).order('created_at', { ascending: false }),
        db.from('shop_orders').select('*').eq('vendor_id', v.id).order('placed_at', { ascending: false }).limit(20),
      ]);
      setProducts(prods ?? []);
      setOrders(ords ?? []);
    }
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function createStore() {
    if (!storeName.trim()) return;
    setSaving(true);
    try {
      const db = shopDb();
      const { data: userData } = await db.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) { toast.error('Please sign in.'); return; }
      const slug = storeName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) + '-' + Math.random().toString(36).slice(2, 5);
      const { error } = await db.from('shop_vendors').insert({ owner_id: uid, slug, name: storeName.trim(), section: storeSection });
      if (error) throw error;
      toast.success('Store opened!');
      load();
    } catch { toast.error('Could not open store.'); }
    finally { setSaving(false); }
  }

  async function addProduct() {
    if (!vendor || !pTitle.trim()) return;
    setSaving(true);
    try {
      const db = shopDb();
      const { error } = await db.from('shop_products').insert({
        vendor_id: vendor.id, title: pTitle.trim(), price_mly: Number(pPrice) || 0, status: 'active',
      });
      if (error) throw error;
      setPTitle(''); setPPrice('');
      toast.success('Product listed!');
      load();
    } catch { toast.error('Could not list product.'); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/shop" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Shop
      </Link>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-harbor-800"><Store className="h-6 w-6 text-orange-600" /> Your Store</h1>

      {loading ? <div className="h-24 animate-pulse rounded-xl bg-gray-100" /> :
        !vendor ? (
          <div className="rounded-xl border border-gray-100 bg-white p-5 space-y-3">
            <h2 className="font-semibold text-harbor-800">Open a store</h2>
            <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Store name" />
            <div className="flex flex-wrap gap-2">
              {SECTIONS.map((s) => (
                <button key={s.key} onClick={() => setStoreSection(s.key)}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${storeSection === s.key ? 'border-teal-500 bg-teal-50 text-harbor-900' : 'border-gray-200 text-gray-600'}`}>{s.label}</button>
              ))}
            </div>
            <Button variant="harbor" onClick={createStore} disabled={saving} className="w-full">Open store</Button>
          </div>
        ) : (
        <>
          {/* Add product */}
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-harbor-800"><Plus className="h-4 w-4 text-teal-600" /> List a product</h2>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input value={pTitle} onChange={(e) => setPTitle(e.target.value)} placeholder="Product title" />
              <Input type="number" value={pPrice} onChange={(e) => setPPrice(e.target.value)} placeholder="$MLY" className="sm:max-w-[140px]" />
              <Button variant="default" onClick={addProduct} disabled={saving}>List</Button>
            </div>
          </div>

          {/* Products */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-harbor-800"><Package className="h-4 w-4 text-teal-600" /> Products ({products.length})</h2>
            <div className="space-y-2">
              {products.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3">
                  <span className="text-sm font-medium text-harbor-800">{p.title}</span>
                  <span className="text-sm font-bold text-teal-600">{p.price_mly} $MLY</span>
                </div>
              ))}
              {products.length === 0 && <p className="text-sm text-gray-500">No products yet.</p>}
            </div>
          </section>

          {/* Orders */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-harbor-800"><ClipboardList className="h-4 w-4 text-teal-600" /> Orders ({orders.length})</h2>
            <div className="space-y-2">
              {orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3">
                  <span className="text-xs text-gray-500">{new Date(o.placed_at).toLocaleDateString()} · {o.status}</span>
                  <span className="text-sm font-bold text-teal-600">{o.total_mly} $MLY</span>
                </div>
              ))}
              {orders.length === 0 && <p className="text-sm text-gray-500">No orders yet.</p>}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
