/**
 * 결제 검증 API (Supabase Edge Function)
 *
 * [환경 변수 설정]
 * Supabase Dashboard > Edge Functions > verify-payment > Secrets 에서 설정:
 * - PORTONE_API_KEY: 포트원(아임포트) REST API Key (콘솔에서 발급)
 * - PORTONE_API_SECRET: 포트원 REST API Secret (절대 클라이언트에 노출 금지)
 *
 * (선택) 서버에서 Supabase에 주문/재고 저장 시:
 * - SUPABASE_SERVICE_ROLE_KEY: 프로젝트 설정 > API > service_role key (RLS 우회용)
 *   Edge Function 기본 배포 시 프로젝트에 연결되어 있으면 자동 주입될 수 있음.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 포트원(아임포트) API: 결제 조회용 (서버 투 서버)
const IAMPORT_GET_TOKEN_URL = 'https://api.iamport.kr/users/getToken';
const IAMPORT_GET_PAYMENTS_URL = 'https://api.iamport.kr/payments';

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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body: VerifyPaymentBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { paymentId, expectedAmount, orderPayload, isGuest, guestEmail, userId } = body;
  if (!paymentId || expectedAmount == null || !orderPayload?.items?.length) {
    return new Response(JSON.stringify({ error: 'paymentId, expectedAmount, orderPayload required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const apiKey = Deno.env.get('PORTONE_API_KEY');
  const apiSecret = Deno.env.get('PORTONE_API_SECRET');
  if (!apiKey || !apiSecret) {
    console.error('PORTONE_API_KEY or PORTONE_API_SECRET not set');
    return new Response(JSON.stringify({ error: '결제 검증 설정이 없습니다.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 1) 포트원(아임포트) 액세스 토큰 발급
  let tokenRes: Response;
  try {
    tokenRes = await fetch(IAMPORT_GET_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imp_key: apiKey, imp_secret: apiSecret }),
    });
  } catch (e) {
    console.error('PortOne getToken failed:', e);
    return new Response(JSON.stringify({ error: '결제 서버 조회 실패' }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData?.response?.access_token ?? tokenData?.access_token;
  if (!accessToken) {
    console.error('PortOne token response:', tokenData);
    return new Response(JSON.stringify({ error: '결제 인증 실패' }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 2) 결제 건 조회 (merchant_uid = 우리가 보낸 paymentId)
  let payRes: Response;
  try {
    payRes = await fetch(`${IAMPORT_GET_PAYMENTS_URL}?merchant_uid[]=${encodeURIComponent(paymentId)}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (e) {
    console.error('PortOne getPayments failed:', e);
    return new Response(JSON.stringify({ error: '결제 조회 실패' }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const payData = await payRes.json();
  const list = payData?.response ?? payData?.payments ?? (Array.isArray(payData) ? payData : []);
  const arr = Array.isArray(list) ? list : [];
  const payment = arr.find((p: { merchant_uid?: string }) => p?.merchant_uid === paymentId) ?? arr[0];
  const actualAmount = payment?.amount ?? payment?.totalAmount;
  const status = payment?.status ?? payment?.paymentStatus;

  if (!payment || status !== 'paid') {
    return new Response(
      JSON.stringify({ error: '결제가 완료된 건이 아니거나 조회되지 않습니다.' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // 3) 금액 일치 검증 (악의적 조작 방지)
  if (Number(actualAmount) !== Number(expectedAmount)) {
    return new Response(
      JSON.stringify({ error: '위조된 결제 시도' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // 4) 검증 성공 → DB 업데이트 뼈대: orders 저장 + 재고 차감
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // 재고 차감: deduct_stock RPC 존재 시 호출 (뼈대)
    for (const item of orderPayload.items) {
      const qty = Math.max(1, Math.min(99, Number(item.quantity) || 1));
      const { error: stockError } = await supabase.rpc('deduct_stock', {
        p_product_id: item.id,
        p_quantity: qty,
      });
      if (stockError) {
        console.error('deduct_stock error:', stockError);
        await supabase.from('orders').update({ status: '취소됨' }).eq('id', inserted?.id);
        return new Response(
          JSON.stringify({ error: '재고 반영 중 오류가 발생하여 주문이 취소되었습니다.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
  }
  // SUPABASE_SERVICE_ROLE_KEY 없으면 주문/재고 저장 생략 (검증만 수행)

  return new Response(
    JSON.stringify({ success: true, orderNumber }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
