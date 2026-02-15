import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('이메일을 입력한 후 비밀번호 재설정을 요청하세요.');
      return;
    }
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/login?reset=success`,
    });
    setLoading(false);
    if (error) {
      setError('요청 처리에 실패했습니다. 이메일을 확인 후 다시 시도해주세요.');
      return;
    }
    setResetSent(true);
  };

  return (
    <div className="min-h-[calc(100dvh-100px)] bg-black flex items-center justify-center px-6 py-4 antialiased">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-sm w-full space-y-6"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Login</h1>
          <p className="text-[9pt] text-neutral-500 tracking-widest uppercase font-mono">Enter the void</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <p className="text-red-500 text-[9pt] text-center">{error}</p>
          )}
          {resetSent && (
            <p className="text-purple-400 text-[9pt] text-center">
              비밀번호 재설정 링크를 이메일로 보냈습니다.
            </p>
          )}
          {resetSuccess && (
            <p className="text-green-400 text-[9pt] text-center">
              비밀번호가 변경되었습니다. 새 비밀번호로 로그인하세요.
            </p>
          )}
          <input
            type="email"
            placeholder="EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-neutral-900/30 border border-white/5 px-4 py-3 text-[9pt] text-white outline-none focus:border-purple-500/50 transition-all font-mono placeholder:text-neutral-700"
          />
          <input
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-neutral-900/30 border border-white/5 px-4 py-3 text-[9pt] text-white outline-none focus:border-purple-500/50 transition-all font-mono placeholder:text-neutral-700"
          />
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={saveEmail}
              onChange={(e) => setSaveEmail(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-neutral-900 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
            />
            <span className="text-[9pt] text-white/60 group-hover:text-white/80 transition-colors">
              아이디 저장
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-3.5 text-[9pt] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all duration-500 disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="flex justify-between items-center text-[9pt] font-bold tracking-widest text-neutral-500 uppercase">
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={loading || !email.trim()}
            className="opacity-80 hover:opacity-100 hover:text-purple-500 transition-colors disabled:opacity-40"
          >
            비밀번호 찾기
          </button>
          <Link to="/signup" className="hover:text-purple-500 transition-colors underline decoration-purple-500/30 underline-offset-4">
            Create Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
