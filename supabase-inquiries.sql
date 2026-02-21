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

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- 비회원(anon)도 문의 제출 가능
CREATE POLICY "Anyone can insert inquiry"
  ON inquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
