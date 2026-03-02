/**
 * Vercel Serverless Function: 결제 검증 및 주문/재고 DB 업데이트
 *
 * POST body: paymentId, cartItems(또는 orderPayload.items), orderPayload(선택). 서버에서 cartItems 기준 DB 단가로 총액 계산 후 포트원 실제 결제 금액과 비교.
 *
 * [Vercel 환경 변수]
 * - PORTONE_API_SECRET: 포트원 V2 API Secret
 * - VITE_SUPABASE_URL: Supabase Project URL (https://xxx.supabase.co)
 * - SUPABASE_SERVICE_ROLE_KEY: Supabase service_role 키 (RLS 우회)
 *
 * [orders.payment_id] Supabase에서 supabase-orders-payment-id.sql 실행 후 사용 가능
 */

import { createClient } from '@supabase/supabase-js';

const PORTONE_PAYMENTS_URL = 'https://api.portone.io/payments';

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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const {
    paymentId,
    cartItems,
    orderPayload,
    isGuest,
    guestEmail,
    userId,
  } = body;

  const items = Array.isArray(cartItems) && cartItems.length > 0
    ? cartItems
    : orderPayload?.items;
  if (!paymentId || !items?.length) {
    return res.status(400).json({
      success: false,
      error: 'paymentId, cartItems(또는 orderPayload.items) 가 필요합니다.',
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
    return res.status(400).json({ success: false, error: '유효한 상품이 없습니다.' });
  }

  const secret = process.env.PORTONE_API_SECRET;
  if (!secret) {
    return res.status(500).json({ success: false, error: '결제 검증 설정이 없습니다.' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ success: false, error: 'DB 설정이 없습니다.' });
  }
  const supabase = createClient(supabaseUrl, serviceRoleKey, { db: { schema: 'public' } });

  // 1) 서버에서 cartItems의 상품 ID 기준 DB 단가 조회 (products.id = UUID 또는 BIGINT, 컬럼 id, price, stock_quantity)
  const productIds = [...new Set(sanitizedItems.map((it) => it.id))];
  const { data: dbProducts, error: productsError } = await supabase
    .from('products')
    .select('id, price, stock_quantity')
    .in('id', productIds);

  // 디버깅: DB에서 조회된 상품 (Vercel 로그에서 확인)
  console.log('DB에서 조회된 products:', dbProducts ? JSON.stringify(dbProducts.map((p) => ({ id: p?.id, price: p?.price, typeOfId: typeof p?.id }))) : dbProducts, 'productsError:', productsError?.message ?? productsError);

  if (productsError || !dbProducts?.length) {
    return res.status(400).json({ success: false, error: '상품 정보를 확인할 수 없습니다.' });
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
      return res.status(400).json({ success: false, error: '존재하지 않는 상품이 포함되어 있습니다.' });
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
    return res.status(502).json({ success: false, error: '결제 조회 요청 실패' });
  }

  const portOneData = await portOneRes.json().catch(() => ({}));
  const actualAmount =
    portOneData?.amount?.total ?? portOneData?.amount ?? portOneData?.totalAmount;
  const status = (portOneData?.status ?? portOneData?.paymentStatus ?? '').toUpperCase();

  if (portOneRes.status !== 200 || !portOneData) {
    return res.status(400).json({
      success: false,
      error: '결제 정보를 가져올 수 없습니다.',
    });
  }

  if (status !== 'PAID') {
    return res.status(400).json({
      success: false,
      error: '결제가 완료된 건이 아닙니다.',
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
      error: '결제 금액이 일치하지 않습니다.',
    });
  }

  // 3) 주문 INSERT (서버 계산 총액만 사용)
  const orderNumber = `DN-${Date.now().toString().slice(-10)}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const orderRow = {
    payment_id: paymentId,
    user_id: userId || null,
    is_guest: !!isGuest,
    guest_email: isGuest ? guestEmail || null : null,
    order_number: orderNumber,
    items: orderItemsForDb,
    status: '결제완료',
    customer_name: (orderPayload?.customer_name ?? '').slice(0, 100) || null,
    shipping_name: (orderPayload?.shipping_name ?? '').slice(0, 100) || null,
    phone: (orderPayload?.phone ?? '').slice(0, 20) || null,
    shipping_phone: (orderPayload?.shipping_phone ?? '').slice(0, 20) || null,
    total_price: serverTotal,
    total_amount: serverTotal,
    address: (orderPayload?.address ?? '').slice(0, 500) || null,
    shipping_address: (orderPayload?.shipping_address ?? '').slice(0, 500) || null,
  };

  const { data: inserted, error: orderError } = await supabase
    .from('orders')
    .insert(orderRow)
    .select('id')
    .single();

  if (orderError) {
    return res.status(500).json({ success: false, error: '주문 저장에 실패했습니다.' });
  }

  // 4) 재고 차감 (deduct_stock RPC: UUID/BIGINT 공통으로 TEXT 인자 전달)
  for (const item of sanitizedItems) {
    const { error: stockError } = await supabase.rpc('deduct_stock', {
      p_product_id: String(item.id),
      p_quantity: item.quantity,
    });

    if (stockError) {
      await supabase.from('orders').update({ status: '취소됨' }).eq('id', inserted?.id);
      const msg =
        (stockError.message || '').toUpperCase().includes('INSUFFICIENT_STOCK')
          ? '재고가 부족하여 주문이 취소되었습니다.'
          : '재고 반영 중 오류가 발생하여 주문이 취소되었습니다.';
      return res.status(500).json({ success: false, error: msg });
    }
  }

  return res.status(200).json({
    success: true,
    orderNumber,
    message: 'Payment verified successfully',
  });
}
