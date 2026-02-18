-- ============================================
-- jvng. - 개인정보 보호 관련 컬럼 추가
-- ============================================
-- Supabase Dashboard > SQL Editor에서 실행하세요.

-- 1. profiles 테이블에 개인정보/약관 동의 컬럼 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS privacy_policy_agreed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS agreed_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_withdrawn BOOLEAN DEFAULT false;

COMMENT ON COLUMN profiles.privacy_policy_agreed IS '개인정보 처리방침 및 쿠키 수집 동의 여부';
COMMENT ON COLUMN profiles.agreed_at IS '동의 일시';
COMMENT ON COLUMN profiles.is_withdrawn IS '회원 탈퇴 여부';

-- 2. 관리자가 모든 프로필 조회 가능 (회원 관리 페이지용)
-- 기존 "Users can read own profile" 정책을 확장하여 관리자는 전체 조회 가능
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can read all profiles" ON profiles;
CREATE POLICY "Users can read own or admin reads all profiles"
  ON profiles FOR SELECT TO authenticated
  USING (
    auth.uid() = id
    OR (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );
