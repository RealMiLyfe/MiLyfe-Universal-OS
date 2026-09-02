'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ShoppingBag, ShoppingCart, Plus, Star, Store } from 'lucide-react';
import { shopDb, SECTIONS, type Product } from '@/lib/shop/db';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [section, setSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    (async () => {
      const db = shopDb();
      const { data } = await db.from('shop_products')
        .select('*, vendor:shop_vendors(name, slug, section)')
        .eq('status', 'active').order('created_at', { ascending: false }).limit(60);
      setProducts(data ?? []);
      const { data: userData } = await db.auth.getUser();
      if (userData.user) {
        const { count } = await db.from('shop_cart_items').select('id', { count: 'exact', head: true }).eq('user_id', userData.user.id);
        setCartCount(count ?? 0);
      }
      setLoading(false);
    })();
  }, []);

  const shown = section
    ? products.filter((p) => (p as Product & { vendor?: { section?: string } }).vendor?.section === section)
    : products;

  async function addToCart(p: Product) {
    const db = shopDb();
    const { data: userData } = await db.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) { toast.error('Please sign in.'); return; }
    const { error } = await db.from('shop_cart_items').upsert(
      { user_id: uid, product_id: p.id, variant_id: null, quantity: 1 },
      { onConflict: 'user_id,product_id,variant_id' }
    );
    if (error) { toast.error('Could not add to cart.'); return; }
    setCartCount((c) => c + 1);
    toast.success('Added to cart.');
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-harbor-800"><ShoppingBag className="h-6 w-6 text-orange-600" /> Shop</h1>
          <p className="text-gray-500">Everything in $MLY. No processors, no ads — community commerce.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/shop/vendor" className="hidden text-sm text-teal-600 hover:underline sm:inline">Sell</Link>
          <Link href="/shop/cart" className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50">
            <ShoppingCart className="h-5 w-5 text-harbor-700" />
            {cartCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-teal-500 px-1 text-[10px] font-bold text-white">{cartCount}</span>}
          </Link>
        </div>
      </div>

      {/* Sections */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button onClick={() => setSection(null)} className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap ${!section ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'}`}>All</button>
        {SECTIONS.map((s) => (
          <button key={s.key} onClick={() => setSection(section === s.key ? null : s.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap ${section === s.key ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{s.label}</button>
        ))}
      </div>

      {loading ? <div className="h-32 animate-pulse rounded-xl bg-gray-100" /> :
        shown.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-10 text-center">
            <Store className="mx-auto mb-2 h-8 w-8 text-gray-300" aria-hidden="true" />
            <p className="text-sm text-gray-500">No products yet. <Link href="/shop/vendor" className="text-teal-600 hover:underline">Open a store</Link> and list the first.</p>
          </div>
        ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-500/10">
              <Link href={`/shop/product/${p.id}`} className="block">
                <div className="flex aspect-square items-center justify-center bg-gray-50">
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                  ) : <ShoppingBag className="h-10 w-10 text-gray-300" aria-hidden="true" />}
                </div>
              </Link>
              <div className="p-2.5">
                <Link href={`/shop/product/${p.id}`}>
                  <p className="truncate text-sm font-medium text-harbor-800">{p.title}</p>
                  <p className="truncate text-xs text-gray-500">{p.vendor?.name ?? 'Vendor'}</p>
                </Link>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-sm font-bold text-teal-600">{p.price_mly} $MLY</span>
                  {p.rating > 0 && <span className="inline-flex items-center gap-0.5 text-xs text-gray-400"><Star className="h-3 w-3 fill-mly-400 text-mly-400" /> {p.rating.toFixed(1)}</span>}
                </div>
                <button onClick={() => addToCart(p)} className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-harbor-800 py-1.5 text-xs font-medium text-white hover:bg-harbor-900">
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
