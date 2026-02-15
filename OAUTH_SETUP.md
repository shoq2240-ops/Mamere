# 카카오/구글 OAuth 로그인 설정 가이드

코드에 카카오·구글 로그인 버튼이 추가되었습니다. 아래 설정을 완료하면 사용할 수 있습니다.

---

## 1. Supabase Dashboard 설정

### Authentication > URL Configuration
- **Site URL**: 프로덕션 URL (예: `https://yoursite.com`)
- **Redirect URLs**에 다음 추가:
  - `http://localhost:5173` (개발용)
  - `http://localhost:5173/` 
  - 프로덕션 URL (예: `https://yoursite.com`, `https://yoursite.com/`)

---

## 2. Google OAuth 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 또는 선택
3. **API 및 서비스** > **사용자 인증 정보** > **사용자 인증 정보 만들기** > **OAuth 클라이언트 ID**
4. 애플리케이션 유형: **웹 애플리케이션**
5. **승인된 JavaScript 원본**에 추가:
   - `http://localhost:5173`
   - `https://yoursite.com` (프로덕션)
6. **승인된 리디렉션 URI**에 추가:
   - `https://<프로젝트ID>.supabase.co/auth/v1/callback`
   - (Supabase 프로젝트 URL 확인: Project Settings > API)
7. **클라이언트 ID**와 **클라이언트 보안 비밀** 복사

### Supabase에서 설정
- **Authentication** > **Providers** > **Google** 활성화
- Client ID, Client Secret 입력 후 저장

---

## 3. Kakao OAuth 설정

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. **내 애플리케이션** > 애플리케이션 추가
3. **앱 키**에서 **REST API 키** 확인 (= Client ID)
4. **카카오 로그인** > **활성화 설정** ON
5. **카카오 로그인** > **동의항목**: 프로필 정보(닉네임, 프로필 사진), 이메일 필수 동의
6. **카카오 로그인** > **Redirect URI** 등록:
   - `https://<프로젝트ID>.supabase.co/auth/v1/callback`
7. **카카오 로그인** > **보안** > **Client Secret** 생성 후 저장

### Supabase에서 설정
- **Authentication** > **Providers** > **Kakao** 활성화
- Client ID (REST API 키), Client Secret 입력 후 저장

---

## 4. OAuth 신규 사용자 프로필

OAuth로 처음 가입한 사용자는 `profiles` 테이블에 행이 없을 수 있습니다. 자동 생성이 필요하면 Supabase에서 다음 트리거를 추가하세요:

```sql
-- auth.users에 새 사용자 생성 시 profiles 자동 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

설정이 완료되면 로그인/회원가입 페이지에서 카카오·구글 버튼이 동작합니다.
