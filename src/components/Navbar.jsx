import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ cartCount = 0 }) => {
  const [isShopHover, setIsShopHover] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false); // 컴포넌트 내부로 이동

  const menuLinkClass = "relative py-2 group flex items-center";
  const underlineClass = "absolute bottom-0 left-0 w-full h-[1px] bg-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left";

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-[100] px-8 bg-black/80 backdrop-blur-xl border-b border-white/20 text-white h-20 flex items-center justify-between">
        
        {/* 1. 왼쪽 그룹: 로고 및 메인 메뉴 */}
        <div className="flex items-center space-x-16">
          <Link to="/" className="text-xl font-black italic tracking-tighter uppercase shrink-0">
            Double <span className="text-purple-500">Negative</span>
          </Link>

          <div className="flex space-x-10 text-[10px] font-bold tracking-[0.4em] uppercase">
            {/* Shop 드롭다운 */}
            <div className="relative" onMouseEnter={() => setIsShopHover(true)} onMouseLeave={() => setIsShopHover(false)}>
              <Link to="/shop" className={menuLinkClass}>
                <span className={isShopHover ? "text-purple-500" : ""}>Shop</span>
                <span className={`absolute bottom-0 left-0 h-[1px] bg-purple-500 transition-all duration-500 origin-left ${isShopHover ? 'w-full scale-x-100' : 'w-full scale-x-0'}`} />
              </Link>
              <AnimatePresence>
                {isShopHover && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute top-full left-0 w-32 bg-black/95 border border-white/10 backdrop-blur-md py-5 flex flex-col space-y-4 shadow-2xl">
                    <Link to="/shop/women" className="px-6 hover:text-purple-500 transition-colors tracking-[0.2em]">Women</Link>
                    <Link to="/shop/men" className="px-6 hover:text-purple-500 transition-colors tracking-[0.2em]">Men</Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 나머지 메뉴 */}
            {['Collection', 'Lookbook', 'Philosophy'].map((name) => (
              <Link key={name} to={`/${name.toLowerCase()}`} className={menuLinkClass}>
                <span className="group-hover:text-purple-500 transition-colors duration-300">{name}</span>
                <span className={underlineClass} />
              </Link>
            ))}
          </div>
        </div>

        {/* 2. 오른쪽 그룹: 유틸리티 메뉴 (클릭 이벤트 연결) */}
        <div className="flex space-x-8 text-[10px] font-bold uppercase tracking-[0.2em] items-center">
          <button onClick={() => setIsSearchOpen(true)} className="hover:text-purple-500 transition-colors opacity-80 py-2">Search</button>
          <Link to="/login" className="hover:text-purple-500 transition-colors opacity-80 py-2">Account</Link>
          <button className="hover:text-purple-500 transition-colors opacity-80 py-2">Wishlist (0)</button>
          <Link to="/cart" className="hover:text-purple-500 transition-colors opacity-80 py-2 relative">
            Cart ({cartCount})
          </Link>
        </div>
      </nav>

      {/* 3. Search Overlay: 검색창 레이어 */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 w-full h-80 bg-black z-[200] px-8 flex flex-col justify-center border-b border-purple-500/30 text-white"
          >
            <div className="max-w-4xl mx-auto w-full">
              <div className="relative">
                <input 
                  autoFocus
                  type="text" 
                  placeholder="SEARCH YOUR NEGATIVE" 
                  className="w-full bg-transparent border-b border-white/20 py-6 text-5xl font-black italic uppercase outline-none focus:border-purple-500 transition-colors tracking-tighter"
                />
                <button 
                  onClick={() => setIsSearchOpen(false)} 
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-widest opacity-50 hover:opacity-100"
                >
                  CLOSE [ESC]
                </button>
              </div>
              <div className="mt-6 flex space-x-4">
                <span className="text-[9px] text-neutral-600 uppercase tracking-widest font-bold">Trending:</span>
                {['#HOODIE', '#ARCHIVE', '#VOID_BLACK'].map(tag => (
                  <button key={tag} className="text-[9px] text-purple-500/70 hover:text-purple-500 transition-colors font-mono italic">{tag}</button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;