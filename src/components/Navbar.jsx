import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../store/CartContext'; 

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleMenuClick = (path) => {
    setIsMobileMenuOpen(false);
    setIsShopOpen(false);
    navigate(path);
  };

  const navLinks = [
    { name: 'Collection', path: '/collection' },
    { name: 'Lookbook', path: '/lookbook' },
    { name: 'Philosophy', path: '/philosophy' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-[110] bg-black/80 backdrop-blur-xl border-b border-white/10 text-white">
        <div className="max-w-[1800px] mx-auto h-16 flex items-center px-6 relative">
          
          {/* [데스크톱 전용] 로고 + 메뉴 */}
          <div className="flex items-center gap-12">
            <Link to="/" className="hidden md:block text-[14px] font-black italic tracking-[0.4em] uppercase">
              Double <span className="text-purple-500">Negative</span>
            </Link>
            <div className="hidden md:flex items-center gap-8 text-[10px] font-bold tracking-[0.2em] uppercase">
              <Link to="/shop" className="hover:text-purple-500 transition-colors">Shop</Link>
              {navLinks.map((link) => (
                <Link key={link.name} to={link.path} className="hover:text-purple-500 transition-colors">{link.name}</Link>
              ))}
            </div>
          </div>

          {/* [모바일 전용] 햄버거 버튼 */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="md:hidden w-10 h-10 -ml-2 flex flex-col justify-center items-center gap-[6px] z-[210]"
          >
            <motion.span animate={isMobileMenuOpen ? { rotate: 45, y: 7, backgroundColor: "#A855F7" } : { rotate: 0, y: 0, backgroundColor: "#FFFFFF" }} className="w-5 h-[1px] block" />
            <motion.span animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }} className="w-5 h-[1px] bg-white block" />
            <motion.span animate={isMobileMenuOpen ? { rotate: -45, y: -7, backgroundColor: "#A855F7" } : { rotate: 0, y: 0, backgroundColor: "#FFFFFF" }} className="w-5 h-[1px] block" />
          </button>

          {/* [모바일 전용] 중앙 로고 */}
          <Link to="/" className="md:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-black italic tracking-[0.4em] uppercase z-[210]">
            Double <span className="text-purple-500">Negative</span>
          </Link>

          {/* [공통 우측] Search & Cart */}
          <div className="ml-auto flex items-center gap-1 z-[210]">
            <Link to="/login" className="hidden md:block text-[10px] font-bold tracking-widest uppercase mr-4 hover:text-purple-500">Account</Link>
            <button onClick={() => { setIsSearchOpen(true); setIsMobileMenuOpen(false); }} className="w-10 h-10 flex items-center justify-center hover:text-purple-500 transition-colors">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            </button>
            <Link to="/cart" className="w-10 h-10 flex items-center justify-center relative hover:text-purple-500">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
              {cartCount > 0 && <span className="absolute top-2 right-1.5 bg-purple-600 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-mono">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </nav>

      {/* 모바일 메뉴 (위계 적용) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-black z-[200] flex flex-col pt-32 pb-8 px-8 text-white md:hidden"
          >
            <div className="flex-1 flex flex-col overflow-y-auto">
              
              {/* SECTION 1: MAIN (SHOP) */}
              <div className="mb-10">
                <button 
                  onClick={() => setIsShopOpen(!isShopOpen)}
                  className="flex items-center justify-between w-full text-5xl font-black italic tracking-tighter uppercase hover:text-purple-500 transition-colors"
                >
                  <span>Shop</span>
                  <motion.span animate={{ rotate: isShopOpen ? 180 : 0 }} className="text-2xl font-normal opacity-50">↓</motion.span>
                </button>
                <AnimatePresence>
                  {isShopOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden flex flex-col space-y-4 mt-4 ml-2 border-l border-purple-500/30 pl-6">
                      <button onClick={() => handleMenuClick('/shop/men')} className="text-2xl font-bold uppercase tracking-tight text-white/80 text-left">Men</button>
                      <button onClick={() => handleMenuClick('/shop/women')} className="text-2xl font-bold uppercase tracking-tight text-white/80 text-left">Women</button>
                      <button onClick={() => handleMenuClick('/shop')} className="text-sm font-bold uppercase tracking-widest text-purple-400 text-left underline underline-offset-4">View All Archive</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* SECTION 2: BRAND */}
              <div className="flex flex-col space-y-6 mb-12 border-t border-white/5 pt-8">
                {navLinks.map((item) => (
                  <button key={item.name} onClick={() => handleMenuClick(item.path)} className="text-2xl font-bold tracking-tight uppercase text-left text-white/50 hover:text-white transition-colors">{item.name}</button>
                ))}
              </div>

              {/* SECTION 3: UTILITY */}
              <div className="mt-auto pt-8 border-t border-white/10 space-y-8">
                <button onClick={() => handleMenuClick('/cart')} className="flex justify-between items-center w-full group">
                  <span className="text-base font-black tracking-widest uppercase text-purple-500 group-hover:text-purple-400 italic">Shopping Bag</span>
                  <span className="bg-purple-600 text-white px-3 py-1 text-xs font-bold rounded-full">{cartCount}</span>
                </button>
                <div className="flex gap-6 items-center text-[11px] font-bold tracking-[0.2em] uppercase text-white/30">
                  <button onClick={() => handleMenuClick('/login')} className="hover:text-white transition-colors">Login</button>
                  <span className="w-[1px] h-3 bg-white/10"></span>
                  <button onClick={() => handleMenuClick('/signup')} className="hover:text-white transition-colors">Join Now</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 검색 모달 (생략된 경우 에러 방지용) */}
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