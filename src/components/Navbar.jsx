import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ cartCount = 0 }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShopHover, setIsShopHover] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-[100] px-5 md:px-10 bg-black/90 backdrop-blur-xl border-b border-white/10 text-white h-20 flex items-center justify-between">
        
        {/* 1. 왼쪽 영역: 로고 및 데스크탑 전용 메뉴 */}
        <div className="flex items-center min-w-0"> {/* min-w-0: 텍스트가 넘쳐도 레이아웃 유지 */}
          <Link to="/" className="text-lg md:text-xl font-black italic uppercase tracking-tighter shrink-0 mr-8 md:mr-16">
            Double <span className="text-purple-500">Negative</span>
          </Link>

          {/* 데스크탑 메뉴: md(768px) 이상에서만 노출 */}
          <div className="hidden md:flex space-x-10 text-[10px] font-bold tracking-[0.4em] uppercase items-center">
            {/* Shop 드롭다운 로직은 동일하게 유지 */}
            <div className="relative" onMouseEnter={() => setIsShopHover(true)} onMouseLeave={() => setIsShopHover(false)}>
              <Link to="/shop" className="hover:text-purple-500 py-2 block">Shop</Link>
              {/* ... (생략된 드롭다운 AnimatePresence 로직) */}
            </div>
            <Link to="/collection" className="hover:text-purple-500 py-2">Collection</Link>
            <Link to="/lookbook" className="hover:text-purple-500 py-2">Lookbook</Link>
            <Link to="/philosophy" className="hover:text-purple-500 py-2">Philosophy</Link>
          </div>
        </div>

        {/* 2. 오른쪽 영역: 아이콘 + 햄버거 (모바일에서도 절대 사라지지 않음) */}
        <div className="flex items-center space-x-4 md:space-x-8 shrink-0">
          {/* Search 버튼: 모바일에서는 글자 대신 아이콘이나 작은 텍스트로 */}
          <button onClick={() => setIsSearchOpen(true)} className="text-[10px] font-bold uppercase tracking-widest hover:text-purple-500">
            Search
          </button>

          {/* Cart: 수량 표시 */}
          <Link to="/cart" className="relative group">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 group-hover:text-purple-500">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-3 -right-3 bg-purple-600 text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-mono">
                {cartCount}
              </span>
            )}
          </Link>

          {/* 🍔 모바일 햄버거 버튼: md 미만에서 "반드시" 보임 */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5 z-[210] border border-white/10 rounded-sm"
          >
            <motion.span animate={isMobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} className="w-5 h-[1px] bg-white block" />
            <motion.span animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }} className="w-5 h-[1px] bg-white block" />
            <motion.span animate={isMobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} className="w-5 h-[1px] bg-white block" />
          </button>
        </div>
      </nav>

      {/* 📱 모바일 메뉴 슬라이드 레이어 */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ x: "100%" }} 
            animate={{ x: 0 }} 
            exit={{ x: "100%" }} 
            className="fixed inset-0 bg-black z-[200] flex flex-col justify-center px-10 space-y-8"
          >
            {['Shop', 'Collection', 'Lookbook', 'Philosophy', 'Account'].map((name) => (
              <Link 
                key={name} 
                to={`/${name.toLowerCase()}`} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-4xl font-black italic uppercase tracking-tighter text-white hover:text-purple-500"
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

export default Navbar;