-- ============================================
-- Double Negative - Admin 기능 설정 SQL
-- ============================================
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- 1. products 테이블에 subcategory 컬럼 추가 (아웃웨어/상의/하의)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS subcategory TEXT;

COMMENT ON COLUMN products.subcategory IS 'outerwear | top | bottom';

-- 2. Storage 버킷 "product-images" 생성
-- Storage는 SQL로 생성할 수 없습니다. Dashboard에서 수동 생성하세요:
-- Storage > New Bucket > 이름: product-images, Public: true
-- Policies > New Policy > "Allow authenticated uploads" 예시:
--   - Policy name: Allow authenticated uploads
--   - Allowed operation: INSERT
--   - Target roles: authenticated
--   - WITH CHECK: true
--   - Allowed operation: SELECT (Public 읽기용)
--   - Target roles: public
--   - USING: true

-- 3. (선택) 기존 상품에 subcategory 기본값 설정
UPDATE products SET subcategory = 'outerwear' WHERE subcategory IS NULL;
