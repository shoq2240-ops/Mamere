-- ============================================
-- Double Negative - Products 테이블 생성 SQL
-- ============================================
-- 이 파일을 Supabase Dashboard > SQL Editor에 복사해서 실행하세요

-- 1. products 테이블 생성
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  image TEXT NOT NULL,
  category TEXT,
  description TEXT,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Row Level Security (RLS) 활성화
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 3. 읽기 정책: 모든 사용자가 제품을 볼 수 있음
CREATE POLICY "Anyone can read products"
  ON products
  FOR SELECT
  TO public
  USING (true);

-- 4. 쓰기 정책: 인증된 사용자만 제품 추가 가능
CREATE POLICY "Authenticated users can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 5. 수정 정책: 인증된 사용자만 제품 수정 가능
CREATE POLICY "Authenticated users can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true);

-- 6. 삭제 정책: 인증된 사용자만 제품 삭제 가능
CREATE POLICY "Authenticated users can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);

-- 7. updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. 샘플 데이터 삽입
INSERT INTO products (name, price, image, category, description) VALUES
  (
    'DECONSTRUCTED BLAZER',
    890000,
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800',
    'men',
    '해체주의 철학이 담긴 비대칭 블레이저'
  ),
  (
    'ASYMMETRIC KNIT VEST',
    420000,
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800',
    'women',
    '불규칙한 니트 패턴의 베스트'
  ),
  (
    'RAW EDGE CARGO PANTS',
    550000,
    'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=800',
    'men',
    '로우 엣지 마감의 카고 팬츠'
  ),
  (
    'VOID OVERSIZED HOODIE',
    380000,
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800',
    'women',
    '오버사이즈 실루엣의 후디'
  ),
  (
    'MINIMALIST TRENCH COAT',
    1200000,
    'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=800',
    'women',
    '미니멀한 디자인의 트렌치 코트'
  ),
  (
    'DRAPED SHIRT',
    320000,
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800',
    'men',
    '드레이프 디테일 셔츠'
  );

-- 9. 테이블 정보 확인
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- 완료! 이제 Realtime을 활성화하세요:
-- Database > Replication > products 테이블의 Realtime 토글을 ON으로 설정
