-- ============================================
-- Double Negative - 관리자 전용 보안 강화 SQL
-- ============================================
-- Supabase Dashboard > SQL Editor에서 실행하세요.
--
-- [기능]
-- 1. profiles에 is_admin 컬럼 추가 (관리자 여부)
-- 2. products: 관리자만 INSERT/UPDATE/DELETE
-- 3. orders: 관리자만 UPDATE (주문 상태/송장 수정)
--
-- [설정 방법] 관리자로 지정할 사용자의 profiles에 is_admin = true 설정:
--   UPDATE profiles SET is_admin = true WHERE id = '관리자-user-uuid';
--   (Supabase Dashboard > Table Editor > profiles에서 수동 설정 가능)
-- ============================================

-- 1. profiles에 is_admin 컬럼 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2. full_name 컬럼이 없으면 추가 (일부 프로젝트에서 사용)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
    ALTER TABLE profiles ADD COLUMN full_name TEXT;
  END IF;
END $$;

-- 3. 기존 products 쓰기 정책 삭제 후 관리자 전용으로 재생성
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

-- 4. orders: 기존 관리자용 정책 삭제 후 관리자 전용 UPDATE로 재생성
DROP POLICY IF EXISTS "Authenticated can read all orders" ON orders;
DROP POLICY IF EXISTS "Authenticated can update orders" ON orders;

-- 모든 사용자는 본인 주문만 조회 (기존 정책 유지)
-- UPDATE는 관리자만
CREATE POLICY "Admin only update orders"
  ON orders FOR UPDATE TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true)
  WITH CHECK ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

-- 5. 관리자용 주문 전체 조회 (관리 대시보드용)
CREATE POLICY "Admin can read all orders"
  ON orders FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id  -- 본인 주문
    OR (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true  -- 또는 관리자
  );
