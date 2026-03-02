-- 재고 차감: 단일 시그니처로 후보 함수 충돌 방지 (API에서 deduct_stock_by_id 호출)
-- p_product_id TEXT, p_quantity INTEGER — UUID/BIGINT 공통 (id::text 비교)
-- Supabase Dashboard > SQL Editor에서 실행

CREATE OR REPLACE FUNCTION deduct_stock_by_id(p_product_id TEXT, p_quantity INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quantity INTEGER := GREATEST(0, COALESCE(p_quantity, 0));
  v_updated  INTEGER;
BEGIN
  IF v_quantity <= 0 OR p_product_id IS NULL OR trim(p_product_id) = '' THEN
    RETURN;
  END IF;

  UPDATE products
  SET stock_quantity = stock_quantity - v_quantity
  WHERE id::text = trim(p_product_id)
    AND COALESCE(stock_quantity, 0) >= v_quantity;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated = 0 THEN
    RAISE EXCEPTION 'INSUFFICIENT_STOCK' USING errcode = 'P0001';
  END IF;
END;
$$;

COMMENT ON FUNCTION deduct_stock_by_id(TEXT, INTEGER) IS '주문 확정 시 재고 차감. API 전용 단일 시그니처. 재고 부족 시 INSUFFICIENT_STOCK 예외';

GRANT EXECUTE ON FUNCTION deduct_stock_by_id(TEXT, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION deduct_stock_by_id(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION deduct_stock_by_id(TEXT, INTEGER) TO service_role;
