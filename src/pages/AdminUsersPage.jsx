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
      const { data, error: err } = await publicTable('profiles')
        .select('id, name, full_name, address, phone, is_admin, is_withdrawn, privacy_policy_agreed, agreed_at, updated_at')
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

  const filteredProfiles = profiles.filter((p) => {
    const matchWithdrawn = !showWithdrawnOnly || p.is_withdrawn === true;
    const name = (p.name || p.full_name || '').toLowerCase();
    const q = searchQuery.trim().toLowerCase();
    const matchSearch = !q || name.includes(q) || (p.phone || '').includes(q);
    return matchWithdrawn && matchSearch;
  });

  const withdrawnCount = profiles.filter((p) => p.is_withdrawn === true).length;

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#000000] pt-28 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight uppercase">회원 관리</h1>
            <p className="text-[11px] text-[#666666] tracking-[0.1em] uppercase mt-2">
              전체 {profiles.length}명 · 탈퇴 {withdrawnCount}명
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/admin/orders"
              className="text-[10px] font-medium tracking-widest uppercase text-[#666666] hover:text-[#000000] border-b border-[#E5E5E5] pb-1"
            >
              주문 관리
            </Link>
            <Link
              to="/admin/upload"
              className="text-[10px] font-medium tracking-widest uppercase text-[#666666] hover:text-[#000000] border-b border-[#E5E5E5] pb-1"
            >
              상품 등록
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="이름, 전화번호 검색..."
            className="flex-1 bg-[#F9F9F9] px-4 py-3 text-[11px] text-[#000000] outline-none focus:bg-[#F5F5F5] placeholder:text-[#999999]"
          />
          <label className="flex items-center gap-2 cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={showWithdrawnOnly}
              onChange={(e) => setShowWithdrawnOnly(e.target.checked)}
              className="w-4 h-4 rounded border-[#CCCCCC] text-[#000000] focus:ring-[#000000]"
            />
            <span className="text-[10px] font-medium tracking-widest uppercase">탈퇴 회원만 보기</span>
          </label>
        </div>

        {error && (
          <p className="text-red-600 text-[11px] mb-4">{error}</p>
        )}

        {loading ? (
          <p className="text-[10px] text-[#999999] tracking-widest uppercase">불러오는 중...</p>
        ) : (
          <div className="border border-[#F0F0F0] overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#F0F0F0]">
                  <th className="px-4 py-4 text-[10px] font-medium tracking-widest uppercase text-[#666666]">이름</th>
                  <th className="px-4 py-4 text-[10px] font-medium tracking-widest uppercase text-[#666666]">전화번호</th>
                  <th className="px-4 py-4 text-[10px] font-medium tracking-widest uppercase text-[#666666]">상태</th>
                  <th className="px-4 py-4 text-[10px] font-medium tracking-widest uppercase text-[#666666]">동의일시</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map((p) => (
                  <tr
                    key={p.id}
                    className={`border-b border-[#F5F5F5] ${
                      p.is_withdrawn ? 'bg-[#F9F9F9]' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-[11px]">
                      <span className={p.is_withdrawn ? 'text-[#999999] line-through' : ''}>
                        {p.name || p.full_name || '-'}
                      </span>
                      {p.is_admin && (
                        <span className="ml-2 text-[9px] font-bold uppercase text-[#666666]">관리자</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-[#666666]">{p.phone || '-'}</td>
                    <td className="px-4 py-3">
                      {p.is_withdrawn ? (
                        <span className="text-[9px] font-bold uppercase text-[#999999] border border-[#E5E5E5] px-2 py-0.5">
                          탈퇴
                        </span>
                      ) : (
                        <span className="text-[9px] font-medium uppercase text-[#333333]">정상</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-[#666666]">
                      {p.agreed_at ? formatDate(p.agreed_at) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredProfiles.length === 0 && (
              <div className="py-16 text-center text-[#999999] text-[11px]">조건에 맞는 회원이 없습니다.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
