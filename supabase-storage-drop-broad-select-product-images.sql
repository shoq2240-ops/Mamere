-- ============================================
-- product-images: 넓은 storage.objects SELECT 정책 제거
-- ============================================
-- Public 버킷은 URL 직접 접근만으로 충분하고, 버킷 단위 SELECT는 목록 유출 위험이 있습니다.
-- 1) 알려진 정책 이름 제거
-- 2) USING이 사실상 `bucket_id = 'product-images'` 수준만인 SELECT 정책 자동 제거
--    (폴더·객체 경로로 제한된 정책은 qual에 `foldername` 또는 `(name` 조건이 들어가므로 제외)
--
-- 실행 후: Dashboard > Storage > Policies에서 SELECT가 의도대로인지 확인하세요.
-- ============================================

DROP POLICY IF EXISTS "Allow public read product-images" ON storage.objects;

DO $$
DECLARE
  r RECORD;
  q TEXT;
BEGIN
  FOR r IN
    SELECT policyname, qual
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND cmd = 'SELECT'
  LOOP
    q := coalesce(r.qual::text, '');
    IF q ~* 'bucket_id\s*=\s*''product-images'''
       AND q !~* 'storage\.foldername'
       AND q !~* '\(name\s*[=!<>~]'
       AND length(trim(q)) < 400
    THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
      RAISE NOTICE 'Dropped broad SELECT policy: %', r.policyname;
    END IF;
  END LOOP;
END $$;
