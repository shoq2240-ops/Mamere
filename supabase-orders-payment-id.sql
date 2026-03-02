-- 결제 검증 API에서 주문 시 payment_id 저장용
-- Supabase Dashboard > SQL Editor에서 실행
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_id TEXT;
