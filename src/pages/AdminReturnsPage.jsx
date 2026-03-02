import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { publicTable } from '../lib/supabase';
import { useAuth } from '../store/AuthContext';

const TYPE_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: '반품', label: '반품' },
  { value: '교환', label: '교환' },
];

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

const parseAttachmentUrls = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter((u) => typeof u === 'string');
  if (typeof raw === 'string') {
    try {
      const p = JSON.parse(raw);
      return Array.isArray(p) ? p.filter((u) => typeof u === 'string') : [];
    } catch {
      return raw.trim() ? [raw.trim()] : [];
    }
  }
  return [];
};

const AdminReturnsPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, isLoggedIn, navigate]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      setError('');
      const { data, error: err } = await publicTable('return_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (err) throw err;
      setList(data ?? []);
    } catch (err) {
      setError(err?.message || '반품/교환 신청 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchReturns();
  }, [isLoggedIn]);

  const filtered = useMemo(() => {
    let items = [...list];
    if (typeFilter !== 'all') {
      items = items.filter((r) => (r.request_type || '') === typeFilter);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      items = items.filter(
        (r) =>
          (r.order_number || '').toLowerCase().includes(q) ||
          (r.reason || '').toLowerCase().includes(q) ||
          (r.detail || '').toLowerCase().includes(q)
      );
    }
    return items;
  }, [list, typeFilter, searchQuery]);

  if (authLoading || !isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#FDFDFB] pt-24 pb-24 px-8 md:px-12 lg:px-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
          <div>
            <h1 className="text-2xl md:text-3xl font-light uppercase tracking-tight text-[#FDFDFB]">
              반품/교환 신청
            </h1>
            <p className="text-[11px] text-white/50 tracking-[0.1em] uppercase mt-2">
              고객 반품·교환 신청을 확인하고 관리합니다
            </p>
          </div>
          <div className="flex flex-wrap gap-6">
            <Link
              to="/admin/orders"
              className="text-[10px] font-medium tracking-[0.12em] uppercase text-white/60 hover:text-[#FDFDFB] transition-colors"
            >
              주문 관리
            </Link>
            <Link
              to="/admin/upload"
              className="text-[10px] font-medium tracking-[0.12em] uppercase text-white/60 hover:text-[#FDFDFB] transition-colors"
            >
              상품 등록
            </Link>
            <Link
              to="/admin/users"
              className="text-[10px] font-medium tracking-[0.12em] uppercase text-white/60 hover:text-[#FDFDFB] transition-colors"
            >
              회원 관리
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {TYPE_OPTIONS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setTypeFilter(f.value)}
                className={`px-4 py-2.5 text-[10px] font-medium tracking-[0.12em] uppercase transition-colors ${
                  typeFilter === f.value
                    ? 'bg-[#FDFDFB] text-[#000000]'
                    : 'text-white/60 hover:text-[#FDFDFB] shadow-[0_1px_0_0_rgba(255,255,255,0.1)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="주문번호·사유·상세 검색"
            className="flex-1 min-w-0 bg-white/[0.06] px-4 py-2.5 text-[11px] text-[#FDFDFB] placeholder-white/30 outline-none focus:bg-white/[0.08] transition-colors shadow-[0_1px_0_0_rgba(255,255,255,0.06)]"
          />
        </div>

        {error && <p className="text-red-400 text-[11px] mb-4">{error}</p>}

        <div className="bg-[#000000]/40 overflow-hidden shadow-[0_1px_0_0_rgba(255,255,255,0.06)]">
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block w-8 h-8 border border-white/30 border-t-white rounded-full animate-spin" />
              <p className="mt-4 text-[10px] text-white/50 tracking-widest uppercase">불러오는 중...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-white/50 text-[11px]">
              조건에 맞는 반품/교환 신청이 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="px-5 py-5 text-[10px] font-medium tracking-[0.12em] uppercase text-white/50">
                      신청일시
                    </th>
                    <th className="px-5 py-5 text-[10px] font-medium tracking-[0.12em] uppercase text-white/50">
                      주문번호
                    </th>
                    <th className="px-5 py-5 text-[10px] font-medium tracking-[0.12em] uppercase text-white/50">
                      유형
                    </th>
                    <th className="px-5 py-5 text-[10px] font-medium tracking-[0.12em] uppercase text-white/50">
                      사유
                    </th>
                    <th className="px-5 py-5 text-[10px] font-medium tracking-[0.12em] uppercase text-white/50">
                      상세
                    </th>
                    <th className="px-5 py-5 text-[10px] font-medium tracking-[0.12em] uppercase text-white/50">
                      첨부
                    </th>
                    <th className="px-5 py-5 text-[10px] font-medium tracking-[0.12em] uppercase text-white/50">
                      신청자
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => {
                    const attachments = parseAttachmentUrls(row.attachment_urls);
                    const detailPreview =
                      (row.detail || '').length > 40 ? `${(row.detail || '').slice(0, 40)}…` : row.detail || '-';
                    return (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setSelected(row)}
                        className="border-b border-white/[0.06] cursor-pointer hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="px-5 py-4 text-[11px] text-white/70 whitespace-nowrap">
                          {formatDate(row.created_at)}
                        </td>
                        <td className="px-5 py-4 text-[11px] font-mono text-white/80">{row.order_number || '-'}</td>
                        <td className="px-5 py-4 text-[11px] text-white/80">{row.request_type || '-'}</td>
                        <td className="px-5 py-4 text-[11px] text-white/70">{row.reason || '-'}</td>
                        <td className="px-5 py-4 text-[11px] text-white/70 max-w-[180px] truncate" title={row.detail}>
                          {detailPreview}
                        </td>
                        <td className="px-5 py-4 text-[11px] text-white/60">
                          {attachments.length > 0 ? `${attachments.length}장` : '-'}
                        </td>
                        <td className="px-5 py-4 text-[11px] text-white/60">
                          {row.user_id ? '회원' : '비회원'}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 상세 모달 */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4"
          onClick={() => setSelected(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0a0a0a] border border-white/10 max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-medium tracking-[0.12em] uppercase text-[#FDFDFB]">
                반품/교환 신청 상세
              </h2>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="p-2 text-white/50 hover:text-white transition-colors"
                aria-label="닫기"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <dl className="space-y-4 text-[11px]">
              <div>
                <dt className="text-white/50 tracking-[0.08em] uppercase mb-1">신청일시</dt>
                <dd className="text-white/90">{formatDate(selected.created_at)}</dd>
              </div>
              <div>
                <dt className="text-white/50 tracking-[0.08em] uppercase mb-1">주문번호</dt>
                <dd className="text-white/90 font-mono">{selected.order_number || '-'}</dd>
              </div>
              <div>
                <dt className="text-white/50 tracking-[0.08em] uppercase mb-1">신청 유형</dt>
                <dd className="text-white/90">{selected.request_type || '-'}</dd>
              </div>
              <div>
                <dt className="text-white/50 tracking-[0.08em] uppercase mb-1">사유</dt>
                <dd className="text-white/90">{selected.reason || '-'}</dd>
              </div>
              <div>
                <dt className="text-white/50 tracking-[0.08em] uppercase mb-1">상세 사유</dt>
                <dd className="text-white/90 whitespace-pre-wrap">{selected.detail || '-'}</dd>
              </div>
              <div>
                <dt className="text-white/50 tracking-[0.08em] uppercase mb-1">신청자</dt>
                <dd className="text-white/90">{selected.user_id ? '회원' : '비회원'}</dd>
              </div>
              {parseAttachmentUrls(selected.attachment_urls).length > 0 && (
                <div>
                  <dt className="text-white/50 tracking-[0.08em] uppercase mb-2">첨부 이미지</dt>
                  <dd className="flex flex-wrap gap-2">
                    {parseAttachmentUrls(selected.attachment_urls).map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-20 h-20 rounded overflow-hidden border border-white/20 hover:border-white/50 transition-colors"
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminReturnsPage;
