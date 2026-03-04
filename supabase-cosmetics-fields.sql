-- ============================================
-- Mamère 화장품 전용 products 컬럼
-- ============================================
-- Supabase Dashboard > SQL Editor에서 실행하세요.
-- 기존 의류용 컬럼(gender, subcategory 등)은 유지해도 되고, 사용하지 않으면 무시됩니다.

-- 용량 (예: 50ml, 30g)
ALTER TABLE products ADD COLUMN IF NOT EXISTS volume TEXT;

-- 피부 타입 (JSONB 배열, 예: ["건성", "민감성"])
ALTER TABLE products ADD COLUMN IF NOT EXISTS skin_type JSONB DEFAULT '[]';

-- 피부 고민 (JSONB 배열, 예: ["보습", "진정"])
ALTER TABLE products ADD COLUMN IF NOT EXISTS skin_concern JSONB DEFAULT '[]';

-- 주요 성분 (JSONB 배열, 예: ["시나몬", "히알루론산", "티트리"])
ALTER TABLE products ADD COLUMN IF NOT EXISTS key_ingredients JSONB DEFAULT '[]';

COMMENT ON COLUMN products.volume IS '용량 표기 (예: 50ml, 30g)';
COMMENT ON COLUMN products.skin_type IS '피부 타입: 건성, 지성, 복합성, 민감성';
COMMENT ON COLUMN products.skin_concern IS '피부 고민: 보습, 진정, 트러블, 미백, 탄력';
COMMENT ON COLUMN products.key_ingredients IS '주요 성분 목록';
