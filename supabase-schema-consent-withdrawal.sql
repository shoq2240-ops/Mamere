-- ============================================
-- jvng. - 개인정보/약관 동의 및 탈퇴 스키마
-- ============================================
-- Supabase Dashboard > SQL Editor에서 실행하세요.
-- (supabase-privacy-columns.sql 적용 후 실행 권장)

-- ==========================================
-- 1. profiles 테이블 컬럼 추가
-- ==========================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS terms_agreed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS terms_agreed_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marketing_agreed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marketing_agreed_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS withdrawn_at TIMESTAMPTZ;

-- 기존 컬럼 (없으면 추가)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS privacy_policy_agreed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS agreed_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_withdrawn BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

COMMENT ON COLUMN profiles.birth_date IS '생년월일';
COMMENT ON COLUMN profiles.terms_agreed IS '이용약관 동의 여부';
COMMENT ON COLUMN profiles.terms_agreed_at IS '이용약관 동의 일시';
COMMENT ON COLUMN profiles.marketing_agreed IS '마케팅 수신 동의 여부';
COMMENT ON COLUMN profiles.marketing_agreed_at IS '마케팅 수신 동의 일시';
COMMENT ON COLUMN profiles.withdrawn_at IS '탈퇴 일시 (법적 보유용)';

-- ==========================================
-- 2. user_consent_logs 테이블 (동의 이력)
-- ==========================================
CREATE TABLE IF NOT EXISTS user_consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET,
  terms_agreed_at TIMESTAMPTZ NOT NULL,
  privacy_agreed_at TIMESTAMPTZ NOT NULL,
  marketing_agreed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_consent_logs_user_id ON user_consent_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consent_logs_created_at ON user_consent_logs(created_at DESC);

ALTER TABLE user_consent_logs ENABLE ROW LEVEL SECURITY;

-- 본인만 자신의 동의 로그 조회 가능
CREATE POLICY "Users can read own consent logs"
  ON user_consent_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 본인만 자신의 동의 로그 삽입 가능 (가입 시 1회)
CREATE POLICY "Users can insert own consent logs"
  ON user_consent_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 관리자는 전체 조회 가능
CREATE POLICY "Admin can read all consent logs"
  ON user_consent_logs FOR SELECT
  TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

-- ==========================================
-- 3. updated_at 자동 갱신 트리거
-- ==========================================
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- ==========================================
-- 4. 동의 로그 기록 RPC 함수
-- ==========================================
CREATE OR REPLACE FUNCTION log_user_consent(
  p_user_id UUID,
  p_ip_address TEXT DEFAULT NULL,
  p_terms_agreed_at TIMESTAMPTZ DEFAULT NOW(),
  p_privacy_agreed_at TIMESTAMPTZ DEFAULT NOW(),
  p_marketing_agreed BOOLEAN DEFAULT false
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_ip INET;
BEGIN
  -- 본인만 호출 가능
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  v_ip := NULL;
  IF p_ip_address IS NOT NULL AND p_ip_address <> '' THEN
    BEGIN
      v_ip := p_ip_address::INET;
    EXCEPTION WHEN OTHERS THEN
      v_ip := NULL;
    END;
  END IF;

  INSERT INTO user_consent_logs (user_id, ip_address, terms_agreed_at, privacy_agreed_at, marketing_agreed)
  VALUES (p_user_id, v_ip, p_terms_agreed_at, p_privacy_agreed_at, p_marketing_agreed)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- ==========================================
-- 5. (선택) auth.users 가입 시 동의 로그 자동 기록
-- Supabase에서 auth 스키마 권한이 있으면 실행 가능
-- 권한 오류 시 5번은 건너뛰고, 클라이언트에서 log_user_consent RPC 호출
-- ==========================================
-- CREATE OR REPLACE FUNCTION auth.handle_new_user_consent_log()
-- RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
-- BEGIN
--   INSERT INTO public.user_consent_logs (user_id, ip_address, terms_agreed_at, privacy_agreed_at, marketing_agreed)
--   VALUES (NEW.id, inet_client_addr(), COALESCE(NEW.created_at, NOW()), COALESCE(NEW.created_at, NOW()), false);
--   RETURN NEW;
-- END; $$;
-- DROP TRIGGER IF EXISTS on_auth_user_created_consent_log ON auth.users;
-- CREATE TRIGGER on_auth_user_created_consent_log AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION auth.handle_new_user_consent_log();

-- ==========================================
-- 6. 회원 탈퇴(Soft Delete) RPC 함수
-- ==========================================
CREATE OR REPLACE FUNCTION withdraw_user()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET is_withdrawn = true, withdrawn_at = NOW()
  WHERE id = auth.uid() AND (is_withdrawn IS NULL OR is_withdrawn = false);
END;
$$;
