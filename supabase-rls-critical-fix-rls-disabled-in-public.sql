-- ============================================
-- Critical: rls_disabled_in_public / Table publicly accessible
-- ============================================
-- PostgREST로 노출된 public 테이블에 RLS가 꺼져 있으면 anon 키로 데이터가
-- 읽기·쓰기·삭제될 수 있습니다. 본 스크립트는:
-- 1) public의 모든 일반·파티션 부모 테이블에 RLS를 켭니다.
-- 2) 하드닝 정책(profiles, orders, return_requests, user_consent_logs, inquiries)
-- 3) products(공개 조회 + 관리자만 쓰기)
-- 4) product_reviews / product_questions (없으면 생성 후 RLS·정책)
--
-- Supabase Dashboard > SQL Editor에서 전체 실행.
-- 여러 번 실행해도 되도록 DROP POLICY IF EXISTS 사용.
-- ============================================

-- ----- 선택 테이블이 없으면 생성 (하드닝 ALTER가 실패하지 않도록) -----
CREATE TABLE IF NOT EXISTS public.return_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('반품', '교환')),
  reason TEXT,
  detail TEXT,
  attachment_urls TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET,
  terms_agreed_at TIMESTAMPTZ NOT NULL,
  privacy_agreed_at TIMESTAMPTZ NOT NULL,
  marketing_agreed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  skin_type TEXT,
  content TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT,
  content TEXT NOT NULL,
  answer TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기존 DB에 컬럼만 없을 때 (정책이 참조함)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_guest BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS guest_email TEXT;

-- ----- 1) public 스키마 전 테이블 RLS 강제 활성화 -----
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.relname AS tablename
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind IN ('r', 'p')
      AND NOT c.relrowsecurity
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
    RAISE NOTICE 'RLS enabled: public.%', r.tablename;
  END LOOP;
END $$;

-- ----- 2) 관리자 판별 함수 -----
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid()),
    false
  );
$$;

REVOKE ALL ON FUNCTION public.current_user_is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO anon, authenticated;

-- ----- 3) profiles -----
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own or admin reads all profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid() OR public.current_user_is_admin());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_own_or_admin"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid() OR public.current_user_is_admin())
WITH CHECK (id = auth.uid() OR public.current_user_is_admin());

-- ----- 4) orders -----
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
DROP POLICY IF EXISTS "Admin can read all orders" ON public.orders;
DROP POLICY IF EXISTS "orders_select_own_or_admin" ON public.orders;
CREATE POLICY "orders_select_own_or_admin"
ON public.orders
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.current_user_is_admin());

DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_member_own" ON public.orders;
CREATE POLICY "orders_insert_member_own"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Guest can insert guest orders" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_guest" ON public.orders;
CREATE POLICY "orders_insert_guest"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  user_id IS NULL
  AND is_guest = true
  AND guest_email IS NOT NULL
);

DROP POLICY IF EXISTS "Admin only update orders" ON public.orders;
DROP POLICY IF EXISTS "orders_update_admin_only" ON public.orders;
CREATE POLICY "orders_update_admin_only"
ON public.orders
FOR UPDATE
TO authenticated
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

-- ----- 5) return_requests -----
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own return_requests" ON public.return_requests;
DROP POLICY IF EXISTS "Admins can read all return_requests" ON public.return_requests;
DROP POLICY IF EXISTS "return_requests_select_own_or_admin" ON public.return_requests;
CREATE POLICY "return_requests_select_own_or_admin"
ON public.return_requests
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.current_user_is_admin());

DROP POLICY IF EXISTS "Authenticated can insert return_requests" ON public.return_requests;
DROP POLICY IF EXISTS "Anon can insert return_requests with null user_id" ON public.return_requests;
DROP POLICY IF EXISTS "return_requests_insert_own_or_guest" ON public.return_requests;
CREATE POLICY "return_requests_insert_own_or_guest"
ON public.return_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (user_id = auth.uid())
  OR (user_id IS NULL)
);

DROP POLICY IF EXISTS "return_requests_update_admin_only" ON public.return_requests;
CREATE POLICY "return_requests_update_admin_only"
ON public.return_requests
FOR UPDATE
TO authenticated
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

-- ----- 6) user_consent_logs -----
ALTER TABLE public.user_consent_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own consent logs" ON public.user_consent_logs;
DROP POLICY IF EXISTS "Admin can read all consent logs" ON public.user_consent_logs;
DROP POLICY IF EXISTS "user_consent_logs_select_own_or_admin" ON public.user_consent_logs;
CREATE POLICY "user_consent_logs_select_own_or_admin"
ON public.user_consent_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.current_user_is_admin());

DROP POLICY IF EXISTS "Users can insert own consent logs" ON public.user_consent_logs;
DROP POLICY IF EXISTS "user_consent_logs_insert_own" ON public.user_consent_logs;
CREATE POLICY "user_consent_logs_insert_own"
ON public.user_consent_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- ----- 7) inquiries -----
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert inquiry" ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_insert_any" ON public.inquiries;
CREATE POLICY "inquiries_insert_any"
ON public.inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "inquiries_select_own_or_admin" ON public.inquiries;
CREATE POLICY "inquiries_select_own_or_admin"
ON public.inquiries
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.current_user_is_admin());

-- ----- 8) products (카탈로그 공개 읽기 + 관리자만 쓰기) -----
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read products" ON public.products;
CREATE POLICY "Anyone can read products"
ON public.products
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.products;
DROP POLICY IF EXISTS "Admin only insert products" ON public.products;
DROP POLICY IF EXISTS "Admin only update products" ON public.products;
DROP POLICY IF EXISTS "Admin only delete products" ON public.products;

CREATE POLICY "Admin only insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (public.current_user_is_admin());

CREATE POLICY "Admin only update products"
ON public.products
FOR UPDATE
TO authenticated
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

CREATE POLICY "Admin only delete products"
ON public.products
FOR DELETE
TO authenticated
USING (public.current_user_is_admin());

-- ----- 9) product_reviews -----
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read product_reviews" ON public.product_reviews;
CREATE POLICY "Anyone can read product_reviews"
ON public.product_reviews FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated can insert product_reviews" ON public.product_reviews;
CREATE POLICY "Authenticated can insert product_reviews"
ON public.product_reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated can update own product_reviews" ON public.product_reviews;
CREATE POLICY "Authenticated can update own product_reviews"
ON public.product_reviews FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated can delete own product_reviews" ON public.product_reviews;
CREATE POLICY "Authenticated can delete own product_reviews"
ON public.product_reviews FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR user_id IS NULL);

-- ----- 10) product_questions -----
ALTER TABLE public.product_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read product_questions" ON public.product_questions;
CREATE POLICY "Anyone can read product_questions"
ON public.product_questions FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated can insert product_questions" ON public.product_questions;
CREATE POLICY "Authenticated can insert product_questions"
ON public.product_questions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ----- 점검: 아래가 0행이면 public 일반 테이블에 RLS 미적용이 없음 -----
-- SELECT c.relname
-- FROM pg_class c
-- JOIN pg_namespace n ON n.oid = c.relnamespace
-- WHERE n.nspname = 'public'
--   AND c.relkind IN ('r', 'p')
--   AND NOT c.relrowsecurity;
