import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, fetchClientIp, logUserConsent, getAuthRedirectUrl } from '../lib/supabase';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX_LENGTH = 254;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
// 영문, 숫자, 특수문자 각 1종 이상 포함
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,128}$/;

function isDuplicateEmailError(err) {
  if (!err?.message) return false;
  const msg = String(err.message).toLowerCase();
  return (
    msg.includes('already registered') ||
    msg.includes('user already exists') ||
    msg.includes('already been registered') ||
    msg.includes('email already') ||
    msg.includes('duplicate') ||
    err.code === 'user_already_exists'
  );
}

function isDuplicateUserResponse(data) {
  if (!data?.user) return false;
  const identities = data.user.identities;
  return Array.isArray(identities) && identities.length === 0;
}

const SignupPage = () => {
  const navigate = useNavigate();
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
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: getAuthRedirectUrl('/') },
      });
      if (error) setError('OAuth 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } catch (err) {
      setError('OAuth 로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!agreeTerms || !agreePrivacy) {
      setError('이용약관과 개인정보 처리방침에 동의해 주세요.');
      return;
    }

    const trimmedEmail = email.trim().slice(0, EMAIL_MAX_LENGTH);
    if (!trimmedEmail) {
      setError('올바른 이메일 형식을 입력해 주세요.');
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('올바른 이메일 형식을 입력해 주세요.');
      return;
    }
    if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
      setError('비밀번호는 8자 이상 128자 이하여야 합니다.');
      return;
    }
    if (!PASSWORD_REGEX.test(password)) {
      setError('비밀번호는 영문, 숫자, 특수문자를 각 1종 이상 포함해 주세요.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: password.slice(0, PASSWORD_MAX_LENGTH),
        options: { data: {} },
      });

      if (signUpError) {
        if (isDuplicateEmailError(signUpError)) {
          setError('이미 가입된 이메일입니다.');
          return;
        }
        setError('가입에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        return;
      }

      if (data?.user && isDuplicateUserResponse(data)) {
        setError('이미 가입된 이메일입니다.');
        return;
      }

      if (data?.user && data?.session) {
        try {
          const ip = await fetchClientIp();
          await logUserConsent({
            userId: data.user.id,
            ipAddress: ip,
            termsAgreedAt: new Date().toISOString(),
            privacyAgreedAt: new Date().toISOString(),
            marketingAgreed: agreeMarketing,
          });
        } catch {
          // 동의 로그 실패해도 가입 성공은 유지
        }
        navigate('/', { replace: true });
        return;
      }

      if (data?.user && !data?.session) {
        setMessage('가입이 완료되었습니다. 확인 메일을 확인해 주세요.');
        return;
      }

      navigate('/', { replace: true });
    } catch (err) {
      setError('가입 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-8 pt-20 antialiased text-[#3E2F28]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full space-y-12"
      >
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-semibold uppercase tracking-tight text-[#3E2F28]">join</h1>
          <p className="text-[10px] font-light text-[#7A6B63] tracking-mega-wide uppercase">create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-red-500 text-[11px] text-center" role="alert">{error}</p>
          )}
          {message && (
            <p className="text-[#666666] text-[11px] text-center">{message}</p>
          )}
          <input
            type="email"
            placeholder="EMAIL"
            value={email}
            onChange={(e) => { setEmail(e.target.value.slice(0, EMAIL_MAX_LENGTH)); setError(''); }}
            required
            maxLength={EMAIL_MAX_LENGTH}
            disabled={loading}
            autoComplete="email"
            className="w-full bg-[#F9F9F9] px-6 py-4 text-[11px] text-[#000000] outline-none focus:bg-[#F5F5F5] transition-all font-light placeholder:text-[#999999] disabled:opacity-70 disabled:cursor-not-allowed"
          />
          <input
            type="password"
            placeholder="비밀번호 (영문/숫자/특수문자 포함)"
            value={password}
            onChange={(e) => setPassword(e.target.value.slice(0, PASSWORD_MAX_LENGTH))}
            required
            minLength={PASSWORD_MIN_LENGTH}
            maxLength={PASSWORD_MAX_LENGTH}
            disabled={loading}
            autoComplete="new-password"
            className="w-full bg-[#F9F9F9] px-6 py-4 text-[11px] text-[#000000] outline-none focus:bg-[#F5F5F5] transition-all font-light placeholder:text-[#999999] disabled:opacity-70 disabled:cursor-not-allowed"
          />

          <div className="space-y-3 py-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-[#A8B894]/50 bg-white text-[#3E2F28] focus:ring-[#A8B894] focus:ring-offset-0"
              />
              <span className="text-[10px] text-[#5C4A42] group-hover:text-[#3E2F28] transition-colors">
                <Link to="/terms" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">이용약관</Link> 동의 (필수)
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreePrivacy}
                onChange={(e) => setAgreePrivacy(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-[#A8B894]/50 bg-white text-[#3E2F28] focus:ring-[#A8B894] focus:ring-offset-0"
              />
              <span className="text-[10px] text-[#5C4A42] group-hover:text-[#3E2F28] transition-colors">
                <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">개인정보처리방침</Link> 동의 (필수)
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
                마케팅 수신 동의 (선택)
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#A8B894] text-[#2D3A2D] py-5 text-[11px] font-medium uppercase tracking-widest hover:opacity-90 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="inline-block w-4 h-4 border-2 border-[#2D3A2D]/40 border-t-[#2D3A2D] rounded-full animate-spin" aria-hidden />
            )}
            {loading ? '처리 중...' : '가입하기'}
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#A8B894]/30" />
            </div>
            <div className="relative flex justify-center text-[9px] uppercase tracking-widest text-[#7A6B63]">
              OR
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
              카카오로 시작
            </button>
            <button
              type="button"
              onClick={() => handleOAuthSignIn('google')}
              disabled={loading || !agreeTerms || !agreePrivacy}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-white text-[#3E2F28] border border-[#A8B894]/50 text-[10px] font-bold rounded transition-opacity hover:bg-white disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              구글로 시작
            </button>
          </div>
        </form>

        <div className="text-center text-[9px] font-bold tracking-widest text-[#7A6B63] uppercase">
          <Link to="/login" className="hover:text-[#3E2F28] transition-colors">
            이미 계정이 있으신가요? 로그인
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
