# 관리자 페이지 설정 가이드

## 1. Supabase SQL 실행

`supabase-admin-setup.sql` 파일을 Supabase Dashboard > SQL Editor에서 실행하세요.
- `products` 테이블에 `subcategory` 컬럼이 추가됩니다.

## 2. Storage 버킷 생성

Supabase Dashboard > Storage에서:

1. **New bucket** 클릭
2. **Name**: `product-images`
3. **Public bucket**: ON (체크)
4. **Create bucket**

### Storage 정책 설정

bucket 생성 후 Policies 탭에서:

- **Upload**: Insert policy 추가
  - Operation: `INSERT`
  - Roles: `authenticated`
  - WITH CHECK: `true`

- **Read**: Select policy (Public 읽기)
  - Operation: `SELECT`
  - Roles: `public`
  - USING: `true`

## 3. 접속

로그인 후 `/admin/upload` 경로로 접속하세요.
