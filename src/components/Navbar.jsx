import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../store/CartContext'; 

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false); // 모바일 아코디언용
  const [hoveredMenu, setHoveredMenu] = useState(null); // 데스크톱 드롭다운용
  const [searchInput, setSearchInput] = useState("");
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleMenuClick = (path) => {
    setIsMobileMenuOpen(false);
    setIsShopOpen(false);
    setHoveredMenu(null);
    navigate(path);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/shop?search=${searchInput}`);
      setIsSearchOpen(false);
      setSearchInput("");
    }
  };

  // 메뉴 데이터 구조 (하위 카테고리 포함)
  const navLinks = [
    { 
      name: 'Shop', 
      path: '/shop',
      sub: [
        { name: 'Men', path: '/shop/men' },
        { name: 'Women', path: '/shop/women' },
        { name: 'Archive', path: '/shop' }
      ]
    },
    { 
      name: 'Collection', 
      path: '/collection',
      sub: [
        { name: '2026 SS', path: '/collection/26ss' },
        { name: '2025 AW', path: '/collection/25aw' }
      ]
    },
    { 
      name: 'Lookbook', 
      path: '/lookbook',

    },
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
    <div className="antialiased" onMouseLeave={() => setHoveredMenu(null)}>
      <nav className="fixed top-0 left-0 w-full z-[110] bg-black/80 backdrop-blur-xl border-b border-white/5 text-white">
        <div className="max-w-[1800px] mx-auto h-20 flex items-center px-8 relative">
          
          <div className="flex items-center gap-16">
            {/* 로고: 글리치 애니메이션 */}
            <motion.div whileHover="hover" variants={logoVariants}>
              <Link to="/" className="hidden md:block text-[20px] font-black italic tracking-[0.3em] uppercase">
                Double <span className="text-purple-500">Negative</span>
              </Link>
            </motion.div>

            {/* 데스크톱 메뉴 */}
            <div className="hidden md:flex items-center gap-10 text-[11px] font-light tracking-extra-wide uppercase h-20">
              {navLinks.map((link) => (
                <div 
                  key={link.name}
                  className="relative h-full flex items-center"
                  onMouseEnter={() => setHoveredMenu(link.name)}
                >
                  <Link to={link.path} className="hover:text-purple-500 transition-all">{link.name}</Link>
                  
                  {/* 데스크톱 하위 메뉴 드롭다운 */}
                  <AnimatePresence>
                    {hoveredMenu === link.name && link.sub && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full left-0 min-w-[120px] bg-black/90 border border-white/10 py-4 px-6 flex flex-col gap-3 backdrop-blur-md"
                      >
                        {link.sub.map((sub) => (
                          <Link 
                            key={sub.name} 
                            to={sub.path} 
                            className="text-[9px] font-bold text-white/40 hover:text-purple-500 transition-colors tracking-extra-wide"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* 모바일 버튼/로고/유틸리티 (기존 로직 완벽 유지) */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden w-10 h-10 -ml-2 flex flex-col justify-center items-center gap-[6px] z-[210]">
            <motion.span animate={isMobileMenuOpen ? { rotate: 45, y: 7, backgroundColor: "#A855F7" } : { rotate: 0, y: 0, backgroundColor: "#FFFFFF" }} className="w-6 h-[1px] block" />
            <motion.span animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }} className="w-6 h-[1px] bg-white block" />
            <motion.span animate={isMobileMenuOpen ? { rotate: -45, y: -7, backgroundColor: "#A855F7" } : { rotate: 0, y: 0, backgroundColor: "#FFFFFF" }} className="w-6 h-[1px] block" />
          </button>

          <Link to="/" className="md:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[12px] font-black italic tracking-[0.4em] uppercase z-[210]">
            Double <span className="text-purple-500">Negative</span>
          </Link>

          <div className="ml-auto flex items-center gap-4 md:gap-2 z-[210]"> 
            <Link to="/login" className="hidden md:block text-[11px] font-light tracking-widest uppercase mr-6 hover:text-purple-500 transition-all">Account</Link>
            <button onClick={() => { setIsSearchOpen(true); setIsMobileMenuOpen(false); }} className="w-10 h-10 ml-2 flex items-center justify-center hover:text-purple-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            </button>
            <Link to="/cart" className="w-10 h-10 flex items-center justify-center relative hover:text-purple-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
              <AnimatePresence mode="popLayout">
                {cartCount > 0 && (
                  <motion.span 
                    key={cartCount} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }}
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

      {/* 모바일 메뉴 (기존 백 기능 완벽 유지) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed inset-0 bg-black z-[200] flex flex-col pt-24 pb-12 px-10 text-white md:hidden">
            <div className="mb-10 text-left">
              <button onClick={() => isShopOpen ? setIsShopOpen(false) : setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-[12px] font-light tracking-ultra-wide uppercase text-white/40">
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
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-col space-y-6 mt-8 ml-4 border-l border-purple-500/20 pl-6 text-left text-3xl font-light uppercase text-white/80">
                        <button onClick={() => handleMenuClick('/shop/men')}>Men</button>
                        <button onClick={() => handleMenuClick('/shop/women')}>Women</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {navLinks.slice(1).map((item) => (
                  <button key={item.name} onClick={() => handleMenuClick(item.path)} className="text-5xl font-bold tracking-tighter uppercase text-left hover:text-purple-500">{item.name}</button>
                ))}
              </div>
              <div className="mt-auto pt-12 border-t border-white/10 flex flex-col space-y-6 text-[14px]">
                <button onClick={() => handleMenuClick('/cart')} className="font-bold tracking-extra-wide uppercase text-purple-500 flex justify-between">Shopping Bag <span>[{cartCount}]</span></button>
                <button onClick={() => handleMenuClick('/login')} className="font-light tracking-extra-wide uppercase text-white/40 text-left">Login</button>
                <button onClick={() => handleMenuClick('/signup')} className="font-light tracking-extra-wide uppercase text-white/40 text-left">Join Now</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 검색 모달 (기존 로직 유지) */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 z-[300] flex flex-col items-center pt-40 px-6">
            <form onSubmit={handleSearch} className="w-full max-w-2xl relative">
              <input autoFocus type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="SEARCH ARCHIVE" className="w-full bg-transparent border-b border-purple-500 py-4 text-3xl md:text-5xl font-bold italic uppercase outline-none text-white placeholder-white/10" />
              <button type="submit" className="hidden">Search</button>
              <button onClick={() => setIsSearchOpen(false)} className="absolute right-0 top-1/2 -translate-y-1/2 text-purple-500 font-bold text-[10px] uppercase tracking-widest">Close</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;