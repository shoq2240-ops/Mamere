-- ============================================
-- 주문 추적: carrier_id (택배사 코드) 추가
-- ============================================
-- Supabase Dashboard > SQL Editor에서 실행하세요.
-- tracking_number는 이미 supabase-admin-orders.sql에서 추가된 경우가 많습니다.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS carrier_id TEXT;
COMMENT ON COLUMN orders.carrier_id IS '택배사 코드 (예: 04=CJ대한통운, 05=한진택배)';
