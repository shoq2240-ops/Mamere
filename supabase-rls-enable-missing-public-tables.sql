-- ============================================
-- PostgREST 노출 public 테이블: RLS 미적용 조치
-- ============================================
-- Supabase Database Linter: "Row level security has not been enabled on tables
-- in schemas exposed to PostgREST"
--
-- public 스키마의 일반 테이블·파티션 부모(relkind r, p) 중 RLS가 꺼진 것만 켭니다.
-- (이미 켜진 테이블은 ALTER가 무해하게 통과합니다.)
--
-- 주의: 정책이 전혀 없는 테이블에 RLS만 켜면 API 접근이 막힙니다.
--       그런 테이블이 있으면 해당 테이블용 POLICY를 추가하세요.
--       이 레포의 products / orders 등은 supabase-full-schema.sql,
--       supabase-rls-hardening.sql, supabase-product-reviews-questions.sql 등을 실행하세요.
--
-- 적용: Dashboard > SQL Editor에서 본문 실행
-- ============================================

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.relname AS tablename
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind IN ('r', 'p')
      AND NOT c.relrowsecurity
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
    RAISE NOTICE 'RLS enabled: public.%', r.tablename;
  END LOOP;
END $$;

-- 점검: 결과 0행이면 public에 RLS 미적용인 r/p 테이블이 없습니다.
-- SELECT c.relname, c.relkind
-- FROM pg_class c
-- JOIN pg_namespace n ON n.oid = c.relnamespace
-- WHERE n.nspname = 'public'
--   AND c.relkind IN ('r', 'p')
--   AND NOT c.relrowsecurity;
