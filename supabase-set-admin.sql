-- ============================================
-- 관리자 계정 설정 (RLS "new row violates row-level security policy" 해결)
-- ============================================
-- 상품 등록/수정 시 "new row violates row-level security policy for table 'products'"
-- 오류가 나면, 상품 쓰기는 관리자(profiles.is_admin = true)만 허용되기 때문입니다.
--
-- [실행 방법]
-- 1. 아래 세 곳의 '여기에-본인-auth-user-uuid-붙여넣기' 를 본인 계정의 UUID로 바꿉니다.
-- 2. UUID 확인: Supabase Dashboard > Authentication > Users 에서 해당 사용자 행의 User UID 복사
-- 3. SQL Editor에 붙여넣고 Run 실행
-- 4. 브라우저에서 로그아웃 후 다시 로그인하고, 상품 등록 페이지를 새로고침한 뒤 다시 시도
-- ============================================

-- profiles에 is_admin 컬럼이 없으면 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 프로필이 없으면 생성, 있으면 is_admin 만 true 로 설정 (가입 시 트리거가 실패한 경우 대비)
-- ⬇️ '여기에-본인-auth-user-uuid-붙여넣기' 를 실제 User UID로 교체한 뒤 실행
INSERT INTO profiles (id, is_admin)
VALUES ('여기에-본인-auth-user-uuid-붙여넣기'::uuid, true)
ON CONFLICT (id) DO UPDATE SET is_admin = true;

-- 적용 확인: 아래 쿼리에서 본인 UUID로 바꿔 실행 시 is_admin = true 인지 확인
-- SELECT id, full_name, name, is_admin FROM profiles WHERE id = '여기에-본인-auth-user-uuid-붙여넣기'::uuid;
