import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase, getAuthRedirectUrl } from '../lib/supabase';

const SAVED_EMAIL_KEY = 'dn_saved_email';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX_LENGTH = 254;
const PASSWORD_MAX_LENGTH = 128;

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
    const trimmedEmail = (email ?? '').trim().slice(0, EMAIL_MAX_LENGTH);
    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      setError('올바른 이메일 형식을 입력해 주세요.');
      return;
    }
    if (!password || password.length > PASSWORD_MAX_LENGTH) {
      setError('비밀번호를 입력해 주세요.');
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: password.slice(0, PASSWORD_MAX_LENGTH),
    });

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
    if (error) setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해 주세요.');
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

  const handleFindId = () => {
    setError('아이디 찾기 기능은 준비 중입니다.');
  };

  return (
    <div className="min-h-[calc(100dvh-100px)] bg-white antialiased">
      <div className="mx-auto w-full max-w-[420px] px-4 pt-24 md:pt-28">
        <h1 className="mb-8 text-[15px] font-medium text-[#1A1A1A]">로그인</h1>

        <form onSubmit={handleSubmit}>
          {(error || resetSent || resetSuccess) && (
            <p className="mb-4 text-[12px] font-light text-[#1A1A1A]">
              {error || (resetSent ? '비밀번호 재설정 메일을 보냈습니다.' : '비밀번호가 변경되었습니다.')}
            </p>
          )}

          <div className="space-y-0">
            <input
              type="email"
              placeholder="아이디"
              value={email}
              onChange={(e) => setEmail(e.target.value.slice(0, EMAIL_MAX_LENGTH))}
              required
              maxLength={EMAIL_MAX_LENGTH}
              autoComplete="email"
              className="w-full rounded-none border border-[#E5E5E5] bg-white px-4 py-4 text-[13px] text-[#1A1A1A] outline-none"
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value.slice(0, PASSWORD_MAX_LENGTH))}
              required
              maxLength={PASSWORD_MAX_LENGTH}
              autoComplete="current-password"
              className="w-full rounded-none border border-[#E5E5E5] border-t-0 bg-white px-4 py-4 text-[13px] text-[#1A1A1A] outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-none bg-black py-4 text-[13px] font-medium text-white disabled:opacity-60"
          >
            로그인
          </button>
        </form>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={handleFindId}
            className="text-[12px] font-light text-[#1A1A1A] underline underline-offset-4 decoration-[#AAAAAA]"
          >
            아이디 찾기
          </button>
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={loading || !email.trim()}
            className="text-[12px] font-light text-[#1A1A1A] underline underline-offset-4 decoration-[#AAAAAA] disabled:opacity-50"
          >
            비밀번호 찾기
          </button>
          <Link
            to="/order-lookup"
            className="text-[12px] font-light text-[#1A1A1A] underline underline-offset-4 decoration-[#AAAAAA]"
          >
            비회원 주문조회
          </Link>
        </div>

        <button
          type="button"
          onClick={() => handleOAuthSignIn('kakao')}
          disabled={loading}
          className="mt-10 flex w-full items-center justify-center gap-2 rounded-none border border-black bg-white py-4 text-[13px] font-medium text-black disabled:opacity-60"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
            <path d="M12 4C7.03 4 3 7.18 3 11.1c0 2.6 1.77 4.87 4.4 6.11l-.78 2.89 3.25-2.03c.7.11 1.42.17 2.13.17 4.97 0 9-3.18 9-7.1S16.97 4 12 4z" />
          </svg>
          카카오톡 로그인
        </button>

        <Link
          to="/signup"
          className="mt-10 block w-full rounded-none border border-[#1A1A1A] bg-[#FBFBFB] py-4 text-center text-[13px] font-medium text-black"
        >
          회원가입
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
