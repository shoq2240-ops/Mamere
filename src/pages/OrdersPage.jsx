import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { publicTable } from '../lib/supabase';
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

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) return;

    const loadOrders = async () => {
      setLoading(true);
      setError('');
      const { data, error: err } = await publicTable('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setLoading(false);
      if (err) {
        setError('주문 내역을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
        return;
      }
      setOrders(data ?? []);
    };

    loadOrders();
  }, [user?.id]);

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen bg-[#FFFFFF] text-[#000000] antialiased">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-semibold tracking-tight uppercase mb-2">
          주문 내역
        </h1>
        <p className="text-[10px] text-[#999999] tracking-widest uppercase mb-12">
          배송 상황을 확인하세요
        </p>

        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-2 border-[#E5E5E5] border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-[10px] text-[#999999] tracking-widest uppercase">불러오는 중...</p>
          </div>
        ) : error ? (
          <p className="text-red-500 text-[11px] text-center py-12">{error}</p>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center border-t border-white/10">
            <p className="text-[#999999] uppercase tracking-widest mb-8 text-sm">주문 내역이 없습니다.</p>
            <Link to="/shop" className="inline-block border border-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all">
              쇼핑하기
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = STATUS_LABELS[order.status] || {
                label: order.status || '처리 중',
                color: 'text-[#666666]',
              };
              const items = Array.isArray(order.items) ? order.items : [];

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-[#E8E8E8] p-6 space-y-4 bg-[#FFFFFF]"
                >
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                      <p className="text-[10px] text-[#999999] tracking-widest uppercase">
                        {formatDate(order.created_at)}
                      </p>
                      <p className="text-[9px] text-[#999999] font-mono mt-1">주문번호 {order.id?.slice(0, 8)}...</p>
                    </div>
                    <span className={`text-[11px] font-bold ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* 5단계 배송 스테퍼 */}
                  {order.status !== '취소됨' && (
                    <div className="py-3 border-t border-[#F0F0F0]">
                      <OrderTrackingStepper status={order.status} />
                    </div>
                  )}

                  <ul className="space-y-2 border-t border-[#F0F0F0] pt-4">
                    {items.map((item, i) => (
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

                  {/* 실시간 택배 추적 (운송장 등록 시) */}
                  {order.tracking_number && (
                    <OrderTrackingBlock order={order} />
                  )}

                  <div className="flex justify-end pt-2">
                    <span className="text-lg font-semibold text-[#000000]">
                      ₩{(order.total_amount ?? order.total_price ?? 0).toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-12 flex gap-4">
          <Link
            to="/profile"
            className="text-[10px] font-bold tracking-widest uppercase text-[#666666] hover:text-[#000000] transition-colors"
          >
            ← 프로필
          </Link>
          <Link
            to="/shop"
            className="text-[10px] font-bold tracking-widest uppercase text-[#666666] hover:text-[#000000] transition-colors"
          >
            쇼핑 계속하기 →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
