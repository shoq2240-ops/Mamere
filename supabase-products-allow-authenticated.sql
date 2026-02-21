-- ============================================
-- [선택] 로그인 사용자 모두 상품 등록 허용
-- ============================================
-- 관리자(is_admin) 설정이 잘 되지 않을 때만 사용하세요.
-- 이렇게 하면 로그인한 모든 사용자가 상품 등록/수정/삭제를 할 수 있어 보안이 약해집니다.
-- ============================================

DROP POLICY IF EXISTS "Admin only insert products" ON products;
DROP POLICY IF EXISTS "Admin only update products" ON products;
DROP POLICY IF EXISTS "Admin only delete products" ON products;

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE TO authenticated USING (true);
