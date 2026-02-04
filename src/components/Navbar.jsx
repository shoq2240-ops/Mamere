import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ cartCount = 0 }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      {/* 1. 상단바: 세로 모드에서 한눈에 들어오는 비율 */}
      <nav className="fixed top-0 left-0 w-full z-[110] bg-white/90 backdrop-blur-md border-b border-black/5">
        <div className="h-14 flex items-center justify-between px-5 relative">
          
          {/* 왼쪽: 햄버거 버튼 (반응 범위를 위해 패딩 추가) */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="w-10 h-10 -ml-2 flex flex-col justify-center items-center gap-[6px] z-[120]"
          >
            <motion.span 
              animate={isMobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} 
              className="w-5 h-[1px] bg-black block"
            />
            <motion.span 
              animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }} 
              className="w-5 h-[1px] bg-black block"
            />
            <motion.span 
              animate={isMobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} 
              className="w-5 h-[1px] bg-black block"
            />
          </button>

          {/* 중앙: 로고 (세로 모드에서 시선이 집중되는 위치) */}
          <Link 
            to="/" 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-medium tracking-[0.4em] uppercase text-black"
          >
            Double Negative
          </Link>

          {/* 오른쪽: 아이콘 버튼 그룹 */}
          <div className="flex items-center gap-1 z-[120]">
            <button onClick={() => setIsSearchOpen(true)} className="w-10 h-10 flex items-center justify-center">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.1" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>
            <Link to="/cart" className="w-10 h-10 flex items-center justify-center relative">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.1" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-2 right-1.5 bg-black text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-mono">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. 세로 전체 화면 메뉴 (우영미 스타일) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[105] flex flex-col pt-24 pb-12 px-8"
          >
            <div className="flex-1 flex flex-col justify-center space-y-9">
              {['Shop', 'Collection', 'Lookbook', 'Philosophy', 'Account'].map((name, i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link 
                    to={`/${name.toLowerCase()}`} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-3xl font-extralight tracking-[0.2em] uppercase text-black hover:opacity-40 transition-opacity"
                  >
                    {name}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* 하단 정보 영역 */}
            <div className="border-t border-black/5 pt-8 space-y-4">
              <p className="text-[9px] tracking-widest text-black/40 uppercase">© 2026 Double Negative Archive</p>
              <div className="flex gap-6 text-[10px] tracking-wider uppercase">
                <Link to="/contact" className="hover:text-purple-500">Contact</Link>
                <Link to="/instagram" className="hover:text-purple-500">Instagram</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. 검색창 (동일) */}
    </>
  );
};
<nav className="fixed top-0 left-0 w-full z-[100] bg-red-500 ..."></nav>
export default Navbar;