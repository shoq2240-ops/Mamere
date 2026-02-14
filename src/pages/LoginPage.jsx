import React from 'react';
import { motion } from 'framer-motion';

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-8 pt-20 antialiased">
      {/* 1. 로그인 박스 애니메이션 */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full space-y-12"
      >
        {/* 헤더 부분 */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">Login</h1>
          <p className="text-[10px] text-neutral-500 tracking-mega-wide uppercase font-mono">Enter the void</p>
        </div>
        
        {/* 로그인 폼 */}
        <form className="space-y-4">
          <input 
            type="email" 
            placeholder="EMAIL" 
            className="w-full bg-neutral-900/30 border border-white/5 px-6 py-4 text-[11px] text-white outline-none focus:border-purple-500/50 transition-all font-mono placeholder:text-neutral-700" 
          />
          <input 
            type="password" 
            placeholder="PASSWORD" 
            className="w-full bg-neutral-900/30 border border-white/5 px-6 py-4 text-[11px] text-white outline-none focus:border-purple-500/50 transition-all font-mono placeholder:text-neutral-700" 
          />
          <button 
            type="submit"
            className="w-full bg-white text-black py-5 text-[11px] font-black uppercase tracking-extra-wide hover:bg-purple-600 hover:text-white transition-all duration-500"
          >
            Sign In
          </button>
        </form>

        {/* 소셜 로그인 섹션 (디자인 팁 반영) */}
        <div className="space-y-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[9px] uppercase tracking-widest text-neutral-600">
              <span className="bg-black px-4 font-bold">OR CONTINUE WITH</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button className="border border-white/10 py-3 text-[10px] font-bold text-white hover:bg-white hover:text-black transition-all">GOOGLE</button>
            <button className="border border-white/10 py-3 text-[10px] font-bold text-white hover:bg-white hover:text-black transition-all">APPLE</button>
          </div>
        </div>

        {/* 하단 링크 */}
        <div className="flex justify-between text-[9px] font-bold tracking-widest text-neutral-500 uppercase">
          <button className="hover:text-purple-500 transition-colors">Forgot Password?</button>
          <button className="hover:text-purple-500 transition-colors underline decoration-purple-500/30 underline-offset-4">Create Account</button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;