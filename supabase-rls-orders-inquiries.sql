-- ============================================
-- 보안: 주문·문의 RLS (Row Level Security)
-- ============================================
-- Supabase Dashboard > SQL Editor에서 실행하세요.
--
-- [목적]
-- 1. orders: 유저는 '본인 주문'만 조회, 관리자는 전체 조회/수정
-- 2. inquiries: 유저는 '본인 문의'만 조회, 관리자는 전체 조회 (user_id 기준)
--
-- [사전 조건]
-- - orders 테이블 존재 (supabase-orders.sql)
-- - profiles.is_admin 컬럼 존재 (supabase-profiles-add-is-admin.sql 또는 supabase-security-admin.sql)
-- inquiries 테이블이 없으면 이 스크립트에서 생성합니다.
-- ============================================

-- ----- orders -----
-- 기존 '모든 로그인 사용자 주문 전체 조회' 정책 제거 (보안 취약)
DROP POLICY IF EXISTS "Authenticated can read all orders" ON orders;
DROP POLICY IF EXISTS "Authenticated can update orders" ON orders;

-- 본인 주문만 조회
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 관리자만 전체 주문 조회
DROP POLICY IF EXISTS "Admin can read all orders" ON orders;
CREATE POLICY "Admin can read all orders"
  ON orders FOR SELECT TO authenticated
  USING ((SELECT COALESCE(is_admin, false) FROM profiles WHERE id = auth.uid()) = true);

-- 관리자만 주문 상태/송장 수정
DROP POLICY IF EXISTS "Admin only update orders" ON orders;
CREATE POLICY "Admin only update orders"
  ON orders FOR UPDATE TO authenticated
  USING ((SELECT COALESCE(is_admin, false) FROM profiles WHERE id = auth.uid()) = true)
  WITH CHECK ((SELECT COALESCE(is_admin, false) FROM profiles WHERE id = auth.uid()) = true);


-- ----- inquiries -----
-- 테이블이 없으면 생성 (문의하기 모달 제출 데이터 저장)
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- 문의 제출: 비회원(anon)·회원(authenticated) 모두 가능
DROP POLICY IF EXISTS "Anyone can insert inquiry" ON inquiries;
CREATE POLICY "Anyone can insert inquiry"
  ON inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 로그인 사용자 문의 시 user_id 기록용 컬럼
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 문의 메시지 길이 제한 (1,000자). 기존에 1000자 초과 데이터가 있으면 먼저 수정 후 실행:
-- UPDATE inquiries SET message = left(message, 1000) WHERE message IS NOT NULL AND char_length(message) > 1000;
ALTER TABLE inquiries DROP CONSTRAINT IF EXISTS inquiries_message_max_length;
ALTER TABLE inquiries ADD CONSTRAINT inquiries_message_max_length
  CHECK (message IS NULL OR char_length(message) <= 1000);

-- 문의 SELECT: 비회원 문의(user_id NULL)는 일반 유저가 볼 수 없음
-- 로그인 유저는 자신이 제출한 문의만 조회
DROP POLICY IF EXISTS "Users can read own inquiries" ON inquiries;
CREATE POLICY "Users can read own inquiries"
  ON inquiries FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 관리자는 전체 문의 조회
DROP POLICY IF EXISTS "Admin can read all inquiries" ON inquiries;
CREATE POLICY "Admin can read all inquiries"
  ON inquiries FOR SELECT TO authenticated
  USING ((SELECT COALESCE(is_admin, false) FROM profiles WHERE id = auth.uid()) = true);

-- INSERT 정책은 기존 유지 (anon, authenticated 모두 문의 제출 가능)
-- 이미 "Anyone can insert inquiry" 있으면 그대로 사용
