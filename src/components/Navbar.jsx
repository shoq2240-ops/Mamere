import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../store/CartContext'; // 폴더명 확인 필수!

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleMenuClick = (path) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  const navLinks = [
    { name: 'Shop', path: '/shop' },
    { name: 'Collection', path: '/collection' },
    { name: 'Lookbook', path: '/lookbook' },
    { name: 'Philosophy', path: '/philosophy' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-[110] bg-black/80 backdrop-blur-xl border-b border-white/10 text-white">
        <div className="max-w-[1800px] mx-auto h-16 flex items-center px-6 relative">
          
          {/* [좌측 구역]: 데스크톱 로고 + 데스크톱 메뉴 */}
          <div className="flex items-center gap-12">
            {/* 데스크톱 로고: md 이상에서만 보이고 왼쪽 정렬 */}
            <Link to="/" className="hidden md:block text-[14px] font-black italic tracking-[0.4em] uppercase">
              Double <span className="text-purple-500">Negative</span>
            </Link>

            {/* 데스크톱 메뉴: 로고 바로 옆에 배치 */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  className="text-[10px] font-bold tracking-[0.2em] uppercase hover:text-purple-500 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* [모바일 전용]: 햄버거 버튼 (md 미만 노출) */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="md:hidden w-10 h-10 -ml-2 flex flex-col justify-center items-center gap-[6px] z-[210]"
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

          {/* [모바일 전용 로고]: 중앙 배치 (md 미만 노출) */}
          <Link to="/" className="md:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-black italic tracking-[0.4em] uppercase z-[210]">
            Double <span className="text-purple-500">Negative</span>
          </Link>

          {/* [우측 구역]: Search, Cart, Account (언제나 우측 고정) */}
          <div className="ml-auto flex items-center gap-1 z-[210]">
            <Link to="/login" className="hidden md:block text-[10px] font-bold tracking-widest uppercase mr-4 hover:text-purple-500">Account</Link>
            
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

      {/* 모바일 메뉴 & 검색창 로직 (기존과 동일) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            className="fixed inset-0 bg-black z-[200] flex flex-col pt-32 px-8 text-white md:hidden"
          >
            <div className="flex-1 flex flex-col justify-center space-y-8">
              {[...navLinks, { name: 'Account', path: '/login' }].map((item, i) => (
                <motion.div key={item.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                  <button onClick={() => handleMenuClick(item.path)} className="text-5xl font-black italic tracking-tighter uppercase text-left hover:text-purple-500 w-full">
                    {item.name}
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 z-[300] flex flex-col items-center pt-40 px-6">
            <div className="w-full max-w-2xl relative">
              <input autoFocus type="text" placeholder="SEARCH ARCHIVE" className="w-full bg-transparent border-b border-purple-500 py-4 text-3xl md:text-5xl font-black italic uppercase outline-none text-white placeholder-white/10" />
              <button onClick={() => setIsSearchOpen(false)} className="absolute right-0 top-1/2 -translate-y-1/2 text-purple-500 font-bold text-xs uppercase tracking-widest">Close</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;