import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ cartCount = 0 }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShopHover, setIsShopHover] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-[100] px-4 md:px-10 bg-black/90 backdrop-blur-xl border-b border-white/10 text-white h-16 md:h-20 flex items-center justify-between">
        
        {/* 왼쪽: 로고 */}
        <div className="flex items-center min-w-0 flex-1">
          <Link 
            to="/" 
            className="text-sm md:text-xl font-black italic uppercase tracking-tighter shrink-0 mr-4 md:mr-16"
          >
            <span className="hidden sm:inline">Double <span className="text-purple-500">Negative</span></span>
            <span className="sm:hidden">DN</span>
          </Link>

          {/* 데스크탑 메뉴 */}
          <div className="hidden md:flex space-x-10 text-[10px] font-bold tracking-[0.4em] uppercase items-center">
            {/* Shop 드롭다운 */}
            <div 
              className="relative" 
              onMouseEnter={() => setIsShopHover(true)} 
              onMouseLeave={() => setIsShopHover(false)}
            >
              <Link to="/shop" className="hover:text-purple-500 py-2 block">
                Shop
              </Link>
              <AnimatePresence>
                {isShopHover && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 bg-black/95 backdrop-blur-xl border border-white/10 rounded-lg p-4 min-w-[200px] shadow-2xl"
                  >
                    <Link to="/shop/all" className="block py-2 px-3 hover:bg-white/5 hover:text-purple-500 rounded">
                      All Items
                    </Link>
                    <Link to="/shop/tops" className="block py-2 px-3 hover:bg-white/5 hover:text-purple-500 rounded">
                      Tops
                    </Link>
                    <Link to="/shop/bottoms" className="block py-2 px-3 hover:bg-white/5 hover:text-purple-500 rounded">
                      Bottoms
                    </Link>
                    <Link to="/shop/accessories" className="block py-2 px-3 hover:bg-white/5 hover:text-purple-500 rounded">
                      Accessories
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link to="/collection" className="hover:text-purple-500 py-2">Collection</Link>
            <Link to="/lookbook" className="hover:text-purple-500 py-2">Lookbook</Link>
            <Link to="/philosophy" className="hover:text-purple-500 py-2">Philosophy</Link>
          </div>
        </div>

        {/* 오른쪽: 아이콘 버튼들 */}
        <div className="flex items-center space-x-3 md:space-x-6 shrink-0">
          {/* Search 아이콘 */}
          <button 
            onClick={() => setIsSearchOpen(true)} 
            className="hover:text-purple-500 transition-colors p-2"
            aria-label="Search"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Cart 아이콘 */}
          <Link to="/cart" className="relative hover:text-purple-500 transition-colors p-2" aria-label="Cart">
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-purple-600 text-[9px] md:text-[10px] w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center font-mono font-bold">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          {/* 햄버거 메뉴 (모바일) */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5 relative z-[110]"
            aria-label="Menu"
          >
            <motion.span 
              animate={isMobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} 
              className="w-5 h-[2px] bg-white block transition-all"
            />
            <motion.span 
              animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }} 
              className="w-5 h-[2px] bg-white block transition-all"
            />
            <motion.span 
              animate={isMobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} 
              className="w-5 h-[2px] bg-white block transition-all"
            />
          </button>
        </div>
      </nav>

      {/* 모바일 메뉴 */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* 배경 오버레이 */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[105] md:hidden"
            />
            
            {/* 메뉴 패널 */}
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }} 
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-black z-[106] flex flex-col pt-24 px-8 md:hidden overflow-y-auto"
            >
              <div className="space-y-6">
                {[
                  { name: 'Shop', path: '/shop' },
                  { name: 'Collection', path: '/collection' },
                  { name: 'Lookbook', path: '/lookbook' },
                  { name: 'Philosophy', path: '/philosophy' },
                  { name: 'Account', path: '/account' }
                ].map((item) => (
                  <Link 
                    key={item.name} 
                    to={item.path} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-3xl font-black italic uppercase tracking-tighter text-white hover:text-purple-500 transition-colors border-b border-white/10 pb-4"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* 모바일 메뉴 하단 추가 링크 */}
              <div className="mt-auto mb-8 pt-8 border-t border-white/10">
                <div className="text-xs font-bold uppercase tracking-wider text-white/50 space-y-3">
                  <Link to="/support" className="block hover:text-purple-500">Customer Support</Link>
                  <Link to="/shipping" className="block hover:text-purple-500">Shipping Info</Link>
                  <Link to="/returns" className="block hover:text-purple-500">Returns</Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 검색 모달 */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[150] flex items-start justify-center pt-24 md:pt-32 px-4"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  autoFocus
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-6 py-4 md:py-5 text-white placeholder-white/50 text-base md:text-lg focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-white/40 text-xs md:text-sm mt-4 text-center">Press ESC to close</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
