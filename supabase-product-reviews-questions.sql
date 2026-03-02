-- ============================================
-- product_reviews / product_questions 스키마 및 RLS
-- Supabase Dashboard > SQL Editor에서 실행
-- ============================================

-- 1) 상품 리뷰 테이블
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  skin_type TEXT,
  content TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- 리뷰 읽기: 누구나 특정 상품의 리뷰를 볼 수 있음
DROP POLICY IF EXISTS "Anyone can read product_reviews" ON product_reviews;
CREATE POLICY "Anyone can read product_reviews"
  ON product_reviews FOR SELECT
  TO anon, authenticated
  USING (true);

-- 리뷰 작성: 로그인 사용자만 작성 (user_id = auth.uid())
DROP POLICY IF EXISTS "Authenticated can insert product_reviews" ON product_reviews;
CREATE POLICY "Authenticated can insert product_reviews"
  ON product_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 리뷰 수정: 본인이 작성한 리뷰만 수정 가능
DROP POLICY IF EXISTS "Authenticated can update own product_reviews" ON product_reviews;
CREATE POLICY "Authenticated can update own product_reviews"
  ON product_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 리뷰 삭제: 본인이 작성한 리뷰만 삭제 가능 (user_id 일치)
-- user_id가 NULL인 행(과거 데이터 등)은 로그인 사용자 누구나 삭제 가능
DROP POLICY IF EXISTS "Authenticated can delete own product_reviews" ON product_reviews;
CREATE POLICY "Authenticated can delete own product_reviews"
  ON product_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- 2) 상품 Q&A 테이블
CREATE TABLE IF NOT EXISTS product_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT,
  content TEXT NOT NULL,
  answer TEXT,
  status TEXT DEFAULT 'pending', -- pending / answered
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE product_questions ENABLE ROW LEVEL SECURITY;

-- Q&A 읽기: 누구나 특정 상품의 Q&A 목록을 볼 수 있음
DROP POLICY IF EXISTS "Anyone can read product_questions" ON product_questions;
CREATE POLICY "Anyone can read product_questions"
  ON product_questions FOR SELECT
  TO anon, authenticated
  USING (true);

-- Q&A 작성: 로그인 사용자만 작성 (user_id = auth.uid())
DROP POLICY IF EXISTS "Authenticated can insert product_questions" ON product_questions;
CREATE POLICY "Authenticated can insert product_questions"
  ON product_questions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Storage: 리뷰 사진 업로드 (product-images 버킷 내 review-photos 폴더)
-- Supabase Dashboard > Storage에서 'product-images' 버킷이 있어야 함. 없으면 생성 후 아래만 실행.
-- ============================================
DROP POLICY IF EXISTS "Authenticated can upload review photos" ON storage.objects;
CREATE POLICY "Authenticated can upload review photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = 'review-photos'
  );

