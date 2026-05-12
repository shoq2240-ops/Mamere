/**
 * Vercel / Vite dev 공용: 포트원 V2 결제 검증 + (선택) 서버측 주문 저장·재고 차감(service_role만 RPC 허용).
 */
import { createClient } from '@supabase/supabase-js';

const GUEST_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** @param {Record<string, string | undefined>} env */
export function resolveAllowedOrigin(origin, env) {
  const explicit = env.ALLOWED_ORIGINS?.trim();
  const list = explicit
    ? explicit
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  if (list.length > 0) return origin && list.includes(origin) ? origin : null;

  const siteOrigin = env.SITE_ORIGIN?.trim().replace(/\/$/, '');
  if (siteOrigin && origin === siteOrigin) return origin;

  const vercelUrl = env.VERCEL_URL;
  if (vercelUrl && origin) {
    const cand = [`https://${vercelUrl}`, `http://${vercelUrl}`];
    if (cand.includes(origin)) return origin;
  }

  const prod = env.NODE_ENV === 'production';
  const onVercel = env.VERCEL === '1';
  if (!prod || !onVercel) {
    if (!origin) return '*';
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) return origin;
    return '*';
  }

  return null;
}

export function corsHeaders(allowOrigin) {
  if (!allowOrigin) return {};
  const h = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    Vary: 'Origin',
  };
  return h;
}

async function fetchPortOnePayment(paymentId, secret) {
  const resPay = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`, {
    method: 'GET',
    headers: { Authorization: `PortOne ${secret}` },
  });
  const data = await resPay.json().catch(() => null);
  return { ok: resPay.ok, data };
}

function buildOrderRow(portData, paymentId, paidAmount, c) {
  const base = (c.shippingAddress ?? '').trim();
  const detail = (c.shippingAddressDetail ?? '').trim();
  const fullAddr = [base, detail].filter(Boolean).join(' ').trim();
  const name = (c.shippingName ?? '').trim();
  const digitsPhone = String(c.shippingPhone ?? '').replace(/\D/g, '').trim();

  return {
    order_number: paymentId,
    payment_id: portData?.id ?? paymentId,
    user_id: c.isGuest ? null : c.userId,
    is_guest: !!c.isGuest,
    guest_email: c.isGuest ? String(c.guestEmail ?? '').trim() : null,
    total_amount: paidAmount,
    customer_name: name || null,
    shipping_name: name || '고객',
    shipping_address: fullAddr || base || '—',
    shipping_phone: digitsPhone || '01000000000',
    phone: c.shippingPhone ?? null,
    address: base || null,
    detail_address: detail || null,
    zip_code: String(c.shippingZipCode ?? '').trim() || null,
    status: 'paid',
    items: c.cart,
  };
}

/**
 * @param {{ method: string, origin?: string, authHeader?: string, body: unknown, env: Record<string, string | undefined> }} ctx
 */
export async function runVerifyPayment(ctx) {
  const { method, origin, authHeader, body, env } = ctx;
  const allowOrigin = resolveAllowedOrigin(origin, env);
  const baseHeaders = { 'Content-Type': 'application/json', ...corsHeaders(allowOrigin) };

  if (method === 'OPTIONS') {
    return { statusCode: allowOrigin ? 200 : 403, headers: baseHeaders, body: {} };
  }

  if (method !== 'POST') {
    return {
      statusCode: 405,
      headers: baseHeaders,
      body: { status: 'fail', message: 'Method Not Allowed' },
    };
  }

  if (!allowOrigin) {
    return {
      statusCode: 403,
      headers: { 'Content-Type': 'application/json' },
      body: { status: 'fail', message: '허용되지 않은 출처입니다. ALLOWED_ORIGINS를 설정하세요.' },
    };
  }

  const paymentId = body?.paymentId;
  const expectedAmount = body?.expectedAmount;
  const completeOrder = body?.completeOrder;

  if (!paymentId) {
    return { statusCode: 400, headers: baseHeaders, body: { status: 'fail', message: 'paymentId가 없습니다.' } };
  }

  const secret = env.PORTONE_API_SECRET;
  if (!secret) {
    console.error('[verify-payment] PORTONE_API_SECRET 미설정');
    return { statusCode: 500, headers: baseHeaders, body: { status: 'fail', message: '서버 설정 오류' } };
  }

  const { ok: payOk, data } = await fetchPortOnePayment(String(paymentId), secret);
  if (!payOk || !data) {
    console.error('[verify-payment] 조회 실패', data);
    return {
      statusCode: 500,
      headers: baseHeaders,
      body: {
        status: 'fail',
        message: data?.message || '결제 조회에 실패했습니다.',
      },
    };
  }

  const portTotal = Number(data.amount?.total);
  const expected =
    expectedAmount != null && expectedAmount !== '' ? Number(expectedAmount) : 1000;
  const verified =
    data.status === 'PAID' && Number.isFinite(portTotal) && Number.isFinite(expected) && portTotal === expected;

  if (!verified) {
    console.error('[verify-payment] 검증 불일치', { paymentId, status: data.status, total: data.amount?.total });
    return {
      statusCode: 400,
      headers: baseHeaders,
      body: { status: 'fail', message: '금액 또는 결제 상태가 올바르지 않습니다.' },
    };
  }

  if (!completeOrder) {
    return { statusCode: 200, headers: baseHeaders, body: { status: 'success', message: 'V2 검증 성공' } };
  }

  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error('[verify-payment] SUPABASE 주문 처리: URL 또는 SERVICE_ROLE 키 없음');
    return {
      statusCode: 500,
      headers: baseHeaders,
      body: {
        status: 'fail',
        message: '결제 검증에는 성공했으나 서버 설정(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)이 없어 주문을 저장할 수 없습니다.',
      },
    };
  }

  const { isGuest, guestEmail, userId, cart, shippingName, shippingAddress, shippingAddressDetail, shippingZipCode, shippingPhone } =
    completeOrder ?? {};

  if (!Array.isArray(cart) || cart.length === 0) {
    return { statusCode: 400, headers: baseHeaders, body: { status: 'fail', message: '주문 장바구니 정보가 없습니다.' } };
  }

  if (!isGuest) {
    const token = authHeader?.replace(/^Bearer\s+/i, '')?.trim();
    if (!token) {
      return { statusCode: 401, headers: baseHeaders, body: { status: 'fail', message: '회원 결제 확인을 위해 세션이 필요합니다.' } };
    }
    const supaJwt = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: udata, error: uerr } = await supaJwt.auth.getUser(token);
    const uid = userId ?? '';
    if (uerr || !udata?.user || udata.user.id !== uid) {
      return {
        statusCode: 403,
        headers: baseHeaders,
        body: { status: 'fail', message: '본인 확인에 실패했습니다. 다시 로그인 후 시도해 주세요.' },
      };
    }
  } else if (!GUEST_EMAIL_RE.test(String(guestEmail ?? '').trim())) {
    return { statusCode: 400, headers: baseHeaders, body: { status: 'fail', message: '게스트 이메일이 필요합니다.' } };
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
    db: { schema: 'public' },
  });

  const orderPayload = {
    isGuest: !!isGuest,
    guestEmail,
    userId,
    cart,
    shippingName,
    shippingAddress,
    shippingAddressDetail,
    shippingZipCode,
    shippingPhone,
  };

  const orderRow = buildOrderRow(data, String(paymentId), portTotal, orderPayload);

  const { data: inserted, error: orderErr } = await admin.from('orders').insert(orderRow).select('id').single();

  if (orderErr) {
    console.error('[verify-payment] 주문 저장 실패', orderErr);
    return {
      statusCode: 500,
      headers: baseHeaders,
      body: {
        status: 'fail',
        message: orderErr.message || '주문 저장 중 오류가 발생했습니다. 고객센터로 문의해 주세요.',
      },
    };
  }

  const oid = inserted?.id;
  for (const item of cart) {
    const qty = Math.max(1, Math.min(99, Math.floor(Number(item.quantity) || 1)));
    const { error: stockErr } = await admin.rpc('deduct_stock_by_id', {
      p_product_id: String(item.id),
      p_quantity: qty,
    });
    if (stockErr) {
      console.error('[verify-payment] 재고 차감 실패', stockErr);
      if (oid) {
        await admin.from('orders').update({ status: '취소됨' }).eq('id', oid);
      }
      return {
        statusCode: 500,
        headers: baseHeaders,
        body: {
          status: 'fail',
          message: '재고 차감에 실패해 주문이 취소되었습니다. 결제 환불이 필요하면 고객센터로 연락해 주세요.',
        },
      };
    }
  }

  return {
    statusCode: 200,
    headers: baseHeaders,
    body: {
      status: 'success',
      message: '주문이 완료되었습니다.',
      orderNumber: String(paymentId),
    },
  };
}
