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

  const MAX_ITEMS = 50;
  const MAX_QUANTITY = 99;
  const sanitizedItems = items.slice(0, MAX_ITEMS).map((it) => {
    const id = it.id != null ? Number(it.id) : null;
    const qty = Math.max(1, Math.min(MAX_QUANTITY, Math.floor(Number(it.quantity) || 1)));
    return { id, quantity: qty };
  }).filter((it) => it.id != null && !Number.isNaN(it.id) && it.id > 0);
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

  // 1) 서버에서 cartItems의 productId 기준 DB 단가 조회 후 총액 계산 (클라이언트 금액 불신)
  const productIds = [...new Set(sanitizedItems.map((it) => it.id))];
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, price, stock_quantity')
    .in('id', productIds);

  if (productsError || !products?.length) {
    return res.status(400).json({ success: false, error: '상품 정보를 확인할 수 없습니다.' });
  }

  const priceById = Object.fromEntries(
    products.map((p) => [Number(p.id), Math.max(0, Number(p.price) || 0)])
  );
  let serverTotal = 0;
  const orderItemsForDb = [];
  for (const it of sanitizedItems) {
    const unitPrice = priceById[it.id];
    if (unitPrice == null) {
      return res.status(400).json({ success: false, error: '존재하지 않는 상품이 포함되어 있습니다.' });
    }
    serverTotal += unitPrice * it.quantity;
    orderItemsForDb.push({
      id: it.id,
      quantity: it.quantity,
      price: unitPrice,
      name: (items.find((i) => Number(i.id) === it.id)?.name || '').slice(0, 200),
      image: (items.find((i) => Number(i.id) === it.id)?.image || null)?.slice(0, 2048) ?? null,
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

  const actual = Number(actualAmount);
  if (actual !== serverTotal) {
    return res.status(400).json({
      success: false,
      error: '위조된 결제 시도',
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

  // 4) 재고 차감 (deduct_stock RPC: FOR UPDATE + 원자적 차감)
  for (const item of sanitizedItems) {

    const { error: stockError } = await supabase.rpc('deduct_stock', {
      p_product_id: item.id,
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
