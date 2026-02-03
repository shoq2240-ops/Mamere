import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ cartCount = 0 }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShopHover, setIsShopHover] = useState(false);

  // 공통 스타일 클래스
  const menuLinkClass = "relative py-2 group flex items-center";
  const underlineClass = "absolute bottom-0 left-0 w-full h-[1px] bg-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left";

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-[100] px-6 md:px-8 bg-black/80 backdrop-blur-xl border-b border-white/20 text-white h-20 flex items-center justify-between">
        
        {/* 1. 왼쪽: 로고 및 데스크탑 메뉴 */}
        <div className="flex items-center space-x-16">
          <Link to="/" className="text-xl font-black italic tracking-tighter uppercase shrink-0">
            Double <span className="text-purple-500">Negative</span>
          </Link>

          {/* 데스크탑 전용 (md 이상에서만 보임) */}
          <div className="hidden md:flex space-x-10 text-[10px] font-bold tracking-[0.4em] uppercase items-center">
            <div className="relative" onMouseEnter={() => setIsShopHover(true)} onMouseLeave={() => setIsShopHover(false)}>
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

        {/* 2. 오른쪽: 유틸리티 (웹/모바일 레이아웃 핵심) */}
        <div className="flex items-center space-x-5 md:space-x-8 text-[10px] font-bold uppercase tracking-[0.2em]">
          {/* 웹에서만 보이는 항목들 (hidden md:block) */}
          <button onClick={() => setIsSearchOpen(true)} className="hover:text-purple-500 transition-colors">Search</button>
          <Link to="/login" className="hidden md:block hover:text-purple-500 transition-colors opacity-80">Account</Link>
          <button className="hidden md:block hover:text-purple-500 transition-colors opacity-80">Wishlist (0)</button>
          
          {/* 모바일/웹 공통 Cart */}
          <Link to="/cart" className="relative group">
            <span className="opacity-80 group-hover:text-purple-500 transition-colors">Cart</span>
            {cartCount > 0 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-3 -right-4 w-4 h-4 bg-purple-600 rounded-full text-[8px] flex items-center justify-center font-mono">
                {cartCount}
              </motion.span>
            )}
          </Link>

          {/* 🍔 모바일 햄버거 버튼 (md:hidden) */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden flex flex-col space-y-1.5 z-[210] ml-2">
            <motion.span animate={isMobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} className="w-6 h-[1px] bg-white block" />
            <motion.span animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }} className="w-6 h-[1px] bg-white block" />
            <motion.span animate={isMobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} className="w-6 h-[1px] bg-white block" />
          </button>
        </div>
      </nav>

      {/* 📱 모바일 메뉴 레이어 (사라진 항목들 여기 다 넣기) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.4 }} className="fixed inset-0 bg-black z-[200] flex flex-col justify-center px-12 space-y-6 text-white overflow-y-auto">
            {/* 메인 메뉴들 */}
            <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-black italic uppercase tracking-tighter hover:text-purple-500">Shop</Link>
            <div className="flex space-x-4 pl-2 opacity-60">
                <Link to="/shop/women" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest">Women</Link>
                <Link to="/shop/men" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest">Men</Link>
            </div>
            <Link to="/collection" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-black italic uppercase tracking-tighter hover:text-purple-500">Collection</Link>
            <Link to="/lookbook" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-black italic uppercase tracking-tighter hover:text-purple-500">Lookbook</Link>
            <Link to="/philosophy" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-black italic uppercase tracking-tighter hover:text-purple-500">Philosophy</Link>
            
            <div className="h-[1px] bg-white/10 w-full my-4" />
            
            {/* 모바일 전용 하단 유틸리티 */}
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold uppercase tracking-[0.2em] opacity-80">Account</Link>
            <button className="text-left text-lg font-bold uppercase tracking-[0.2em] opacity-80">Wishlist (0)</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔍 검색창 레이어 생략 (이전과 동일) */}
    </>
  );
};

export default Navbar;