import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { publicTable } from '../lib/supabase';

const STATUS_LABELS = {
  결제완료: { label: '결제 완료', color: 'text-purple-500' },
  배송준비중: { label: '배송 준비중', color: 'text-amber-500' },
  배송중: { label: '배송 중', color: 'text-blue-500' },
  배송완료: { label: '배송 완료', color: 'text-green-500' },
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
  const navigate = useNavigate();
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, isLoggedIn, navigate]);

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
        setError(err.message);
        return;
      }
      setOrders(data ?? []);
    };

    loadOrders();
  }, [user?.id]);

  if (authLoading || !isLoggedIn) return null;

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen bg-black text-white antialiased">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">
          주문 내역
        </h1>
        <p className="text-[10px] text-white/40 tracking-widest uppercase mb-12">
          배송 상황을 확인하세요
        </p>

        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-[10px] text-white/40 tracking-widest uppercase">불러오는 중...</p>
          </div>
        ) : error ? (
          <p className="text-red-500 text-[11px] text-center py-12">{error}</p>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center border-t border-white/10">
            <p className="text-white/40 uppercase tracking-widest mb-8 text-sm">주문 내역이 없습니다.</p>
            <Link to="/shop" className="inline-block border border-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all">
              쇼핑하기
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = STATUS_LABELS[order.status] || {
                label: order.status || '처리 중',
                color: 'text-white/60',
              };
              const items = Array.isArray(order.items) ? order.items : [];

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-white/10 p-6 space-y-4"
                >
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                      <p className="text-[10px] text-white/40 tracking-widest uppercase">
                        {formatDate(order.created_at)}
                      </p>
                      <p className="text-[9px] text-white/30 font-mono mt-1">주문번호 {order.id?.slice(0, 8)}...</p>
                    </div>
                    <span className={`text-[11px] font-bold ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <ul className="space-y-2 border-t border-white/5 pt-4">
                    {items.map((item, i) => (
                      <li key={i} className="flex justify-between text-[11px]">
                        <span className="text-white/80 truncate max-w-[70%]">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="text-purple-500 shrink-0">
                          ₩{((parsePrice(item.price) || 0) * (item.quantity || 1)).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex justify-between items-center border-t border-white/5 pt-4">
                    <span className="text-[10px] text-white/50">배송지</span>
                    <span className="text-[11px] text-white/70 text-right max-w-[60%]">
                      {order.shipping_name} / {order.shipping_address}
                    </span>
                  </div>

                  <div className="flex justify-end pt-2">
                    <span className="text-lg font-black italic text-purple-500">
                      ₩{(order.total_amount || 0).toLocaleString()}
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
            className="text-[10px] font-bold tracking-widest uppercase text-white/50 hover:text-purple-500 transition-colors"
          >
            ← 프로필
          </Link>
          <Link
            to="/shop"
            className="text-[10px] font-bold tracking-widest uppercase text-white/50 hover:text-purple-500 transition-colors"
          >
            쇼핑 계속하기 →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
