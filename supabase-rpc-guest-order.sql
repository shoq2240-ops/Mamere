-- ============================================
-- Double Negative - 게스트 주문/재고용 RPC 및 RLS 강화
-- ============================================
-- Supabase Dashboard > SQL Editor에서 실행하세요.
-- 실행 전: supabase-orders-guest.sql 적용 필요

-- 1. 재고 차감 RPC: deduct_stock (anon/authenticated 호출, 재고 부족 시 예외)
-- products 테이블은 anon이 UPDATE 불가하므로 SECURITY DEFINER로 정의
-- 재고가 부족하면 INSUFFICIENT_STOCK 예외 발생 → 클라이언트에서 결제 중단/알림 가능
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

COMMENT ON FUNCTION deduct_stock(BIGINT, INTEGER) IS '주문 확정 시 재고 차감. 재고 부족 시 INSUFFICIENT_STOCK 예외';

GRANT EXECUTE ON FUNCTION deduct_stock(BIGINT, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION deduct_stock(BIGINT, INTEGER) TO authenticated;


-- 2. 게스트 주문 조회 RPC (이메일 + 주문번호가 **동시에** 일치할 때만 1건 반환)
-- anon은 orders 테이블 직접 SELECT 불가 → 이 RPC로만 조회 가능 (보안 강화)
-- RLS 강화: guest_email과 order_number가 모두 일치할 때만 데이터 반환
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

COMMENT ON FUNCTION get_guest_order(TEXT, TEXT) IS '비회원 주문 조회: guest_email과 order_number가 동시에 일치할 때만 반환 (RLS 강화)';

GRANT EXECUTE ON FUNCTION get_guest_order(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_guest_order(TEXT, TEXT) TO authenticated;


-- 3. RLS 강화: 비회원 주문 조회 시 guest_email과 order_number가 동시에 일치할 때만 데이터 반환
-- anon은 orders 테이블 직접 SELECT 불가. 게스트 조회는 반드시 get_guest_order RPC만 사용.
-- RPC 내부에서 guest_email = p_guest_email AND order_number = p_order_number 조건으로만 1건 반환.
DROP POLICY IF EXISTS "anon can read guest orders" ON orders;
DROP POLICY IF EXISTS "Allow anon select orders" ON orders;
