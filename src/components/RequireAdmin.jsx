import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { publicTable } from '../lib/supabase';

/**
 * 관리자 전용 라우트 보호
 * - 비로그인: /login으로 리다이렉트
 * - 로그인했지만 is_admin 아님: /로 리다이렉트
 */
const RequireAdmin = ({ children }) => {
  const navigate = useNavigate();
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
      return;
    }
    const checkAdmin = async () => {
      if (!user?.id) return;
      try {
        const { data } = await publicTable('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .maybeSingle();
        setIsAdmin(data?.is_admin === true);
      } catch {
        setIsAdmin(false);
      } finally {
        setAdminChecked(true);
      }
    };
    checkAdmin();
  }, [user?.id, isLoggedIn, authLoading, navigate]);

  useEffect(() => {
    if (!authLoading && isLoggedIn && adminChecked && !isAdmin) {
      navigate('/', { replace: true });
    }
  }, [authLoading, isLoggedIn, adminChecked, isAdmin, navigate]);

  if (authLoading || !adminChecked || !isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-black">
        <p className="text-[10px] tracking-[0.2em] uppercase text-white/40">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return children;
};

export default RequireAdmin;
