import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import OrderTrackingStepper from '../components/OrderTrackingStepper';
import OrderTrackingBlock from '../components/OrderTrackingBlock';

const STATUS_LABELS = {
  결제완료: { label: '결제 완료', color: 'text-[#000000]' },
  배송준비중: { label: '배송 준비 중', color: 'text-[#333333]' },
  배송중: { label: '배송 중', color: 'text-[#000000]' },
  배송완료: { label: '배송 완료', color: 'text-[#000000]' },
  취소됨: { label: '취소됨', color: 'text-[#999999]' },
};

const parsePrice = (price) => {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    const num = parseInt(String(price).replace(/[^\d]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  }
  return 0;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const OrderLookupPage = () => {
  const [guestEmail, setGuestEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = (guestEmail ?? '').trim();
    const number = (orderNumber ?? '').trim();
    if (!email || !number) {
      setError('이메일과 주문번호를 모두 입력해주세요.');
      return;
    }
    setError('');
    setLoading(true);
    setOrder(null);
    setSearched(true);

    const { data, error: rpcError } = await supabase.rpc('get_guest_order', {
      p_guest_email: email,
      p_order_number: number,
    });

    setLoading(false);
    if (rpcError) {
      setError(rpcError.message || '조회에 실패했습니다.');
      return;
    }
    const list = Array.isArray(data) ? data : data ? [data] : [];
    if (list.length === 0) {
      setError('일치하는 주문이 없습니다. 이메일과 주문번호를 확인해주세요.');
      return;
    }
    setOrder(list[0]);
  };

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen bg-[#FFFFFF] text-[#000000] antialiased">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">
          비회원 주문 조회
        </h1>
        <p className="text-[10px] text-[#999999] tracking-widest uppercase mb-10">
          주문 시 입력한 이메일과 주문번호로 배송 상태를 확인하세요
        </p>

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="border border-[#F0F0F0] p-6 space-y-4 mb-10"
        >
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-[#666666] mb-2">
              이메일
            </label>
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value.slice(0, 255))}
              placeholder="example@email.com"
              className="w-full bg-[#F9F9F9] px-4 py-3 text-[11px] text-[#000000] outline-none focus:bg-[#F5F5F5] placeholder:text-[#999999]"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-[#666666] mb-2">
              주문번호 (DN-XXXX)
            </label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.trim().toUpperCase().slice(0, 32))}
              placeholder="DN-YYYYMMDD-XXXX"
              className="w-full bg-[#F9F9F9] px-4 py-3 text-[11px] text-[#000000] font-mono outline-none focus:bg-[#F5F5F5] placeholder:text-[#999999]"
            />
          </div>
          {error && (
            <p className="text-red-500 text-[11px]">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#000000] text-[#FFFFFF] py-4 text-[11px] font-black tracking-widest uppercase hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '조회 중...' : '조회하기'}
          </button>
        </motion.form>

        {searched && !loading && order && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-[#F0F0F0] p-6 space-y-4"
          >
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <p className="text-[10px] text-[#999999] tracking-widest uppercase">
                  {formatDate(order.created_at)}
                </p>
                <p className="text-[11px] font-mono mt-1 text-[#000000]">
                  주문번호 {order.order_number ?? order.id}
                </p>
              </div>
              <span className={`text-[11px] font-bold ${(STATUS_LABELS[order.status] || { color: 'text-[#666666]' }).color}`}>
                {(STATUS_LABELS[order.status] || { label: order.status || '처리 중' }).label}
              </span>
            </div>

            {order.status !== '취소됨' && (
              <div className="py-3 border-t border-[#F0F0F0]">
                <OrderTrackingStepper status={order.status} />
              </div>
            )}

            <ul className="space-y-2 border-t border-[#F0F0F0] pt-4">
              {(Array.isArray(order.items) ? order.items : []).map((item, i) => (
                <li key={i} className="flex justify-between text-[11px]">
                  <span className="text-[#333333] truncate max-w-[70%]">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="text-[#000000] shrink-0">
                    ₩{((parsePrice(item.price) || 0) * (item.quantity || 1)).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex justify-between items-center border-t border-[#F0F0F0] pt-4">
              <span className="text-[10px] text-[#666666]">배송지</span>
              <span className="text-[11px] text-[#333333] text-right max-w-[60%]">
                {order.shipping_name || order.customer_name} / {order.shipping_address || order.address}
              </span>
            </div>

            {order.tracking_number && (
              <OrderTrackingBlock order={order} />
            )}

            <div className="flex justify-end pt-2">
              <span className="text-lg font-black italic text-[#000000]">
                ₩{(order.total_amount ?? order.total_price ?? 0).toLocaleString()}
              </span>
            </div>
          </motion.div>
        )}

        <div className="mt-10 flex gap-4">
          <Link
            to="/"
            className="text-[10px] font-bold tracking-widest uppercase text-[#666666] hover:text-[#000000] transition-colors"
          >
            홈
          </Link>
          <Link
            to="/shop"
            className="text-[10px] font-bold tracking-widest uppercase text-[#666666] hover:text-[#000000] transition-colors"
          >
            쇼핑하기
          </Link>
          <Link
            to="/order-lookup"
            className="text-[10px] font-bold tracking-widest uppercase text-[#666666] hover:text-[#000000] transition-colors"
          >
            주문 조회
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderLookupPage;
