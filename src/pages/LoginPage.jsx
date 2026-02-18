import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase, getAuthRedirectUrl } from '../lib/supabase';
import brandLogo from '../asset/brand.logo.png';

const SAVED_EMAIL_KEY = 'dn_saved_email';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saveEmail, setSaveEmail] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const resetSuccess = searchParams.get('reset') === 'success';

  useEffect(() => {
    if (resetSuccess) {
      setSearchParams({}, { replace: true });
    }
  }, [resetSuccess, setSearchParams]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVED_EMAIL_KEY);
      if (saved) {
        setEmail(saved);
        setSaveEmail(true);
      }
    } catch (_) {}
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError('회원 정보가 없습니다');
      return;
    }
    try {
      if (saveEmail) localStorage.setItem(SAVED_EMAIL_KEY, email);
      else localStorage.removeItem(SAVED_EMAIL_KEY);
    } catch (_) {}
    navigate('/', { replace: true });
  };

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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('이메일을 입력한 후 비밀번호 재설정을 요청하세요.');
      return;
    }
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: getAuthRedirectUrl('/login?reset=success'),
    });
    setLoading(false);
    if (error) {
      setError('요청 처리에 실패했습니다. 이메일을 확인 후 다시 시도해주세요.');
      return;
    }
    setResetSent(true);
  };

  return (
    <div className="min-h-[calc(100dvh-100px)] bg-[#FFFFFF] flex items-center justify-center px-6 py-12 antialiased">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-sm w-full space-y-8"
      >
        <div className="flex flex-col items-center gap-10">
          <img src={brandLogo} alt="jvng." className="h-20 md:h-24 w-auto object-contain" />
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold uppercase tracking-[0.2em] text-[#000000]">Login</h1>
            <p className="text-[9pt] text-[#999999] tracking-[0.15em] uppercase">계정에 로그인하세요</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-red-600 text-[9pt] text-center">{error}</p>
          )}
          {resetSent && (
            <p className="text-[#666666] text-[9pt] text-center">
              비밀번호 재설정 링크를 이메일로 보냈습니다.
            </p>
          )}
          {resetSuccess && (
            <p className="text-green-600 text-[9pt] text-center">
              비밀번호가 변경되었습니다. 새 비밀번호로 로그인하세요.
            </p>
          )}
          <input
            type="email"
            placeholder="EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-[#F9F9F9] px-5 py-4 text-[9pt] text-[#000000] outline-none focus:bg-[#F5F5F5] transition-all placeholder-[#999999] tracking-[0.1em]"
          />
          <input
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-[#F9F9F9] px-5 py-4 text-[9pt] text-[#000000] outline-none focus:bg-[#F5F5F5] transition-all placeholder-[#999999] tracking-[0.1em]"
          />
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={saveEmail}
              onChange={(e) => setSaveEmail(e.target.checked)}
              className="w-4 h-4 rounded border-[#CCCCCC] bg-white text-[#000000] focus:ring-[#000000] focus:ring-offset-0"
            />
            <span className="text-[9pt] text-[#666666] group-hover:text-[#000000] transition-colors">
              아이디 저장
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#000000] text-[#FFFFFF] py-4 text-[9pt] font-bold uppercase tracking-[0.15em] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="relative py-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#F0F0F0]" />
            </div>
            <div className="relative flex justify-center text-[9px] uppercase tracking-[0.15em] text-[#999999] bg-[#FFFFFF] px-4">
              또는
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleOAuthSignIn('kakao')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#FEE500] text-[#191919] text-[9pt] font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 01-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
              </svg>
              카카오
            </button>
            <button
              type="button"
              onClick={() => handleOAuthSignIn('google')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#FFFFFF] text-[#333333] border border-[#E5E5E5] text-[9pt] font-bold transition-opacity hover:bg-[#F9F9F9] disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              구글
            </button>
          </div>
        </form>

        <div className="flex justify-between items-center text-[9pt] font-medium tracking-[0.1em] text-[#666666] uppercase">
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={loading || !email.trim()}
            className="hover:text-[#000000] transition-colors disabled:opacity-40"
          >
            비밀번호 찾기
          </button>
          <Link to="/signup" className="hover:text-[#000000] transition-colors underline underline-offset-4 decoration-[#CCCCCC] hover:decoration-[#000000]">
            Create Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
