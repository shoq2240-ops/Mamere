# profiles 테이블 컬럼 구조

## 기본 스키마 (supabase-profiles.sql)

| 컬럼명       | 타입         | NOT NULL | 기본값   | 비고                    |
|-------------|--------------|----------|----------|-------------------------|
| id         | UUID         | ✅ (PK)  | -        | auth.users(id) FK      |
| name       | TEXT         | -        | -        |                         |
| address    | TEXT         | -        | -        |                         |
| phone      | TEXT         | -        | -        |                         |
| updated_at | TIMESTAMPTZ  | -        | NOW()    |                         |
| full_name  | TEXT         | -        | -        | **트리거(handle_new_user)에서 사용** |

## 트리거 handle_new_user가 넣는 값

- `id` ← NEW.id (auth.users 새 행의 id)
- `full_name` ← COALESCE(metadata.full_name, metadata.name, NEW.email, '')

**필수:** profiles 테이블에 `full_name` 컬럼이 있어야 함. 없으면 "column full_name does not exist" / "Database error saving new user" 발생.  
→ 이미 테이블만 있는 경우: `supabase-profiles-add-full-name.sql` 실행.

## 기타 마이그레이션으로 추가되는 컬럼 (선택)

- full_name, is_admin, privacy_policy_agreed, agreed_at, is_withdrawn, birth_date, terms_agreed, terms_agreed_at, marketing_agreed, marketing_agreed_at, withdrawn_at 등 (supabase-schema-consent-withdrawal.sql, supabase-security-admin.sql 등)
