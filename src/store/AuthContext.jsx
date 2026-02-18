import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase, publicTable, fetchClientIp, logUserConsent } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawnMessage, setWithdrawnMessage] = useState(null);
  const consentLoggedFor = useRef(new Set());

  // 탈퇴 사용자 차단 및 동의 로그 보충 (OAuth/이메일 인증 완료 시)
  useEffect(() => {
    if (!user?.id) return;

    const checkProfileAndConsent = async () => {
      const { data: profile } = await publicTable('profiles')
        .select('is_withdrawn')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.is_withdrawn) {
        await supabase.auth.signOut();
        setWithdrawnMessage('탈퇴된 계정입니다. 문의가 필요하면 고객센터로 연락해 주세요.');
        setUser(null);
        return;
      }

      if (consentLoggedFor.current.has(user.id)) return;

      const { data: existing } = await publicTable('user_consent_logs')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (!existing) {
        const ip = await fetchClientIp();
        await logUserConsent({
          userId: user.id,
          ipAddress: ip,
          marketingAgreed: false,
        });
        consentLoggedFor.current.add(user.id);
      }
    };

    checkProfileAndConsent();
  }, [user?.id]);

  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 세션 변경 구독 (로그인/로그아웃/토큰 갱신)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const clearWithdrawnMessage = () => setWithdrawnMessage(null);

  const value = {
    user,
    loading,
    isLoggedIn: !!user,
    email: user?.email ?? null,
    withdrawnMessage,
    clearWithdrawnMessage,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
