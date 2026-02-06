import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../store/CartContext'; 

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(""); // 검색어 상태 추가
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleMenuClick = (path) => {
    setIsMobileMenuOpen(false);
    setIsShopOpen(false);
    navigate(path);
  };

  // 검색 실행 함수
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/shop?search=${searchInput}`); // Shop 페이지로 검색어 전달
      setIsSearchOpen(false);
      setSearchInput("");
    }
  };

  const navLinks = [
    { name: 'Collection', path: '/collection' },
    { name: 'Lookbook', path: '/lookbook' },
    { name: 'Philosophy', path: '/philosophy' },
  ];

  const logoVariants = {
    hover: {
      skewX: [0, -10, 10, -5, 5, 0],
      x: [0, -2, 2, -1, 1, 0],
      transition: { duration: 0.3, repeat: Infinity }
    }
  };

  return (
    <div className="font-['Noto_Sans_KR'] antialiased">
      <nav className="fixed top-0 left-0 w-full z-[110] bg-black/80 backdrop-blur-xl border-b border-white/10 text-white">
        <div className="max-w-[1800px] mx-auto h-20 flex items-center px-8 relative">
          
          <div className="flex items-center gap-16">
            <motion.div whileHover="hover" variants={logoVariants}>
              <Link to="/" className="hidden md:block text-[20px] font-black italic tracking-[0.3em] uppercase">
                Double <span className="text-purple-500">Negative</span>
              </Link>
            </motion.div>

            <div className="hidden md:flex items-center gap-10 text-[11px] font-light tracking-[0.2em] uppercase">
              <Link to="/shop" className="hover:font-bold hover:text-purple-500 transition-all">Shop</Link>
              {navLinks.map((link) => (
                <Link key={link.name} to={link.path} className="hover:font-bold hover:text-purple-500 transition-all">{link.name}</Link>
              ))}
            </div>
          </div>

          {/* 모바일 햄버거 버튼 */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden w-10 h-10 -ml-2 flex flex-col justify-center items-center gap-[6px] z-[210]">
            <motion.span animate={isMobileMenuOpen ? { rotate: 45, y: 7, backgroundColor: "#A855F7" } : { rotate: 0, y: 0, backgroundColor: "#FFFFFF" }} className="w-6 h-[1px] block" />
            <motion.span animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }} className="w-6 h-[1px] bg-white block" />
            <motion.span animate={isMobileMenuOpen ? { rotate: -45, y: -7, backgroundColor: "#A855F7" } : { rotate: 0, y: 0, backgroundColor: "#FFFFFF" }} className="w-6 h-[1px] block" />
          </button>

          <Link to="/" className="md:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[12px] font-black italic tracking-[0.4em] uppercase z-[210]">
            Double <span className="text-purple-500">Negative</span>
          </Link>

          {/* 우측 유틸리티 영역: 간격 넓힘 */}
          <div className="ml-auto flex items-center gap-4 md:gap-2 z-[210]"> 
            <Link to="/login" className="hidden md:block text-[11px] font-light tracking-widest uppercase mr-6 hover:font-bold hover:text-purple-500">Account</Link>
            
            {/* 검색 아이콘: ml-2 추가하여 로고와의 간격 확보 */}
            <button onClick={() => { setIsSearchOpen(true); setIsMobileMenuOpen(false); }} className="w-10 h-10 ml-2 flex items-center justify-center hover:text-purple-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            </button>
            
            <Link to="/cart" className="w-10 h-10 flex items-center justify-center relative hover:text-purple-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
              <AnimatePresence mode="popLayout">
                {cartCount > 0 && (
                  <motion.span 
                    key={cartCount}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    className="absolute top-2 right-1.5 bg-purple-600 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>
        </div>
      </nav>

      {/* 모바일 메뉴 */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed inset-0 bg-black z-[200] flex flex-col pt-24 pb-12 px-10 text-white md:hidden font-['Noto_Sans_KR']">
            <div className="mb-10 text-left">
              <button onClick={() => isShopOpen ? setIsShopOpen(false) : setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-[12px] font-light tracking-[0.3em] uppercase text-white/40">
                <span className="text-xl">←</span> {isShopOpen ? 'Back to Menu' : 'Back'}
              </button>
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex flex-col space-y-8">
                <div>
                  <button onClick={() => setIsShopOpen(!isShopOpen)} className="text-5xl font-bold tracking-tighter uppercase text-left flex items-center justify-between w-full">
                    Shop <span className="text-2xl font-light opacity-20">{isShopOpen ? '−' : '+'}</span>
                  </button>
                  <AnimatePresence>
                    {isShopOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-col space-y-6 mt-8 ml-4 border-l border-purple-500/20 pl-6 text-left">
                        <button onClick={() => handleMenuClick('/shop/men')} className="text-3xl font-light uppercase text-white/80 text-left">Men</button>
                        <button onClick={() => handleMenuClick('/shop/women')} className="text-3xl font-light uppercase text-white/80 text-left">Women</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {!isShopOpen && navLinks.map((item) => (
                  <button key={item.name} onClick={() => handleMenuClick(item.path)} className="text-5xl font-bold tracking-tighter uppercase text-left hover:text-purple-500">{item.name}</button>
                ))}
              </div>
              <div className="mt-auto pt-12 border-t border-white/10 flex flex-col space-y-6">
                <button onClick={() => handleMenuClick('/cart')} className="text-[14px] font-bold tracking-[0.2em] uppercase text-purple-500 flex justify-between">Shopping Bag <span>[{cartCount}]</span></button>
                <button onClick={() => handleMenuClick('/login')} className="text-[14px] font-light tracking-[0.2em] uppercase text-white/40 text-left">Login</button>
                <button onClick={() => handleMenuClick('/signup')} className="text-[14px] font-light tracking-[0.2em] uppercase text-white/40 text-left">Join Now</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 검색 모달: 실제 검색 기능 적용 */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 z-[300] flex flex-col items-center pt-40 px-6 font-['Noto_Sans_KR']">
            <form onSubmit={handleSearch} className="w-full max-w-2xl relative">
              <input 
                autoFocus 
                type="text" 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="SEARCH ARCHIVE" 
                className="w-full bg-transparent border-b border-purple-500 py-4 text-3xl md:text-5xl font-bold italic uppercase outline-none text-white placeholder-white/10" 
              />
              <button type="submit" className="hidden">Search</button>
              <button onClick={() => setIsSearchOpen(false)} className="absolute right-0 top-1/2 -translate-y-1/2 text-purple-500 font-bold text-[10px] uppercase tracking-widest">Close</button>
            </form>
            <div className="mt-8 text-[10px] font-light tracking-widest text-white/20 uppercase italic">Press enter to explore</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;