import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const SignupPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data?.user && !data?.session) {
      setMessage('가입 완료. 이메일 확인 링크를 보냈습니다. 메일함을 확인해주세요.');
      return;
    }
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-8 pt-20 antialiased">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full space-y-12"
      >
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">Sign Up</h1>
          <p className="text-[10px] text-neutral-500 tracking-mega-wide uppercase font-mono">Join the archive</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-red-500 text-[11px] text-center">{error}</p>
          )}
          {message && (
            <p className="text-purple-400 text-[11px] text-center">{message}</p>
          )}
          <input
            type="email"
            placeholder="EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-neutral-900/30 border border-white/5 px-6 py-4 text-[11px] text-white outline-none focus:border-purple-500/50 transition-all font-mono placeholder:text-neutral-700"
          />
          <input
            type="password"
            placeholder="PASSWORD (6자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full bg-neutral-900/30 border border-white/5 px-6 py-4 text-[11px] text-white outline-none focus:border-purple-500/50 transition-all font-mono placeholder:text-neutral-700"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-5 text-[11px] font-black uppercase tracking-extra-wide hover:bg-purple-600 hover:text-white transition-all duration-500 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center text-[9px] font-bold tracking-widest text-neutral-500 uppercase">
          <Link to="/login" className="hover:text-purple-500 transition-colors">
            Already have an account? Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
