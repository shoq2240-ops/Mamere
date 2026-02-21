-- ============================================
-- OAuth 신규 사용자 프로필 자동 생성 트리거
-- ============================================
-- OAuth(카카오/구글)로 처음 가입한 사용자의 profiles 행을 자동 생성합니다.
-- Supabase Dashboard > SQL Editor에서 실행하세요.
-- ============================================

-- 표시 이름: metadata.full_name > metadata.name > email > ''
-- profiles 테이블에 full_name 컬럼이 있어야 함. 없으면 supabase-profiles-add-full-name.sql 실행
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  display_name TEXT := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
    NEW.email,
    ''
  );
BEGIN
  INSERT INTO public.profiles (id, full_name, name)
  VALUES (NEW.id, display_name, display_name)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN undefined_column THEN
    -- full_name 컬럼이 없으면 id, name만 삽입 (구 스키마 호환)
    INSERT INTO public.profiles (id, name)
    VALUES (NEW.id, display_name)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
