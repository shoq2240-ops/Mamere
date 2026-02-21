-- ============================================
-- Double Negative - 전체 스키마 (신규 프로젝트용)
-- ============================================
-- 새 Supabase 프로젝트에서 테이블이 없을 때
-- Dashboard > SQL Editor에 붙여넣고 한 번만 실행하세요.
-- (이미 테이블이 있으면 IF NOT EXISTS / DROP IF EXISTS 로 일부만 적용됩니다)
-- ============================================

-- ---------- 1. products ----------
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  image TEXT NOT NULL,
  category TEXT,
  description TEXT,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read products"
  ON products FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE TO authenticated USING (true);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 샘플 데이터 (테이블이 비어 있을 때만 삽입)
INSERT INTO products (name, price, image, category, description)
SELECT * FROM (VALUES
  ('DECONSTRUCTED BLAZER'::TEXT, 890000, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800'::TEXT, 'men'::TEXT, '해체주의 철학이 담긴 비대칭 블레이저'::TEXT),
  ('ASYMMETRIC KNIT VEST', 420000, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800', 'women', '불규칙한 니트 패턴의 베스트'),
  ('RAW EDGE CARGO PANTS', 550000, 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=800', 'men', '로우 엣지 마감의 카고 팬츠'),
  ('VOID OVERSIZED HOODIE', 380000, 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800', 'women', '오버사이즈 실루엣의 후디'),
  ('MINIMALIST TRENCH COAT', 1200000, 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=800', 'women', '미니멀한 디자인의 트렌치 코트'),
  ('DRAPED SHIRT', 320000, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800', 'men', '드레이프 디테일 셔츠')
) AS v(name, price, image, category, description)
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

-- ---------- 2. profiles ----------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  address TEXT,
  phone TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- ---------- 3. auth 트리거: 가입 시 프로필 자동 생성 ----------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email, '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------- 4. orders ----------
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shipping_name TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  total_amount INTEGER NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ---------- 5. inquiries ----------
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert inquiry"
  ON inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ---------- 6. products 이미지 확장 ----------
ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]';
COMMENT ON COLUMN products.images IS '이미지 목록: [{ "url": "...", "priority": 0, "isMain": true }, ...]';

-- ---------- 7. 재고 관리 ----------
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_manual_soldout BOOLEAN DEFAULT false;

-- ---------- 8. admin-setup (subcategory) ----------
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory TEXT;
COMMENT ON COLUMN products.subcategory IS 'outerwear | top | bottom';

-- ---------- 9. admin-orders (tracking 등) ----------
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_price INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address TEXT;

-- ---------- 10. 게스트 주문 ----------
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_guest BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number) WHERE order_number IS NOT NULL;

CREATE POLICY "Guest can insert guest orders"
  ON orders FOR INSERT TO anon
  WITH CHECK (user_id IS NULL AND is_guest = true);

-- ---------- 11. security-admin (is_admin, 정책 교체) ----------
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
    ALTER TABLE profiles ADD COLUMN full_name TEXT;
  END IF;
END $$;

DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;

CREATE POLICY "Admin only insert products"
  ON products FOR INSERT TO authenticated
  WITH CHECK ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

CREATE POLICY "Admin only update products"
  ON products FOR UPDATE TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true)
  WITH CHECK ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

CREATE POLICY "Admin only delete products"
  ON products FOR DELETE TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

DROP POLICY IF EXISTS "Authenticated can read all orders" ON orders;
DROP POLICY IF EXISTS "Authenticated can update orders" ON orders;

CREATE POLICY "Admin only update orders"
  ON orders FOR UPDATE TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true)
  WITH CHECK ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

CREATE POLICY "Admin can read all orders"
  ON orders FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );

-- ---------- 12. privacy-columns (profiles 확장 + 정책) ----------
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS privacy_policy_agreed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS agreed_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_withdrawn BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS terms_agreed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS terms_agreed_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marketing_agreed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marketing_agreed_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS withdrawn_at TIMESTAMPTZ;

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can read all profiles" ON profiles;
CREATE POLICY "Users can read own or admin reads all profiles"
  ON profiles FOR SELECT TO authenticated
  USING (
    auth.uid() = id
    OR (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );

-- ---------- 13. 동의 로그 및 RPC ----------
CREATE TABLE IF NOT EXISTS user_consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET,
  terms_agreed_at TIMESTAMPTZ NOT NULL,
  privacy_agreed_at TIMESTAMPTZ NOT NULL,
  marketing_agreed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_consent_logs_user_id ON user_consent_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consent_logs_created_at ON user_consent_logs(created_at DESC);

ALTER TABLE user_consent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own consent logs"
  ON user_consent_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consent logs"
  ON user_consent_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can read all consent logs"
  ON user_consent_logs FOR SELECT TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

CREATE OR REPLACE FUNCTION log_user_consent(
  p_user_id UUID,
  p_ip_address TEXT DEFAULT NULL,
  p_terms_agreed_at TIMESTAMPTZ DEFAULT NOW(),
  p_privacy_agreed_at TIMESTAMPTZ DEFAULT NOW(),
  p_marketing_agreed BOOLEAN DEFAULT false
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_ip INET;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  v_ip := NULL;
  IF p_ip_address IS NOT NULL AND p_ip_address <> '' THEN
    BEGIN
      v_ip := p_ip_address::INET;
    EXCEPTION WHEN OTHERS THEN
      v_ip := NULL;
    END;
  END IF;
  INSERT INTO user_consent_logs (user_id, ip_address, terms_agreed_at, privacy_agreed_at, marketing_agreed)
  VALUES (p_user_id, v_ip, p_terms_agreed_at, p_privacy_agreed_at, p_marketing_agreed)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION withdraw_user()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET is_withdrawn = true, withdrawn_at = NOW()
  WHERE id = auth.uid() AND (is_withdrawn IS NULL OR is_withdrawn = false);
END;
$$;

-- ---------- 14. 게스트 주문/재고 RPC ----------
CREATE OR REPLACE FUNCTION deduct_stock(p_product_id BIGINT, p_quantity INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quantity INTEGER := GREATEST(0, COALESCE(p_quantity, 0));
  v_current  INTEGER;
BEGIN
  SELECT COALESCE(stock_quantity, 0) INTO v_current
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;

  IF NOT FOUND OR v_current IS NULL THEN
    RAISE EXCEPTION 'INSUFFICIENT_STOCK' USING errcode = 'P0001';
  END IF;
  IF v_current < v_quantity THEN
    RAISE EXCEPTION 'INSUFFICIENT_STOCK'
      USING errcode = 'P0001',
            message = format('재고 부족 (상품 id: %s, 필요: %s, 현재: %s)', p_product_id, v_quantity, v_current);
  END IF;

  UPDATE products
  SET stock_quantity = v_current - v_quantity
  WHERE id = p_product_id;
END;
$$;

GRANT EXECUTE ON FUNCTION deduct_stock(BIGINT, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION deduct_stock(BIGINT, INTEGER) TO authenticated;

CREATE OR REPLACE FUNCTION get_guest_order(p_guest_email TEXT, p_order_number TEXT)
RETURNS SETOF orders
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT *
  FROM orders
  WHERE is_guest = true
    AND guest_email IS NOT NULL
    AND order_number IS NOT NULL
    AND lower(trim(guest_email)) = lower(trim(p_guest_email))
    AND order_number = trim(p_order_number)
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION get_guest_order(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_guest_order(TEXT, TEXT) TO authenticated;

-- ---------- 15. 주문 택배 ----------
ALTER TABLE orders ADD COLUMN IF NOT EXISTS carrier_id TEXT;
COMMENT ON COLUMN orders.carrier_id IS '택배사 코드 (예: 04=CJ대한통운, 05=한진택배)';

-- ---------- 16. inquiries user_id ----------
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 완료. Realtime: Database > Replication > products, orders 에서 ON 설정 권장.
