import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, fetchClientIp, logUserConsent } from '../lib/supabase';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX_LENGTH = 254;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const NAME_MAX_LENGTH = 100;
const PHONE_MAX_LENGTH = 20;
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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [phone, setPhone] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const allChecked = agreeTerms && agreePrivacy && agreeMarketing;

  const toggleAll = (checked) => {
    setAgreeTerms(checked);
    setAgreePrivacy(checked);
    setAgreeMarketing(checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!agreeTerms || !agreePrivacy) {
      setError('이용약관과 개인정보 처리방침에 동의해 주세요.');
      return;
    }

    const trimmedName = name.trim().slice(0, NAME_MAX_LENGTH);
    const trimmedEmail = email.trim().slice(0, EMAIL_MAX_LENGTH);
    const trimmedPhone = phone.trim().replace(/\D/g, '').slice(0, 11);

    if (!trimmedName) {
      setError('이름을 입력해 주세요.');
      return;
    }
    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
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
    if (password !== passwordConfirm) {
      setError('비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    if (!trimmedPhone || trimmedPhone.length < 9) {
      setError('휴대폰 번호를 올바르게 입력해 주세요.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: password.slice(0, PASSWORD_MAX_LENGTH),
        options: { data: { full_name: trimmedName, name: trimmedName, phone: trimmedPhone } },
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

      if (data?.user) {
        await supabase.schema('public').from('profiles').upsert(
          { id: data.user.id, full_name: trimmedName, name: trimmedName, phone: trimmedPhone || null },
          { onConflict: 'id' }
        );
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
        } catch {}
        navigate('/', { replace: true });
        return;
      }

      if (data?.user && !data?.session) {
        setMessage('가입이 완료되었습니다. 확인 메일을 확인해 주세요.');
        return;
      }

      navigate('/', { replace: true });
    } catch {
      setError('가입 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white antialiased">
      <div className="mx-auto w-full max-w-[420px] px-4 pb-32 pt-20">
        <h1 className="mb-8 text-[15px] font-medium text-[#1A1A1A]">회원가입</h1>

        <form onSubmit={handleSubmit}>
          {error ? <p className="mb-4 text-[12px] font-light text-red-500">{error}</p> : null}
          {message ? <p className="mb-4 text-[12px] font-light text-[#1A1A1A]">{message}</p> : null}

          <div className="space-y-0">
            <input
              type="text"
              placeholder="이름"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, NAME_MAX_LENGTH))}
              required
              maxLength={NAME_MAX_LENGTH}
              disabled={loading}
              autoComplete="name"
              className="relative w-full rounded-none border border-[#E5E5E5] py-4 px-4 text-[13px] font-light placeholder:text-[#AAAAAA] outline-none focus:border-black focus:z-10 transition-colors"
            />
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value.slice(0, EMAIL_MAX_LENGTH))}
              required
              maxLength={EMAIL_MAX_LENGTH}
              disabled={loading}
              autoComplete="email"
              className="relative -mt-px w-full rounded-none border border-[#E5E5E5] border-t-0 py-4 px-4 text-[13px] font-light placeholder:text-[#AAAAAA] outline-none focus:border-black focus:z-10 transition-colors"
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value.slice(0, PASSWORD_MAX_LENGTH))}
              required
              minLength={PASSWORD_MIN_LENGTH}
              maxLength={PASSWORD_MAX_LENGTH}
              disabled={loading}
              autoComplete="new-password"
              className="relative -mt-px w-full rounded-none border border-[#E5E5E5] border-t-0 py-4 px-4 text-[13px] font-light placeholder:text-[#AAAAAA] outline-none focus:border-black focus:z-10 transition-colors"
            />
            <input
              type="password"
              placeholder="비밀번호 확인"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value.slice(0, PASSWORD_MAX_LENGTH))}
              required
              minLength={PASSWORD_MIN_LENGTH}
              maxLength={PASSWORD_MAX_LENGTH}
              disabled={loading}
              autoComplete="new-password"
              className="relative -mt-px w-full rounded-none border border-[#E5E5E5] border-t-0 py-4 px-4 text-[13px] font-light placeholder:text-[#AAAAAA] outline-none focus:border-black focus:z-10 transition-colors"
            />
            <input
              type="tel"
              placeholder="휴대폰 번호"
              value={phone}
              onChange={(e) => setPhone(e.target.value.slice(0, PHONE_MAX_LENGTH))}
              required
              maxLength={PHONE_MAX_LENGTH}
              disabled={loading}
              autoComplete="tel"
              className="relative -mt-px w-full rounded-none border border-[#E5E5E5] border-t-0 py-4 px-4 text-[13px] font-light placeholder:text-[#AAAAAA] outline-none focus:border-black focus:z-10 transition-colors"
            />
          </div>

          <div className="mt-8">
            <label className="mb-4 flex cursor-pointer items-start gap-3 border-b border-[#E5E5E5] pb-4">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={(e) => toggleAll(e.target.checked)}
                className="relative mt-0.5 h-4 w-4 flex-shrink-0 appearance-none rounded-none border border-[#CCCCCC] cursor-pointer checked:bg-black checked:border-black after:content-[''] checked:after:block after:hidden after:w-1.5 after:h-2.5 after:border-r-2 after:border-b-2 after:border-white after:rotate-45 after:absolute after:left-[4px] after:top-[1px]"
              />
              <span className="text-[12px] font-medium text-[#1A1A1A]">전체 동의</span>
            </label>

            <div className="flex flex-col gap-3">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="relative mt-0.5 h-4 w-4 flex-shrink-0 appearance-none rounded-none border border-[#CCCCCC] cursor-pointer checked:bg-black checked:border-black after:content-[''] checked:after:block after:hidden after:w-1.5 after:h-2.5 after:border-r-2 after:border-b-2 after:border-white after:rotate-45 after:absolute after:left-[4px] after:top-[1px]"
                />
                <span className="text-[12px] font-light text-[#1A1A1A]">
                  <Link to="/terms" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                    이용약관
                  </Link>{' '}
                  동의 (필수)
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                  className="relative mt-0.5 h-4 w-4 flex-shrink-0 appearance-none rounded-none border border-[#CCCCCC] cursor-pointer checked:bg-black checked:border-black after:content-[''] checked:after:block after:hidden after:w-1.5 after:h-2.5 after:border-r-2 after:border-b-2 after:border-white after:rotate-45 after:absolute after:left-[4px] after:top-[1px]"
                />
                <span className="text-[12px] font-light text-[#1A1A1A]">
                  <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                    개인정보처리방침
                  </Link>{' '}
                  동의 (필수)
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={agreeMarketing}
                  onChange={(e) => setAgreeMarketing(e.target.checked)}
                  className="relative mt-0.5 h-4 w-4 flex-shrink-0 appearance-none rounded-none border border-[#CCCCCC] cursor-pointer checked:bg-black checked:border-black after:content-[''] checked:after:block after:hidden after:w-1.5 after:h-2.5 after:border-r-2 after:border-b-2 after:border-white after:rotate-45 after:absolute after:left-[4px] after:top-[1px]"
                />
                <span className="text-[12px] font-light text-[#1A1A1A]">마케팅 수신 동의 (선택)</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 mt-10 text-[13px] font-medium rounded-none transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? '처리 중...' : '회원가입'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
