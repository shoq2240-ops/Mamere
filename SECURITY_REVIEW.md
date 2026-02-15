# 보안 점검 내역

## 적용된 보안 조치 (2026-02)

### 1. 결제 금액 검증 (CheckoutPage)
- **상품 가격**: 클라이언트 장바구니가 아닌 Supabase `products` 테이블 기준 가격으로 결제
- **가격 파싱**: DB 응답 타입(숫자/문자열) 모두 안전하게 파싱
- **수량 상한**: 항목당 최대 99개로 제한

### 2. 장바구니 보안 (CartContext)
- **화이트리스트**: `id`, `name`, `price`, `image`, `category`만 허용 (prototype pollution 방지)
- **문자열 길이 제한**: `name` 200자, `image` URL 2048자
- **수량 제한**: 항목당 최대 99개
- **카트 크기**: 최대 50개 품목
- **localStorage**: `try/catch`로 파싱 오류·quota 초과 처리

### 3. 입력 검증
- **이름**: 100자 제한
- **주소**: 기본 400자, 상세 100자, 합산 500자
- **전화번호**: 숫자만 허용, 15자 제한
- **검색어**: 100자 제한

### 4. 로깅
- **useProducts**: 프로덕션에서 `console.error` 비활성화
- **supabase.js**: 프로덕션에서 설정 경고 비활성화

### 5. 주문 저장
- **items 필드**: 이름/이미지 길이 제한, 수량 상한 적용

---

## 추가 권장 사항

- **Supabase RLS**: `orders`, `profiles` 테이블에 Row Level Security 정책 설정
- **포트원**: 결제 완료 후 서버(또는 Supabase Edge Function)에서 webhook으로 검증
- **HTTPS**: 프로덕션에서는 반드시 HTTPS 사용
