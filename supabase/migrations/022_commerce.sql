-- ============================================================================
-- MiLyfe Phase 5 — Commerce & Services Depth
-- Migration 022
--
-- Catalog + variants, cart, orders, vendor dashboard, delivery tracking,
-- service verticals. $MLY ONLY. No processors. No ads. No sponsored listings.
-- ============================================================================

-- Vendors (a member's store)
CREATE TABLE public.shop_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  section TEXT NOT NULL DEFAULT 'goods'
    CHECK (section IN ('goods','food','grocery','pharmacy','flowers','digital','service','rental','parcel')),
  self_delivery BOOLEAN NOT NULL DEFAULT FALSE,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  rating NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_shop_vendors_owner ON public.shop_vendors(owner_id);

-- Products (with variants/attributes)
CREATE TABLE public.shop_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.shop_vendors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  image_url TEXT,
  price_mly NUMERIC NOT NULL DEFAULT 0,   -- base price in $MLY
  is_digital BOOLEAN NOT NULL DEFAULT FALSE,
  attributes JSONB NOT NULL DEFAULT '[]'::jsonb,  -- [{name:'Size', values:['S','M','L']}]
  variants JSONB NOT NULL DEFAULT '[]'::jsonb,    -- [{id, label, price_mly, stock}]
  stock INTEGER,                          -- null = unlimited/digital
  rating NUMERIC NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','out_of_stock','hidden')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_shop_products_vendor ON public.shop_products(vendor_id);
CREATE INDEX idx_shop_products_cat ON public.shop_products(category, status);

-- Product reviews
CREATE TABLE public.shop_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.shop_products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- Cart (persistent, per user)
CREATE TABLE public.shop_cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.shop_products(id) ON DELETE CASCADE,
  variant_id TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id, variant_id)
);

-- Saved delivery addresses
CREATE TABLE public.shop_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label TEXT,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT,
  region TEXT,
  postal TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders (settled in $MLY via the internal wallet — no processor)
CREATE TABLE public.shop_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.shop_vendors(id) ON DELETE SET NULL,
  total_mly NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'placed'
    CHECK (status IN ('placed','accepted','preparing','ready','out_for_delivery','delivered','completed','cancelled','refunded')),
  address_id UUID REFERENCES public.shop_addresses(id) ON DELETE SET NULL,
  scheduled_for TIMESTAMPTZ,
  placed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_shop_orders_buyer ON public.shop_orders(buyer_id, placed_at DESC);
CREATE INDEX idx_shop_orders_vendor ON public.shop_orders(vendor_id, status);

CREATE TABLE public.shop_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.shop_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.shop_products(id) ON DELETE SET NULL,
  title TEXT NOT NULL,                    -- snapshot
  variant_label TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_mly NUMERIC NOT NULL DEFAULT 0
);

-- Deliveries (courier flow + tracking)
CREATE TABLE public.shop_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.shop_orders(id) ON DELETE CASCADE,
  courier_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','assigned','picked_up','en_route','delivered','failed')),
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  eta_minutes INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Service bookings (on-demand services / rides / rentals)
CREATE TABLE public.service_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.shop_vendors(id) ON DELETE SET NULL,
  service_type TEXT NOT NULL,             -- 'service','ride','rental','parcel'
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  price_mly NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested','accepted','in_progress','completed','cancelled')),
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_service_bookings_customer ON public.service_bookings(customer_id);

-- ============================================================================
-- RLS
-- ============================================================================
ALTER TABLE public.shop_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;

-- Vendors + products + reviews: public read; owner writes.
CREATE POLICY "shop_vendors_read" ON public.shop_vendors FOR SELECT USING (TRUE);
CREATE POLICY "shop_vendors_write" ON public.shop_vendors
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "shop_products_read" ON public.shop_products FOR SELECT USING (TRUE);
CREATE POLICY "shop_products_write" ON public.shop_products
  FOR ALL USING (EXISTS (SELECT 1 FROM public.shop_vendors v WHERE v.id = vendor_id AND v.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.shop_vendors v WHERE v.id = vendor_id AND v.owner_id = auth.uid()));
CREATE POLICY "shop_reviews_read" ON public.shop_reviews FOR SELECT USING (TRUE);
CREATE POLICY "shop_reviews_write" ON public.shop_reviews
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Cart + addresses: owner only.
CREATE POLICY "shop_cart_own" ON public.shop_cart_items
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "shop_addresses_own" ON public.shop_addresses
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Orders: buyer + the vendor owner can read; buyer creates.
CREATE POLICY "shop_orders_buyer" ON public.shop_orders
  FOR ALL USING (auth.uid() = buyer_id) WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "shop_orders_vendor_read" ON public.shop_orders
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.shop_vendors v WHERE v.id = vendor_id AND v.owner_id = auth.uid()));
CREATE POLICY "shop_order_items_read" ON public.shop_order_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.shop_orders o WHERE o.id = order_id AND (o.buyer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.shop_vendors v WHERE v.id = o.vendor_id AND v.owner_id = auth.uid()))));
CREATE POLICY "shop_order_items_insert" ON public.shop_order_items
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.shop_orders o WHERE o.id = order_id AND o.buyer_id = auth.uid()));

-- Deliveries: buyer + vendor + courier can read.
CREATE POLICY "shop_deliveries_read" ON public.shop_deliveries
  FOR SELECT USING (
    auth.uid() = courier_id OR
    EXISTS (SELECT 1 FROM public.shop_orders o WHERE o.id = order_id AND (o.buyer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.shop_vendors v WHERE v.id = o.vendor_id AND v.owner_id = auth.uid())))
  );

-- Service bookings: customer + vendor owner.
CREATE POLICY "service_bookings_customer" ON public.service_bookings
  FOR ALL USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "service_bookings_vendor_read" ON public.service_bookings
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.shop_vendors v WHERE v.id = vendor_id AND v.owner_id = auth.uid()));
