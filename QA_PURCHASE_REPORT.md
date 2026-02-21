# Dr.care 가상 구매 QA 리포트

**작성일**: 2025-02-14 (최종 갱신)  
**범위**: 상품 상세 → 장바구니 → 결제 → 주문 저장, 로직/UX/데이터 무결성, 배송 추적·FAQ 영향, **비로그인(게스트) 결제**

---

## 1. 가상 구매 시나리오 실행

### 1.1 시나리오 단계

| 단계 | 동작 | 확인 포인트 |
|------|------|-------------|
| 1 | 상품 상세 페이지 진입 | 옵션(사이즈) 선택, ADD TO ARCHIVE / BUY |
| 2 | 장바구니 담기 | 품절 시 SOLD OUT·버튼 비활성화, **비로그인도 담기 가능** |
| 3 | 장바구니 페이지 | 수량 +/- 시 **합계 금액 실시간 반영**, Proceed to Checkout |
| 4 | 결제 페이지 | **비로그인**: 게스트 이메일·배송지 입력 / **로그인**: 프로필 로드 |
| 5 | 결제하기 | 폼 검증(이름·주소·전화·게스트 시 이메일), 결제 전 재고 부족 검사 |
| 6 | 결제 완료 | 주문 저장(orders), **deduct_stock RPC** 재고 차감, **clearCart() + localStorage 삭제**, 게스트 시 주문번호 화면 |

### 1.2 검증 결과 요약

- **로직**: 품절 시 구매 불가, 수량 변경 시 합계 실시간 반영, 결제 전/후 재고 검사 및 RPC 차감.
- **UX**: 결제 버튼 위치·폼 적절, 에러 메시지 사용자 친화 문구 적용.
- **데이터 무결성**: 주문 저장(회원/게스트), 관리자 주문 목록·Realtime 반영.
- **비로그인**: 게스트 담기 → 결제 → 주문번호 화면 → /order-lookup 조회 가능.

---

## 2. 문제점(이상한 점) 분석

### 2.1 로직 오류

| 항목 | 결과 | 비고 |
|------|------|------|
| 재고 없을 때 구매 | ✅ 차단 | 상세 `isSoldOut` 비활성화, Checkout 결제 전 `stock_quantity >= quantity` 검사, 결제 후 `deduct_stock` RPC(부족 시 예외) |
| 수량 변경 시 합계 | ✅ 실시간 반영 | `CartPage`: `totalPrice = cart.reduce(...)`, `updateQuantity` → `setCart` → 리렌더 |
| 결제 금액 조작 | ✅ 방지 | Checkout에서 `products` 재조회 후 `totalAmount` 계산·결제 |

### 2.2 사용자 경험(UX)

| 항목 | 결과 | 조치 |
|------|------|------|
| 결제 버튼 위치 | ✅ 하단 "장바구니로"와 나란히 | 유지 |
| 에러 메시지 | ✅ 사용자 친화 문구 적용 | 유지 |
| **비로그인 장바구니 담기** | ⚠️ 상세에서 로그인 유도 시 담기 불가 | → **로그인 없이 담기 허용** (ProductDetailPage 수정) |
| 상품 이미지 참조 | ⚠️ `handleAddToCart`에서 `images[0]` 의존 | → `getImageList(product)?.[0]` 등 **안전 참조**로 수정 |

### 2.3 데이터 무결성

| 항목 | 결과 | 비고 |
|------|------|------|
| 주문 저장 | ✅ 회원(프로필/폼 값), 게스트(user_id null, is_guest, guest_email, order_number) | 유지 |
| 재고 차감 | ✅ `deduct_stock` RPC 사용, 재고 부족 시 예외·알림 | 유지 |
| 관리자 주문 노출 | ✅ `orders` select + Realtime | 유지 |
| 게스트 조회 | ✅ `get_guest_order` RPC로 guest_email·order_number 일치 시만 1건 반환 | RLS 강화 유지 |

### 2.4 최종 점검 (배송 추적·FAQ)

| 항목 | 결과 |
|------|------|
| 배송 추적 그래프 | `OrderTrackingStepper` / `OrderTrackingBlock`은 **주문 내역(/orders)·비회원 조회(/order-lookup)** 전용. 결제 페이지·장바구니·상세에 없음 → **구매 과정 방해 없음** |
| FAQ 모달/섹션 | FAQ는 /faq·랜딩 섹션. 결제 플로우 중 자동 팝업 없음 → **구매 과정 방해 없음** |

### 2.5 비로그인(게스트) 결제

| 항목 | 결과 | 조치 |
|------|------|------|
| 상품 상세에서 담기 | ⚠️ 기존 로그인 필수로 **담기 불가** | → **로그인 없이 담기 허용** (ProductDetailPage) |
| 장바구니 → 결제 | ✅ 로그인 없이 /checkout 이동 가능 | CartPage에서 로그인 모달 제거 반영됨 |
| 결제 페이지 | ✅ 게스트 이메일·배송지 폼, 결제 후 주문번호 화면 | 유지 |
| 주문 조회 | ✅ /order-lookup 에서 이메일+주문번호로 조회 | 유지 |

---

## 3. 해결책 및 코드 수정 (이번 QA 반영)

### 3.1 상품 상세: 비로그인 장바구니 담기 허용

- **원인**: `ProductDetailPage`의 `handleAddToCart`에서 `isLoggedIn`이 아니면 `setShowLoginModal(true)` 후 return → 게스트가 담기 불가.
- **수정**: 로그인 체크 제거. 비로그인도 장바구니 담기 가능하도록 변경. 게스트는 담기 → 장바구니 → 결제(게스트 폼) → 주문 완료 흐름 가능.

### 3.2 상품 이미지 참조 안전화

- **원인**: `handleAddToCart`에서 `image: product.image || images[0]` 사용. `images`는 같은 렌더의 뒤쪽에서 정의되어 동작은 하나, 선언 순서 변경 시 오동작 가능.
- **수정**: `getImageList(product)` 결과를 `handleAddToCart` 내부에서 사용. `image: product?.image || (Array.isArray(imageList) ? imageList[0] : null)` 로 명시적 참조.

### 3.3 사용하지 않는 코드 제거 (ProductDetailPage)

- **수정**: `LoginRequiredModal`, `useAuth`, `showLoginModal` state 제거(담기에 로그인 불필요하므로).

---

## 4. 최종 점검 요약

| 구분 | 상태 |
|------|------|
| 가상 구매 시나리오 | 상세 → 장바구니 → 결제 → 주문 저장·재고 차감·장바구니 비우기 검증 완료 |
| 로직(재고/수량/금액) | 재고 없음 구매 차단, 수량 변경 시 합계 실시간 반영, 서버 기준 금액·재고 검증 |
| UX | 에러 메시지 친화적, 결제 버튼 위치 적절 |
| 데이터 무결성 | 주문 저장(회원/게스트), deduct_stock RPC, 관리자 주문 노출 정상 |
| 배송 추적·FAQ | 구매 과정과 분리, 방해 없음 |
| **비로그인(게스트)** | **상세에서 담기 가능 → 결제 → 주문번호 화면 → /order-lookup 조회 가능** |

---

## 5. 참고 파일

- `src/pages/ProductDetailPage.jsx` — 상품 상세, 장바구니 담기(비로그인 허용), 품절 처리, 이미지 참조
- `src/pages/CartPage.jsx` — 장바구니, 수량 변경, 결제 페이지 이동
- `src/pages/CheckoutPage.jsx` — 배송지·게스트 이메일, 결제, 주문 저장, deduct_stock, clearCart
- `src/store/CartContext.jsx` — 장바구니 상태, clearCart 시 localStorage.removeItem('dn_cart')
- `src/pages/OrderLookupPage.jsx` — 비회원 주문 조회(이메일+주문번호)
- `src/lib/productStock.js` — isSoldOut
- `supabase-rpc-guest-order.sql` — deduct_stock, get_guest_order RPC
