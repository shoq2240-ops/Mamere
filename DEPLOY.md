# 배포 시 Supabase 연결 안 될 때

## 1. 빌드는 프로젝트 폴더에서 실행

```bash
cd /Users/jaeheepark/double-negative
npm run build
```

`~`(홈)이나 다른 폴더에서 `npm run build`를 실행하면 `Missing script: "build"` 에러가 납니다. **반드시 프로젝트 루트**에서 실행하세요.

---

## 2. 배포된 사이트에서 Supabase가 안 되는 이유

Vite는 **빌드할 때** 환경 변수를 코드에 박아 넣습니다.  
`.env.local`은 보통 **git에 안 올라가고**, 배포 서버(Vercel, Netlify 등)에는 **업로드되지 않습니다.**

그래서 배포 서버에서 빌드할 때 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`가 비어 있고, 배포된 사이트는 Supabase에 연결되지 않습니다.

---

## 3. 해결: 배포 플랫폼에 환경 변수 설정

배포하는 곳(Vercel, Netlify, GitHub Pages 등)의 **설정 → Environment Variables**에서 아래 두 개를 추가하세요.

| 이름 | 값 |
|------|-----|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` (본인 프로젝트 URL) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public 키 |

- **Vercel**: Project → Settings → Environment Variables  
- **Netlify**: Site → Site configuration → Environment variables  
- **기타**: 해당 서비스 문서에서 "Environment Variables" 검색

저장 후 **한 번 다시 배포(Redeploy)** 해야 적용됩니다.

---

## 4. 로컬에서 빌드 테스트

```bash
cd /Users/jaeheepark/double-negative
npm run build
npm run preview
```

`http://localhost:4173` 에서 프로덕션 빌드가 Supabase에 잘 연결되는지 확인할 수 있습니다. (로컬에는 `.env.local`이 있으므로 동작합니다.)
