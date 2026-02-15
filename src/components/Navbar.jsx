import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../store/CartContext';
import { useWishlist } from '../store/WishlistContext';
import { useAuth } from '../store/AuthContext';
import { supabase } from '../lib/supabase';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWomenOpen, setIsWomenOpen] = useState(false);
  const [isMenOpen, setIsMenOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMobileMenuOpen(false);
    navigate('/', { replace: true });
  };

  const handleMenuClick = (path) => {
    setIsMobileMenuOpen(false);
    setIsWomenOpen(false);
    setIsMenOpen(false);
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

  // 메뉴 데이터 구조: 여성, 남성 (아웃웨어/상의/하의), 컬렉션, 스토리
  const navLinks = [
    { 
      name: '여성', 
      path: '/shop/women',
      sub: [
        { name: '아웃웨어', path: '/shop/women?sub=outerwear' },
        { name: '상의', path: '/shop/women?sub=top' },
        { name: '하의', path: '/shop/women?sub=bottom' },
      ]
    },
    { 
      name: '남성', 
      path: '/shop/men',
      sub: [
        { name: '아웃웨어', path: '/shop/men?sub=outerwear' },
        { name: '상의', path: '/shop/men?sub=top' },
        { name: '하의', path: '/shop/men?sub=bottom' },
      ]
    },
    { name: '컬렉션', path: '/collection' },
    { name: '스토리', path: '/philosophy' },
  ];

  return (
    <div className="antialiased" onMouseLeave={() => setHoveredMenu(null)}>
      <nav className="relative w-full z-[110] bg-black/80 backdrop-blur-xl border-b border-white/5 text-white">
        <div className="max-w-[1800px] mx-auto h-14 flex items-center justify-between px-6 relative">
          
          {/* 왼쪽: 메뉴 (오른쪽으로 3cm 이동) */}
          <div className="hidden md:flex items-center gap-8 text-[9pt] font-light tracking-widest uppercase h-14 flex-1 ml-[3cm]">
            {navLinks.map((link) => (
                <div 
                  key={link.name}
                  className="relative h-full flex items-center"
                  onMouseEnter={() => setHoveredMenu(link.name)}
                >
                  <Link to={link.path} className="hover:text-purple-500 transition-all">{link.name}</Link>
                  
                  {/* 데스크톱 하위 메뉴 드롭다운 (Dark Aesthetic) */}
                  <AnimatePresence>
                    {hoveredMenu === link.name && link.sub && (
                      <motion.div 
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute top-full left-0 mt-1 py-5 px-6 flex flex-col gap-0 min-w-[160px]"
                        style={{ 
                          background: 'rgba(0,0,0,0.95)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        {link.sub.map((sub) => (
                          <Link 
                            key={sub.name} 
                            to={sub.path} 
                            className="relative py-3 text-[11px] font-light uppercase transition-all duration-200 text-[#888888] hover:text-white group/row"
                            style={{ letterSpacing: '0.1em' }}
                          >
                            {sub.name}
                            <span className="absolute bottom-1 left-0 w-0 h-px bg-white transition-all duration-200 group-hover/row:w-full" />
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
          </div>

          {/* 가운데: 로고 (은은한 네온 호버) */}
          <Link
            to="/"
            className="hidden md:flex absolute left-1/2 -translate-x-1/2 text-[20px] font-black italic tracking-[0.3em] uppercase transition-shadow duration-300 logo-neon-subtle cursor-pointer"
          >
            Double <span className="text-purple-500">Negative</span>
          </Link>

          {/* 모바일 버튼/로고/유틸리티 (기존 로직 완벽 유지) */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden w-10 h-10 -ml-2 flex flex-col justify-center items-center gap-[6px] z-[210]">
            <motion.span animate={isMobileMenuOpen ? { rotate: 45, y: 7, backgroundColor: "#A855F7" } : { rotate: 0, y: 0, backgroundColor: "#FFFFFF" }} className="w-6 h-[1px] block" />
            <motion.span animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }} className="w-6 h-[1px] bg-white block" />
            <motion.span animate={isMobileMenuOpen ? { rotate: -45, y: -7, backgroundColor: "#A855F7" } : { rotate: 0, y: 0, backgroundColor: "#FFFFFF" }} className="w-6 h-[1px] block" />
          </button>

          <Link to="/" className="md:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[12px] font-black italic tracking-[0.4em] uppercase z-[210] transition-shadow duration-300 logo-neon-subtle">
            Double <span className="text-purple-500">Negative</span>
          </Link>

          <div className="ml-auto flex items-center gap-4 md:gap-2 z-[210]">
            {/* 계정 영역: 로그인 시 MY PAGE, 비로그인 시 사람 아이콘 */}
            <div className="hidden md:block relative">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => setAccountOpen(!accountOpen)}
                    className="text-[10px] font-light tracking-[0.15em] uppercase hover:text-purple-500 transition-all"
                  >
                    MY PAGE
                  </button>
                  <AnimatePresence>
                    {accountOpen && (
                      <>
                        <div className="fixed inset-0 z-[105]" onClick={() => setAccountOpen(false)} aria-hidden="true" />
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="absolute right-0 top-full mt-2 py-4 px-6 bg-black/95 border border-white/10 min-w-[160px] z-[120] flex flex-col gap-3"
                        >
                          <Link to="/orders" onClick={() => setAccountOpen(false)} className="text-[10px] font-light text-white/70 hover:text-white transition-colors tracking-[0.15em] uppercase">ORDERS</Link>
                          <Link to="/profile" onClick={() => setAccountOpen(false)} className="text-[10px] font-light text-white/70 hover:text-white transition-colors tracking-[0.15em] uppercase">PROFILE</Link>
                          <button type="button" onClick={() => { handleLogout(); setAccountOpen(false); }} className="text-[10px] font-light text-white/70 hover:text-purple-500 transition-colors tracking-[0.15em] uppercase text-left">LOGOUT</button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link to="/login" className="flex items-center justify-center w-10 h-10 hover:text-purple-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="3.5" stroke="currentColor" />
                    <path d="M6 21c0-4 2.5-7 6-7s6 3 6 7" stroke="currentColor" strokeLinecap="round" />
                  </svg>
                </Link>
              )}
            </div>
            <button onClick={() => { setIsSearchOpen(true); setIsMobileMenuOpen(false); }} className="w-10 h-10 ml-2 flex items-center justify-center hover:text-purple-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            </button>
            <Link to="/wishlist" className="w-10 h-10 flex items-center justify-center relative hover:text-purple-500 transition-colors" aria-label="위시리스트">
              <svg className="w-5 h-5" fill={wishlist.length > 0 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              {wishlist.length > 0 && (
                <span className="absolute top-2 right-1.5 bg-purple-600 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>
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
              <button onClick={() => (isWomenOpen || isMenOpen) ? (setIsWomenOpen(false), setIsMenOpen(false)) : setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-[12px] font-light tracking-ultra-wide uppercase text-white/40">
                <span className="text-xl">←</span> {(isWomenOpen || isMenOpen) ? 'Back to Menu' : 'Back'}
              </button>
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex flex-col space-y-8">
                {navLinks.map((item) => (
                  <div key={item.name}>
                    {item.sub ? (
                      <>
                        <button onClick={() => { setIsWomenOpen(item.name === '여성' ? !isWomenOpen : false); setIsMenOpen(item.name === '남성' ? !isMenOpen : false); }} className="text-5xl font-bold tracking-tighter uppercase text-left flex items-center justify-between w-full hover:text-purple-500">
                          {item.name} <span className="text-2xl font-light opacity-20">{(item.name === '여성' ? isWomenOpen : isMenOpen) ? '−' : '+'}</span>
                        </button>
                        <AnimatePresence>
                          {(item.name === '여성' ? isWomenOpen : isMenOpen) && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-col space-y-6 mt-8 ml-4 border-l border-purple-500/20 pl-6 text-left text-3xl font-light uppercase text-white/80">
                              {item.sub.map((sub) => (
                                <button key={sub.name} onClick={() => handleMenuClick(sub.path)}>{sub.name}</button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <button onClick={() => handleMenuClick(item.path)} className="text-5xl font-bold tracking-tighter uppercase text-left hover:text-purple-500">{item.name}</button>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-12 border-t border-white/10 flex flex-col space-y-6 text-[14px]">
                <button onClick={() => handleMenuClick('/wishlist')} className="font-light tracking-[0.15em] uppercase text-white/60 text-left flex justify-between">
                  Wishlist <span>[{wishlist.length}]</span>
                </button>
                <button onClick={() => handleMenuClick('/cart')} className="font-bold tracking-extra-wide uppercase text-purple-500 flex justify-between">Shopping Bag <span>[{cartCount}]</span></button>
                {isLoggedIn ? (
                  <>
                    <button onClick={() => handleMenuClick('/orders')} className="font-light tracking-[0.15em] uppercase text-white/60 text-left" style={{ fontWeight: 300 }}>ORDERS</button>
                    <button onClick={() => handleMenuClick('/profile')} className="font-light tracking-[0.15em] uppercase text-white/60 text-left" style={{ fontWeight: 300 }}>PROFILE</button>
                    <button onClick={handleLogout} className="font-light tracking-[0.15em] uppercase text-white/40 text-left" style={{ fontWeight: 300 }}>LOGOUT</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleMenuClick('/login')} className="font-light tracking-extra-wide uppercase text-white/40 text-left">Login</button>
                    <button onClick={() => handleMenuClick('/signup')} className="font-light tracking-extra-wide uppercase text-white/40 text-left">Join Now</button>
                  </>
                )}
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