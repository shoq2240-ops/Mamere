-- ============================================
-- 문의(inquiries) 테이블
-- ============================================
-- Supabase Dashboard > SQL Editor에서 실행하세요.
-- 푸터 '문의 양식 작성하기' 모달에서 제출된 데이터 저장

CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert inquiry" ON inquiries;
DROP POLICY IF EXISTS "inquiries_insert_any" ON inquiries;
DROP POLICY IF EXISTS "inquiries_insert_validated" ON inquiries;
CREATE POLICY "inquiries_insert_validated"
  ON inquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(trim(first_name)) BETWEEN 1 AND 50
    AND char_length(trim(last_name)) BETWEEN 1 AND 50
    AND char_length(trim(email)) BETWEEN 3 AND 254
    AND trim(email) ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    AND (phone IS NULL OR char_length(trim(phone)) <= 20)
    AND (subject IS NULL OR char_length(trim(subject)) <= 50)
    AND (message IS NULL OR char_length(trim(message)) <= 1000)
    AND (user_id IS NULL OR user_id = auth.uid())
  );
