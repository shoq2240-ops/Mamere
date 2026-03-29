/**
 * Vercel Serverless Function: 결제 검증 및 주문/재고 DB 업데이트
 *
 * POST body: paymentId, cartItems(또는 orderPayload.items), orderPayload(선택). 서버에서 cartItems 기준 DB 단가로 총액 계산 후 포트원 실제 결제 금액과 비교.
 *
 * [Vercel 환경 변수]
 * - PORTONE_API_KEY / PORTONE_API_SECRET: 아임포트(V1) REST API(imp_key/imp_secret) — imp_uid + merchant_uid 수신 후 결제 조회·검증
 * - PORTONE_API_SECRET: 포트원 V2 API Secret (paymentId + 장바구니 검증 분기)
 * - VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: 주문 저장 시 필요
 *
 * [orders.payment_id] Supabase에서 supabase-orders-payment-id.sql 실행 후 사용 가능
 */

import { createClient } from '@supabase/supabase-js';

const PORTONE_PAYMENTS_URL = 'https://api.portone.io/payments';
const IAMPORT_GET_TOKEN_URL = 'https://api.iamport.kr/users/getToken';
const IAMPORT_PAYMENT_URL = 'https://api.iamport.kr/payments';

function allowCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  allowCors(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: 'POST 요청만 허용됩니다.',
      details: null,
    });
  }

  const body = req.body || {};
  const impUidV1 = body.imp_uid != null ? String(body.imp_uid).trim() : '';
  const merchantUidV1 = body.merchant_uid != null ? String(body.merchant_uid).trim() : '';
  const {
    paymentId,
    cartItems,
    orderPayload,
    shippingAddress: shippingAddressFromBody,
    isGuest,
    guestEmail,
    userId,
  } = body;

  // —— 포트원(아임포트) V1: imp_uid + merchant_uid 수신 → 토큰 → 결제 조회 → amount 1000 & status paid (DB 없음) ——
  if (impUidV1 && merchantUidV1) {
    try {
      const impKey = process.env.PORTONE_API_KEY;
      const impSecret = process.env.PORTONE_API_SECRET;
      if (!impKey || !impSecret) {
        console.error('[verify-payment V1] PORTONE_API_KEY 또는 PORTONE_API_SECRET 미설정');
        return res.status(500).json({
          message:
            '서버 환경 변수 PORTONE_API_KEY, PORTONE_API_SECRET 을 Vercel(또는 실행 환경)에 설정해 주세요.',
        });
      }

      let tokenRes;
      try {
        tokenRes = await fetch(IAMPORT_GET_TOKEN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imp_key: impKey, imp_secret: impSecret }),
        });
      } catch (e) {
        console.error('[verify-payment V1] getToken 네트워크 오류:', e);
        return res.status(500).json({
          message: `아임포트 토큰 요청 실패(네트워크): ${e?.message ?? String(e)}`,
        });
      }

      let tokenJson = {};
      try {
        tokenJson = await tokenRes.json();
      } catch (e) {
        console.error('[verify-payment V1] getToken JSON 파싱 실패:', e);
        return res.status(500).json({
          message: '아임포트 토큰 응답을 JSON으로 읽을 수 없습니다.',
        });
      }

      if (!tokenRes.ok) {
        console.error('[verify-payment V1] getToken HTTP 오류:', tokenRes.status, tokenJson);
        return res.status(500).json({
          message: `아임포트 액세스 토큰 발급 실패 (HTTP ${tokenRes.status}): ${tokenJson?.message ?? JSON.stringify(tokenJson)}`,
        });
      }

      const accessToken = tokenJson?.response?.access_token ?? tokenJson?.access_token;
      if (!accessToken) {
        console.error('[verify-payment V1] getToken 응답에 access_token 없음:', tokenJson);
        return res.status(500).json({
          message: `아임포트 액세스 토큰을 받지 못했습니다: ${tokenJson?.message ?? '응답에 access_token 없음'}`,
        });
      }

      const paymentUrl = `${IAMPORT_PAYMENT_URL}/${encodeURIComponent(impUidV1)}`;
      let payRes;
      try {
        payRes = await fetch(paymentUrl, {
          method: 'GET',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        });
      } catch (e) {
        console.error('[verify-payment V1] 결제 조회 네트워크 오류:', e);
        return res.status(500).json({
          message: `결제 상세 조회 요청 실패(네트워크): ${e?.message ?? String(e)}`,
        });
      }

      let payJson = {};
      try {
        payJson = await payRes.json();
      } catch (e) {
        console.error('[verify-payment V1] 결제 조회 JSON 파싱 실패:', e);
        return res.status(500).json({
          message: '결제 조회 응답을 JSON으로 읽을 수 없습니다.',
        });
      }

      if (!payRes.ok) {
        console.error('[verify-payment V1] 결제 조회 HTTP 오류:', payRes.status, payJson);
        return res.status(500).json({
          message: `결제 상세 조회 실패 (HTTP ${payRes.status}): ${payJson?.message ?? JSON.stringify(payJson)}`,
        });
      }

      const pay = payJson?.response ?? payJson;
      if (!pay || pay.amount == null) {
        console.error('[verify-payment V1] 결제 payload 없음 또는 amount 없음:', payJson);
        return res.status(500).json({
          message: '아임포트 결제 응답에 유효한 결제 정보가 없습니다.',
        });
      }

      const paidAmount = Number(pay.amount);
      const paidStatus = String(pay.status ?? '').toLowerCase();
      const EXPECTED_TEST_AMOUNT = 1000;

      if (paidAmount === EXPECTED_TEST_AMOUNT && paidStatus === 'paid') {
        return res.status(200).json({ status: 'success', message: '검증 성공' });
      }

      console.error('[verify-payment V1] 검증 실패 (금액·상태)', {
        imp_uid: impUidV1,
        merchant_uid_post: merchantUidV1,
        paidAmount,
        paidStatus,
        iamport_merchant_uid: pay.merchant_uid,
      });
      return res.status(400).json({
        status: 'fail',
        message: '금액 위조 또는 미결제 상태입니다.',
      });
    } catch (err) {
      console.error('[verify-payment V1] 처리 중 예외:', err);
      return res.status(500).json({
        message: err?.message ?? '서버에서 예기치 않은 오류가 발생했습니다.',
      });
    }
  }

  // 배송지: shippingAddress 객체 우선, 없으면 orderPayload에서 복원
  const shippingAddress = shippingAddressFromBody ?? (orderPayload && {
    name: orderPayload.customer_name ?? orderPayload.shipping_name,
    phone: orderPayload.phone ?? orderPayload.shipping_phone,
    address: orderPayload.address ?? orderPayload.shipping_address,
    detailAddress: orderPayload.detail_address ?? '',
    zipCode: orderPayload.zip_code ?? '',
  });

  const items = Array.isArray(cartItems) && cartItems.length > 0
    ? cartItems
    : orderPayload?.items;
  if (!paymentId || !items?.length) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'paymentId, cartItems(또는 orderPayload.items) 가 필요합니다.',
      details: { hasPaymentId: !!paymentId, hasItems: !!(items?.length) },
    });
  }

  // 디버깅: 클라이언트에서 받은 cartItems 구조 확인 (Vercel 로그에서 확인)
  console.log('클라이언트에서 받은 cartItems:', JSON.stringify(items.map((it) => ({
    id: it?.id,
    product_id: it?.product_id,
    quantity: it?.quantity,
    keys: it ? Object.keys(it) : [],
  }))));

  const MAX_ITEMS = 50;
  const MAX_QUANTITY = 99;
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  // Supabase products.id: UUID 또는 BIGINT 모두 수용. id / product_id 키 모두 수용
  const normalizeId = (raw) => {
    if (raw == null || raw === '') return null;
    const s = typeof raw === 'string' ? raw.trim() : String(raw);
    if (UUID_REGEX.test(s)) return s;
    const n = typeof raw === 'number' ? raw : Number(raw);
    return Number.isNaN(n) || n < 1 ? null : n;
  };
  const sanitizedItems = items.slice(0, MAX_ITEMS).map((it) => {
    const id = normalizeId(it.id ?? it.product_id);
    const qty = Math.max(1, Math.min(MAX_QUANTITY, Math.floor(Number(it.quantity) || 1)));
    return { id, quantity: qty };
  }).filter((it) => it.id != null);
  if (sanitizedItems.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid Cart Items',
      message: '유효한 상품이 없습니다. 장바구니 상품 ID 형식(id 또는 product_id)을 확인하세요.',
      details: { receivedCount: items?.length ?? 0, sanitizedCount: 0 },
    });
  }

  const secret = process.env.PORTONE_API_SECRET;
  if (!secret) {
    return res.status(500).json({
      success: false,
      error: 'Server Configuration Error',
      message: '결제 검증 설정이 없습니다.',
      details: 'PORTONE_API_SECRET 환경변수가 서버에 설정되지 않았습니다.',
    });
  }

  // Supabase 클라이언트: Vite에서 쓰는 변수명과 동일하게 서버에서 읽음
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    const state = { hasUrl: !!supabaseUrl, hasKey: !!supabaseServiceKey };
    console.error('환경변수 누락 상태:', state);
    return res.status(500).json({
      success: false,
      error: 'Server Configuration Error',
      message: 'Supabase API 키 또는 URL이 서버 환경변수에 설정되지 않았습니다.',
      details: state,
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, { db: { schema: 'public' } });

  // 1) 서버에서 cartItems의 상품 ID 기준 DB 단가 조회 (products.id = UUID 또는 BIGINT, 컬럼 id, price, stock_quantity)
  const productIds = [...new Set(sanitizedItems.map((it) => it.id))];
  const { data: dbProducts, error: productsError } = await supabase
    .from('products')
    .select('id, price, stock_quantity')
    .in('id', productIds);

  // 디버깅: DB에서 조회된 상품 (Vercel 로그에서 확인)
  console.log('DB에서 조회된 products:', dbProducts ? JSON.stringify(dbProducts.map((p) => ({ id: p?.id, price: p?.price, typeOfId: typeof p?.id }))) : dbProducts, 'productsError:', productsError?.message ?? productsError);

  if (productsError || !dbProducts?.length) {
    return res.status(400).json({
      success: false,
      error: 'Supabase Query Error',
      message: productsError?.message ?? '상품 정보를 확인할 수 없습니다.',
      details: productsError ? { code: productsError.code, hint: productsError.hint, details: productsError.details } : { dbProductsLength: dbProducts?.length ?? 0 },
    });
  }

  // id를 키로 사용 (UUID 문자열 또는 숫자 모두 매칭되도록 id 그대로 사용)
  const priceById = Object.fromEntries(
    dbProducts.map((p) => [p.id, Math.max(0, Number(p.price) || 0)])
  );
  let serverTotal = 0;
  const orderItemsForDb = [];
  for (const it of sanitizedItems) {
    const unitPrice = priceById[it.id] ?? priceById[String(it.id)];
    if (unitPrice == null) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Product',
        message: '존재하지 않는 상품이 포함되어 있습니다.',
        details: { productId: it.id },
      });
    }
    serverTotal += unitPrice * it.quantity;
    const orig = items.find((i) => {
      const n = normalizeId(i.id ?? i.product_id);
      return n === it.id || (n != null && it.id != null && String(n) === String(it.id));
    });
    orderItemsForDb.push({
      id: it.id,
      quantity: it.quantity,
      price: unitPrice,
      name: (orig?.name ?? '').slice(0, 200),
      image: (orig?.image ?? null)?.slice(0, 2048) ?? null,
    });
  }

  // 2) 포트원 V2 REST API로 실제 결제 금액·상태 조회
  let portOneRes;
  try {
    portOneRes = await fetch(`${PORTONE_PAYMENTS_URL}/${encodeURIComponent(paymentId)}`, {
      method: 'GET',
      headers: {
        Authorization: `PortOne ${secret}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (e) {
    console.error('PortOne fetch error:', e);
    return res.status(502).json({
      success: false,
      error: 'PortOne Request Failed',
      message: e?.message ?? '결제 조회 요청 실패',
      details: String(e),
    });
  }

  const portOneData = await portOneRes.json().catch(() => ({}));
  const actualAmount =
    portOneData?.amount?.total ?? portOneData?.amount ?? portOneData?.totalAmount;
  const status = (portOneData?.status ?? portOneData?.paymentStatus ?? '').toUpperCase();

  if (portOneRes.status !== 200 || !portOneData) {
    return res.status(400).json({
      success: false,
      error: 'PortOne Validation Error',
      message: '결제 정보를 가져올 수 없습니다.',
      details: { portOneStatus: portOneRes.status, portOneData: portOneData ?? null },
    });
  }

  if (status !== 'PAID') {
    return res.status(400).json({
      success: false,
      error: 'PortOne Validation Error',
      message: '결제가 완료된 건이 아닙니다.',
      details: { status },
    });
  }

  // 총 결제 금액 검증: 포트원 amount.total = 상품 소계 + 배송비(3만원 미만 시 3000원)
  const FREE_SHIPPING_THRESHOLD = 30000;
  const DEFAULT_SHIPPING_FEE = 3000;
  const serverShippingFee = serverTotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_FEE;
  const expectedTotal = serverTotal + serverShippingFee;
  const actual = Number(actualAmount);
  if (actual !== expectedTotal) {
    return res.status(400).json({
      success: false,
      error: 'Amount Mismatch',
      message: '결제 금액이 일치하지 않습니다.',
      details: { expectedTotal, actual, serverTotal, serverShippingFee },
    });
  }

  // 3) 주문 INSERT — Supabase orders 테이블 컬럼과 1:1 매칭
  // [체크리스트] payment_id: 포트원 paymentId | total_amount: 결제 금액 | items: 장바구니 JSON | address/detail_address: 배송지
  const orderNumber = `DN-${Date.now().toString().slice(-10)}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const totalAmountToStore = serverTotal + serverShippingFee;

  const orderRow = {
    payment_id: paymentId,
    total_amount: totalAmountToStore,
    status: 'PAID',
    items: orderItemsForDb,
    customer_name: (shippingAddress?.name ?? orderPayload?.customer_name ?? '').toString().trim().slice(0, 100) || null,
    phone: (shippingAddress?.phone ?? orderPayload?.phone ?? '').toString().trim().slice(0, 20) || null,
    address: (shippingAddress?.address ?? orderPayload?.address ?? '').toString().trim().slice(0, 500) || null,
    detail_address: (shippingAddress?.detailAddress ?? orderPayload?.detail_address ?? '').toString().trim().slice(0, 300) || null,
    zip_code: (shippingAddress?.zipCode ?? orderPayload?.zip_code ?? '').toString().trim().slice(0, 20) || null,
    user_id: userId || null,
    is_guest: !!isGuest,
    guest_email: isGuest ? guestEmail || null : null,
    order_number: orderNumber,
  };

  const { data: inserted, error: orderError } = await supabase
    .from('orders')
    .insert(orderRow)
    .select('id')
    .single();

  if (orderError) {
    console.error('Supabase orders insert error:', orderError);
    return res.status(500).json({
      success: false,
      error: 'Supabase Query Error',
      message: orderError?.message ?? '주문 저장에 실패했습니다.',
      details: { code: orderError.code, hint: orderError.hint, details: orderError.details },
    });
  }

  // 4) 재고 차감 — 주문 INSERT 성공 후에만 실행 (순서 보장). deduct_stock_by_id(TEXT, INTEGER) 단일 시그니처로 후보 충돌 방지
  for (const item of sanitizedItems) {
    const p_product_id = item.id != null ? String(item.id) : '';
    const p_quantity = Math.max(1, Math.min(99, Math.floor(Number(item.quantity) || 1)));
    const { error: stockError } = await supabase.rpc('deduct_stock_by_id', {
      p_product_id,
      p_quantity,
    });

    if (stockError) {
      await supabase.from('orders').update({ status: '취소됨' }).eq('id', inserted?.id);
      const isStock = (stockError.message || '').toUpperCase().includes('INSUFFICIENT_STOCK');
      const userMessage = isStock
        ? '재고가 부족하여 주문이 취소되었습니다.'
        : '주문은 기록되었으나 재고 업데이트에 문제가 발생했습니다. 고객센터로 문의해 주세요.';
      console.error('재고 차감 실패:', {
        message: stockError?.message,
        code: stockError?.code,
        productId: item.id,
        orderId: inserted?.id,
        note: '주문은 취소됨으로 업데이트됨',
      });
      return res.status(500).json({
        success: false,
        error: isStock ? 'Insufficient Stock' : 'Supabase RPC Error',
        message: userMessage,
        details: { code: stockError.code, hint: stockError.hint, productId: item.id },
      });
    }
  }

  return res.status(200).json({
    success: true,
    orderNumber,
    message: 'Payment verified successfully',
  });
}
