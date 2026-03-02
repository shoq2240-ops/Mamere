-- ============================================
-- products 테이블 컬럼 동기화 (앱에서 사용하는 모든 컬럼)
-- ============================================
-- "Could not find the 'xxx' column of 'products' in the schema cache" 오류 방지용.
-- Supabase Dashboard > SQL Editor에서 한 번 실행해 두면, 앱에서 사용하는 컬럼이 모두 추가됩니다.
-- 기존 컬럼은 ADD COLUMN IF NOT EXISTS 로 건너뛰므로 여러 번 실행해도 안전합니다.
-- ============================================

-- 여러 이미지 목록 (JSON 배열)
ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]';
COMMENT ON COLUMN products.images IS '이미지 목록: [{ "url": "...", "priority": 0, "isMain": true }, ...]';

-- 상품 카드용 대표/호버 이미지 (선택)
ALTER TABLE products ADD COLUMN IF NOT EXISTS card_image TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS card_hover_image TEXT;
COMMENT ON COLUMN products.card_image IS '상품 카드 대표 이미지 URL';
COMMENT ON COLUMN products.card_hover_image IS '상품 카드 호버 이미지 URL';

-- 재고 수량
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;
COMMENT ON COLUMN products.stock_quantity IS '재고 수량. 결제 시 차감, 0 이하 시 자동 품절';

-- 수동 품절 스위치 (관리자 판매 중단)
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_manual_soldout BOOLEAN DEFAULT false;
COMMENT ON COLUMN products.is_manual_soldout IS 'true면 재고와 관계없이 품절로 표시';

-- 화장품용: 용량, 피부 타입/고민, 주요 성분
ALTER TABLE products ADD COLUMN IF NOT EXISTS volume TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS skin_type JSONB DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS skin_concern JSONB DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS key_ingredients JSONB DEFAULT '[]';

-- 서브카테고리 (선택)
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory TEXT;

-- 컬럼 확인 (실행 후 필요 시 아래 쿼리로 확인)
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'products'
-- ORDER BY ordinal_position;
