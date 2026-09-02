'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, ShoppingBag, Plus, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { shopDb, type Product } from '@/lib/shop/db';
import { CommentsThread } from '@/components/social/comments-thread';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<(Product & { vendor?: { name: string } }) | null>(null);
  const [variant, setVariant] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const db = shopDb();
      const { data } = await db.from('shop_products').select('*, vendor:shop_vendors(name, slug)').eq('id', id).maybeSingle();
      setProduct(data ?? null);
      setLoading(false);
    })();
  }, [id]);

  async function addToCart() {
    const db = shopDb();
    const { data: userData } = await db.auth.getUser();
    if (!userData.user) { toast.error('Please sign in.'); return; }
    const { error } = await db.from('shop_cart_items').upsert(
      { user_id: userData.user.id, product_id: id, variant_id: variant, quantity: 1 },
      { onConflict: 'user_id,product_id,variant_id' }
    );
    if (error) { toast.error('Could not add.'); return; }
    toast.success('Added to cart.');
  }

  if (loading) return <div className="h-40 animate-pulse rounded-xl bg-gray-100" />;
  if (!product) return <p className="text-center text-sm text-gray-500">Product not found.</p>;

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/shop" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Shop
      </Link>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        <div className="flex aspect-video items-center justify-center bg-gray-50">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_url} alt="" className="h-full w-full object-cover" />
          ) : <ShoppingBag className="h-14 w-14 text-gray-300" />}
        </div>
        <div className="p-4">
          <h1 className="text-xl font-bold text-harbor-800">{product.title}</h1>
          {product.vendor?.name && <p className="text-sm text-gray-500">{product.vendor.name}</p>}
          <div className="mt-1 flex items-center gap-2">
            <span className="text-lg font-bold text-teal-600">{product.price_mly} $MLY</span>
            {product.rating > 0 && <span className="inline-flex items-center gap-0.5 text-sm text-gray-400"><Star className="h-3.5 w-3.5 fill-mly-400 text-mly-400" /> {product.rating.toFixed(1)} ({product.review_count})</span>}
          </div>
          {product.description && <p className="mt-2 text-sm text-gray-600">{product.description}</p>}

          {product.variants && product.variants.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button key={v.id} onClick={() => setVariant(v.id)}
                  className={`rounded-lg border px-3 py-1.5 text-sm ${variant === v.id ? 'border-teal-500 bg-teal-50 text-harbor-900' : 'border-gray-200 text-gray-600'}`}>
                  {v.label} · {v.price_mly} $MLY
                </button>
              ))}
            </div>
          )}

          <Button variant="harbor" size="lg" className="mt-4 w-full" onClick={addToCart}>
            <Plus className="mr-2 h-4 w-4" /> Add to cart
          </Button>
        </div>
      </div>

      <CommentsThread targetType="product" targetId={id} />
    </div>
  );
}
