-- ============================================
-- 회원 탈퇴 RPC: withdraw_user
-- ============================================
-- Supabase Dashboard > SQL Editor에서 실행하세요.
--
-- [목적]
-- 탈퇴 시 스키마 캐시 오류 등을 방지하기 위해 RPC를 명시적으로 생성·권한 부여.
-- 클라이언트는 탈퇴 성공 후 반드시 signOut() 호출 후 리다이렉트 권장.
--
-- [사전 조건]
-- profiles 테이블에 is_withdrawn, withdrawn_at 컬럼이 있어야 함.
-- "column is_withdrawn does not exist" 에러가 나면 → supabase-profiles-withdraw-columns.sql 을 먼저 실행.
-- ============================================

-- 기존 함수 교체 (스키마 캐시 갱신에 도움)
CREATE OR REPLACE FUNCTION public.withdraw_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 로그인한 본인만 호출 가능
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: not authenticated';
  END IF;

  UPDATE public.profiles
  SET
    is_withdrawn = true,
    withdrawn_at = NOW()
  WHERE id = auth.uid()
    AND (is_withdrawn IS NOT true);

  -- 결과가 없어도 정상 (이미 탈퇴 처리된 경우)
END;
$$;

-- anon key로 호출하지 않으므로 authenticated만 부여
GRANT EXECUTE ON FUNCTION public.withdraw_user() TO authenticated;

COMMENT ON FUNCTION public.withdraw_user() IS '회원 탈퇴(Soft Delete). profiles.is_withdrawn=true, withdrawn_at=NOW(). 호출 후 클라이언트에서 signOut() 필수.';
