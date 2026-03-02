import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { publicTable } from '../lib/supabase';
import { useAuth } from '../store/AuthContext';

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

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showWithdrawnOnly, setShowWithdrawnOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, isLoggedIn, navigate]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      // select('*')로 실제 존재하는 컬럼만 반환 (name/full_name 없어도 에러 없음)
      const { data, error: err } = await publicTable('profiles')
        .select('*')
        .order('updated_at', { ascending: false });
      if (err) throw err;
      setProfiles(data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchProfiles();
  }, [isLoggedIn]);

  const displayName = (p) =>
    (p.name && p.name.trim()) || (p.full_name && p.full_name.trim()) || (p.id ? `${String(p.id).slice(0, 8)}…` : '—');

  const filteredProfiles = profiles.filter((p) => {
    const matchWithdrawn = !showWithdrawnOnly || p.is_withdrawn === true;
    const name = (p.name || p.full_name || '').toLowerCase();
    const q = searchQuery.trim().toLowerCase();
    const matchSearch = !q || name.includes(q) || (p.phone || '').includes(q) || (p.id || '').toLowerCase().includes(q);
    return matchWithdrawn && matchSearch;
  });

  const withdrawnCount = profiles.filter((p) => p.is_withdrawn === true).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#FDFDFB] pt-24 pb-24 px-8 md:px-12 lg:px-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12 pb-8 border-b border-white/10">
          <div>
            <h1 className="text-2xl md:text-3xl font-light uppercase tracking-tight text-[#FDFDFB]">회원 관리</h1>
            <p className="text-[11px] text-white/50 tracking-[0.1em] uppercase mt-2">
              전체 {profiles.length}명 · 탈퇴 {withdrawnCount}명
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Link
              to="/admin/orders"
              className="text-[10px] font-medium tracking-[0.12em] uppercase text-white/60 hover:text-[#FDFDFB] transition-colors"
            >
              주문 관리
            </Link>
            <Link
              to="/admin/returns"
              className="text-[10px] font-medium tracking-[0.12em] uppercase text-white/60 hover:text-[#FDFDFB] transition-colors"
            >
              반품/교환
            </Link>
            <Link
              to="/admin/upload"
              className="text-[10px] font-medium tracking-[0.12em] uppercase text-white/60 hover:text-[#FDFDFB] transition-colors"
            >
              상품 등록
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="이름, 전화번호 검색..."
            className="flex-1 bg-white/[0.06] px-4 py-3.5 text-[11px] text-[#FDFDFB] placeholder-white/30 outline-none focus:bg-white/[0.08] transition-colors shadow-[0_1px_0_0_rgba(255,255,255,0.06)]"
          />
          <label className="flex items-center gap-2 cursor-pointer shrink-0 text-white/70 hover:text-[#FDFDFB] transition-colors">
            <input
              type="checkbox"
              checked={showWithdrawnOnly}
              onChange={(e) => setShowWithdrawnOnly(e.target.checked)}
              className="w-4 h-4 rounded border-white/30 bg-white/[0.06] text-[#000000] focus:ring-white/30"
            />
            <span className="text-[10px] font-medium tracking-[0.12em] uppercase">탈퇴 회원만 보기</span>
          </label>
        </div>

        {error && (
          <p className="text-red-400 text-[11px] mb-4">{error}</p>
        )}

        {loading ? (
          <p className="text-[10px] text-white/50 tracking-[0.12em] uppercase">불러오는 중...</p>
        ) : (
          <div className="bg-[#000000]/40 overflow-hidden shadow-[0_1px_0_0_rgba(255,255,255,0.06)]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="px-5 py-5 text-[10px] font-medium tracking-[0.12em] uppercase text-white/50">이름</th>
                  <th className="px-5 py-5 text-[10px] font-medium tracking-[0.12em] uppercase text-white/50">전화번호</th>
                  <th className="px-5 py-5 text-[10px] font-medium tracking-[0.12em] uppercase text-white/50">상태</th>
                  <th className="px-5 py-5 text-[10px] font-medium tracking-[0.12em] uppercase text-white/50">동의일시</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map((p) => (
                  <tr
                    key={p.id}
                    className={`border-b border-white/[0.06] last:border-0 ${
                      p.is_withdrawn ? 'bg-white/[0.02]' : ''
                    }`}
                  >
                    <td className="px-5 py-4 text-[11px]">
                      <span className={p.is_withdrawn ? 'text-white/40 line-through' : 'text-[#FDFDFB]'}>
                        {displayName(p)}
                      </span>
                      {Boolean(p.is_admin) && (
                        <span className="ml-2 text-[9px] font-bold uppercase text-white/50">관리자</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[11px] text-white/60">{p.phone ?? '-'}</td>
                    <td className="px-5 py-4">
                      {p.is_withdrawn ? (
                        <span className="text-[9px] font-bold uppercase text-white/40">탈퇴</span>
                      ) : (
                        <span className="text-[9px] font-medium uppercase text-[#FDFDFB]">정상</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[11px] text-white/60">
                      {p.agreed_at != null ? formatDate(p.agreed_at) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredProfiles.length === 0 && (
              <div className="py-16 text-center text-white/40 text-[11px]">조건에 맞는 회원이 없습니다.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
