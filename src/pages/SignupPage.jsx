import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, fetchClientIp, logUserConsent, getAuthRedirectUrl } from '../lib/supabase';
import { useLanguage } from '../store/LanguageContext';

const SignupPage = () => {
  const navigate = useNavigate();
  const { t, locale } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleOAuthSignIn = async (provider) => {
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: getAuthRedirectUrl('/') },
    });
    setLoading(false);
    if (error) setError(error.message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!agreeTerms || !agreePrivacy) {
      setError('이용약관과 개인정보 처리방침에 동의해 주세요.');
      return;
    }
    setLoading(true);

    // options.data는 handle_new_user 트리거에서 profiles.full_name으로 사용됨 (full_name, name, 없으면 email)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: email.split('@')[0] || '',
          name: email.split('@')[0] || '',
        },
      },
    });

    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    // 세션 있으면 동의 로그 기록 (IP, 동의 시점)
    if (data?.user && data?.session) {
      const ip = await fetchClientIp();
      await logUserConsent({
        userId: data.user.id,
        ipAddress: ip,
        termsAgreedAt: new Date().toISOString(),
        privacyAgreedAt: new Date().toISOString(),
        marketingAgreed: agreeMarketing,
      });
    }

    setLoading(false);
    if (data?.user && !data?.session) {
      setMessage(t('signup.messageSent'));
      return;
    }
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center px-8 pt-20 antialiased text-[#3E2F28]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full space-y-12"
      >
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-[#3E2F28]">{t('signup.title')}</h1>
          <p className="text-[10px] font-light text-[#7A6B63] tracking-mega-wide uppercase">{t('signup.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-red-500 text-[11px] text-center">{error}</p>
          )}
          {message && (
            <p className="text-[#666666] text-[11px] text-center">{message}</p>
          )}
          <input
            type="email"
            placeholder={t('signup.email').toUpperCase()}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-[#F9F9F9] px-6 py-4 text-[11px] text-[#000000] outline-none focus:bg-[#F5F5F5] transition-all font-light placeholder:text-[#999999]"
          />
          <input
            type="password"
            placeholder={t('signup.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full bg-[#F9F9F9] px-6 py-4 text-[11px] text-[#000000] outline-none focus:bg-[#F5F5F5] transition-all font-light placeholder:text-[#999999]"
          />

          <div className="space-y-3 py-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-[#A8B894]/50 bg-[#F9F7F2] text-[#3E2F28] focus:ring-[#A8B894] focus:ring-offset-0"
              />
              <span className="text-[10px] text-[#5C4A42] group-hover:text-[#3E2F28] transition-colors">
                <Link to="/terms" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{t('footer.terms')}</Link> {t('signup.agreeTermsLabel')}
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreePrivacy}
                onChange={(e) => setAgreePrivacy(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-[#A8B894]/50 bg-[#F9F7F2] text-[#3E2F28] focus:ring-[#A8B894] focus:ring-offset-0"
              />
              <span className="text-[10px] text-[#5C4A42] group-hover:text-[#3E2F28] transition-colors">
                <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{t('footer.privacy')}</Link> {t('signup.agreePrivacyLabel')}
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreeMarketing}
                onChange={(e) => setAgreeMarketing(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-[#CCCCCC] bg-white text-[#000000] focus:ring-[#000000] focus:ring-offset-0"
              />
              <span className="text-[10px] text-[#5C4A42] group-hover:text-[#3E2F28] transition-colors">
                {t('signup.agreeMarketing')}
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#A8B894] text-[#2D3A2D] py-5 text-[11px] font-black uppercase tracking-extra-wide hover:opacity-90 transition-all duration-500 disabled:opacity-50"
          >
            {loading ? (locale === 'ko' ? '가입 중...' : 'Creating...') : t('signup.submit')}
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#A8B894]/30" />
            </div>
            <div className="relative flex justify-center text-[9px] uppercase tracking-widest text-[#7A6B63]">
              {t('login.or')}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleOAuthSignIn('kakao')}
              disabled={loading || !agreeTerms || !agreePrivacy}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#FEE500] text-[#191919] text-[10px] font-bold rounded transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 01-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
              </svg>
              {locale === 'ko' ? '카카오로 시작' : 'Kakao'}
            </button>
            <button
              type="button"
              onClick={() => handleOAuthSignIn('google')}
              disabled={loading || !agreeTerms || !agreePrivacy}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#F9F7F2] text-[#3E2F28] border border-[#A8B894]/50 text-[10px] font-bold rounded transition-opacity hover:bg-[#F5F3EE] disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {locale === 'ko' ? '구글로 시작' : 'Google'}
            </button>
          </div>
        </form>

        <div className="text-center text-[9px] font-bold tracking-widest text-[#7A6B63] uppercase">
          <Link to="/login" className="hover:text-[#3E2F28] transition-colors">
            {t('signup.haveAccount')} {t('signup.login')}
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
