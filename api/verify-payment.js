/**
 * 포트원 V2 결제 검증 (Vercel Serverless)
 * POST JSON: { paymentId, expectedAmount?, completeOrder? }
 * completeOrder가 있으면 SUPABASE_SERVICE_ROLE_KEY로 주문 저장 + deduct_stock_by_id
 *
 * 환경 변수: PORTONE_API_SECRET, SUPABASE_URL(또는 VITE_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY
 * 선택: ALLOWED_ORIGINS(쉼표 구분), SITE_ORIGIN(단일 허용 오리진)
 */

import { runVerifyPayment } from '../server/verify-payment-core.mjs';

export default async function handler(req, res) {
  const origin = req.headers.origin;

  let body = {};
  if (req.method === 'POST') {
    const raw = req.body;
    if (typeof raw === 'string') {
      try {
        body = JSON.parse(raw || '{}');
      } catch {
        return res.status(400).json({ status: 'fail', message: '요청 본문이 유효한 JSON이 아닙니다.' });
      }
    } else if (raw && typeof raw === 'object') {
      body = raw;
    }
  }

  const out = await runVerifyPayment({
    method: req.method,
    origin,
    authHeader: typeof req.headers.authorization === 'string' ? req.headers.authorization : undefined,
    body,
    env: process.env,
  });

  for (const [k, v] of Object.entries(out.headers ?? {})) {
    if (v != null) res.setHeader(k, v);
  }
  return res.status(out.statusCode).json(out.body);
}
