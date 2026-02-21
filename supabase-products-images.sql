-- ============================================
-- Double Negative - products 이미지 배열(priority) 확장
-- ============================================
-- Supabase Dashboard > SQL Editor에서 실행하세요.
-- 상품당 여러 이미지 URL + 순서(priority) + 대표 이미지 저장용

ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]';

COMMENT ON COLUMN products.images IS '이미지 목록: [{ "url": "...", "priority": 0, "isMain": true }, ...]. image 컬럼은 대표 이미지 URL과 동일하게 유지';
