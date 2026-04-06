-- ============================================
-- RLS Hardening for Mamere (public schema)
-- ============================================
-- 목적:
-- 1) 회원은 본인 데이터만 조회/수정
-- 2) 관리자는 전체 주문/회원/반품 조회 및 주문 상태 업데이트 가능
-- 3) 게스트 주문/반품 플로우는 현재 프론트 로직을 깨지 않도록 최소 허용
--
-- 적용 방법:
-- - Supabase Dashboard > SQL Editor에서 본 파일 전체 실행
-- - 여러 번 실행해도 동작하도록 IF EXISTS / DROP POLICY 사용
-- ============================================

BEGIN;

-- --------------------------------------------
-- 관리자 판별 함수 (RLS 정책에서 재사용)
-- --------------------------------------------
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

-- --------------------------------------------
-- profiles
-- --------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid() OR public.current_user_is_admin());

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_own_or_admin"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid() OR public.current_user_is_admin())
WITH CHECK (id = auth.uid() OR public.current_user_is_admin());

-- --------------------------------------------
-- orders
-- --------------------------------------------
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_own_or_admin" ON public.orders;
CREATE POLICY "orders_select_own_or_admin"
ON public.orders
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.current_user_is_admin());

DROP POLICY IF EXISTS "orders_insert_member_own" ON public.orders;
CREATE POLICY "orders_insert_member_own"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
);

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

DROP POLICY IF EXISTS "orders_update_admin_only" ON public.orders;
CREATE POLICY "orders_update_admin_only"
ON public.orders
FOR UPDATE
TO authenticated
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

-- --------------------------------------------
-- return_requests
-- --------------------------------------------
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "return_requests_select_own_or_admin" ON public.return_requests;
CREATE POLICY "return_requests_select_own_or_admin"
ON public.return_requests
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.current_user_is_admin());

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

-- --------------------------------------------
-- user_consent_logs
-- --------------------------------------------
ALTER TABLE public.user_consent_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_consent_logs_select_own_or_admin" ON public.user_consent_logs;
CREATE POLICY "user_consent_logs_select_own_or_admin"
ON public.user_consent_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.current_user_is_admin());

DROP POLICY IF EXISTS "user_consent_logs_insert_own" ON public.user_consent_logs;
CREATE POLICY "user_consent_logs_insert_own"
ON public.user_consent_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- --------------------------------------------
-- inquiries (문의)
-- --------------------------------------------
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

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

COMMIT;

-- --------------------------------------------
-- 점검용 쿼리 (필요 시 실행)
-- --------------------------------------------
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND tablename IN ('profiles', 'orders', 'return_requests', 'user_consent_logs', 'inquiries')
-- ORDER BY tablename, policyname;
