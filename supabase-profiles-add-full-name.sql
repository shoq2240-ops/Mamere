-- ============================================
-- profiles에 full_name 컬럼 추가 (회원가입 트리거 호환)
-- ============================================
-- "Database error saving new user" 발생 시 Supabase Dashboard > SQL Editor에서 실행하세요.
-- handle_new_user 트리거가 INSERT (id, full_name) 하므로 이 컬럼이 필요합니다.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

COMMENT ON COLUMN profiles.full_name IS '표시 이름. handle_new_user 트리거에서 auth.users 메타데이터 또는 email로 채움';
