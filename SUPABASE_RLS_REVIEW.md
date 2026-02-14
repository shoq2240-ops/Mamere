# Supabase RLS(Row Level Security) 검토

## profiles 테이블

| 정책 | 작업 | 대상 | 조건 | 안전성 |
|------|------|------|------|--------|
| Users can read own profile | SELECT | authenticated | `auth.uid() = id` | ✅ 본인 행만 조회 |
| Users can insert own profile | INSERT | authenticated | `WITH CHECK (auth.uid() = id)` | ✅ 본인 id로만 삽입 가능 |
| Users can update own profile | UPDATE | authenticated | `USING (auth.uid() = id)` `WITH CHECK (auth.uid() = id)` | ✅ 본인 행만 수정 가능 |

- **결제 시 “기본 배송지로 저장”**: 클라이언트가 `profiles.upsert({ id: user.id, name, address, phone })` 호출.  
  RLS에 의해 `id`는 반드시 `auth.uid()`와 일치해야 하므로, **다른 사용자의 프로필을 수정·삽입할 수 없음**. ✅ 안전

---

## orders 테이블

| 정책 | 작업 | 대상 | 조건 | 안전성 |
|------|------|------|------|--------|
| Users can insert own orders | INSERT | authenticated | `WITH CHECK (auth.uid() = user_id)` | ✅ 본인 user_id로만 주문 생성 |
| Users can read own orders | SELECT | authenticated | `auth.uid() = user_id` | ✅ 본인 주문만 조회 |

- **DELETE/UPDATE 정책 없음**: 익명·다른 사용자가 주문을 수정·삭제할 수 없음. ✅ 안전

---

## products 테이블 (참고)

| 정책 | 설명 |
|------|------|
| Anyone can read | SELECT는 public (비로그인 포함). 상품 조회용. ✅ |
| Authenticated insert/update/delete | 로그인 사용자만 변경 가능. 필요 시 “관리자만” 등으로 제한 가능. |

---

## 요약

- **profiles**: 본인 프로필만 읽기/쓰기. 결제 페이지에서 “기본 배송지로 저장” 시에도 RLS로 본인 행만 업데이트됨. ✅  
- **orders**: 본인만 주문 생성·조회. 타인 주문 조회/수정/삭제 불가. ✅  
- 별도 “관리자” 역할을 쓰려면 Supabase Dashboard에서 역할별 정책을 추가해 적용하면 됨.
