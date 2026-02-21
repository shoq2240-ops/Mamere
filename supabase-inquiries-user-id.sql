-- inquiries 테이블에 user_id 컬럼 추가
-- 로그인 사용자의 문의 시 auth.users.id 기록용
-- Supabase Dashboard > SQL Editor에서 실행하세요.

ALTER TABLE inquiries
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
