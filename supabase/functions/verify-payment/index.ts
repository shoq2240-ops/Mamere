/**
 * 결제 검증 API (Supabase Edge Function)
 *
 * Secrets:
 * - PORTONE_API_KEY, PORTONE_API_SECRET (아임포트 REST)
 * - SUPABASE_SERVICE_ROLE_KEY (선택, 주문/재고 처리)
 * 선택: ALLOWED_ORIGINS (쉼표 구분), SITE_ORIGIN
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function resolveAllowedOrigin(origin: string | null): string | null {
  const explicit = Deno.env.get('ALLOWED_ORIGINS')?.trim();
  const list = explicit
    ? explicit
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  if (list.length > 0) return origin && list.includes(origin) ? origin : null;

  const siteOrigin = Deno.env.get('SITE_ORIGIN')?.trim().replace(/\/$/, '');
  if (siteOrigin && origin === siteOrigin) return origin;

  const vercelUrl = Deno.env.get('VERCEL_URL');
  if (vercelUrl && origin) {
    const cand = [`https://${vercelUrl}`, `http://${vercelUrl}`];
    if (cand.includes(origin)) return origin;
  }

  const prod = Deno.env.get('NODE_ENV') === 'production';
  const onVercel = Deno.env.get('VERCEL') === '1';
  if (!prod || !onVercel) {
    if (!origin) return '*';
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) return origin;
    return '*';
  }

  return null;
}

function corsHeaders(allowOrigin: string | null) {
  if (!allowOrigin) return {};
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    Vary: 'Origin',
  };
}

interface VerifyPaymentBody {
  paymentId: string;
  expectedAmount: number;
  orderPayload: {
    items: Array<{ id: number | string; name: string; price: number; quantity: number; image?: string | null }>;
    customer_name: string;
    shipping_name: string;
    phone: string;
    shipping_phone: string;
    address: string;
    shipping_address: string;
  };
  isGuest: boolean;
  guestEmail?: string | null;
  userId?: string | null;
}

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin');
  const allowOrigin = resolveAllowedOrigin(origin);
  const ch = corsHeaders(allowOrigin);

  if (req.method === 'OPTIONS') {
    if (!allowOrigin) return new Response('Forbidden', { status: 403 });
    return new Response('ok', { headers: ch });
  }

  if (!allowOrigin) {
    return new Response(JSON.stringify({ error: '허용되지 않은 출처입니다. ALLOWED_ORIGINS 또는 SITE_ORIGIN을 설정하세요.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }

  let body: VerifyPaymentBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }

  const { paymentId, expectedAmount, orderPayload, isGuest, guestEmail, userId } = body;
  if (!paymentId || expectedAmount == null || !orderPayload?.items?.length) {
    return new Response(JSON.stringify({ error: 'paymentId, expectedAmount, orderPayload required' }), {
      status: 400,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }

  const apiKey = Deno.env.get('PORTONE_API_KEY');
  const apiSecret = Deno.env.get('PORTONE_API_SECRET');
  if (!apiKey || !apiSecret) {
    console.error('PORTONE_API_KEY or PORTONE_API_SECRET not set');
    return new Response(JSON.stringify({ error: '결제 검증 설정이 없습니다.' }), {
      status: 500,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }

  let tokenRes: Response;
  try {
    tokenRes = await fetch('https://api.iamport.kr/users/getToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imp_key: apiKey, imp_secret: apiSecret }),
    });
  } catch (e) {
    console.error('PortOne getToken failed:', e);
    return new Response(JSON.stringify({ error: '결제 서버 조회 실패' }), {
      status: 502,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData?.response?.access_token ?? tokenData?.access_token;
  if (!accessToken) {
    console.error('PortOne token response:', tokenData);
    return new Response(JSON.stringify({ error: '결제 인증 실패' }), {
      status: 502,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }

  let payRes: Response;
  try {
    payRes = await fetch(
      `https://api.iamport.kr/payments?merchant_uid[]=${encodeURIComponent(paymentId)}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
  } catch (e) {
    console.error('PortOne getPayments failed:', e);
    return new Response(JSON.stringify({ error: '결제 조회 실패' }), {
      status: 502,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }

  const payData = await payRes.json();
  const list = payData?.response ?? payData?.payments ?? (Array.isArray(payData) ? payData : []);
  const arr = Array.isArray(list) ? list : [];
  const payment = arr.find((p: { merchant_uid?: string }) => p?.merchant_uid === paymentId) ?? arr[0];
  const actualAmount = payment?.amount ?? payment?.totalAmount;
  const status = payment?.status ?? payment?.paymentStatus;

  if (!payment || status !== 'paid') {
    return new Response(JSON.stringify({ error: '결제가 완료된 건이 아니거나 조회되지 않습니다.' }), {
      status: 400,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }

  if (Number(actualAmount) !== Number(expectedAmount)) {
    return new Response(JSON.stringify({ error: '위조된 결제 시도' }), {
      status: 400,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }

  const orderNumber = `DN-${Date.now().toString().slice(-10)}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (supabaseUrl && serviceRoleKey) {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const orderRow = {
      user_id: userId || null,
      is_guest: !!isGuest,
      guest_email: isGuest ? (guestEmail ?? null) : null,
      order_number: orderNumber,
      items: orderPayload.items,
      status: '결제완료',
      customer_name: orderPayload.customer_name,
      shipping_name: orderPayload.shipping_name,
      phone: orderPayload.phone,
      shipping_phone: orderPayload.shipping_phone,
      total_price: expectedAmount,
      total_amount: expectedAmount,
      address: orderPayload.address,
      shipping_address: orderPayload.shipping_address,
    };
    const { data: inserted, error: orderError } = await supabase.from('orders').insert(orderRow).select('id').single();

    if (orderError) {
      console.error('orders insert error:', orderError);
      return new Response(JSON.stringify({ error: '주문 저장에 실패했습니다.' }), {
        status: 500,
        headers: { ...ch, 'Content-Type': 'application/json' },
      });
    }

    for (const item of orderPayload.items) {
      const qty = Math.max(1, Math.min(99, Number(item.quantity) || 1));
      const { error: stockError } = await supabase.rpc('deduct_stock_by_id', {
        p_product_id: String(item.id),
        p_quantity: qty,
      });
      if (stockError) {
        console.error('deduct_stock_by_id error:', stockError);
        await supabase.from('orders').update({ status: '취소됨' }).eq('id', inserted?.id);
        return new Response(
          JSON.stringify({ error: '재고 반영 중 오류가 발생하여 주문이 취소되었습니다.' }),
          { status: 500, headers: { ...ch, 'Content-Type': 'application/json' } },
        );
      }
    }
  }

  return new Response(JSON.stringify({ success: true, orderNumber }), {
    status: 200,
    headers: { ...ch, 'Content-Type': 'application/json' },
  });
});
