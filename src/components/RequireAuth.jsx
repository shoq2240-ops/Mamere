import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

/**
 * 인증 필요 라우트 보호 (Profile, Orders 등)
 * 로그인하지 않은 사용자는 /login으로 리다이렉트
 */
const RequireAuth = ({ children }) => {
  const navigate = useNavigate();
  const { isLoggedIn, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, isLoggedIn, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F9F7F2]">
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#7A6B63]">로딩 중...</p>
      </div>
    );
  }
  if (!isLoggedIn) return null;

  return children;
};

export default RequireAuth;
