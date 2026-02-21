-- ============================================
-- profiles에 is_admin 컬럼 추가
-- ============================================
-- Supabase Dashboard > SQL Editor에서 실행하세요.
-- 실행 후 반드시 관리자로 쓸 사용자의 is_admin을 true로 설정해야 /admin/upload, /admin/orders 접속 가능합니다.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

COMMENT ON COLUMN profiles.is_admin IS '관리자 여부. true인 사용자만 /admin/* 페이지 접근 가능';

-- [필수] 아래에서 UUID를 관리자로 지정할 사용자 id로 바꾼 뒤 이 쿼리도 실행하세요.
-- Authentication > Users 에서 해당 사용자의 UUID 복사 후 붙여넣기:
-- UPDATE profiles SET is_admin = true WHERE id = '여기에-auth-users-uuid-붙여넣기';
