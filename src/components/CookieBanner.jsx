import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../store/AuthContext';
import { publicTable, supabase } from '../lib/supabase';

const COOKIE_CONSENT_KEY = 'jvng_cookie_consent';

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    try {
      const agreed = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${COOKIE_CONSENT_KEY}=`));
      if (!agreed || agreed !== `${COOKIE_CONSENT_KEY}=true`) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const handleAgree = async () => {
    try {
      document.cookie = `${COOKIE_CONSENT_KEY}=true; path=/; max-age=31536000; SameSite=Lax`;
      if (isLoggedIn && user?.id) {
        await publicTable('profiles')
          .upsert(
            {
              id: user.id,
              privacy_policy_agreed: true,
              agreed_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );
      }
    } catch (err) {
      console.warn('[CookieBanner] DB 업데이트 실패:', err);
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-[200] bg-[#F9F9F9] border-t border-[#E5E5E5] px-6 py-5"
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[11px] text-[#333333] leading-relaxed flex-1">
            jvng.은 서비스 이용을 위해 쿠키를 사용하며, 수집된 정보는{' '}
            <a href="/privacy" className="underline underline-offset-2 hover:text-[#000000]">개인정보 처리방침</a>에 따라 처리됩니다.
          </p>
          <button
            type="button"
            onClick={handleAgree}
            className="shrink-0 px-6 py-3 bg-[#000000] text-[#FFFFFF] text-[10px] font-bold uppercase tracking-[0.15em] hover:opacity-90 transition-opacity"
          >
            동의
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CookieBanner;
