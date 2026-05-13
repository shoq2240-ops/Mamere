-- ============================================
-- Storage 버킷 product-images — INSERT만 (넓은 SELECT 없음)
-- ============================================
-- Public 버킷은 **객체 URL**(`/storage/v1/object/public/product-images/...`)로
-- 이미지를 열 수 있으며, `storage.objects`에 **버킷 전체 SELECT** 정책이 있으면
-- 클라이언트가 `.list()` 등으로 **버킷 내 모든 파일 목록**을 조회할 수 있어
-- Supabase 린터가 취약점으로 지적합니다.
--
-- 따라서 여기서는 INSERT(업로드) 정책만 정의하고, 공개 읽기용 SELECT는 두지 않습니다.
-- Supabase Dashboard > SQL Editor에서 실행하세요.
-- ============================================

DROP POLICY IF EXISTS "Allow authenticated uploads to product-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read product-images" ON storage.objects;

-- 로그인한 사용자(authenticated)가 product-images 버킷에 파일 업로드 허용
CREATE POLICY "Allow authenticated uploads to product-images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images');
