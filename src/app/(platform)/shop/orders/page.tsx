'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Package, Truck, CheckCircle2 } from 'lucide-react';
import { shopDb, type Order } from '@/lib/shop/db';

const STATUS_STEPS = ['placed', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'completed'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const db = shopDb();
      const { data } = await db.from('shop_orders').select('*').order('placed_at', { ascending: false }).limit(30);
      setOrders(data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/shop" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Shop
      </Link>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-harbor-800"><Package className="h-6 w-6 text-orange-600" /> Your Orders</h1>

      {loading ? <div className="h-24 animate-pulse rounded-xl bg-gray-100" /> :
        orders.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-10 text-center">
            <Package className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">No orders yet. <Link href="/shop" className="text-teal-600 hover:underline">Browse the shop.</Link></p>
          </div>
        ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const stepIdx = STATUS_STEPS.indexOf(o.status);
            const delivered = o.status === 'delivered' || o.status === 'completed';
            return (
              <div key={o.id} className="rounded-xl border border-gray-100 bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">{new Date(o.placed_at).toLocaleDateString()}</span>
                  <span className="text-sm font-bold text-teal-600">{o.total_mly} $MLY</span>
                </div>
                {/* Delivery progress */}
                <div className="flex items-center gap-1">
                  {STATUS_STEPS.slice(0, 6).map((s, i) => (
                    <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= stepIdx ? 'bg-teal-500' : 'bg-gray-100'}`} />
                  ))}
                </div>
                <p className="mt-2 inline-flex items-center gap-1 text-xs text-gray-600">
                  {delivered ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> : <Truck className="h-3.5 w-3.5 text-teal-600" />}
                  <span className="capitalize">{o.status.replace(/_/g, ' ')}</span>
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
