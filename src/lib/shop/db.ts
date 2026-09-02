/** Commerce Supabase access (browser, loose-typed). $MLY only. */
import { createClient } from '@/lib/supabase/client';

type LooseClient = { from: (t: string) => any; auth: { getUser: () => Promise<{ data: { user: { id: string } | null } }> } };

export function shopDb(): LooseClient {
  return createClient() as unknown as LooseClient;
}

export interface Product {
  id: string; vendor_id: string; title: string; description: string | null;
  category: string | null; image_url: string | null; price_mly: number;
  is_digital: boolean; attributes: { name: string; values: string[] }[];
  variants: { id: string; label: string; price_mly: number; stock: number }[];
  stock: number | null; rating: number; review_count: number; status: string;
  vendor?: { name: string; slug: string };
}
export interface CartItem {
  id: string; product_id: string; variant_id: string | null; quantity: number;
  product?: Product;
}
export interface Order {
  id: string; total_mly: number; status: string; placed_at: string; vendor_id: string | null;
}

export const SECTIONS = [
  { key: 'goods', label: 'Goods' },
  { key: 'food', label: 'Food' },
  { key: 'grocery', label: 'Grocery' },
  { key: 'pharmacy', label: 'Pharmacy' },
  { key: 'flowers', label: 'Flowers' },
  { key: 'digital', label: 'Digital' },
  { key: 'service', label: 'Services' },
  { key: 'rental', label: 'Rentals' },
  { key: 'parcel', label: 'Parcel' },
];
