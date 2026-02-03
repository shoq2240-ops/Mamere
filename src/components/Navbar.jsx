import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ cartCount = 0 }) => {
  // 1. 모든 상태 변수 정의 (누락 방지)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShopHover, setIsShopHover] = useState(false);

  const menuLinkClass = "relative py-2 group flex items-center";
  const underlineClass = "absolute bottom-0 left-0 w-full h-[1px] bg-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left";

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-[100] px-6 md:px-8 bg-black/80 backdrop-blur-xl border-b border-white/20 text-white h-20 flex items-center justify-between">
        
        {/* 왼쪽: 로고 */}
        <div className="flex items-center space-x-16">
          <Link to="/" className="text-lg md:text-xl font-black italic tracking-tighter uppercase shrink-0">
            Double <span className="text-purple-500">Negative</span>
          </Link>

          {/* 데스크탑 전용 메뉴 (md 이상) */}
          <div className="hidden md:flex space-x-10 text-[10px] font-bold tracking-[0.4em] uppercase">
            <div 
              className="relative" 
              onMouseEnter={() => setIsShopHover(true)} 
              onMouseLeave={() => setIsShopHover(false)}
            >
              <Link to="/shop" className={menuLinkClass}>
                <span className={isShopHover ? "text-purple-500" : ""}>Shop</span>
                <span className={`absolute bottom-0 left-0 h-[1px] bg-purple-500 transition-all duration-500 origin-left ${isShopHover ? 'w-full scale-x-100' : 'w-full scale-x-0'}`} />
              </Link>
              <AnimatePresence>
                {isShopHover && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute top-full left-0 w-32 bg-black/95 border border-white/10 py-5 flex flex-col space-y-4 shadow-2xl">
                    <Link to="/shop/women" className="px-6 hover:text-purple-500 transition-colors">Women</Link>
                    <Link to="/shop/men" className="px-6 hover:text-purple-500 transition-colors">Men</Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {['Collection', 'Lookbook', 'Philosophy'].map((name) => (
              <Link key={name} to={`/${name.toLowerCase()}`} className={menuLinkClass}>
                <span className="group-hover:text-purple-500 transition-colors">{name}</span>
                <span className={underlineClass} />
              </Link>
            ))}
          </div>
        </div>

        {/* 오른쪽: 유틸리티 아이콘 */}
        <div className="flex items-center space-x-6">
          <button onClick={() => setIsSearchOpen(true)} className="hover:text-purple-500 transition-colors">
            <span className="text-[10px] font-bold uppercase tracking-widest">Search</span>
          </button>
          
          <Link to="/cart" className="relative group">
             <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 group-hover:text-purple-500 transition-colors">Cart</span>
             {cartCount > 0 && (
               <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-3 -right-4 w-4 h-4 bg-purple-600 rounded-full text-[8px] flex items-center justify-center">
                 {cartCount}
               </motion.span>
             )}
          </Link>

          {/* 모바일 햄버거 버튼 */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden flex flex-col space-y-1.5 z-[210]">
            <motion.span animate={isMobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} className="w-6 h-[1px] bg-white block" />
            <motion.span animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }} className="w-6 h-[1px] bg-white block" />
            <motion.span animate={isMobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} className="w-6 h-[1px] bg-white block" />
          </button>
        </div>
      </nav>

      {/* 📱 모바일 메뉴 레이어 */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.4 }} className="fixed inset-0 bg-black z-[200] flex flex-col justify-center px-12 space-y-8 text-white">
            {['Shop', 'Collection', 'Lookbook', 'Philosophy', 'Account'].map((name) => (
              <Link key={name} to={`/${name.toLowerCase()}`} onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-black italic uppercase tracking-tighter hover:text-purple-500 transition-colors">
                {name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔍 검색창 레이어 (Search 기능 복구) */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div initial={{ y: "-100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }} className="fixed top-0 left-0 w-full h-80 bg-black z-[250] px-8 flex flex-col justify-center border-b border-purple-500/30 text-white">
            <div className="max-w-4xl mx-auto w-full relative">
              <input autoFocus type="text" placeholder="SEARCH YOUR NEGATIVE" className="w-full bg-transparent border-b border-white/20 py-6 text-5xl font-black italic uppercase outline-none focus:border-purple-500 transition-colors tracking-tighter" />
              <button onClick={() => setIsSearchOpen(false)} className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-widest opacity-50 hover:opacity-100">CLOSE [ESC]</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;