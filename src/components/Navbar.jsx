import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ cartCount = 0 }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      {/* 네비바: 왼쪽(햄버거) | 중앙(로고) | 오른쪽(아이콘) */}
      <nav className="fixed top-0 left-0 w-full z-[100] bg-white border-b border-black/10">
        <div className="h-14 sm:h-16 md:h-20 flex items-center justify-between px-4 sm:px-6 md:px-10">
          
          {/* 왼쪽: 햄버거 메뉴 */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="flex flex-col justify-center items-center w-9 h-9 sm:w-10 sm:h-10 gap-[5px] hover:opacity-50 transition-opacity z-[110]"
            aria-label="Menu"
          >
            <motion.span 
              animate={isMobileMenuOpen ? { rotate: 45, y: 6.5 } : { rotate: 0, y: 0 }} 
              transition={{ duration: 0.2 }}
              className="w-5 sm:w-6 h-[1px] bg-black block"
            />
            <motion.span 
              animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }} 
              transition={{ duration: 0.2 }}
              className="w-5 sm:w-6 h-[1px] bg-black block"
            />
            <motion.span 
              animate={isMobileMenuOpen ? { rotate: -45, y: -6.5 } : { rotate: 0, y: 0 }} 
              transition={{ duration: 0.2 }}
              className="w-5 sm:w-6 h-[1px] bg-black block"
            />
          </button>

          {/* 중앙: 로고 (절대 위치로 정확한 중앙) */}
          <Link 
            to="/" 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[11px] sm:text-xs md:text-sm font-light tracking-[0.35em] uppercase text-black hover:opacity-50 transition-opacity whitespace-nowrap"
          >
            Double Negative
          </Link>

          {/* 오른쪽: 아이콘들 */}
          <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
            {/* Search */}
            <button 
              onClick={() => setIsSearchOpen(true)} 
              className="hover:opacity-50 transition-opacity p-1"
              aria-label="Search"
            >
              <svg className="w-[17px] h-[17px] sm:w-[18px] sm:h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {/* Cart */}
            <Link to="/cart" className="relative hover:opacity-50 transition-opacity p-1" aria-label="Cart">
              <svg className="w-[17px] h-[17px] sm:w-[18px] sm:h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] w-[15px] h-[15px] sm:w-4 sm:h-4 rounded-full flex items-center justify-center font-mono leading-none">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* 풀스크린 메뉴 (우영미 스타일 - 미니멀) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-0 bg-white z-[105] flex flex-col"
          >
            {/* 메뉴 내용 */}
            <div className="flex-1 flex flex-col justify-center items-center space-y-7 sm:space-y-9 md:space-y-11 px-6">
              {[
                { name: 'Shop', path: '/shop' },
                { name: 'Collection', path: '/collection' },
                { name: 'Lookbook', path: '/lookbook' },
                { name: 'Philosophy', path: '/philosophy' },
                { name: 'Account', path: '/account' }
              ].map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 0.1 + index * 0.05, 
                    duration: 0.5,
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                >
                  <Link 
                    to={item.path} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-2xl sm:text-3xl md:text-4xl font-light tracking-[0.25em] uppercase text-black hover:opacity-40 transition-opacity duration-300"
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* 하단: 푸터 링크 */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="border-t border-black/10 px-6 py-6 sm:py-8"
            >
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] sm:text-[11px] font-light tracking-wider uppercase text-black/50">
                <Link to="/support" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-black transition-colors">Customer Support</Link>
                <Link to="/shipping" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-black transition-colors">Shipping</Link>
                <Link to="/returns" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-black transition-colors">Returns</Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 검색 모달 (미니멀 스타일) */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-white z-[150] flex items-start justify-center pt-24 sm:pt-32 md:pt-40 px-4"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  autoFocus
                  className="w-full bg-transparent border-b border-black/20 px-0 py-3 sm:py-4 text-black placeholder-black/30 text-base sm:text-lg md:text-xl font-light tracking-wider focus:outline-none focus:border-black transition-colors"
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <p className="text-black/30 text-[10px] sm:text-xs font-light tracking-wider uppercase mt-6 text-center">Press ESC to close</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
