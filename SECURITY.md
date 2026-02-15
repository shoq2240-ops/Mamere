# Double Negative - 보안 가이드

## 적용된 보안 조치

### 1. 인증 및 권한
- **관리자 라우트 보호**: `/admin/*` 경로는 `profiles.is_admin = true` 사용자만 접근
- **RequireAdmin 컴포넌트**: 관리자 페이지 렌더링 전 DB에서 is_admin 확인
- **RLS (Row Level Security)**: Supabase에서 테이블별 접근 제어
  - `products`: 관리자만 INSERT/UPDATE/DELETE
  - `orders`: 본인 주문만 조회, 관리자만 전체 조회 및 수정
  - `profiles`: 본인 프로필만 조회/수정

### 2. 결제 및 주문
- **서버 가격 검증**: 결제 시 DB에서 실제 가격 조회 후 총액 검증 (클라이언트 조작 방지)
- **품절 검사**: 결제 전 재고·수동 품절 상태 확인
- **수량 제한**: 장바구니 수량 상한 99, 주문 항목 수 제한

### 3. 입력 검증
- **장바구니 (CartContext)**: 필드 화이트리스트, prototype pollution 방지, product id 유효성 검사
- **이미지 업로드**: 파일 타입(JPEG, PNG, WebP, GIF), 크기(5MB 이하) 검증
- **주소/연락처**: slice로 길이 제한 적용

### 4. 정보 노출 최소화
- **로그인 실패**: "회원 정보가 없습니다" (계정 존재 여부 비공개)
- **비밀번호 재설정 실패**: 일반화된 메시지로 이메일 존재 여부 비공개

### 5. 환경 변수
- `.env` 파일 git 제외 (src/.env 포함)
- Supabase anon key는 클라이언트 노출 전제, RLS로 보호

---

## 관리자 설정 방법

1. Supabase Dashboard > SQL Editor에서 `supabase-security-admin.sql` 실행
2. Table Editor > `profiles` > 관리자로 지정할 사용자 행의 `is_admin`을 `true`로 설정

```sql
UPDATE profiles SET is_admin = true WHERE id = '관리자-user-uuid';
```

---

## 추가 권장 사항

- **Rate Limiting**: Supabase Edge Functions 또는 별도 백엔드에서 로그인/회원가입 API 호출 제한
- **CSP (Content-Security-Policy)**: 배포 시 헤더 설정으로 XSS 완화
- **HTTPS**: 프로덕션 환경에서는 반드시 HTTPS 사용
- **정기 점검**: 의존성 취약점 검사 (`npm audit`)
