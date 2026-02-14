import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { supabase } from '../lib/supabase';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // 로그인 안 되어 있으면 로그인 페이지로 (auth 로딩 끝난 뒤에만)
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, isLoggedIn, navigate]);

  // 프로필 로드 (본인 행만)
  useEffect(() => {
    if (!user?.id) return;

    const loadProfile = async () => {
      setLoading(true);
      setError('');
      const { data, error } = await supabase
        .from('profiles')
        .select('name, address, phone')
        .eq('id', user.id)
        .maybeSingle();

      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      if (data) {
        setName(data.name ?? '');
        setAddress(data.address ?? '');
        setPhone(data.phone ?? '');
      }
    };

    loadProfile();
  }, [user?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;

    setSaving(true);
    setError('');
    setMessage('');

    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          name: name.trim() || null,
          address: address.trim() || null,
          phone: phone.trim() || null,
        },
        { onConflict: 'id' }
      );

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setMessage('저장되었습니다.');
  };

  if (authLoading || !isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-8 pt-24 pb-20 antialiased">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center space-y-2 mb-10">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
            Profile
          </h1>
          <p className="text-[10px] text-neutral-500 tracking-mega-wide uppercase font-mono">
            이름, 주소, 전화번호를 입력하세요
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="inline-block w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-[10px] text-white/40 tracking-widest uppercase">Loading...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <p className="text-red-500 text-[11px] text-center">{error}</p>
            )}
            {message && (
              <p className="text-purple-400 text-[11px] text-center">{message}</p>
            )}

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-white/50 mb-2">
                이름
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름"
                className="w-full bg-neutral-900/30 border border-white/5 px-6 py-4 text-[11px] text-white outline-none focus:border-purple-500/50 transition-all placeholder:text-neutral-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-white/50 mb-2">
                주소
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="주소"
                className="w-full bg-neutral-900/30 border border-white/5 px-6 py-4 text-[11px] text-white outline-none focus:border-purple-500/50 transition-all placeholder:text-neutral-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-white/50 mb-2">
                전화번호
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="전화번호"
                className="w-full bg-neutral-900/30 border border-white/5 px-6 py-4 text-[11px] text-white outline-none focus:border-purple-500/50 transition-all placeholder:text-neutral-600"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-white text-black py-5 text-[11px] font-black uppercase tracking-extra-wide hover:bg-purple-600 hover:text-white transition-all duration-500 disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-[10px] font-light tracking-widest uppercase text-white/40 hover:text-purple-500 transition-colors"
          >
            ← 홈으로
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
