# Double Negative 🖤

우영미 스타일 미니멀리즘 패션 브랜드 웹사이트  
Vite + React + Tailwind CSS + Framer Motion + Supabase

## ✨ 주요 기능

- 🎨 **미니멀리즘 디자인** — 우영미 브랜드 스타일의 정갈한 UI
- ⚡ **실시간 데이터 동기화** — Supabase Realtime으로 제품 즉시 반영
- 🛍️ **쇼핑 기능** — 장바구니, 제품 상세, 검색 기능
- 📱 **반응형 디자인** — 모바일/태블릿/데스크톱 최적화
- 🎭 **부드러운 애니메이션** — Framer Motion 기반 페이지 전환

## 🚀 빠른 시작

### 1. 설치

```bash
cd double-negative
npm install
```

### 2. Supabase 설정

**⚠️ 중요:** 프로젝트 실행 전 Supabase를 설정해야 합니다!

1. `.env.example` 파일을 `.env.local`로 복사
2. [Supabase Dashboard](https://supabase.com)에서 프로젝트 생성
3. API 키를 `.env.local`에 입력

```bash
cp .env.example .env.local
# .env.local 파일을 열어 본인의 Supabase 키로 수정
```

**자세한 설정 방법은 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) 참고**

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

## 📂 프로젝트 구조

```
double-negative/
├── src/
│   ├── components/      # 재사용 컴포넌트 (Navbar, Footer 등)
│   ├── pages/           # 페이지 컴포넌트 (Landing, Shop, Cart 등)
│   ├── hooks/           # 커스텀 훅 (useProducts 등)
│   ├── lib/             # 유틸리티 (Supabase 클라이언트)
│   ├── store/           # 상태 관리 (CartContext)
│   ├── data/            # 정적 데이터 (fallback용)
│   └── App.jsx          # 메인 앱 컴포넌트
├── SUPABASE_SETUP.md    # Supabase 설정 가이드
└── .env.local           # 환경 변수 (git 제외)
```

## 🎯 스크립트

- **`npm run dev`** — 개발 서버 실행 (HMR)
- **`npm run build`** — 프로덕션 빌드 (`dist/`)
- **`npm run preview`** — 빌드 결과물 미리보기

## 🛠️ 기술 스택

### Frontend
- **Vite** — 초고속 빌드 도구
- **React 18** — UI 라이브러리
- **Tailwind CSS** — 유틸리티 우선 CSS
- **Framer Motion** — 애니메이션 라이브러리
- **React Router** — 페이지 라우팅
- **Lucide React** — 아이콘 세트

### Backend
- **Supabase** — PostgreSQL + Realtime + Auth
  - 실시간 데이터베이스
  - Row Level Security (RLS)
  - RESTful API

### Typography
- **Noto Sans KR** — 한글 본문 폰트

## 📦 제품 관리

### Supabase Dashboard에서 제품 추가하기

1. Supabase Dashboard > **Table Editor** > `products` 테이블
2. **Insert row** 클릭
3. 제품 정보 입력:
   - `name`: 제품명 (예: "OVERSIZED TRENCH COAT")
   - `price`: 가격 (숫자만, 예: 1200000)
   - `image`: 이미지 URL
   - `category`: "men" 또는 "women"
4. 저장하면 **웹사이트에 즉시 반영** ✨

### 실시간 동기화

- 제품 추가/수정/삭제 시 자동으로 모든 사용자 화면에 반영
- 새로고침 없이 실시간 업데이트
- Supabase Realtime 채널 구독 활용

## 🎨 디자인 철학

**"더블 네거티브"** — 두 번의 부정을 통한 본질의 회복

- **미니멀리즘**: 불필요한 요소 제거
- **모노톤**: 검은색/흰색 기반 + 보라색 악센트
- **여백의 미**: 넓은 간격과 깊이 있는 레이아웃
- **타이포그래피**: Noto Sans KR로 정갈한 한글 표현
- **절제된 애니메이션**: 부드럽고 의미 있는 전환

## 🔒 보안

- `.env.local` 파일은 git에 포함되지 않음
- Supabase RLS(Row Level Security)로 데이터 보호
- 읽기는 public, 쓰기는 authenticated 사용자만 가능

## 📝 라이선스

MIT License

---

**Made with 🖤 by Double Negative Studio**
