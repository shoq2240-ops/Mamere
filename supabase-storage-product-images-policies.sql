-- ============================================
-- Storage 버킷 product-images 업로드/읽기 정책
-- ============================================
-- "new row violates row-level security policy" 가 이미지 업로드 단계에서 나오면
-- Storage(storage.objects) 에 INSERT 정책이 없기 때문입니다.
-- Supabase Dashboard > SQL Editor에서 실행하세요.
-- ============================================

-- 기존 정책이 있으면 제거 후 재생성
DROP POLICY IF EXISTS "Allow authenticated uploads to product-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read product-images" ON storage.objects;

-- 로그인한 사용자(authenticated)가 product-images 버킷에 파일 업로드 허용
CREATE POLICY "Allow authenticated uploads to product-images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Public 버킷이면 모든 사용자가 읽기 허용
CREATE POLICY "Allow public read product-images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'product-images');
