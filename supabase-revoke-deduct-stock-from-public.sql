-- ============================================
-- 보안: 재고 차감 RPC를 service_role 전용으로 제한
-- ============================================
-- 클라이언트(브라우저)·anon이 deduct_stock 계열 RPC를 호출하면 재고를 임의로 깎을 수 있습니다.
-- Vercel / Supabase Edge Function 등 서버 역할 키로만 차감하도록 합니다.
-- Supabase SQL Editor에서 실행하세요 (함수 오버로드가 없으면 해당 REVOKE 줄만 오류 나면 무시 가능).
-- ============================================

REVOKE EXECUTE ON FUNCTION public.deduct_stock(bigint, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.deduct_stock(bigint, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.deduct_stock(bigint, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_stock(bigint, integer) TO service_role;

REVOKE EXECUTE ON FUNCTION public.deduct_stock(text, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.deduct_stock(text, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.deduct_stock(text, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_stock(text, integer) TO service_role;

REVOKE EXECUTE ON FUNCTION public.deduct_stock_by_id(text, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.deduct_stock_by_id(text, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.deduct_stock_by_id(text, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_stock_by_id(text, integer) TO service_role;
