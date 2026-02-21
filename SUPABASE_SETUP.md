# 🗄️ Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com) 접속 후 로그인
2. "New Project" 클릭
3. 프로젝트 이름, 데이터베이스 비밀번호 설정
4. 리전 선택 (Seoul 추천)

## 2. Products 테이블 생성

Supabase Dashboard > SQL Editor에서 다음 쿼리 실행:

```sql
-- products 테이블 생성
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  image TEXT NOT NULL,
  category TEXT,
  description TEXT,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) 활성화
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽을 수 있도록 정책 설정
CREATE POLICY "Anyone can read products"
  ON products
  FOR SELECT
  TO public
  USING (true);

-- 인증된 사용자만 제품 추가/수정/삭제 가능 (선택사항)
CREATE POLICY "Authenticated users can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 샘플 데이터 삽입
INSERT INTO products (name, price, image, category) VALUES
  ('DECONSTRUCTED BLAZER', 890000, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800', 'men'),
  ('ASYMMETRIC KNIT VEST', 420000, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800', 'women'),
  ('RAW EDGE CARGO PANTS', 550000, 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=800', 'men'),
  ('VOID OVERSIZED HOODIE', 380000, 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800', 'women');
```

## 2-1. products 컬럼 동기화 (필수)

관리자 상품 등록/수정 시 `Could not find the 'xxx' column of 'products' in the schema cache` 오류를 방지하려면, **SQL Editor에서 아래 파일 내용을 한 번 실행**하세요.

- **파일**: 프로젝트 루트의 `supabase-products-columns-sync.sql`
- **내용**: `images`, `stock_quantity`, `is_manual_soldout`, `volume`, `skin_type`, `skin_concern`, `key_ingredients` 등 앱에서 사용하는 컬럼을 `ADD COLUMN IF NOT EXISTS`로 추가합니다. 여러 번 실행해도 안전합니다.

## 2-2. 관리자 설정 (RLS "new row violates row-level security policy" 해결)

상품 등록 시 **"new row violates row-level security policy for table 'products'"** 또는 **"상품 등록 권한이 없습니다"** 가 나오면, 상품 쓰기는 **관리자(profiles.is_admin = true)** 만 허용되기 때문입니다.

**해결 순서:**

1. **UUID 확인**: Supabase Dashboard > **Authentication** > **Users** 에서 상품 등록에 쓸 계정의 **User UID** 복사
2. **SQL 실행**: SQL Editor에서 `supabase-set-admin.sql` 내용을 열고, `'여기에-본인-auth-user-uuid-붙여넣기'` 를 방금 복사한 UUID로 바꾼 뒤 **전체** 실행
3. **재로그인**: 브라우저에서 **로그아웃** 후 같은 계정으로 **다시 로그인** 하고, 상품 등록 페이지를 **새로고침** 한 뒤 다시 시도
4. **확인**: 그래도 안 되면 SQL Editor에서 `SELECT id, full_name, is_admin FROM profiles WHERE id = '본인-UUID'::uuid;` 로 해당 행에 `is_admin = true` 인지 확인

**여전히 안 될 때 (선택):** `supabase-products-allow-authenticated.sql` 을 실행하면 **로그인한 모든 사용자**가 상품 등록/수정/삭제를 할 수 있게 됩니다. 보안이 약해지므로, 테스트용으로만 쓰는 것을 권장합니다.

## 3. Realtime 기능 활성화

Supabase Dashboard에서:
1. **Database > Replication** 메뉴로 이동
2. `products` 테이블의 **Realtime** 토글을 ON으로 설정
3. 이제 데이터 변경이 실시간으로 반영됩니다!

## 4. API 키 확인 및 환경변수 설정

1. **Settings > API** 메뉴로 이동
2. **Project URL**과 **anon public** 키 복사
3. 프로젝트 루트의 `.env.local` 파일 수정:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 5. 개발 서버 재시작

```bash
npm run dev
```

## 6. 제품 추가하기 (Supabase Dashboard)

1. **Table Editor > products** 메뉴로 이동
2. "Insert row" 버튼 클릭
3. 제품 정보 입력:
   - `name`: 제품명 (예: "OVERSIZED TRENCH COAT")
   - `price`: 가격 (숫자만, 예: 1200000)
   - `image`: 이미지 URL
   - `category`: "men" 또는 "women"
   - `description`: 제품 설명 (선택사항)
   - `stock`: 재고 수량 (선택사항)

4. 저장하면 웹사이트에 **즉시 반영**됩니다! ✨

## 🎯 주요 기능

- ✅ **실시간 동기화**: Supabase에서 제품 추가/수정/삭제 시 자동 반영
- ✅ **로딩 상태**: 데이터 로딩 중 스켈레톤 UI 표시
- ✅ **에러 핸들링**: 연결 실패 시 사용자 친화적 메시지
- ✅ **카테고리 필터**: men/women 카테고리별 자동 필터링
- ✅ **가격 포맷팅**: 자동으로 ₩890,000 형식으로 표시

## 📝 제품 데이터 스키마

| 필드 | 타입 | 설명 |
|------|------|------|
| id | BIGSERIAL | 자동 생성 ID |
| name | TEXT | 제품명 (필수) |
| price | INTEGER | 가격 (숫자, 필수) |
| image | TEXT | 이미지 URL (필수) |
| category | TEXT | 카테고리 (men/women) |
| description | TEXT | 제품 설명 |
| stock | INTEGER | 재고 수량 |
| created_at | TIMESTAMPTZ | 생성 시각 |
| updated_at | TIMESTAMPTZ | 수정 시각 |

## 🔒 보안 설정

- RLS(Row Level Security)가 활성화되어 있습니다
- 모든 사용자는 제품을 **읽을 수** 있습니다
- 제품 추가/수정/삭제는 **인증된 사용자만** 가능합니다

## 🚀 다음 단계

- Supabase Storage를 사용한 이미지 업로드
- 관리자 대시보드 구축
- 제품 검색 및 필터링 고도화
- 재고 관리 시스템
