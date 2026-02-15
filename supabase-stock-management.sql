-- ============================================
-- Double Negative - 재고 관리 및 품절 시스템
-- ============================================
-- Supabase Dashboard > SQL Editor에서 실행하세요.
-- products 테이블에 재고/품절 관련 컬럼을 추가합니다.
--
-- [초보 관리자용 안내]
-- 1. Supabase 대시보드 로그인 후 왼쪽 메뉴에서 'SQL Editor' 클릭
-- 2. 아래 전체 내용 복사 후 붙여넣기
-- 3. 'Run' 버튼 클릭하여 실행
-- ============================================

-- 1. stock_quantity: 재고 개수 (Integer, 기본값 0)
--    - 상품의 현재 재고 수량
--    - 0 이하면 자동 품절로 간주 (상품 상세 페이지에서 SOLD OUT 표시)
--    - 결제 완료 시 이 값이 차감됨
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;

-- 2. is_manual_soldout: 관리자 수동 품절 스위치 (Boolean, 기본값 false)
--    - 관리자가 '판매 중단' 토글로 강제 품절 처리 시 true
--    - true이면 재고와 상관없이 항상 품절로 표시
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_manual_soldout BOOLEAN DEFAULT false;

-- 3. (선택) 기존 stock 컬럼이 있다면 stock_quantity로 마이그레이션
-- DO $$
-- BEGIN
--   IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock') THEN
--     UPDATE products SET stock_quantity = COALESCE(stock, 0) WHERE stock_quantity IS NULL;
--   END IF;
-- END $$;

-- 4. 컬럼 확인
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('stock_quantity', 'is_manual_soldout');
