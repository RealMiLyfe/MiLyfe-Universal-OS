'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, ShoppingCart, Trash2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { shopDb, type CartItem } from '@/lib/shop/db';

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  async function load() {
    const db = shopDb();
    const { data } = await db.from('shop_cart_items')
      .select('*, product:shop_products(id, title, price_mly, vendor_id, image_url)')
      .order('added_at', { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  const total = items.reduce((s, i) => s + (i.product?.price_mly ?? 0) * i.quantity, 0);

  async function remove(id: string) {
    const db = shopDb();
    await db.from('shop_cart_items').delete().eq('id', id);
    setItems((it) => it.filter((x) => x.id !== id));
  }

  async function checkout() {
    if (items.length === 0) return;
    setPlacing(true);
    try {
      const db = shopDb();
      const { data: userData } = await db.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) { toast.error('Please sign in.'); return; }
      // Create the order (settled in $MLY internally — a wallet debit hook can
      // be attached server-side; no external processor).
      const vendorId = items[0]?.product?.vendor_id ?? null;
      const { data: order, error } = await db.from('shop_orders')
        .insert({ buyer_id: uid, vendor_id: vendorId, total_mly: total, status: 'placed' })
        .select('id').single();
      if (error) throw error;
      const rows = items.map((i) => ({
        order_id: order.id, product_id: i.product?.id, title: i.product?.title ?? 'Item',
        quantity: i.quantity, price_mly: i.product?.price_mly ?? 0,
      }));
      await db.from('shop_order_items').insert(rows);
      await db.from('shop_cart_items').delete().eq('user_id', uid);
      setItems([]);
      toast.success('Order placed! Paid in $MLY.');
    } catch {
      toast.error('Could not place order.');
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/shop" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Shop
      </Link>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-harbor-800"><ShoppingCart className="h-6 w-6 text-orange-600" /> Cart</h1>

      {loading ? <div className="h-24 animate-pulse rounded-xl bg-gray-100" /> :
        items.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-10 text-center">
            <ShoppingCart className="mx-auto mb-2 h-8 w-8 text-gray-300" aria-hidden="true" />
            <p className="text-sm text-gray-500">Your cart is empty. <Link href="/shop" className="text-teal-600 hover:underline">Browse the shop.</Link></p>
          </div>
        ) : (
        <>
          <div className="space-y-2">
            {items.map((i) => (
              <div key={i.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                  {i.product?.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={i.product.image_url} alt="" className="h-full w-full rounded-lg object-cover" />
                  ) : <ShoppingCart className="h-5 w-5 text-gray-300" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-harbor-800">{i.product?.title}</p>
                  <p className="text-xs text-gray-500">Qty {i.quantity} · {i.product?.price_mly} $MLY</p>
                </div>
                <span className="text-sm font-bold text-teal-600">{(i.product?.price_mly ?? 0) * i.quantity}</span>
                <button onClick={() => remove(i.id)} aria-label="Remove" className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-semibold text-harbor-800">Total</span>
              <span className="text-xl font-bold text-teal-600">{total} $MLY</span>
            </div>
            <Button variant="harbor" size="lg" className="w-full" onClick={checkout} disabled={placing}>
              <Wallet className="mr-2 h-5 w-5" /> {placing ? 'Placing…' : 'Pay with $MLY'}
            </Button>
            <p className="mt-2 text-center text-xs text-gray-400">Settled from your $MLY wallet. No cards, no processors, ever.</p>
          </div>
        </>
      )}
    </div>
  );
}
