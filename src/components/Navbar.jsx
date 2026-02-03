import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ cartCount = 0 }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShopHover, setIsShopHover] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-[100] px-6 md:px-8 bg-black/80 backdrop-blur-xl border-b border-white/20 text-white h-20 flex items-center justify-between">
        
        {/* 1. 왼쪽: 로고 및 데스크톱 메뉴 */}
        <div className="flex items-center space-x-12 lg:space-x-16">
          <Link to="/" className="text-lg md:text-xl font-black italic tracking-tighter uppercase shrink-0">
            Double <span className="text-purple-500">Negative</span>
          </Link>

          {/* 데스크톱 메뉴 (태블릿 이상에서만 노출) */}
          <div className="hidden md:flex space-x-8 lg:space-x-10 text-[10px] font-bold tracking-[0.4em] uppercase items-center">
            <div className="relative" onMouseEnter={() => setIsShopHover(true)} onMouseLeave={() => setIsShopHover(false)}>
              <Link to="/shop" className="relative py-2 group">
                <span className={isShopHover ? "text-purple-500" : ""}>Shop</span>
                <span className={`absolute bottom-0 left-0 h-[1px] bg-purple-500 transition-all duration-500 ${isShopHover ? 'w-full' : 'w-0'}`} />
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
              <Link key={name} to={`/${name.toLowerCase()}`} className="relative py-2 group overflow-hidden">
                <span className="group-hover:text-purple-500 transition-colors">{name}</span>
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </Link>
            ))}
          </div>
        </div>

        {/* 2. 오른쪽: 유틸리티 메뉴 (모바일/데스크톱 공통) */}
        <div className="flex items-center space-x-4 md:space-x-8 text-[10px] font-bold uppercase tracking-[0.2em]">
          <button onClick={() => setIsSearchOpen(true)} className="hover:text-purple-500 transition-colors cursor-pointer">
            Search
          </button>
          
          {/* 데스크톱에서만 보이는 항목들 */}
          <div className="hidden md:flex space-x-8">
            <Link to="/login" className="hover:text-purple-500 transition-colors">Account</Link>
            <Link to="/wishlist" className="hover:text-purple-500 transition-colors">Wishlist (0)</Link>
          </div>

          {/* 장바구니 (모든 기기 공통) */}
          <Link to="/cart" className="relative group hover:text-purple-500 transition-colors">
            Cart ({cartCount})
          </Link>

          {/* 모바일 전용 햄버거 버튼 */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden flex flex-col space-y-1.5 z-[210] ml-2">
            <motion.span animate={isMobileMenuOpen ? { rotate: 45, y: 7, backgroundColor: "#A855F7" } : { rotate: 0, y: 0, backgroundColor: "#FFFFFF" }} className="w-6 h-[1px] block" />
            <motion.span animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }} className="w-6 h-[1px] bg-white block" />
            <motion.span animate={isMobileMenuOpen ? { rotate: -45, y: -7, backgroundColor: "#A855F7" } : { rotate: 0, y: 0, backgroundColor: "#FFFFFF" }} className="w-6 h-[1px] block" />
          </button>
        </div>
      </nav>

      {/* 모바일 전용 메뉴 오버레이 생략 (기존과 동일) */}
      {/* 검색창 오버레이 생략 (기존과 동일) */}
    </>
  );
};

export default Navbar;