import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ cartCount = 0 }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate(); // 페이지 이동을 위한 훅

  // 메뉴 클릭 시 메뉴창을 닫고 해당 페이지로 이동하는 함수
  const handleMenuClick = (path) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* 1. 상단바 (고정) */}
      <nav className="fixed top-0 left-0 w-full z-[110] bg-black/80 backdrop-blur-xl border-b border-white/10 text-white">
        <div className="h-14 flex items-center justify-between px-5 relative">
          
          {/* 왼쪽: 햄버거 버튼 */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="w-10 h-10 -ml-2 flex flex-col justify-center items-center gap-[6px] z-[210]"
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

          {/* 중앙: 로고 */}
          <Link to="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-black italic tracking-[0.4em] uppercase z-[210]">
            Double <span className="text-purple-500">Negative</span>
          </Link>

          {/* 오른쪽: Search & Cart 버튼 */}
          <div className="flex items-center gap-1 z-[210]">
            <button 
              onClick={() => { setIsSearchOpen(true); setIsMobileMenuOpen(false); }} 
              className="w-10 h-10 flex items-center justify-center hover:text-purple-500 transition-colors"
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>
            <Link to="/cart" className="w-10 h-10 flex items-center justify-center relative hover:text-purple-500">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-2 right-1.5 bg-purple-600 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-mono">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. 모바일 메뉴 레이어 */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            className="fixed inset-0 bg-black z-[200] flex flex-col pt-24 pb-12 px-8 text-white"
          >
            <div className="flex-1 flex flex-col justify-center space-y-8">
              {[
                { name: 'Shop', path: '/shop' },
                { name: 'Collection', path: '/collection' },
                { name: 'Lookbook', path: '/lookbook' },
                { name: 'Philosophy', path: '/philosophy' },
                { name: 'Account', path: '/login' } // Account 클릭 시 로그인 페이지로
              ].map((item, i) => (
                <motion.div key={item.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}>
                  <button 
                    onClick={() => handleMenuClick(item.path)}
                    className="text-4xl font-black italic tracking-tighter uppercase text-left hover:text-purple-500 transition-colors w-full"
                  >
                    {item.name}
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Search 모달 (z-index를 최상위인 300으로 설정) */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[300] flex flex-col items-center pt-32 px-6"
          >
            <div className="w-full max-w-lg relative">
              <input 
                autoFocus
                type="text" 
                placeholder="SEARCH ARCHIVE" 
                className="w-full bg-transparent border-b border-purple-500 py-4 text-2xl font-black italic uppercase outline-none text-white placeholder-white/20"
              />
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-purple-500 font-bold text-xs uppercase"
              >
                Close
              </button>
            </div>
            <div className="mt-10 text-[10px] tracking-widest text-white/40 uppercase">Press Enter to Search</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;