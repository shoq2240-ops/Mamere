-- ============================================
-- Double Negative - 게스트 결제용 orders 확장
-- ============================================
-- Supabase Dashboard > SQL Editor에서 실행하세요.
-- 실행 전: supabase-orders.sql, supabase-admin-orders.sql 적용 권장

-- 1. user_id nullable (게스트 주문 시 null)
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- 2. 게스트 주문 식별 및 조회용 컬럼
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_guest BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT;

COMMENT ON COLUMN orders.is_guest IS '비회원(게스트) 주문 여부';
COMMENT ON COLUMN orders.guest_email IS '게스트 주문 시 조회용 이메일';
COMMENT ON COLUMN orders.order_number IS '주문 번호 (예: DN-20250214-XXXX)';

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number) WHERE order_number IS NOT NULL;

-- 3. 게스트 주문 INSERT 허용 (anon)
-- 기존: "Users can insert own orders" (authenticated, auth.uid() = user_id)
-- 추가: anon이 user_id NULL + is_guest true로만 INSERT 가능
CREATE POLICY "Guest can insert guest orders"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL AND is_guest = true);
