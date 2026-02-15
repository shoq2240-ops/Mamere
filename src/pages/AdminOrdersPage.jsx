import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { publicTable, supabase } from '../lib/supabase';
import { useAuth } from '../store/AuthContext';

/** 주문 상태별 라벨 및 색상 */
const STATUS_OPTIONS = [
  { value: '결제완료', label: '결제완료', color: 'text-purple-400' },
  { value: '배송준비중', label: '배송 준비 중', color: 'text-amber-400' },
  { value: '배송중', label: '배송 중', color: 'text-blue-400' },
  { value: '배송완료', label: '배송 완료', color: 'text-emerald-400' },
  { value: '취소됨', label: '취소됨', color: 'text-red-400' },
];

const STATUS_MAP = Object.fromEntries(STATUS_OPTIONS.map((s) => [s.value, s]));

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

const parsePrice = (v) => {
  if (typeof v === 'number' && !isNaN(v)) return v;
  if (typeof v === 'string') {
    const n = parseInt(v.replace(/\D/g, ''), 10);
    return isNaN(n) ? 0 : n;
  }
  return 0;
};

/** 결제 후 24시간 경과 + 아직 배송준비 전이면 미처리 */
const isUnprocessedAlert = (order) => {
  if (!order?.created_at) return false;
  const status = order.status || '';
  if (status !== '결제완료') return false;
  const created = new Date(order.created_at).getTime();
  const now = Date.now();
  return now - created > 24 * 60 * 60 * 1000;
};

const ITEMS_PER_PAGE = 10;

const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingInput, setTrackingInput] = useState({});
  const [trackingModalOrder, setTrackingModalOrder] = useState(null);
  const [trackingModalValue, setTrackingModalValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, isLoggedIn, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await publicTable('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (err) throw err;
      setOrders(data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchOrders();
  }, [isLoggedIn]);

  /** 실시간 구독: orders 변경 시 자동 반영 */
  useEffect(() => {
    if (!isLoggedIn) return;
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLoggedIn]);

  /** 필터 + 검색 적용된 목록 */
  const filteredOrders = useMemo(() => {
    let list = [...orders];
    if (statusFilter !== 'all') {
      list = list.filter((o) => (o.status || '') === statusFilter);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (o) =>
          (o.shipping_name || '').toLowerCase().includes(q) ||
          (o.id || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, statusFilter, searchQuery]);

  /** 페이지네이션 */
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  /** 오늘 기준 통계 */
  const stats = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayCount = orders.filter((o) => new Date(o.created_at) >= todayStart).length;
    const byStatus = {
      결제완료: orders.filter((o) => (o.status || '') === '결제완료').length,
      배송준비중: orders.filter((o) => (o.status || '') === '배송준비중').length,
      취소됨: orders.filter((o) => (o.status || '') === '취소됨').length,
    };
    return {
      신규주문: todayCount,
      결제완료: byStatus.결제완료,
      배송준비중: byStatus.배송준비중,
      반품취소: byStatus.취소됨,
    };
  }, [orders]);

  const handleStatusChange = async (orderId, newStatus, tracking = '') => {
    try {
      const payload = { status: newStatus };
      if (newStatus === '배송중' && tracking.trim()) {
        payload.tracking_number = tracking.trim();
      }
      const { error: err } = await publicTable('orders').update(payload).eq('id', orderId);
      if (err) throw err;
      setTrackingInput((prev) => ({ ...prev, [orderId]: '' }));
      setTrackingModalOrder(null);
      setTrackingModalValue('');
      fetchOrders();
      setSelectedOrder((prev) => (prev?.id === orderId ? { ...prev, ...payload } : prev));
    } catch (err) {
      setError(err.message);
    }
  };

  /** 배송중 선택 시 송장 번호 입력창 표시 */
  const openTrackingModal = (order) => {
    setTrackingModalOrder(order);
    setTrackingModalValue(order.tracking_number || '');
  };

  const handleExportCSV = () => {
    const headers = ['주문번호', '주문일시', '고객명', '상품명', '결제금액', '주문상태', '송장번호', '배송지', '연락처'];
    const rows = filteredOrders.map((o) => {
      const items = Array.isArray(o.items) ? o.items : [];
      const itemNames = items.map((i) => `${i.name || ''} x${i.quantity || 1}`).join('; ');
      return [
        o.id || '',
        formatDate(o.created_at),
        o.shipping_name || '',
        itemNames,
        o.total_amount ?? '',
        o.status || '',
        o.tracking_number || '',
        o.shipping_address || '',
        o.shipping_phone || '',
      ];
    });
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading || !isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-light uppercase tracking-tight">주문 관리</h1>
            <p className="text-[11px] text-white/50 tracking-[0.1em] uppercase mt-2">
              주문 현황을 한눈에 파악하고 관리합니다
            </p>
          </div>
          <Link
            to="/admin/upload"
            className="text-[10px] font-medium tracking-widest uppercase text-white/60 hover:text-white border-b border-white/20 pb-1 w-fit"
          >
            ← 상품 등록으로
          </Link>
        </div>

        {/* 1. 핵심 지표 요약 (Stats Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { key: '신규주문', label: '신규 주문', value: stats.신규주문 },
            { key: '결제완료', label: '결제 완료', value: stats.결제완료 },
            { key: '배송준비중', label: '배송 준비 중', value: stats.배송준비중 },
            { key: '반품취소', label: '반품/취소', value: stats.반품취소 },
          ].map((s) => (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-white/10 p-6 text-center"
            >
              <p className="text-[10px] font-medium tracking-widest uppercase text-white/50 mb-2">{s.label}</p>
              <p className="text-3xl font-light tracking-tight">{s.value}</p>
              <p className="text-[9px] text-white/30 mt-1">건</p>
            </motion.div>
          ))}
        </div>

        {/* 2. 필터 + 검색 + 엑셀 다운로드 */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: '전체' },
              ...STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label })),
            ].map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => {
                  setStatusFilter(f.value);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 text-[10px] font-medium tracking-widest uppercase border transition-colors ${
                  statusFilter === f.value
                    ? 'border-white text-white bg-white/5'
                    : 'border-white/20 text-white/60 hover:border-white/40 hover:text-white/80'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="고객명 또는 주문번호 검색"
              className="flex-1 min-w-0 bg-white/5 border border-white/10 px-4 py-2 text-[11px] text-white placeholder-white/30 outline-none focus:border-white/30"
            />
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-2 border border-white/20 text-[10px] font-medium tracking-widest uppercase hover:bg-white/5 shrink-0"
            >
              CSV 다운로드
            </button>
          </div>
        </div>

        {error && <p className="text-red-400 text-[11px] mb-4">{error}</p>}

        {/* 3. 주문 목록 테이블 */}
        <div className="border border-white/10 overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block w-8 h-8 border border-white/30 border-t-white rounded-full animate-spin" />
              <p className="mt-4 text-[10px] text-white/50 tracking-widest uppercase">불러오는 중...</p>
            </div>
          ) : paginatedOrders.length === 0 ? (
            <div className="py-16 text-center text-white/50 text-[11px]">조건에 맞는 주문이 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-4 text-[10px] font-medium tracking-widest uppercase text-white/50">주문번호</th>
                    <th className="px-4 py-4 text-[10px] font-medium tracking-widest uppercase text-white/50">주문일시</th>
                    <th className="px-4 py-4 text-[10px] font-medium tracking-widest uppercase text-white/50">고객명</th>
                    <th className="px-4 py-4 text-[10px] font-medium tracking-widest uppercase text-white/50">상품명</th>
                    <th className="px-4 py-4 text-[10px] font-medium tracking-widest uppercase text-white/50">결제금액</th>
                    <th className="px-4 py-4 text-[10px] font-medium tracking-widest uppercase text-white/50">주문상태</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => {
                    const items = Array.isArray(order.items) ? order.items : [];
                    const itemNames = items.map((i) => i.name || '').join(', ') || '-';
                    const statusInfo = STATUS_MAP[order.status] || {
                      label: order.status || '-',
                      color: 'text-white/60',
                    };
                    const alert = isUnprocessedAlert(order);
                    return (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setSelectedOrder(order)}
                        className={`border-b border-white/5 cursor-pointer hover:bg-white/[0.02] transition-colors ${
                          alert ? 'animate-pulse bg-amber-500/5' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-[11px] font-mono text-white/70">
                          {order.id?.slice(0, 8)}...
                        </td>
                        <td className="px-4 py-3 text-[11px] text-white/70">{formatDate(order.created_at)}</td>
                        <td className="px-4 py-3 text-[11px] text-white/80">{order.shipping_name || '-'}</td>
                        <td className="px-4 py-3 text-[11px] text-white/70 max-w-[200px] truncate" title={itemNames}>
                          {itemNames}
                        </td>
                        <td className="px-4 py-3 text-[11px] text-white/80">
                          ₩{(order.total_amount || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={order.status || ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (v === '배송중') {
                                openTrackingModal(order);
                              } else {
                                handleStatusChange(order.id, v);
                              }
                            }}
                            className={`bg-transparent border border-white/20 px-2 py-1 text-[11px] outline-none focus:border-white/40 ${statusInfo.color}`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s.value} value={s.value} className="bg-zinc-900 text-white">
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 4. 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-4 py-2 border border-white/20 text-[10px] uppercase disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5"
            >
              이전
            </button>
            <span className="text-[11px] text-white/60">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-4 py-2 border border-white/20 text-[10px] uppercase disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5"
            >
              다음
            </button>
          </div>
        )}

        {/* 미처리 알림 안내 */}
        {filteredOrders.some(isUnprocessedAlert) && (
          <p className="mt-4 text-[10px] text-amber-400/80 tracking-widest uppercase">
            * 결제 후 24시간 경과 후에도 배송 준비가 안 된 주문은 강조 표시됩니다.
          </p>
        )}
      </div>

      {/* 송장 번호 입력 모달: 배송중으로 변경 시 표시 */}
      <AnimatePresence>
        {trackingModalOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80"
            onClick={() => setTrackingModalOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-black border border-white/10 p-6"
            >
              <h3 className="text-[11px] font-medium tracking-[0.15em] uppercase text-white/70 mb-4">
                송장 번호 입력 (선택)
              </h3>
              <p className="text-[10px] text-white/50 mb-3">
                주문번호 {trackingModalOrder.id?.slice(0, 8)}... · {trackingModalOrder.shipping_name}
              </p>
              <input
                type="text"
                value={trackingModalValue}
                onChange={(e) => setTrackingModalValue(e.target.value)}
                placeholder="송장 번호를 입력하세요"
                className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 mb-4"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleStatusChange(trackingModalOrder.id, '배송중', trackingModalValue);
                  }
                  if (e.key === 'Escape') setTrackingModalOrder(null);
                }}
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setTrackingModalOrder(null)}
                  className="px-4 py-2 border border-white/20 text-[10px] uppercase tracking-widest hover:bg-white/5"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(trackingModalOrder.id, '배송중', trackingModalValue)}
                  className="px-4 py-2 bg-white text-black text-[10px] font-medium uppercase tracking-widest hover:bg-white/90"
                >
                  확인
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. 상세 정보 모달 */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[85vh] overflow-y-auto bg-black border border-white/10 p-6"
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-[11px] font-medium tracking-[0.15em] uppercase text-white/70">
                  주문 상세
                </h2>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="text-white/50 hover:text-white text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4 text-[11px]">
                <div>
                  <p className="text-[10px] text-white/40 tracking-widest uppercase mb-1">주문번호</p>
                  <p className="font-mono text-white/80">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/40 tracking-widest uppercase mb-1">주문일시</p>
                  <p className="text-white/80">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/40 tracking-widest uppercase mb-1">고객명</p>
                  <p className="text-white/80">{selectedOrder.shipping_name || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/40 tracking-widest uppercase mb-1">배송지 주소</p>
                  <p className="text-white/80 whitespace-pre-line">{selectedOrder.shipping_address || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/40 tracking-widest uppercase mb-1">연락처</p>
                  <p className="text-white/80">{selectedOrder.shipping_phone || '-'}</p>
                </div>
                {selectedOrder.tracking_number && (
                  <div>
                    <p className="text-[10px] text-white/40 tracking-widest uppercase mb-1">송장 번호</p>
                    <p className="text-white/80 font-mono">{selectedOrder.tracking_number}</p>
                  </div>
                )}

                <div>
                  <p className="text-[10px] text-white/40 tracking-widest uppercase mb-2">주문 상품</p>
                  <ul className="space-y-3">
                    {(Array.isArray(selectedOrder.items) ? selectedOrder.items : []).map((item, i) => (
                      <li key={i} className="flex gap-3 border-b border-white/5 pb-3 last:border-0">
                        {item.image && (
                          <div className="w-16 h-20 bg-white/5 overflow-hidden flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white/90 truncate">{item.name || '-'}</p>
                          <p className="text-white/50 text-[10px]">
                            {item.quantity || 1}개 · ₩{((parsePrice(item.price) || 0) * (item.quantity || 1)).toLocaleString()}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-[10px] text-white/50 uppercase tracking-widest">총 결제금액</span>
                  <span className="text-lg font-light text-white">₩{(selectedOrder.total_amount || 0).toLocaleString()}</span>
                </div>

                {/* 모달 내 상태 변경 (배송중일 때 송장 입력) */}
                <div className="pt-4 flex flex-col gap-2">
                  <p className="text-[10px] text-white/40 tracking-widest uppercase">상태 변경</p>
                  <div className="flex gap-2 flex-wrap">
                    {STATUS_OPTIONS.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => {
                          if (s.value === '배송중') {
                            openTrackingModal(selectedOrder);
                          } else {
                            handleStatusChange(selectedOrder.id, s.value);
                          }
                        }}
                        className={`px-3 py-2 text-[10px] uppercase tracking-widest border ${
                          (selectedOrder.status || '') === s.value
                            ? 'border-white text-white'
                            : 'border-white/20 text-white/60 hover:border-white/40'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                  {(selectedOrder.status || '') === '배송중' && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={trackingInput[selectedOrder.id] ?? selectedOrder.tracking_number ?? ''}
                        onChange={(e) =>
                          setTrackingInput((prev) => ({
                            ...prev,
                            [selectedOrder.id]: e.target.value,
                          }))
                        }
                        onBlur={() => {
                          const v = (trackingInput[selectedOrder.id] ?? '').trim();
                          if (v && v !== (selectedOrder.tracking_number || '')) {
                            handleStatusChange(selectedOrder.id, '배송중', v);
                          }
                        }}
                        placeholder="송장 번호 입력 후 포커스 아웃 시 저장"
                        className="w-full bg-white/5 border border-white/10 px-3 py-2 text-[11px] text-white placeholder-white/30 outline-none focus:border-white/30"
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrdersPage;
