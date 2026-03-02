-- ============================================
-- 회원 탈퇴용 profiles 컬럼 추가
-- ============================================
-- "column is_withdrawn does not exist" 에러 시 Supabase Dashboard > SQL Editor에서
-- 이 파일을 먼저 실행한 뒤, supabase-rpc-withdraw-user.sql 을 실행하세요.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_withdrawn BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS withdrawn_at TIMESTAMPTZ;

COMMENT ON COLUMN profiles.is_withdrawn IS '회원 탈퇴 여부 (true 시 탈퇴 처리)';
COMMENT ON COLUMN profiles.withdrawn_at IS '탈퇴 일시 (법적 보유용)';
