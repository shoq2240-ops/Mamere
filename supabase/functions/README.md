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
