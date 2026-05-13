-- ============================================
-- 보안: withdraw_user RPC — anon / PUBLIC 실행 제거
-- ============================================
-- PostgREST에서 SECURITY DEFINER 함수가 anon에 열려 있으면 취약점으로 지적됩니다.
-- 본 스크립트는 함수 본문(비로그인 시 예외)과 EXECUTE 권한을 정리합니다.
-- (이미 supabase-rpc-withdraw-user.sql 전체를 실행했다면 동일 효과입니다.)
-- ============================================

CREATE OR REPLACE FUNCTION public.withdraw_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: not authenticated';
  END IF;

  UPDATE public.profiles
  SET
    is_withdrawn = true,
    withdrawn_at = NOW()
  WHERE id = auth.uid()
    AND (is_withdrawn IS NOT true);
END;
$$;

REVOKE ALL ON FUNCTION public.withdraw_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.withdraw_user() FROM anon;
GRANT EXECUTE ON FUNCTION public.withdraw_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.withdraw_user() TO service_role;
