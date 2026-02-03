import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ cartCount = 0 }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // ... (기존 isSearchOpen, isShopHover 상태 유지)

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-[100] px-6 md:px-8 bg-black/80 backdrop-blur-xl border-b border-white/20 text-white h-20 flex items-center justify-between">
        
        {/* 로고 (모바일에서는 크기를 살짝 조절) */}
        <Link to="/" className="text-lg md:text-xl font-black italic tracking-tighter uppercase shrink-0">
          Double <span className="text-purple-500">Negative</span>
        </Link>

        {/* 데스크탑 메뉴 (md 이상에서만 보임) */}
        <div className="hidden md:flex space-x-10 text-[10px] font-bold tracking-[0.4em] uppercase items-center">
          {/* ... 기존 메뉴 리스트 코드 ... */}
        </div>

        {/* 우측 아이콘 그룹 */}
        <div className="flex items-center space-x-6">
          {/* 검색 버튼 (모바일에서도 유지) */}
          <button onClick={() => setIsSearchOpen(true)} className="hover:text-purple-500 transition-colors">
            <span className="text-[10px] font-bold uppercase tracking-widest">Search</span>
          </button>
          
          {/* 장바구니 (수량 표시 유지) */}
          <Link to="/cart" className="relative">
             <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Cart</span>
             {cartCount > 0 && <span className="absolute -top-2 -right-3 text-[8px] bg-purple-600 px-1 rounded-full">{cartCount}</span>}
          </Link>

          {/* 🍔 모바일 햄버거 버튼 (md 미만에서만 보임) */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex flex-col space-y-1.5 z-[210]"
          >
            <motion.span animate={isMobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} className="w-6 h-[1px] bg-white block" />
            <motion.span animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }} className="w-6 h-[1px] bg-white block" />
            <motion.span animate={isMobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} className="w-6 h-[1px] bg-white block" />
          </button>
        </div>
      </nav>

      {/* 📱 모바일 전체 화면 메뉴 레이어 */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.4 }}
            className="fixed inset-0 bg-black z-[200] flex flex-col justify-center px-12 space-y-8"
          >
            {['Shop', 'Collection', 'Lookbook', 'Philosophy', 'Account'].map((name) => (
              <Link 
                key={name}
                to={`/${name.toLowerCase()}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-4xl font-black italic uppercase tracking-tighter hover:text-purple-500 transition-colors"
              >
                {name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};