-- ============================================
-- 반품/교환 신청 (return_requests)
-- Supabase Dashboard > SQL Editor에서 실행
-- ============================================

CREATE TABLE IF NOT EXISTS return_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('반품', '교환')),
  reason TEXT,
  detail TEXT,
  attachment_urls TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;

-- 본인만 신청 조회
DROP POLICY IF EXISTS "Users can read own return_requests" ON return_requests;
CREATE POLICY "Users can read own return_requests"
  ON return_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 관리자(profiles.is_admin = true)는 전체 조회 가능
DROP POLICY IF EXISTS "Admins can read all return_requests" ON return_requests;
CREATE POLICY "Admins can read all return_requests"
  ON return_requests FOR SELECT
  TO authenticated
  USING ( (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true );

-- 로그인 사용자만 신청 등록 (user_id는 선택적: 비로그인 시 null)
DROP POLICY IF EXISTS "Authenticated can insert return_requests" ON return_requests;
CREATE POLICY "Authenticated can insert return_requests"
  ON return_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 비로그인(anon)도 주문 번호로 신청 가능 (user_id NULL)
DROP POLICY IF EXISTS "Anon can insert return_requests with null user_id" ON return_requests;
CREATE POLICY "Anon can insert return_requests with null user_id"
  ON return_requests FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- ============================================
-- Storage: 반품/교환 첨부 (product-images 버킷 > return-attachments 폴더)
-- ============================================
DROP POLICY IF EXISTS "Authenticated can upload return attachments" ON storage.objects;
CREATE POLICY "Authenticated can upload return attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = 'return-attachments'
  );
DROP POLICY IF EXISTS "Anon can upload return attachments" ON storage.objects;
CREATE POLICY "Anon can upload return attachments"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = 'return-attachments'
  );
