import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../store/AuthContext';
import { publicTable } from '../lib/supabase';

const STORAGE_KEY = 'mamere_cookie_consent';

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== 'accepted' && stored !== 'rejected') {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const persistChoice = (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  const handleAgree = async () => {
    try {
      if (isLoggedIn && user?.id) {
        await publicTable('profiles').upsert(
          {
            id: user.id,
            privacy_policy_agreed: true,
            agreed_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );
      }
    } catch (err) {
      console.warn('[CookieBanner] profiles 업데이트 실패:', err);
    }
    persistChoice('accepted');
  };

  const handleReject = () => {
    persistChoice('rejected');
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="pointer-events-none fixed bottom-4 left-0 right-0 z-[200] flex justify-center px-4"
        role="dialog"
        aria-label="쿠키 안내"
      >
        <div className="pointer-events-auto w-full max-w-lg border border-[#1A1A1A] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <p className="text-[11px] leading-relaxed text-[#333333]">
              마메르는 원활한 서비스 제공과 맞춤형 환경을 위해 쿠키를 사용합니다. (
              <Link
                to="/privacy"
                className="underline decoration-[#1A1A1A] underline-offset-2 transition-opacity hover:opacity-70"
              >
                자세히 보기: /privacy
              </Link>
              )
            </p>
            <div className="flex shrink-0 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleReject}
                className="min-w-[4.5rem] border border-[#1A1A1A] bg-white px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.12em] text-[#1A1A1A] transition-colors hover:bg-[#F5F5F5]"
              >
                거부
              </button>
              <button
                type="button"
                onClick={handleAgree}
                className="min-w-[4.5rem] border border-[#1A1A1A] bg-[#1A1A1A] px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-90"
              >
                동의
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CookieBanner;
