-- ============================================
-- orders: INSERT + WITH CHECK(true) 제거 (Supabase 린터 / 보안)
-- ============================================
-- "Enable insert for authenticated users only" 등 UI 템플릿은 WITH CHECK(true)로
-- 인증된 사용자가 임의 행을 넣을 수 있어 RLS를 무력화합니다.
-- 본 스크립트는 해당 정책을 제거한 뒤, 회원·게스트 INSERT만 재정의합니다.
-- (current_user_is_admin() 없으면 supabase-rls-hardening.sql 선행 실행 권장)
-- ============================================

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for anon users only" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.orders;

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'orders'
      AND cmd = 'INSERT'
      AND replace(replace(lower(trim(coalesce(with_check::text, ''))), '(', ''), ')', '') = 'true'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.orders', r.policyname);
    RAISE NOTICE 'Dropped permissive INSERT policy: %', r.policyname;
  END LOOP;
END $$;

-- 안전한 INSERT 정책 (hardening / critical-fix 와 동일 의미)
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
