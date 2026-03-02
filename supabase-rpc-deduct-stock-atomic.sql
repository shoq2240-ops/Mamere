-- 재고 차감 원자적 연산 (Race Condition 방어)
-- WHERE stock_quantity >= p_quantity 로 0 미만 방어, 단일 UPDATE로 원자성 보장
-- Supabase Dashboard > SQL Editor에서 실행

CREATE OR REPLACE FUNCTION deduct_stock(p_product_id BIGINT, p_quantity INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quantity INTEGER := GREATEST(0, COALESCE(p_quantity, 0));
  v_updated  INTEGER;
BEGIN
  IF v_quantity <= 0 THEN
    RETURN;
  END IF;

  UPDATE products
  SET stock_quantity = stock_quantity - v_quantity
  WHERE id = p_product_id
    AND COALESCE(stock_quantity, 0) >= v_quantity;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated = 0 THEN
    RAISE EXCEPTION 'INSUFFICIENT_STOCK' USING errcode = 'P0001';
  END IF;
END;
$$;

COMMENT ON FUNCTION deduct_stock(BIGINT, INTEGER) IS '주문 확정 시 재고 원자적 차감. 재고 부족 시 INSUFFICIENT_STOCK 예외';
