import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ cartCount = 0 }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      {/* 1. 상단바: 다크 무드 적용 */}
      <nav className="fixed top-0 left-0 w-full z-[110] bg-black/80 backdrop-blur-xl border-b border-white/10 text-white">
        <div className="h-14 flex items-center justify-between px-5 relative">
          
          {/* 왼쪽: 햄버거 버튼 (흰색 선) */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="w-10 h-10 -ml-2 flex flex-col justify-center items-center gap-[6px] z-[120]"
          >
            <motion.span 
              animate={isMobileMenuOpen ? { rotate: 45, y: 7, backgroundColor: "#A855F7" } : { rotate: 0, y: 0, backgroundColor: "#FFFFFF" }} 
              className="w-5 h-[1px] block"
            />
            <motion.span 
              animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }} 
              className="w-5 h-[1px] bg-white block"
            />
            <motion.span 
              animate={isMobileMenuOpen ? { rotate: -45, y: -7, backgroundColor: "#A855F7" } : { rotate: 0, y: 0, backgroundColor: "#FFFFFF" }} 
              className="w-5 h-[1px] block"
            />
          </button>

          {/* 중앙: 로고 (보라색 포인트 복구) */}
          <Link 
            to="/" 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-black italic tracking-[0.4em] uppercase"
          >
            Double <span className="text-purple-500">Negative</span>
          </Link>

          {/* 오른쪽: 아이콘 버튼 그룹 */}
          <div className="flex items-center gap-1 z-[120]">
            <button onClick={() => setIsSearchOpen(true)} className="w-10 h-10 flex items-center justify-center hover:text-purple-500 transition-colors">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>
            <Link to="/cart" className="w-10 h-10 flex items-center justify-center relative hover:text-purple-500 transition-colors">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-2 right-1.5 bg-purple-600 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-mono animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. 세로 전체 화면 메뉴 (다크 모드 + 보라색 그라데이션) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ x: "-100%" }} 
            animate={{ x: 0 }} 
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-black z-[105] flex flex-col pt-24 pb-12 px-8 text-white"
          >
            {/* 은은한 보랏빛 배경 광원 효과 추가 */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-purple-900/20 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-purple-900/10 blur-[100px] pointer-events-none" />

            <div className="flex-1 flex flex-col justify-center space-y-8 relative z-10">
              {['Shop', 'Collection', 'Lookbook', 'Philosophy', 'Account'].map((name, i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link 
                    to={`/${name.toLowerCase()}`} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-4xl font-black italic tracking-tighter uppercase hover:text-purple-500 transition-all duration-300"
                  >
                    {name}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-8 space-y-4 relative z-10">
              <p className="text-[9px] tracking-widest text-white/30 uppercase">© 2026 Double Negative Archive</p>
              <div className="flex gap-6 text-[10px] tracking-[0.2em] uppercase font-bold text-white/60">
                <Link to="/contact" className="hover:text-purple-500">Contact</Link>
                <Link to="/instagram" className="hover:text-purple-500">Instagram</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;