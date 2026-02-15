-- ============================================
-- Double Negative - 관리자 주문 관리용 SQL
-- ============================================
-- Supabase Dashboard > SQL Editor에서 실행하세요.
--
-- [기능]
-- 1. 관리자가 모든 주문 조회/수정 가능 (RLS 정책 추가)
-- 2. 배송 중일 때 송장 번호 저장용 컬럼 추가
--
-- [실시간 동기화] Database > Replication > orders 테이블 Realtime ON 설정 시
-- 관리자 대시보드에서 주문 상태 변경이 즉시 반영됩니다.
-- ============================================

-- 1. tracking_number 컬럼 추가 (배송 중 상태일 때 송장 번호)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tracking_number TEXT;

-- 2. 관리자용 RLS 정책: 로그인 사용자가 모든 주문 조회 가능
--    (실제 운영 시 profiles.is_admin 등으로 제한 권장)
CREATE POLICY "Authenticated can read all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

-- 3. 관리자용 RLS 정책: 로그인 사용자가 주문 상태/송장 수정 가능
CREATE POLICY "Authenticated can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
