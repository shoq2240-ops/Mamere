# Supabase Edge Functions

## "Failed to fetch" 가 나올 때

- **Edge Function 미배포**: `supabase functions deploy verify-payment` 로 배포했는지 확인하세요.
- **Supabase URL/키**: `.env`의 `VITE_SUPABASE_URL`(예: `https://xxx.supabase.co`), `VITE_SUPABASE_ANON_KEY`(Supabase Dashboard > Settings > API 의 anon public 키)가 맞는지 확인하세요.
- **CORS**: 이 함수는 `Access-Control-Allow-Origin: *` 및 `POST` 메서드를 허용합니다. 배포 후 재시도하세요.

## verify-payment (결제 검증 API)

결제 완료 후 서버에서 포트원(아임포트) API로 실제 결제 금액을 조회해, 클라이언트에서 보낸 기대 금액과 일치할 때만 주문을 저장합니다.

### 배포

```bash
# Supabase CLI 설치 후 로그인
npx supabase login

# 프로젝트 링크 (최초 1회)
npx supabase link --project-ref <your-project-ref>

# 시크릿 설정 후 배포
npx supabase secrets set PORTONE_API_KEY=your_rest_api_key
npx supabase secrets set PORTONE_API_SECRET=your_rest_api_secret
npx supabase functions deploy verify-payment
```

### 환경 변수 (Secrets)

| 이름 | 설명 |
|------|------|
| `PORTONE_API_KEY` | 포트원(아임포트) 콘솔에서 발급한 REST API Key |
| `PORTONE_API_SECRET` | REST API Secret (클라이언트에 노출 금지) |
| `SUPABASE_SERVICE_ROLE_KEY` | 주문/재고 저장 시 RLS 우회용. Edge Function 배포 시 프로젝트에 연결되어 있으면 자동 주입되는 경우 있음. 없으면 Supabase Dashboard > Settings > API 에서 복사 후 `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...` |

### 동작

1. 프론트에서 `paymentId`, `expectedAmount`, `orderPayload` 등 POST
2. 포트원 API로 토큰 발급 → `GET /payments?merchant_uid[]=paymentId` 로 결제 조회
3. `amount` === `expectedAmount` 이고 `status === 'paid'` 인지 검증
4. 불일치 시 `400 { error: '위조된 결제 시도' }`
5. 일치 시 `orders` 테이블에 저장, `deduct_stock` RPC로 재고 차감 후 `200 { success: true, orderNumber }` 반환

---

## notify-inquiry-email (문의 접수 시 운영자 메일)

`ContactModal`이 `inquiries` 테이블에 INSERT 할 때, **Supabase Database Webhook**이 이 Edge Function을 호출하고, **Resend**로 운영자 수신함에 메일을 보냅니다. (기존처럼 DB 저장은 그대로입니다.)

### 1) Resend 준비

1. [Resend](https://resend.com) 가입 후 API Key 발급
2. **발신 주소(`from`)**: Resend에서 인증한 도메인이 있으면 `이름 <noreply@yourdomain.com>` 형식으로 사용. 테스트만 할 때는 Resend 기본 `onboarding@resend.dev` 를 `INQUIRY_NOTIFY_FROM`에 쓸 수 있으나, 수신 가능 주소가 제한될 수 있으니 문서를 확인하세요.

### 2) Secrets 설정

```bash
npx supabase secrets set RESEND_API_KEY=re_xxxxxxxx
npx supabase secrets set INQUIRY_NOTIFY_TO=운영자@example.com
npx supabase secrets set INQUIRY_NOTIFY_FROM="Mamere <noreply@yourdomain.com>"
# 웹훅과 동일한 값으로 임의 긴 문자열 생성
npx supabase secrets set INQUIRY_WEBHOOK_SECRET=랜덤_긴_문자열
```

### 3) 함수 배포 (웹훅은 JWT 없이 호출되므로 `--no-verify-jwt` 필수)

```bash
npx supabase functions deploy notify-inquiry-email --no-verify-jwt
```

배포 후 호출 URL 예시:

`https://<project-ref>.supabase.co/functions/v1/notify-inquiry-email`

### 4) Supabase Database Webhook 연결

1. Dashboard → **Database** → **Webhooks** (또는 **Integrations** 메뉴의 Database Webhooks)
2. **Create a new hook**
3. **Table**: `public.inquiries`
4. **Events**: `INSERT` 만 선택
5. **HTTP Request**
   - **URL**: 위 Edge Function URL
   - **HTTP Headers** 추가:
     - Name: `x-inquiry-webhook-secret`
     - Value: Secrets에 넣은 `INQUIRY_WEBHOOK_SECRET` 과 **동일한 값**
6. 저장 후, 사이트에서 문의 폼을 한 번 제출해 메일 수신을 확인합니다.

### 환경 변수 요약

| 이름 | 설명 |
|------|------|
| `RESEND_API_KEY` | Resend API 키 |
| `INQUIRY_NOTIFY_TO` | 알림을 받을 운영자 이메일 (한 주소) |
| `INQUIRY_NOTIFY_FROM` | Resend에 등록된 발신자 (도메인 인증 필요 시 해당 주소) |
| `INQUIRY_WEBHOOK_SECRET` | 웹훅 요청 헤더 `x-inquiry-webhook-secret` 과 일치해야 함 (미설정·불일치 시 401) |
